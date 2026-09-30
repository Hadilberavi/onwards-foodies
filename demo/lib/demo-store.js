// Browser-side stand-in for the real app's SQLite layer (lib/meals.js).
//
// The real app writes a row and an image file on the server. A static export
// has neither, so submitted meals live in the visitor's own localStorage.
// Nothing here ever leaves the browser.

import slugify from "slugify";
import xss from "xss";
import { seedMeals } from "./seed-meals";

// Namespaced and versioned on purpose: GitHub Pages serves every project of
// an account from one origin (hadilberavi.github.io), so localStorage is
// shared with unrelated repos.
const STORAGE_KEY = "onwards-foodies:meals:v1";

// Base64 of a downscaled JPEG runs ~60-120 KB. localStorage caps around 5 MB
// per origin, shared, so keep a hard ceiling and evict the oldest entries.
const MAX_STORED = 24;
const MAX_EDGE = 600;
const JPEG_QUALITY = 0.7;

function readRaw() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt payload or storage blocked entirely (private mode, site data
    // disabled). Drop the key rather than white-screening the meals grid.
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing further we can do */
    }
    return [];
  }
}

/** Meals this visitor added, oldest first. Always safe to call. */
export function getStoredMeals() {
  // Defend against half-written entries: every consumer assumes these fields.
  return readRaw().filter(
    (meal) =>
      meal &&
      typeof meal.slug === "string" &&
      typeof meal.title === "string" &&
      typeof meal.instructions === "string",
  );
}

/** One stored meal by slug, or undefined. */
export function getStoredMeal(slug) {
  return getStoredMeals().find((meal) => meal.slug === slug);
}

/** True once the visitor has added at least one meal. */
export function hasStoredMeals() {
  return getStoredMeals().length > 0;
}

function uniqueSlug(title) {
  // slugify returns "" for emoji-only or non-Latin titles, which would make
  // the detail link point back at the grid.
  const base = slugify(title, { lower: true }) || "meal";
  const taken = new Set([
    ...seedMeals.map((m) => m.slug),
    ...getStoredMeals().map((m) => m.slug),
  ]);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/**
 * Shrink a picked file to a data URL. The real app streams the original bytes
 * to public/images/; here the image has to fit in localStorage.
 */
export async function fileToDataUrl(file) {
  const readAsDataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });

  const image = new Image();
  image.src = readAsDataUrl;
  try {
    // decode() resolves only once the bitmap is usable; drawImage on a
    // half-loaded image silently produces a blank canvas.
    await image.decode();
  } catch {
    // Some platforms let a HEIC through the accept filter.
    throw new Error("That image format could not be read. Try a JPEG or PNG.");
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const ctx = canvas.getContext("2d");
  // JPEG has no alpha channel; without this, transparent PNGs go black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

/**
 * Persist a submitted meal and return it. Mirrors saveMeal() in lib/meals.js:
 * same slugify, same xss sanitizing before the value is ever rendered as HTML.
 * Throws a human-readable Error the form can display.
 */
export function saveStoredMeal({
  title,
  summary,
  instructions,
  creator,
  creator_email,
  image,
}) {
  const meal = {
    // meals-grid.js keys on `id`; without one, React sees duplicate keys.
    id: `demo-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
    slug: uniqueSlug(title),
    title,
    summary,
    // The detail view renders this through dangerouslySetInnerHTML, so it must
    // be sanitized on write — exactly where the real app sanitizes it.
    instructions: xss(instructions),
    creator,
    creator_email,
    image,
    addedAt: new Date().toISOString(),
  };

  const next = [...getStoredMeals(), meal].slice(-MAX_STORED);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    if (error?.name === "QuotaExceededError") {
      throw new Error(
        "Your browser's storage for this demo is full. Remove a meal you added earlier, or clear this site's data.",
      );
    }
    throw new Error(
      "This demo could not save to your browser's storage. Private browsing usually blocks it.",
    );
  }

  return meal;
}

/** Wipe everything this visitor added. */
export function clearStoredMeals() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* already unavailable */
  }
}
