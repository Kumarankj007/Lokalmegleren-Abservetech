// Shared configuration for the PDF brochure viewer
// (pdfhtml.tsx + FlipBook.tsx).

// --- PDF rendering (pdfhtml.tsx) ---

/** Canvas render scale applied to each PDF page (higher = sharper, heavier). */
export const PDF_RENDER_SCALE = 2;

/**
 * Aspect-ratio window used to detect A3 landscape spreads (≈ 1.413).
 * Pages within this range are split into two halves; A4 single pages
 * (≈ 0.707) and any other size stay whole.
 */
export const A3_RATIO_MIN = 1.3;
export const A3_RATIO_MAX = 1.55;

/**
 * Path to the pdfjs-dist worker served from /public.
 *
 * Self-hosted rather than CDN-pinned: the worker version must match the
 * installed pdfjs-dist exactly or every render fails with "API version does
 * not match the Worker version". `scripts/copy-pdf-worker.mjs` (postinstall)
 * keeps this file in step with node_modules automatically.
 */
export const PDF_WORKER_SRC = "/pdf.worker.min.mjs";

/** MIME type used when exporting each rendered page to a data URL. */
export const PAGE_IMAGE_MIME = "image/png";

// --- Flipbook layout / animation (FlipBook.tsx) ---

/** Single page dimensions; the open spread is ~2× the width. */
// export const PAGE_WIDTH = 400;
// export const PAGE_HEIGHT = 566;
export const PAGE_WIDTH = 520;
export const PAGE_HEIGHT = 735;
export const MIN_PAGE_WIDTH = 320;
export const MIN_PAGE_HEIGHT = 453;

/** Page-turn animation duration in ms. */
export const FLIPPING_TIME = 1000;

/** Maximum opacity of the page-turn shadow. */
export const MAX_SHADOW_OPACITY = 0.6;

/** Progress-bar fill transition duration in ms (matches the `duration-500` class). */
export const PROGRESS_TRANSITION_MS = 200;
