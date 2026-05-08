import { readFileSync } from "fs";
const manifest = JSON.parse(readFileSync(".private-data/photo-manifest.json", "utf8"));
const favs = manifest.records.filter((r) => r.favourite === true);
console.log("Total favourites:", favs.length);
console.log("With theme_suggested:", favs.filter((r) => r.theme_suggested).length);
console.log("With theme_final:", favs.filter((r) => r.theme_final).length);
const sample = favs.slice(0, 3).map((r) => ({
  file: String(r.file_path).split("\\").at(-1),
  download_url: r.download_url ? String(r.download_url).slice(0, 80) + "..." : null,
  source_directory: r.source_directory,
}));
console.log(JSON.stringify(sample, null, 2));
