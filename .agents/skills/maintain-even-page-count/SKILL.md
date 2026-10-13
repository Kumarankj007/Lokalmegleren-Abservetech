---
name: maintain-even-page-count
description: >-
  Keep the property-brochure booklet at an EVEN page total in the Nokonvo
  editor (app/[locale]/rediger/nokonvo-editor) by managing the single
  print-padding page (data-field="extra-page"). Use when touching page count,
  booklet pagination/parity, the extra/padding page, page-number badges, import
  (parse) or export (serialize), or PDF imposition.
---

# Maintain Even Page Count

## Why

The brochure prints as a saddle-stitched booklet: cover alone, inner pages in
facing-page spreads, back cover alone. That imposition only pairs cleanly when
the **total page count is even**. A single auto-managed padding page closes the
gap when the real content is odd.

## The rule (single source of truth)

Count only **content** pages — i.e. pages WITHOUT `data-field="extra-page"`.

- **Content count is odd** → the padding page is **active** (shown + included) →
  total even.
- **Content count is even** → the padding page is **hidden** (dimmed in the
  editor, excluded from export) → total already even.

Exactly one padding page exists; it is never duplicated and never deleted —
only shown or hidden by parity.

## How it behaves

The padding page is a real page in the editable model, but it is auto-managed:

- **On import** it is ensured to exist (created if the template lacks one).
- **In the editor** it shows normally when needed (content odd); when not needed
  (content even) it is dimmed with a "skjult (partall sideantall)" label so it
  never silently prints.
- **On export** it is included when needed and dropped when not, so the saved
  HTML / PDF is always even.

## Where it lives (this codebase)

All in `app/[locale]/rediger/nokonvo-editor`:

- `utils/factories.ts`
  - `extraPage()` — builds the padding page: `id: "page_1000"`,
    `dataField: "extra-page"`, blueBg `rgb(24, 52, 78)`, with a grey rule `<img>`
    and a locked `page-num` badge. Must stay byte-compatible with the template's
    `page_1000` (see the brochure EJS).
  - `ensureExtraPage(model)` — if no `extra-page` exists, inserts one before the
    final back-cover pages (so the last page stays the standalone back cover).
    Called after parsing on import.
- `utils/pagination.ts` → `computeBookletNumbers(pages)` — the single source of
  truth for parity. Returns a 1-based booklet number per page, or `null` for an
  `extra-page` that is currently hidden (content count even). Numbering is
  contiguous over the visible pages, so the live badges and the exported HTML
  never diverge.
- `serializer.ts` → `serializeTemplate(...)` uses `computeBookletNumbers`,
  **skips** pages numbered `null` (hidden extra-page), and drops the
  page-break-after on the last visible page.
- Display (driven by the same numbers, passed down from
  `PropertyTemplateEditor.tsx` as `pageNumbers`):
  - `EditorCanvas.tsx` passes `pageNumber` + `hidden` (number is `null`) to
    `PageView`/`SpreadView`.
  - `PageView.tsx` dims a hidden page and shows the "skjult" label;
    `ElementView.tsx` renders the live number for `page-num` badges (blank when
    no number).
  - `PageList.tsx` dims the thumbnail and appends "· skjult".
- Import: `PropertyTemplateEditor.tsx` (the `initialHtml` effect) and
  `hooks/useFileIO.ts` (`handleImport`) call `ensureExtraPage(parsed)` before
  dispatching `reset`.
- Identification: a page is the padding page if `dataField === "extra-page"`.
  The parser (`parser.ts`) also treats the reserved id `page_1000` as
  `extra-page` so older exports that lack the attribute are still recognised
  (prevents a duplicate being created).

Server side: `Lokalmegleren-server/controllers/pdfGenerationController.js` does
the actual imposition and has its OWN blank `pad` fallback for an odd leftover —
so even if no styled padding page is present, the PDF still comes out even (just
with a plain blank instead of the styled page).

## When you change anything here, keep these invariants

- Decide parity on the **content** count (exclude `extra-page`).
- Keep exactly one padding page in the model; show/hide it by parity rather than
  adding/removing copies.
- `computeBookletNumbers` is the single source of truth — display and serializer
  must both consume it so badge numbers stay identical.
- Page numbering must stay contiguous over the pages that are actually visible /
  emitted (hidden extra-page is skipped, not numbered).
- Do not modify, reorder, or renumber real content pages.
- Do not break import → edit → export → re-import (round-trip must not
  accumulate padding pages — `ensureExtraPage` + the `page_1000`/`extra-page`
  recognition already guard this).

## Acceptance criteria

- Odd content → the padding page is shown in the editor and present in the
  exported HTML/PDF (before the back cover); total is even.
- Even content → the padding page is dimmed/"skjult" in the editor and absent
  from the exported HTML/PDF; total is even.
- Exactly one padding page ever exists; re-importing an export never creates a
  second one.
- Content pages, their order, and their styling are untouched.
- `page-num` badges renumber live as pages are added/removed/reordered.

## Quick check

Serialize a model of N content pages (with one `extra-page` present): N+1 content
even → the `extra-page` is skipped, N pages out; N+1 content odd → the
`extra-page` is emitted (numbered, second-to-last). In the editor, toggling the
content count flips the padding page between shown and dimmed.
