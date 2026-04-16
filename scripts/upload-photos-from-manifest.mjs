/**
 * Upload photos to Firebase Storage and upsert `photos` Firestore docs from the
 * private local manifest.
 */

import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

import {
  buildFirebaseDownloadUrl,
  buildPhotoDocument,
  buildStoragePath,
  resolveDownloadToken,
  selectUploadRecords,
} from "./photo-upload-lib.mjs";
import { loadManifest, saveManifest } from "./photography-manifest-lib.mjs";

const DEFAULT_CREDENTIALS_PATH =
  "portfolio-9e62d-firebase-adminsdk-vkp5a-80f55801a1.json";
const DEFAULT_MANIFEST_PATH = ".private-data/photo-manifest.json";
const DEFAULT_BUCKET = "portfolio-9e62d.firebasestorage.app";
const MAX_UPLOAD_DIMENSION = 2000;

function parseArgs(argv) {
  const options = {
    credentialsPath:
      process.env.GOOGLE_APPLICATION_CREDENTIALS ?? DEFAULT_CREDENTIALS_PATH,
    manifestPath: DEFAULT_MANIFEST_PATH,
    bucket: DEFAULT_BUCKET,
    write: false,
    onlyFavourites: true,
    includeUploaded: false,
    force: false,
    fileIncludes: "",
    hash: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--credentials") {
      options.credentialsPath = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--manifest") {
      options.manifestPath = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--bucket") {
      options.bucket = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--write") {
      options.write = true;
      continue;
    }

    if (argument === "--all") {
      options.onlyFavourites = false;
      continue;
    }

    if (argument === "--include-uploaded") {
      options.includeUploaded = true;
      continue;
    }

    if (argument === "--force") {
      options.force = true;
      continue;
    }

    if (argument === "--where-file") {
      options.fileIncludes = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--where-hash") {
      options.hash = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--help") {
      printUsage();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return options;
}

function printUsage() {
  console.log(`Usage:
  node scripts/upload-photos-from-manifest.mjs [options]

Options:
  --manifest <path>           local manifest file path
  --credentials <path>        service account JSON path
  --bucket <name>             Firebase Storage bucket name
  --all                       upload all manifest records, not just favourites
  --include-uploaded          include records already marked uploaded
  --where-file <text>         upload only records whose file path contains text
  --where-hash <hash>         upload only the exact manifest hash
  --force                     reupload even if the Firestore doc already exists
  --write                     actually upload files and write Firestore docs
  --help                      show this usage message
`);
}

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

async function loadServiceAccount(credentialsPath) {
  const raw = await readFile(credentialsPath, "utf8");
  const credentials = JSON.parse(raw);

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error(
      "The configured service account JSON is missing client_email or private_key.",
    );
  }

  return credentials;
}

function createJwtAssertion(credentials) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope:
      "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.full_control",
    aud: credentials.token_uri ?? "https://oauth2.googleapis.com/token",
    iat: issuedAt,
    exp: issuedAt + 3600,
  };

  const encodedHeader = base64UrlEncode(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  );
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();

  return `${unsignedToken}.${base64UrlEncode(
    signer.sign(credentials.private_key),
  )}`;
}

async function fetchAccessToken(credentials) {
  const response = await fetch(
    credentials.token_uri ?? "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: createJwtAssertion(credentials),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `OAuth token exchange failed: ${response.status} ${await response.text()}`,
    );
  }

  const payload = await response.json();
  return payload.access_token;
}

function encodeFirestoreValue(value) {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }

  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }

  if (typeof value === "string") {
    return { stringValue: value };
  }

  if (typeof value === "boolean") {
    return { booleanValue: value };
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return { integerValue: String(value) };
    }
    return { doubleValue: value };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: { values: value.map((item) => encodeFirestoreValue(item)) },
    };
  }

  return { mapValue: { fields: encodeFirestoreFields(value) } };
}

function encodeFirestoreFields(data) {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, encodeFirestoreValue(value)]),
  );
}

async function writeFirestoreDocument(
  accessToken,
  projectId,
  documentPath,
  data,
) {
  const documentName = `projects/${projectId}/databases/(default)/documents/${documentPath}`;
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        writes: [
          {
            update: {
              name: documentName,
              fields: encodeFirestoreFields(data),
            },
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Firestore write failed for ${documentPath}: ${response.status} ${await response.text()}`,
    );
  }
}

async function getFirestoreDocument(accessToken, projectId, documentPath) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${documentPath}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Firestore read failed for ${documentPath}: ${response.status} ${await response.text()}`,
    );
  }

  return response.json();
}

