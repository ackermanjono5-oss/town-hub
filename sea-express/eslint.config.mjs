import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "next-env.d.ts",
      "supabase/functions/**",
      "supabase/setup/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Plain <a> is deliberate: the static export is opened over file:// in
      // the Android app, and scripts/relativize-export.mjs rewrites these
      // hrefs. <Link> client-side navigation would bypass that rewrite.
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default eslintConfig;
