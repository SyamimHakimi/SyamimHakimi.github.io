/**
 * Export Firestore content into the `export/` archive for Phase A1.
 *
 * This script uses a Firebase service account provided via
 * `GOOGLE_APPLICATION_CREDENTIALS` and talks to Firestore through the REST API.
 */

import { createSign } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  buildExportBundle,
  decodeDocument,
  sortDecodedRecords,
} from "./firestore-export-lib.mjs";

// PROJECT_ID and FIRESTORE_BASE_URL are derived from the loaded service account
// credentials at runtime — see main() — so the script works against any Firebase project.

/**
 * Base64url encode a UTF-8 string or buffer.
 *
 * @param {string | Buffer} input
 * @returns {string}
 */
function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

/**
 * Read and validate the configured service account file.
 *
 * @returns {Promise<Record<string, string>>}
 */
async function loadServiceAccount() {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) {
    throw new Error(
      "GOOGLE_APPLICATION_CREDENTIALS is not set. Point it at the Firebase service account JSON before running the export.",
    );
  }

  const raw = await readFile(credentialsPath, "utf8");
  const credentials = JSON.parse(raw);

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error(
      "The configured service account JSON is missing client_email or private_key.",
    );
  }

  return credentials;
}

/**
 * Create a signed JWT assertion for Google OAuth service account exchange.
 *
 * @param {Record<string, string>} credentials
 * @returns {string}
 */
function createJwtAssertion(credentials) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
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

  const signature = signer.sign(credentials.private_key);
  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

/**
 * Exchange the signed JWT for a Google OAuth access token.
 *
 * @param {Record<string, string>} credentials
 * @returns {Promise<string>}
 */
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

/**
 * Fetch JSON from the Firestore REST API.
 *
 * @param {string} accessToken
 * @param {string} url
 * @returns {Promise<Record<string, unknown>>}
 */
async function fetchFirestoreJson(accessToken, url) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(
      `Firestore request failed: ${response.status} ${await response.text()}`,
    );
  }

  return response.json();
}

/**
 * Read a single Firestore document and decode it.
 *
 * @param {string} accessToken
 * @param {string} documentPath
 * @returns {Promise<Record<string, unknown>>}
 */
async function getDocument(accessToken, firestoreBaseUrl, documentPath) {
  const payload = await fetchFirestoreJson(
    accessToken,
    `${firestoreBaseUrl}/${documentPath}`,
  );
  return decodeDocument(payload);
}

/**
 * List every document in a Firestore collection path and decode the results.
 *
 * @param {string} accessToken
 * @param {string} collectionPath
 * @param {{ field: string, direction?: "asc" | "desc" } | undefined} sortSpec
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
async function listCollection(
  accessToken,
  firestoreBaseUrl,
  collectionPath,
  sortSpec,
) {
  const decoded = [];
  let pageToken = "";

  do {
    const url = new URL(`${firestoreBaseUrl}/${collectionPath}`);
    url.searchParams.set("pageSize", "200");
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const payload = await fetchFirestoreJson(accessToken, url.toString());
    const documents = Array.isArray(payload.documents) ? payload.documents : [];
    decoded.push(...documents.map((document) => decodeDocument(document)));
    pageToken =
      typeof payload.nextPageToken === "string" ? payload.nextPageToken : "";
  } while (pageToken);

  return sortDecodedRecords(decoded, sortSpec);
}

/**
 * Write the assembled export bundle into `export/`.
 *
 * @param {Record<string, unknown>} exportBundle
 * @returns {Promise<void>}
 */
async function writeExportBundle(exportBundle) {
  const exportDir = path.resolve("export");
  await mkdir(exportDir, { recursive: true });

  for (const [filename, data] of Object.entries(exportBundle)) {
    const filePath = path.join(exportDir, filename);
    await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }
}

async function main() {
  const credentials = await loadServiceAccount();
  const accessToken = await fetchAccessToken(credentials);

  // Derive base URL from the service account so the script works against any project.
  const projectId = credentials.project_id;
  const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  const get = (path) => getDocument(accessToken, firestoreBaseUrl, path);
  const list = (path, sort) =>
    listCollection(accessToken, firestoreBaseUrl, path, sort);

  const exportBundle = buildExportBundle({
    profile: await get("profile/ddIhV8IxV5DjciJY7UxW"),
    services: await list("services", { field: "sorting", direction: "asc" }),
    experiencePlatforms: await list("experience/platforms/item", {
      field: "date-from",
      direction: "asc",
    }),
    experienceProtocols: await list("experience/protocols/item", {
      field: "date-from",
      direction: "asc",
    }),
    experienceFrameworks: await list("experience/frameworks/item", {
      field: "date-from",
      direction: "asc",
    }),
    experienceLanguages: await list("experience/languages/item", {
      field: "date-from",
      direction: "asc",
    }),
    // projects is a singleton document accessed via doc() at runtime — export mirrors that shape.
    project: await get("projects/XYdqe9OyXNSUEzZ8kqwn"),
    projectTechstack: await list("projects/XYdqe9OyXNSUEzZ8kqwn/techstack", {
      field: "sorting",
      direction: "asc",
    }),
    boardgames: await list("favourite-boardgames", {
      field: "score",
      direction: "desc",
    }),
    photographyGear: await list("photography-gears", {
      field: "type",
      direction: "asc",
    }),
    socialMedia: await list("social-media", {
      field: "sorting",
      direction: "asc",
    }),
    photos: await list("photos", { field: "date", direction: "desc" }),
    statistics: {
      stats: await get("statistics/stats"),
      "photo-stats": await get("statistics/photo-stats"),
      "fav-photo-stats": await get("statistics/fav-photo-stats"),
      "focal-stats": await get("statistics/focal-stats"),
      lens_stats: await get("statistics/lens_stats"),
      "recipe-stats": await get("statistics/recipe-stats"),
      "theme-stats": await get("statistics/theme-stats"),
    },
  });

  await writeExportBundle(exportBundle);

  console.log("Firestore export completed.");
  Object.keys(exportBundle).forEach((filename) =>
    console.log(`- export/${filename}`),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
