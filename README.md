# NextLevel Food

A meal-sharing community built on the Next.js 14 App Router — React Server Components, Server Actions and streamed data fetching, with no API layer in between.

[![Next.js](https://img.shields.io/badge/Next.js-14.0.3-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)](https://github.com/WiseLibs/better-sqlite3)

> ### [View the live demo →](https://hadilberavi.github.io/onwards-foodies/)
>
> The demo is a **static export** of this app. Every page and interaction is real, but there is no server behind it: meal data is a build-time snapshot, and anything you submit is saved to your own browser's `localStorage`. The full application — the one in this repository — runs a Node server and writes to SQLite. [Why the two differ ↓](#why-there-are-two-versions)

## About

NextLevel Food is a recipe-sharing site where visitors browse community-submitted meals and contribute their own. It was built to work through the App Router end to end: rendering on the server by default, opting into the client only where interactivity demands it, and mutating data through a Server Action bound directly to a `<form>` — no API routes, no client-side fetching, no state management library.

The stack is deliberately small. Data lives in a local SQLite file read synchronously through `better-sqlite3`, uploaded images are written to disk, and styling is plain CSS Modules.

## Features

**Browsing**

- Landing page with an auto-rotating hero slideshow
- Meals grid rendered on the server straight from SQLite
- Per-meal detail pages pre-rendered at build time via `generateStaticParams`
- Active-route highlighting in the nav, driven by `usePathname`

**Contributing**

- Share form submitted through a Server Action — the function is passed directly as the form's `action`, so submission works before any JavaScript has loaded
- Custom image picker with a live preview via the `FileReader` API
- Uploaded images written to `public/images/` and served back through `next/image`
- Titles slugified into clean URLs; submitted instructions sanitized with `xss` before they are stored

**Rendering**

- React Server Components by default — only four components ship JavaScript to the browser
- `<Suspense>` streaming on the meals list, so the page shell paints while data loads
- A route-level `error.js` boundary scoped to `/meals/*`, and a `not-found.js` page for unknown slugs

## Architecture notes

**Server-first by default.** Pages are async Server Components that query SQLite directly — `lib/meals.js` runs `db.prepare(...).all()` inside the component tree. There is no API route, no serialization boundary, and no client-side data fetching anywhere in the app.

**Mutations without an endpoint.** `lib/action.js` is marked `"use server"` and exports `shareMeal(formData)`. The share page passes that function straight to `<form action={shareMeal}>`. Next.js generates the endpoint, serializes the form data, runs the function on the server, and the action finishes with `redirect('/meals')`.

**Streaming over blocking.** `getMeals()` deliberately awaits a two-second delay to make the loading path visible. The meals page wraps its data-dependent child in `<Suspense>`, so the header and call-to-action render immediately while the grid streams in behind them.

**Sanitized at the boundary.** Recipe instructions are rendered with `dangerouslySetInnerHTML` so that newlines become `<br />`. That is safe because `saveMeal()` runs every submission through `xss()` *before* it reaches the database — sanitizing on write rather than on read.

## Why there are two versions

This application cannot run on GitHub Pages, and that is not a limitation worth engineering around — it follows directly from the architecture.

Server Actions need a server to execute them. `better-sqlite3` needs a filesystem it can write to. Image uploads need somewhere to put the file. Static hosting provides none of those things. Building this codebase with `output: 'export'` fails with exactly the error you would expect:

> `Server Actions are not supported with static export.`

The choice was to strip the server features out so the app could be hosted anywhere, or to keep them and ship a second artifact. Removing them would have meant discarding the point of the project.

So the repository contains both. The real application, at the root, needs Node and a writable SQLite file. The **static demo** in [`demo/`](demo) reproduces the same interface with browser-side substitutes: meal data is a snapshot captured at build time, and the share form writes to the visitor's `localStorage` instead of a database. It is fully clickable, and nothing ever leaves the browser.

### What differs

| | Full application | Static demo |
|---|---|---|
| **Hosting** | Node runtime (Vercel, Render, a VPS, local) | Any static host — GitHub Pages |
| **Rendering** | Server Components, per request | Pre-rendered HTML, shipped as files |
| **Meal data** | Live SQLite queries | Build-time snapshot of `meals.db` |
| **Submitting a meal** | Server Action writes a row | Saved to `localStorage` in your browser |
| **Image upload** | Original file written to `public/images/` | Downscaled and held as a data URL |
| **Persistence** | Shared — everyone sees every meal | Private to your browser; cleared with site data |
| **New detail pages** | Generated on demand | Rendered client-side from stored data |
| **Image optimization** | On, server-side | Off (`unoptimized`) — no optimizer available |

Two consequences worth knowing about in the demo: a meal you add is reachable at a real `/meals/<slug>/` URL, but that URL is served through `404.html` and therefore returns an HTTP 404 status even though the page renders correctly. And because meals are stored per-browser, sharing that link with someone else will not show them your meal.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14.0.3 (App Router) |
| UI | React 18, Server Components by default |
| Language | JavaScript (ES modules) |
| Styling | CSS Modules + a small global stylesheet |
| Database | SQLite via `better-sqlite3` |
| Mutations | Server Actions (`"use server"`) |
| Utilities | `slugify` for URLs, `xss` for sanitizing user HTML |

## Getting started

Requires Node.js 18 or newer. `better-sqlite3` is a native module and will either download a prebuilt binary or compile on install.

```bash
git clone https://github.com/Hadilberavi/onwards-foodies.git
cd onwards-foodies
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). A pre-seeded `meals.db` is committed, so there is no database setup step.

To rebuild the database from scratch, delete it first — `initdb.js` inserts unconditionally and will fail against the existing file with a `UNIQUE constraint failed: meals.slug` error:

```bash
rm meals.db && node initdb.js
```

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint via `next lint` |
| `npm run demo:seed` | Re-snapshot `meals.db` into the demo's seed data |

## Project structure

```
onwards-foodies/
├── app/                            # App Router — routes, layouts, route-level UI
│   ├── layout.js                   # Root layout: metadata, header, global styles
│   ├── page.js                     # "/" — hero + auto-rotating slideshow
│   ├── not-found.js                # Rendered by notFound() on unknown slugs
│   ├── community/page.js           # "/community"
│   └── meals/
│       ├── page.js                 # "/meals" — Suspense-streamed grid
│       ├── error.js                # Client error boundary for /meals/*
│       ├── [mealSlug]/page.js      # "/meals/:slug" + generateStaticParams
│       └── share/page.js           # "/meals/share" — form bound to a Server Action
├── components/
│   ├── main-header/                # Header, nav with active state, SVG wave
│   ├── images/image-slideshow.js   # Client — timed crossfade
│   └── meals/                      # Grid, card, and the image picker
├── lib/
│   ├── meals.js                    # SQLite queries + saveMeal (slugify, xss, fs)
│   └── action.js                   # "use server" — the shareMeal Server Action
├── scripts/export-demo-seed.mjs    # Snapshots meals.db into demo/lib/seed-meals.js
├── demo/                           # Static export deployed to GitHub Pages
├── initdb.js                       # Creates the meals table and seeds recipes
└── meals.db                        # SQLite database (committed, pre-seeded)
```

## The demo

`demo/` is a standalone Next.js app that reuses the same pages, components and stylesheets, with three things swapped out:

- **Data** — `demo/lib/seed-meals.js` is generated from `meals.db` by `npm run demo:seed` and committed, so the demo never depends on `better-sqlite3`.
- **Mutations** — `demo/lib/demo-store.js` replaces `saveMeal()`. It runs the same `slugify` and `xss` calls, downscales the picked image through a canvas, and writes to `localStorage`.
- **Missing routes** — meals added in the browser have no pre-rendered page, so `demo/app/not-found.js` inspects the URL and renders the meal from storage when the slug matches.

Images are the one genuine trap. `next/image` does not apply `basePath` to a plain string `src`, so `/images/burger.jpg` would 404 under `/onwards-foodies/` with no build error at all. The generated seed therefore carries static imports instead, which webpack rewrites correctly; user-submitted data URLs pass through untouched. CI asserts both conditions on every deploy.

Run it locally — note the `basePath`, which applies in development too:

```bash
cd demo && npm install && npm run dev
```

Then open [http://localhost:3000/onwards-foodies/](http://localhost:3000/onwards-foodies/).

## Deployment

**The static demo** is built from `demo/` and published by `.github/workflows/deploy.yml` on every push to `main`. The workflow installs and builds inside `demo/`, verifies the export, and uploads `demo/out` to GitHub Pages.

**The full application** needs a Node runtime — Vercel, Render, Railway or a VPS. One caveat: SQLite and uploaded images live on the local filesystem, so the host must provide persistent disk. Ephemeral or serverless filesystems will lose both on every deploy. On a platform like Vercel you would need a hosted database (Turso, Postgres) and object storage for images.

## Known limitations

- **No authentication** — anyone can submit a meal under any name.
- **No server-side validation** — the form relies on HTML `required` attributes; a crafted request can still insert empty fields.
- **Uploads are unbounded** — file size and type are not checked beyond the `accept` attribute, and two meals with the same title collide on the `slug` unique constraint.
- **SQLite is single-writer** and stored on local disk — fine for one instance, unsuitable for scaling horizontally.
- **No test suite.**

## Credits

The UI design, starter assets and feature set come from Maximilian Schwarzmüller's Next.js course. The application was built by following it and then extended — build-time static generation, the GitHub Pages pipeline, and the separate static demo are additions of my own.

Built by **Hadel Berawi** — [github.com/Hadilberavi](https://github.com/Hadilberavi)
