import type { CollageLayoutDef } from "./types";

/* ═══════════════════════════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════════════════════════ */
export const T = {
  bg: "#0a1420",
  panel: "#11202f",
  panelHi: "#172d40",
  border: "#1f3a52",
  borderHi: "#2d5276",
  text: "#e8dcc8",
  textDim: "#7a9ab5",
  accent: "#e2cf9e",
  brand: "#18344e",
  danger: "#d65656",
  selection: "#5dade2",
} as const;

// Editor-chrome polish, scoped to the `.nokonvo-root` wrapper so it never leaks
// into the rendered brochure pages or the surrounding app. Themed from `T`:
// slim theme-coloured scrollbars, a consistent button hover/active feel, input
// focus rings, and a couple of responsive helpers (the toolbar title collapses
// and the whole shell tightens up on smaller screens).
export const EDITOR_CHROME_CSS = `
.nokonvo-root { scrollbar-color: ${T.border} transparent; scrollbar-width: thin; }
.nokonvo-root ::-webkit-scrollbar { width: 10px; height: 10px; }
.nokonvo-root ::-webkit-scrollbar-track { background: transparent; }
.nokonvo-root ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 6px; border: 2px solid transparent; background-clip: padding-box; }
.nokonvo-root ::-webkit-scrollbar-thumb:hover { background: ${T.borderHi}; background-clip: padding-box; }
.nokonvo-root button { transition: filter .14s ease, box-shadow .14s ease, transform .04s ease, opacity .14s ease, background .14s ease, border-color .14s ease; }
.nokonvo-root button:not(:disabled):hover { filter: brightness(1.13); }
.nokonvo-root button:not(:disabled):active { transform: translateY(1px); }
.nokonvo-root input:focus, .nokonvo-root select:focus, .nokonvo-root textarea:focus { border-color: ${T.selection}; box-shadow: 0 0 0 2px ${T.selection}33; }
.nokonvo-root input[type="range"] { accent-color: ${T.accent}; }
.nokonvo-root input[type="color"] { cursor: pointer; }
/* Burger + off-canvas sidebar drawer: hidden on wide screens (the sidebar is a
   normal inline column there); on narrow screens the burger appears and the left
   sidebar becomes an absolute drawer that slides in over the canvas. */
.nokonvo-burger { display: none; }
.nokonvo-backdrop { display: none; }
@media (max-width: 1024px) {
  .nokonvo-toolbar-title { display: none !important; }
  .nokonvo-toolbar { padding: 8px !important; gap: 6px !important; }
  .nokonvo-burger { display: inline-flex !important; align-items: center; justify-content: center; }
  .nokonvo-left-wrap {
    position: absolute; top: 0; left: 0; bottom: 0; z-index: 60;
    transform: translateX(-100%); transition: transform .22s ease;
    box-shadow: 2px 0 22px rgba(0,0,0,0.5);
  }
  .nokonvo-left-wrap.open { transform: translateX(0); }
  .nokonvo-backdrop {
    display: block; position: absolute; inset: 0; z-index: 55;
    background: rgba(4, 10, 18, 0.55); backdrop-filter: blur(1px);
    animation: nokonvo-fade .18s ease;
  }
}
@keyframes nokonvo-fade { from { opacity: 0; } to { opacity: 1; } }
`;

export const A4_W = 794;
export const A4_H = 1123;
export const GRID = 8;
// When a text box auto-grows/shrinks, shift the elements that sit BELOW it by
// the same delta so content never overlaps. Set to false to keep elements
// free-floating (auto-height still works, but siblings won't move).
export const REFLOW_TEXT_BELOW = true;
export const CANVAS_SCOPE = "pte-canvas-scope";

// Editor-injected presentation reset applied UNIFORMLY to every rich-flow block
// at render time (canvas preview + serialized/PDF output). It is editor chrome,
// NOT per-line user style — see RichFlowView, serializer's RICH_BLOCK_RESET, and
// the parser's strip-on-import. Kept in one place so those three sites can't
// drift: if they disagree, a saved file re-paginates on reload ("Lagre HTML"
// clumsy re-alignment). margin-block tames the UA/`1em` paragraph margin;
// line-height is the compact body-copy leading.
export const FLOW_BLOCK_MARGIN = 2;        // px (margin-block)
export const FLOW_BLOCK_LINE_HEIGHT = 1.4; // unitless

/* ═══════════════════════════════════════════════════════════════════════
   COLLAGE LAYOUTS
   ═══════════════════════════════════════════════════════════════════════ */
