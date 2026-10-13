// Keeps public/pdf.worker.min.mjs in sync with the installed pdfjs-dist.
//
// pdfjs refuses to run when the worker and API versions differ, and the copy
// in public/ had silently gone stale (worker 4.10.38 vs API 5.6.205). Running
// this on postinstall means a pdfjs bump can never desync them again.
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

try {
  const pkgPath = require.resolve("pdfjs-dist/package.json");
  const { version } = require("pdfjs-dist/package.json");
  const src = join(dirname(pkgPath), "build", "pdf.worker.min.mjs");
  const destDir = join(process.cwd(), "public");

  mkdirSync(destDir, { recursive: true });
  copyFileSync(src, join(destDir, "pdf.worker.min.mjs"));
  console.log(`[pdf-worker] copied pdfjs-dist ${version} worker to public/`);
} catch (err) {
  console.warn("[pdf-worker] skipped:", err.message);
}
