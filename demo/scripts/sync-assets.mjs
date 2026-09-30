// Copies the parent app's binary assets into demo/assets so the demo stays
// pixel-identical without committing a second ~6 MB copy of every image.
//
// Runs automatically via the `predev` / `prebuild` npm scripts. The output
// directory is gitignored: it is generated, never edited by hand.
//
// Meal photos land in assets/meals/ because the generated seed imports them
// statically. next/image does NOT apply basePath to plain string srcs, so a
// static import is what keeps image URLs correct under /onwards-foodies/.

import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const demoRoot = resolve(here, "..");
const appRoot = resolve(demoRoot, "..");

// Junk that must never reach the published bundle.
const EXCLUDE = new Set([".DS_Store", "undefined.png"]);
const filter = (src) => !EXCLUDE.has(src.split("/").pop());

const jobs = [
  // Slideshow photos, logo and community icons — imported via `@/assets/...`.
  { from: resolve(appRoot, "assets"), to: resolve(demoRoot, "assets") },
  // Meal photos backing the generated seed — imported via `@/assets/meals/...`.
  {
    from: resolve(appRoot, "public/images"),
    to: resolve(demoRoot, "assets/meals"),
  },
];

for (const { from, to } of jobs) {
  if (!existsSync(from)) {
    console.error(`[sync-assets] missing source: ${from}`);
    process.exit(1);
  }
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true, filter });
}

console.log("[sync-assets] assets synced from the parent app");
