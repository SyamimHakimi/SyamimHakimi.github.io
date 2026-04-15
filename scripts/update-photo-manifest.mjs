/**
 * Update the private photo manifest without editing JSON by hand.
 */

import path from "node:path";
import process from "node:process";

import { loadManifest, saveManifest } from "./photography-manifest-lib.mjs";
import {
  parseBoolean,
  updateManifestRecords,
} from "./photo-manifest-edit-lib.mjs";

const DEFAULT_MANIFEST_PATH = ".private-data/photo-manifest.json";

function parseArgs(argv) {
  const options = {
    manifestPath: DEFAULT_MANIFEST_PATH,
    filters: {},
    updates: {},
    limit: undefined,
    write: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--manifest") {
      options.manifestPath = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--where-file") {
      options.filters.fileIncludes = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--where-hash") {
      options.filters.hash = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--where-theme-suggested") {
      options.filters.themeSuggested = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--where-theme-final") {
      options.filters.themeFinal = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--where-theme-score-gte") {
      options.filters.themeScoreGte = Number(argv[index + 1] ?? "");
      index += 1;
      continue;
    }

    if (argument === "--where-theme-score-lte") {
      options.filters.themeScoreLte = Number(argv[index + 1] ?? "");
      index += 1;
      continue;
    }

    if (argument === "--where-favourite") {
      options.filters.favourite = parseBoolean(argv[index + 1] ?? "");
      index += 1;
      continue;
    }

    if (argument === "--where-uploaded") {
      options.filters.uploaded = parseBoolean(argv[index + 1] ?? "");
      index += 1;
      continue;
    }

    if (argument === "--set-favourite") {
      options.updates.favourite = parseBoolean(argv[index + 1] ?? "");
      index += 1;
      continue;
    }

    if (argument === "--set-theme-final") {
      options.updates.themeFinal = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--clear-theme-final") {
      options.updates.themeFinal = null;
      continue;
    }

    if (argument === "--set-recipe") {
      options.updates.recipe = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--clear-recipe") {
      options.updates.recipe = null;
      continue;
    }

    if (argument === "--set-title") {
      options.updates.title = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (argument === "--clear-title") {
      options.updates.title = null;
      continue;
    }

    if (argument === "--limit") {
      options.limit = Number(argv[index + 1] ?? "");
      index += 1;
      continue;
    }

    if (argument === "--write") {
      options.write = true;
      continue;
    }

    if (argument === "--help") {
      printUsage();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  if (Object.keys(options.updates).length === 0) {
    throw new Error(
      "No update requested. Use at least one --set-* or --clear-* flag.",
    );
  }

  return options;
}

function printUsage() {
  console.log(`Usage:
  node scripts/update-photo-manifest.mjs [filters] [updates] [options]

Filters:
  --where-file <text>             match file path substring
  --where-hash <hash>             match exact hash
  --where-theme-suggested <name>  match suggested theme
  --where-theme-final <name>      match reviewed theme
  --where-theme-score-gte <n>     match minimum suggestion score
  --where-theme-score-lte <n>     match maximum suggestion score
  --where-favourite true|false    match favourite flag
  --where-uploaded true|false     match uploaded flag

Updates:
  --set-favourite true|false
  --set-theme-final <name>
  --clear-theme-final
  --set-recipe <name>
  --clear-recipe
  --set-title <text>
  --clear-title

Options:
  --manifest <path>               local manifest file path
  --limit <n>                     update only the first n matches
  --write                         persist changes to the manifest
  --help                          show this usage message
`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const manifestPath = path.resolve(options.manifestPath);
  const manifest = await loadManifest(manifestPath);

  const result = updateManifestRecords(manifest.records, {
    filters: options.filters,
    updates: options.updates,
    limit: options.limit,
  });

  console.log(`Manifest path: ${manifestPath}`);
  console.log(`Matched records: ${result.matched.length}`);
  console.log(`Updated records: ${result.updatedCount}`);
  console.log(`Mode: ${options.write ? "write" : "dry-run"}`);

  for (const record of result.records
    .filter((candidate) =>
      result.matched.some((matched) => matched.hash === candidate.hash),
    )
    .slice(0, 20)) {
    console.log(
      `- ${record.file_path} | favourite=${record.favourite === true} | theme_final=${record.theme_final ?? ""} | recipe=${record.recipe ?? ""}`,
    );
  }

  if (!options.write) {
    console.log("");
    console.log("Dry run only. Re-run with --write to update the manifest.");
    return;
  }

  await saveManifest(manifestPath, result.records);
  console.log("");
  console.log("Manifest updated.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
