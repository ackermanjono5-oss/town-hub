/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export is what scripts/relativize-export.mjs post-processes and
  // what sea-express-expo bundles into android/app/src/main/assets/webroot,
  // so the Android app runs fully offline over file://.
  output: 'export',
  // The static export has no server to run the Image Optimization API.
  images: { unoptimized: true },
};

module.exports = nextConfig;
