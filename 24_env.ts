export const IS_DEV: boolean = (() => {
  try {
    // esbuild replaces process.env.NODE_ENV in widget build.
    // In non-bundled environments this may be undefined.
    const env =
      typeof process !== "undefined" && (process as any)?.env && typeof (process as any).env.NODE_ENV === "string"
        ? ((process as any).env.NODE_ENV as string)
        : "development";
    return env !== "production";
  } catch {
    return true;
  }
})();

