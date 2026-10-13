---
name: sync-document-images
description: >-
  Reconcile the property brochure's VEDLEGG (attachment) pages with WebMegler's
  "Diverse til salgsoppgave" PDFs during a Webmegler sync. Use when touching the
  document/VEDLEGG section, the page_400 divider or page_401+ document image
  pages, the syncDocumentImages / syncAll functions, or the document markers
  (data-field="document-cover" / "document-page") in the EJS template.
---

# Synchronize Property Document Images from WebMegler

## Why

Each brochure ends with a VEDLEGG (attachments) section: a blue divider page
followed by one image per page of every "Diverse til salgsoppgave" PDF attached
to the property in WebMegler. Those PDFs change over the life of a listing
(a corrected floor plan, a new energy certificate, a removed document), so the
"Sync to Webmegler" action must re-pull them, exactly as it re-pulls text and
gallery photos.

Before this skill, `syncTextsFromWebmegler` **fetched** the document images
(`getDocumentImages`, the expensive PDF→JPEG pipeline) and passed them into
`syncAll`, but `syncAll` **dropped them** — there was `syncPropertyImages` but
no `syncDocumentImages`. The VEDLEGG section therefore never synced.

## The rule (single source of truth)

Document scans are **not hand-editable content** — WebMegler is authoritative.
So this is a **remove-all-and-rebuild** reconciliation, mirroring
`syncPropertyImages`: every sync drops the old document image pages and re-emits
them from the freshly fetched `documentImages`.

## Section structure (must stay byte-compatible with the EJS)

Mirrors `views/property-template.ejs` (server):

- **Divider** `page_400` — blue "VEDLEGG" page, carries a `page-num` badge and a
  `data-field="eiendom.adresse"` span. Marked `data-field="document-cover"`.
- **Image pages** `page_401, page_402, …` — one white page per PDF page, a single
  `<img class="pdf24_05">` (object-fit:contain) inside `.pdf24_03`. Marked
  `data-field="document-page"`. IDs are contiguous, 0-independent, restart at 401
  every rebuild.

The section sits after the accordion (`page_93*`) and before the end pages
(`page_1001`/`page_1002`, or legacy `page_200`/`page_250`).

## Identity across the editor round-trip

The nokonvo editor's serializer strips custom classes/attributes from elements
but **preserves page ids and page-level `data-field`**. So document pages are
identified by, in order:

1. the markers `data-field="document-cover"` / `"document-page"` (survive
   editing — the preferred path), then
2. the **legacy id convention** — `page_400` divider, `page_401..page_999`
   images — for HTML generated before the markers existed.

`page_401..999` is exclusively documents: every other fixed page id is `< 400`
(cover/gallery/content) or `>= 1000` (end pages). Assumes a property never has
600+ document pages (docPageCounter starts at 401).

## Where it lives (this codebase)

Server, `Lokalmegleren-server`:

- `controllers/sync-text-from-webmegler.js`
  - `syncDocumentImages(savedHtml, documentImages, propertyDetail)` — the
    reconciler (next to `syncPropertyImages`). Returns `{ html, changed }`.
  - `syncAll(...)` — now runs `syncDocumentImages` as the 4th pass (after text,
    brief, property images) and merges its `changed` entries. Exported.
  - Helpers: `isDocCoverPage` / `isDocImagePage` / `isEndPage`,
    `buildDocCoverPage` / `buildDocImagePage` / `docPageNumBadge`.
- `controllers/pdfGenerationController.js`
  - `syncTextsFromWebmegler` already fetches `documentImages` via
    `getDocumentImages` and passes them to `syncAll` — unchanged.
  - `generateHTMLForProperty` renders the EJS (first-time generation) — unchanged.
- `views/property-template.ejs` — `page_400` and the document image page now
  carry the `document-cover` / `document-page` markers + `data-role="document-photo"`,
  so freshly generated brochures use the same identity scheme as the sync.

Frontend, `Lokalmegleren-Admin`: **no change**. The editor's "Sync to Webmegler"
button (`app/[locale]/rediger/Client.tsx` → `syncToWebmegler` → `SYNC_WEBMEGLER`)
serializes the current model, POSTs it, and loads the returned `updatedHtml`
back in. It now reconciles document images for free. (The `useDocumentImages`
sidebar hook is a separate concern — it streams doc images for manual placement.)

## Behaviour

- **Images changed** → old `page_401+` removed, fresh ones rebuilt with new srcs.
- **Divider present** → preserved as-is (keeps its baked page number; its address
  is refreshed by the text-sync pass). Image pages are inserted right after it.
- **Divider missing but docs exist** → divider created at the anchor (before the
  first end page, else after the last accordion page, else body-end) with the
  current address baked in and a best-effort page number.
- **Documents empty** → the whole section (divider + image pages) is removed.

## Gotcha — rebuilt pages MUST carry `data-page`

The nokonvo parser detects pages with `querySelectorAll("[data-page]")` first and
only falls back to `"[id^=page_]"` when **no** element has `data-page`
([parser.ts](../../../app/[locale]/rediger/nokonvo-editor/parser.ts) lines
66–74). The editor serializes every page with `data-page`, and the sync endpoint
receives that serialized HTML — so a rebuilt page carrying only an `id` (raw-EJS
style) is silently dropped from the editor model. It still renders in the saved
HTML and the PDF, just not on the editor canvas.

Symptom this caused: document images showed before a sync but vanished from the
editor after it (the HTML file stayed correct). Fix: `buildDocCoverPage` /
`buildDocImagePage` emit `data-page` on the page div, exactly like the serializer
and like `buildEditorImagePage` (the property-image rebuild) already do.

## Invariants — keep these when you change anything here

- Every rebuilt page div sets both `id` and `data-page` (see the gotcha above).
- WebMegler is the source of truth: rebuild image pages, don't try to merge.
- Exactly one divider ever exists; image ids restart at 401 and stay contiguous.
- Rebuilt markup must stay byte-compatible with `property-template.ejs` (classes,
  `data-field` markers) so it round-trips through the editor and matches a freshly
  generated brochure.
- Never touch non-document pages (< 400 or >= 1000).
- Page numbers are cosmetic here and are recomputed live by the editor
  (`computeBookletNumbers`) — don't hand-maintain a running counter in the sync.
- Idempotent: re-syncing the same documents must not accumulate pages.

## Acceptance criteria

- After a sync, the VEDLEGG section matches WebMegler's current
  "Diverse til salgsoppgave" PDFs exactly (added/updated/removed).
- Legacy brochures (no markers) sync correctly and come out marked.
- Editor round-trip (import → edit → export → re-sync) never duplicates the
  divider or accumulates image pages.
- The text-sync pass keeps the divider address in sync.
