import { build } from "esbuild";

await build({
  entryPoints: ["widget/src/entry.tsx"],
  bundle: true,
  minify: true,
  sourcemap: false,
  platform: "browser",
  target: ["es2018"],
  format: "iife",
  globalName: "FinamOnboardingWidget",
  outfile: "widget/finam-onboarding-widget.js",
  define: {
    "process.env.NODE_ENV": "\"production\""
  }
});

