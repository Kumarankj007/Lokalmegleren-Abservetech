import type { Page } from "../types";

/**
 * Compute the running booklet page number for every page, honouring the
 * `extra-page` padding rule.
 *
 * A page marked `data-field="extra-page"` is print-padding: it is only included
 * when the rest of the booklet has an ODD page count, so the total pads to an
 * EVEN count (required for double-sided / booklet printing). When the rest is
 * already even the extra page is dropped.
 *
 * Returns an array parallel to `pages`:
 *   • a 1-based booklet number for each page that participates in the document
 *   • `null` for an extra-page that is currently hidden (not numbered, not printed)
 *
 * The numbering is contiguous over the visible pages, so the same result drives
 * both the live editor badges and the serialized HTML — they never diverge.
 */
export function computeBookletNumbers(pages: Page[]): (number | null)[] {
  const nonExtraCount = pages.reduce(
    (n, p) => (p.dataField === "extra-page" ? n : n + 1),
    0,
  );
  // Odd remainder → we need exactly ONE padding page to reach an even total.
  let padBudget = nonExtraCount % 2 === 1 ? 1 : 0;

  let running = 0;
  return pages.map((p) => {
    if (p.dataField === "extra-page") {
      if (padBudget > 0) {
        padBudget -= 1;
        running += 1;
        return running;
      }
      return null; // hidden — not numbered, not serialized
    }
    running += 1;
    return running;
  });
}

/**
 * Re-align the "OM EIENDOMMEN" running-header pill on every page that carries one
 * to the OUTER corner of its booklet spread, like a magazine running header, and
 * round only its INNER edge (mirroring the .om-pill-left/.om-pill-right classes,
 * whose radius is otherwise lost once the editor strips element classes):
 *   • ODD  booklet page → hugs the RIGHT edge, rounded on the LEFT  (inner) side
 *   • EVEN booklet page → hugs the LEFT  edge, rounded on the RIGHT (inner) side
 *
 * The pill is a narrow text element reading "OM EIENDOMMEN"; the full-width
 * CENTRED "OM EIENDOMMEN" section titles on the blue divider pages are a
 * different element and are left untouched (the `width < half page` guard).
 *
 * Must be run after ANY page insert / delete / reorder: those shift every
 * following page's booklet number and therefore flip the side its pill belongs
 * on. Returns the same array (unchanged pages by reference) when nothing moves.
 */
export function normalizeOmPills(pages: Page[]): Page[] {
  const numbers = computeBookletNumbers(pages);
  return pages.map((page, idx) => {
    // Only the Om/Accordion CONTENT pages carry the corner running-header pill.
    // The blue divider/cover pages (om-cover, accordion-cover) show a CENTRED
    // "OM EIENDOMMEN" title that must never be shunted into a corner — the
    // page-level marker keeps this normalization off them.
    if (page.dataField !== "om-page" && page.dataField !== "accordion-page") return page;
    const n = numbers[idx];
    if (n == null) return page;
    const wantRight = n % 2 === 1; // odd → right, even → left
    let changed = false;
    const elements = page.elements.map((el) => {
      // Match the pill by its exact ALL-CAPS text (case-sensitive so the page's
      // "Om Eiendommen" heading — which upper-cases to the same string — is left
      // alone) and a narrow width (the heading spans the whole text column).
      const isPill =
        el.type === "text" &&
        (el.text || "").trim() === "OM EIENDOMMEN" &&
        el.width > 0 &&
        el.width < page.width * 0.5;
      if (!isPill) return el;
      const targetX = wantRight ? Math.max(0, Math.round(page.width - el.width)) : 0;
      // Keep the pill's own radius magnitude (a full stadium 999 if it has none)
      // and place the rounded corners on the INNER side, straight on the page edge.
      const r =
        Math.max(el.borderRadius.tl, el.borderRadius.tr, el.borderRadius.br, el.borderRadius.bl) ||
        999;
      const targetRadius = wantRight
        ? { tl: r, tr: 0, br: 0, bl: r } // right pill → rounded LEFT (inner) side
        : { tl: 0, tr: r, br: r, bl: 0 }; // left pill  → rounded RIGHT (inner) side
      const radiusSame =
        el.borderRadius.tl === targetRadius.tl &&
        el.borderRadius.tr === targetRadius.tr &&
        el.borderRadius.br === targetRadius.br &&
        el.borderRadius.bl === targetRadius.bl;
      if (Math.round(el.x) === targetX && radiusSame) return el;
      changed = true;
      return { ...el, x: targetX, borderRadius: targetRadius };
    });
    return changed ? { ...page, elements } : page;
  });
}