export const COLLAGE_LAYOUTS: Record<string, CollageLayoutDef> = {
  "1vh": {
    label: "Ett bilde",
    rects: [{ fx: 0, fy: 0, fw: 1, fh: 1 }],
  },
  "2h": {
    label: "2 ved siden",
    rects: [
      { fx: 0, fy: 0, fw: 0.5, fh: 1 },
      { fx: 0.5, fy: 0, fw: 0.5, fh: 1 },
    ],
  },
  "2v": {
    label: "2 stablet",
    rects: [
      { fx: 0, fy: 0, fw: 1, fh: 0.5 },
      { fx: 0, fy: 0.5, fw: 1, fh: 0.5 },
    ],
  },
  "3h": {
    label: "3 kolonner",
    rects: [
      { fx: 0, fy: 0, fw: 1 / 3, fh: 1 },
      { fx: 1 / 3, fy: 0, fw: 1 / 3, fh: 1 },
      { fx: 2 / 3, fy: 0, fw: 1 / 3, fh: 1 },
    ],
  },
  "3v": {
    label: "3 rader",
    rects: [
      { fx: 0, fy: 0, fw: 1, fh: 1 / 3 },
      { fx: 0, fy: 1 / 3, fw: 1, fh: 1 / 3 },
      { fx: 0, fy: 2 / 3, fw: 1, fh: 1 / 3 },
    ],
  },
  "3mix": {
    label: "1 stor + 2",
    rects: [
      { fx: 0, fy: 0, fw: 0.6, fh: 1 },
      { fx: 0.6, fy: 0, fw: 0.4, fh: 0.5 },
      { fx: 0.6, fy: 0.5, fw: 0.4, fh: 0.5 },
    ],
  },
  "2x2": {
    label: "2 × 2",
    rects: [
      { fx: 0, fy: 0, fw: 0.5, fh: 0.5 },
      { fx: 0.5, fy: 0, fw: 0.5, fh: 0.5 },
      { fx: 0, fy: 0.5, fw: 0.5, fh: 0.5 },
      { fx: 0.5, fy: 0.5, fw: 0.5, fh: 0.5 },
    ],
  },
  "2x3": {
    label: "2 × 3",
    rects: [
      { fx: 0, fy: 0, fw: 0.5, fh: 1 / 3 },
      { fx: 0.5, fy: 0, fw: 0.5, fh: 1 / 3 },
      { fx: 0, fy: 1 / 3, fw: 0.5, fh: 1 / 3 },
      { fx: 0.5, fy: 1 / 3, fw: 0.5, fh: 1 / 3 },
      { fx: 0, fy: 2 / 3, fw: 0.5, fh: 1 / 3 },
      { fx: 0.5, fy: 2 / 3, fw: 0.5, fh: 1 / 3 },
    ],
  },
};
export const DEFAULT_COLLAGE_LAYOUT = "1vh";

/* ═══════════════════════════════════════════════════════════════════════
   PAGE / CANVAS
   ═══════════════════════════════════════════════════════════════════════ */
export const SNAP_THRESHOLD = 6;

export const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;
export type HandleDir = (typeof HANDLES)[number];

// Text boxes are content-driven on the vertical axis, so we only expose the
// horizontal/diagonal handles for them — dragging a vertical-only handle would
// just snap back once the ResizeObserver re-measures.
export const TEXT_HANDLES = ["nw", "ne", "se", "sw", "e", "w"] as const;

/* ═══════════════════════════════════════════════════════════════════════
   PRINT CSS (appended to serialized templates)
   ═══════════════════════════════════════════════════════════════════════ */
export const PRINT_CSS = `@page { size: A4; margin: 0; }
@media print {
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #e2cf9e !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .page {
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    overflow: hidden !important;
    position: relative !important;
    page-break-after: always !important;
    break-after: page !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .page:last-of-type {
    page-break-after: auto !important;
    break-after: auto !important;
  }
}`;

/* ═══════════════════════════════════════════════════════════════════════
   FALLBACK SAMPLE DATA
   ═══════════════════════════════════════════════════════════════════════ */
export const SAMPLE_DATA: Record<string, any> = {
  propertyDetail: {
    eiendom: {
      kommune: "Oslo",
      adresse: "Storgata 12 B",
      byggeår: 1937,
      etasje: 3,
      bolignummer: "H0301",
      energimerking: "GrønnB",
      arealer: {
        bruksareal: 84.5,
        interntbruksareal: 78.2,
        primærrom: 76,
        tomteareal: 220,
      },
      romfordeling: { antallSoverom: 3 },
    },
    prisantydning: 6450000,
    okonomi: {
      fellesutgifter: { utgifter: 4250 },
      andelFellesgjeld: { saldo: 320000 },
      andelFellesformue: 18500,
      salgssum: 6450000,
    },
    takst: { ligningsverdi: 1740000, ligningsverdi2: 6960000 },
    markedsføring: {
      finnInnstillinger: { eiendomstype: "Leilighet", eierformTomt: "Eiet" },
    },
    eierformBygning: { navn: "Selveier" },
    megler1: {
      navn: "Astrid Lindholm",
      email: "astrid@lokalmegleren.no",
      mobiltelefon: "98765432",
      profilbilde:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces",
      desc: "Med over 12 års erfaring fra eiendomsmegling i Oslo og omegn, hjelper jeg deg med å finne og selge boligen din.",
    },
  },
  propertyImages: [
    {
      url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&h=1200&fit=crop",
      beskrivelse: "Stue med store vindusflater mot vest",
    },
    {
      url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&h=1200&fit=crop",
      beskrivelse: "Modernisert kjøkken i 2022",
    },
  ],
};