async function uploadObject(
  accessToken,
  bucket,
  objectPath,
  fileBuffer,
  contentType,
  downloadToken,
) {
  const response = await fetch(
    `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(objectPath)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": contentType,
        "X-Goog-Meta-firebaseStorageDownloadTokens": downloadToken,
      },
      body: fileBuffer,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Storage upload failed for ${objectPath}: ${response.status} ${await response.text()}`,
    );
  }
}

async function setStorageDownloadToken(
  accessToken,
  bucket,
  objectPath,
  downloadToken,
) {
  const response = await fetch(
    `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(objectPath)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Storage metadata patch failed for ${objectPath}: ${response.status} ${await response.text()}`,
    );
  }
}

async function buildUploadAsset(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const source = sharp(filePath, { failOn: "none" }).rotate();
  const metadata = await source.metadata();

  const resized = source.resize({
    width: MAX_UPLOAD_DIMENSION,
    height: MAX_UPLOAD_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  });

  if (extension === ".png") {
    const { data, info } = await resized
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer({ resolveWithObject: true });
    return {
      buffer: data,
      contentType: "image/png",
      width: info.width ?? metadata.width ?? null,
      height: info.height ?? metadata.height ?? null,
    };
  }

  const { data, info } = await resized
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  return {
    buffer: data,
    contentType: "image/jpeg",
    width: info.width ?? metadata.width ?? null,
    height: info.height ?? metadata.height ?? null,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const manifestPath = path.resolve(options.manifestPath);
  const manifest = await loadManifest(manifestPath);

  const records = selectUploadRecords(manifest.records, {
    onlyFavourites: options.onlyFavourites,
    includeUploaded: options.includeUploaded,
    fileIncludes: options.fileIncludes,
    hash: options.hash,
  });

  console.log(`Manifest path: ${manifestPath}`);
  console.log(`Candidate records: ${records.length}`);
  console.log(`Mode: ${options.write ? "write" : "dry-run"}`);

  for (const record of records.slice(0, 20)) {
    console.log(
      `- ${record.file_path} | favourite=${record.favourite === true} | uploaded=${record.uploaded === true}`,
    );
  }
  if (records.length > 20) {
    console.log(`- ...and ${records.length - 20} more`);
  }

  if (!options.write) {
    console.log("");
    console.log(
      "Dry run only. Re-run with --write to upload files and upsert Firestore docs.",
    );
    return;
  }

  const credentials = await loadServiceAccount(options.credentialsPath);
  const accessToken = await fetchAccessToken(credentials);
  const projectId = credentials.project_id;

  const manifestByHash = new Map(
    manifest.records.map((record) => [String(record.hash), { ...record }]),
  );

  for (const record of records) {
    const objectPath =
      typeof record.storage_path === "string" && record.storage_path
        ? record.storage_path
        : buildStoragePath(record);
    const shouldUploadObject = options.force || record.uploaded !== true;
    const downloadToken = resolveDownloadToken(record);
    const downloadUrl = buildFirebaseDownloadUrl({
      bucket: options.bucket,
      objectPath,
      token: downloadToken,
    });
    const uploadAsset = shouldUploadObject
      ? await buildUploadAsset(String(record.file_path))
      : {
          width:
            typeof record.uploaded_width === "number"
              ? record.uploaded_width
              : null,
          height:
            typeof record.uploaded_height === "number"
              ? record.uploaded_height
              : null,
        };
    const { docId, payload } = buildPhotoDocument(record, {
      bucket: options.bucket,
      objectPath,
      downloadToken,
    });

    const existingDocument = await getFirestoreDocument(
      accessToken,
      projectId,
      `photos/${docId}`,
    );

    if (shouldUploadObject) {
      await uploadObject(
        accessToken,
        options.bucket,
        objectPath,
        uploadAsset.buffer,
        uploadAsset.contentType,
        downloadToken,
      );
    }

    await setStorageDownloadToken(
      accessToken,
      options.bucket,
      objectPath,
      downloadToken,
    );

    await writeFirestoreDocument(
      accessToken,
      projectId,
      `photos/${docId}`,
      payload,
    );

    manifestByHash.set(String(record.hash), {
      ...record,
      uploaded: true,
      firebase_doc_id: docId,
      storage_path: objectPath,
      storage_download_token: downloadToken,
      download_url: downloadUrl,
      uploaded_width: uploadAsset.width,
      uploaded_height: uploadAsset.height,
      uploaded_at:
        typeof record.uploaded_at === "string" && !shouldUploadObject
          ? record.uploaded_at
          : new Date().toISOString(),
      firestore_synced_at: new Date().toISOString(),
    });

    console.log(
      `${existingDocument ? "Synced" : "Created"} photos/${docId} (${shouldUploadObject ? "uploaded binary + doc" : "doc sync only"})`,
    );
  }

  await saveManifest(manifestPath, [...manifestByHash.values()]);
  console.log("");
  console.log("Upload completed and manifest updated.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
