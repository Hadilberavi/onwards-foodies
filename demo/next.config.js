/** @type {import('next').NextConfig} */

// Must match the GitHub repository name: the demo is served from
// https://hadilberavi.github.io/onwards-foodies/
const BASE_PATH = "/onwards-foodies";

const nextConfig = {
  output: "export",
  basePath: BASE_PATH,
  trailingSlash: true,
  // Required with output:"export" - there is no image optimization server.
  images: { unoptimized: true },
  // Exposed so client code can strip the prefix when parsing location paths.
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
  // The demo is a copy of code already linted in the parent app; skipping this
  // keeps eslint out of the CI install.
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
