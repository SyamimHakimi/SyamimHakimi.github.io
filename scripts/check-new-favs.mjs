import { readFileSync } from "fs";

const { records } = JSON.parse(
  readFileSync(".private-data/photo-manifest.json", "utf8"),
);

const newFiles = [
  "961_fuji/dscf1239.jpg","961_fuji/dscf1783.jpg","961_fuji/dscf1981.jpg","961_fuji/dscf1992.jpg","961_fuji/dscf1996.jpg",
  "962_fuji/dscf2004.jpg","962_fuji/dscf2010.jpg","962_fuji/dscf2088.jpg","962_fuji/dscf2104.jpg","962_fuji/dscf2105.jpg",
  "962_fuji/dscf2111.jpg","962_fuji/dscf2579.jpg","962_fuji/dscf2705.jpg","962_fuji/dscf2722.jpg","962_fuji/dscf2748.jpg",
  "962_fuji/dscf2804.jpg","962_fuji/dscf2841.jpg","962_fuji/dscf2971.jpg","962_fuji/dscf2975.jpg","962_fuji/dscf2997.jpg",
  "963_fuji/dscf3012.jpg","963_fuji/dscf3016.jpg","963_fuji/dscf3046.jpg","963_fuji/dscf3047.jpg","963_fuji/dscf3085.jpg",
  "963_fuji/dscf3101.jpg","963_fuji/dscf3130.jpg","963_fuji/dscf3173.jpg","963_fuji/dscf3209.jpg","963_fuji/dscf3264.jpg",
  "963_fuji/dscf3278.jpg","963_fuji/dscf3282.jpg","963_fuji/dscf3289.jpg","963_fuji/dscf3304.jpg","963_fuji/dscf3381.jpg",
  "963_fuji/dscf3526.jpg","963_fuji/dscf3597.jpg","963_fuji/dscf3599.jpg","963_fuji/dscf3786.jpg","963_fuji/dscf3836.jpg",
  "963_fuji/dscf3874.jpg",
];

const missing = [];
for (const target of newFiles) {
  const found = records.some((r) => {
    const fp = String(r.file_path ?? "")
      .split(/DCIM[\\/]/i)
      .pop()
      .replace(/\\/g, "/")
      .toLowerCase();
    return fp === target;
  });
  if (!found) missing.push(target);
}

console.log(`Total new files: ${newFiles.length}`);
console.log(`Found in manifest: ${newFiles.length - missing.length}`);
if (missing.length) {
  console.log("Missing from manifest:");
  missing.forEach((f) => console.log(" ", f));
} else {
  console.log("All new files are in the manifest.");
}
