import {
  COLLAGE_LAYOUTS,
  DEFAULT_COLLAGE_LAYOUT,
  A4_W,
  A4_H,
} from "../constants";
import type {
  ElementType,
  CollageRect,
  CollageCell,
  CanvasElement,
  Page,
  EditorModel,
} from "../types";

export function genId(prefix = "el"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function cellFromRect(r: CollageRect): CollageCell {
  return {
    fx: r.fx,
    fy: r.fy,
    fw: r.fw,
    fh: r.fh,
    src: "",
    scale: 1,
    posX: 50,
    posY: 50,
  };
}

export function cellsForLayout(
  layoutKey: string,
  existing: CollageCell[] = [],
): CollageCell[] {
  const def =
    COLLAGE_LAYOUTS[layoutKey] ?? COLLAGE_LAYOUTS[DEFAULT_COLLAGE_LAYOUT];
  return def.rects.map((r, i) => {
    const prev = existing[i];
    const base = cellFromRect(r);
    if (prev && prev.src) {
      return {
        ...base,
        src: prev.src,
        scale: prev.scale,
        posX: prev.posX,
        posY: prev.posY,
      };
    }
    return base;
  });
}

export function snapToSpreadStart(idx: number): number {
  if (idx <= 0) return 0;
  return idx - ((idx + 1) % 2);
}

export function defaultElement(type: ElementType): CanvasElement {
  return {
    id: genId(type),
    type,
    x: 100,
    y: 100,
    width:
      type === "image"
        ? 300
        : type === "svg"
          ? 60
          : type === "collage"
            ? 794
            : 400,
    height:
      type === "image"
        ? 200
        : type === "svg"
          ? 60
          : type === "collage"
            ? 1123
            : 60,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
    // ── LOCK BEHAVIOUR ──────────────────────────────────────────────────
    // New elements added from the toolbar are always UNLOCKED so the user
    // can position them immediately. Text elements imported from HTML are
    // defaulted to LOCKED in extractElement (where data-locked is read).
    locked: false,
    bind: null,
    bindSrc: null,
    bindFormat: null,
    bindPrefix: "",
    bindSuffix: "",
    text: type === "text" ? "Ny tekst" : "",
    fontFamily: "Helvetica",
    fontSize: 30,
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#ffffff",
    textAlign: "left",
    lineHeight: "1.4",
    letterSpacing: "normal",
    wordSpacing: "normal",
    textTransform: "none",
    textDecoration: "none",
    whiteSpace: "normal",
    textShadow: "none",
    src:
      type === "image"
        ? "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600"
        : "",
    objectFit: "cover",
    imageFilter: "none",
    imageScale: 1,
    imagePosX: 50,
    imagePosY: 50,
    background: "transparent",
    padding: { t: 0, r: 0, b: 0, l: 0 },
    borderRadius: { tl: 0, tr: 0, br: 0, bl: 0 },
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: "#000000",
    boxShadow: "none",
    svgMarkup:
      type === "svg"
        ? `<svg width="60" height="60" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#e2cf9e"/></svg>`
        : "",
    svgColors: [],
    svgTexts: [],
    collageLayout: type === "collage" ? DEFAULT_COLLAGE_LAYOUT : "",
    collageGap: type === "collage" ? 6 : 0,
    collageCells:
      type === "collage" ? cellsForLayout(DEFAULT_COLLAGE_LAYOUT) : [],
    dataField: null,
    spanning: false,
  };
}

export function blankPage(): Page {
  return {
    id: genId("page"),
    name: "Side 1",
    bg: "#e2cf9e",
    width: A4_W,
    height: A4_H,
    loop: null,
    elements: [
      {
        id: "el-mqz6wtni-jupf",
        type: "image",
        x: 0,
        y: 1087.5,
        width: 794,
        height: 1,
        rotation: 0,
        opacity: 1,
        zIndex: 0,
        locked: false,
        bind: null,
        bindSrc: null,
        bindFormat: null,
        bindPrefix: "",
        bindSuffix: "",
        text: "",
        fontFamily: "",
        fontSize: 0,
        fontWeight: "",
        fontStyle: "",
        color: "",
        textAlign: "",
        lineHeight: "",
        letterSpacing: "",
        wordSpacing: "",
        textTransform: "",
        textDecoration: "",
        whiteSpace: "",
        textShadow: "",
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
        objectFit: "fill",
        imageFilter: "none",
        imageScale: 1,
        imagePosX: 50,
        imagePosY: 50,
        background: "rgb(128, 128, 128)",
        padding: {
          t: 0,
          r: 0,
          b: 0,
          l: 0,
        },
        borderRadius: {
          tl: 0,
          tr: 0,
          br: 0,
          bl: 0,
        },
        borderWidth: 0,
        borderStyle: "solid",
        borderColor: "rgb(30, 41, 59)",
        boxShadow: "none",
        svgMarkup: "",
        svgColors: [],
        svgTexts: [],
        collageLayout: "",
        collageGap: 0,
        collageCells: [],
        dataField: null,
        spanning: false,
      },
      {
        id: "el-mqz6wtni-od7d",
        type: "text",
        x: 383,
        y: 1075,
        width: 28,
        height: 28,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        locked: true,
        bind: null,
        bindSrc: null,
        bindFormat: null,
        bindPrefix: "",
        bindSuffix: "",
        text: "1",
        fontFamily: "Helvetica",
        fontSize: 13,
        fontWeight: "400",
        fontStyle: "normal",
        color: "rgb(128, 128, 128)",
        textAlign: "center",
        lineHeight: "1.2",
        letterSpacing: "normal",
        wordSpacing: "0px",
        textTransform: "none",
        textDecoration: "none",
        whiteSpace: "normal",
        textShadow: "none",
        src: "",
        objectFit: "",
        imageFilter: "none",
        imageScale: 1,
        imagePosX: 50,
        imagePosY: 50,
        background: "#e2cf9e",
        padding: {
          t: 4,
          r: 0,
          b: 4,
          l: 0,
        },
        borderRadius: {
          tl: 50,
          tr: 50,
          br: 50,
          bl: 50,
        },
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "rgb(128, 128, 128)",
        boxShadow: "none",
        svgMarkup: "",
        svgColors: [],
        svgTexts: [],
        collageLayout: "",
        collageGap: 0,
        collageCells: [],
        dataField: "page-num",
        spanning: false,
      },
    ],
  };
}

/**
 * The print-padding page (`data-field="extra-page"`): a blueBg page carrying a
 * single page-number badge, mirroring the template's `page_1000`. It is only
 * printed when the rest of the booklet has an odd page count (see
 * utils/pagination). Created when an imported template lacks one, so the padding
 * mechanism survives save → reload even if it was dropped while the count was even.
 */
export function extraPage(): Page {
  // Thin grey rule across the foot of the page (the template's page-num-line).
  // Locked: it is fixed page chrome pinned to the bottom, never meant to be moved.
  const line: CanvasElement = {
    ...defaultElement("image"),
    id: genId(),
    type: "image",
    x: 0,
    y: 1087.5,
    width: A4_W,
    height: 1,
    locked: true,
    text: "1",
    objectFit: "fill",
    background: "rgb(128, 128, 128)",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
  };
  // The page-number badge. `dataField: "page-num"` makes it number itself live
  // from the page's booklet position (see utils/pagination + ElementView).
  const badge: CanvasElement = {
    ...defaultElement("text"),
    id: genId(),
    type: "text",
    x: 383, // (794 − 28) / 2 — horizontally centred 28px circle
    y: 1075,
    width: 28,
    height: 26,
    zIndex: 1,
    locked: true,
    text: "",
    dataField: "page-num",
    fontFamily: "Helvetica",
    fontSize: 13,
    color: "rgb(128, 128, 128)",
    textAlign: "center",
    lineHeight: "1.2",
    background: "rgb(24, 52, 78)",
    padding: { t: 4, r: 0, b: 4, l: 0 },
    borderRadius: { tl: 50, tr: 50, br: 50, bl: 50 },
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgb(128, 128, 128)",
  };
  return {
    id: "page_1000",
    name: "Ekstra side",
    bg: "rgb(24, 52, 78)",
    width: A4_W,
    height: A4_H,
    loop: null,
    dataField: "extra-page",
    elements: [line, badge],
  };
}

/**
 * Guarantee the model has the padding page available. If no `extra-page` exists
 * it is inserted before the final back-cover pages, so the last page stays the
 * standalone back cover during booklet imposition. Visibility is then decided
 * purely by page-count parity (see utils/pagination — hidden when the booklet
 * would otherwise be even, shown when odd).
 */
export function ensureExtraPage(model: EditorModel): EditorModel {
  if (model.pages.some((p) => p.dataField === "extra-page")) return model;
  const insertAt = Math.max(0, model.pages.length - 2);
  const pages = [...model.pages];
  pages.splice(insertAt, 0, extraPage());
  return { ...model, pages };
}
