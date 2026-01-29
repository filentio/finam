#!/usr/bin/env node
/**
 * HAR summary helper for onboarding analysis.
 *
 * Usage:
 *   node tools/har-summary.js path/to/file.har
 *
 * Outputs:
 *   - top domains and endpoints
 *   - errors (>=400) and redirects
 *   - slowest requests
 *   - auth-ish endpoints hints (login/auth/kyc/account)
 */

const fs = require("fs");
const path = require("path");
const { URL } = require("url");

function formatMs(ms) {
  if (!Number.isFinite(ms)) return "n/a";
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function safeUrl(u) {
  try {
    return new URL(u);
  } catch {
    return null;
  }
}

function pick(entries, n) {
  return entries.slice(0, Math.max(0, n));
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node tools/har-summary.js path/to/file.har");
    process.exit(2);
  }
  const abs = path.resolve(process.cwd(), file);
  const raw = fs.readFileSync(abs, "utf8");
  const har = JSON.parse(raw);

  const entries = har?.log?.entries;
  if (!Array.isArray(entries) || entries.length === 0) {
    console.error("HAR has no entries.");
    process.exit(1);
  }

  const byHost = new Map();
  const byEndpoint = new Map(); // method + host + pathname
  const errors = [];
  const redirects = [];
  const timings = [];
  const authHints = [];

  for (const e of entries) {
    const req = e.request || {};
    const res = e.response || {};
    const url = req.url || "";
    const method = req.method || "GET";
    const u = safeUrl(url);
    const host = u?.host || "(invalid-url)";
    const pathname = u?.pathname || "(invalid-path)";
    const endpointKey = `${method} ${host}${pathname}`;
    const time = typeof e.time === "number" ? e.time : NaN;
    const status = typeof res.status === "number" ? res.status : NaN;

    byHost.set(host, (byHost.get(host) || 0) + 1);
    byEndpoint.set(endpointKey, (byEndpoint.get(endpointKey) || 0) + 1);

    timings.push({ time, endpointKey, status, url });

    if (Number.isFinite(status) && status >= 400) {
      const text = res.statusText || "";
      errors.push({ status, text, endpointKey, url, time });
    }
    if (Number.isFinite(status) && status >= 300 && status < 400) {
      const locHeader = (res.headers || []).find(
        (h) => String(h.name || "").toLowerCase() === "location",
      );
      redirects.push({
        status,
        endpointKey,
        url,
        location: locHeader?.value || "",
        time,
      });
    }

    const hay = `${endpointKey} ${url}`.toLowerCase();
    if (
      /auth|login|token|session|kyc|aml|account|open|onboarding|agreement|sign|passport|document/.test(
        hay,
      )
    ) {
      authHints.push({ endpointKey, status, time, url });
    }
  }

  const hostsSorted = [...byHost.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([host, count]) => ({ host, count }));
  const endpointsSorted = [...byEndpoint.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([endpoint, count]) => ({ endpoint, count }));

  timings.sort((a, b) => (b.time || 0) - (a.time || 0));
  errors.sort((a, b) => (b.time || 0) - (a.time || 0));

  console.log(`# HAR summary: ${path.basename(abs)}`);
  console.log("");
  console.log(`Total requests: ${entries.length}`);
  console.log("");

  console.log("## Top hosts");
  for (const x of pick(hostsSorted, 15)) {
    console.log(`- ${x.host}: ${x.count}`);
  }
  console.log("");

  console.log("## Top endpoints");
  for (const x of pick(endpointsSorted, 20)) {
    console.log(`- ${x.endpoint}: ${x.count}`);
  }
  console.log("");

  console.log("## Slowest requests");
  for (const x of pick(timings, 20)) {
    console.log(
      `- ${formatMs(x.time)} | ${String(x.status).padStart(3)} | ${x.endpointKey}`,
    );
  }
  console.log("");

  console.log(`## Errors (>=400): ${errors.length}`);
  for (const x of pick(errors, 30)) {
    console.log(
      `- ${formatMs(x.time)} | ${x.status} ${x.text} | ${x.endpointKey}`,
    );
  }
  console.log("");

  console.log(`## Redirects (3xx): ${redirects.length}`);
  for (const x of pick(redirects, 30)) {
    console.log(
      `- ${formatMs(x.time)} | ${x.status} | ${x.endpointKey} -> ${x.location}`,
    );
  }
  console.log("");

  console.log(`## Auth/onboarding hints: ${authHints.length}`);
  for (const x of pick(authHints, 40)) {
    console.log(
      `- ${formatMs(x.time)} | ${String(x.status).padStart(3)} | ${x.endpointKey}`,
    );
  }
}

main();

