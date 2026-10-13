"use client";

import Loader from "@/components/loader2";
import { useRouter } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { showToast } from "@/lib/toastSonner";
import { fetchDocumentImages } from "@/services/global";
import {
  Layout,
  ImageIcon,
  FileText,
  Loader2,
  RotateCw,
  CopyPlus,
  Redo2,
  Undo2,
  ClipboardPaste,
  Grid2X2,
  PanelsTopLeft,
  RotateCcw,
  Languages,
  LayoutGrid,
  Minus,
  Lock,
  Unlock,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useReducer,
  useMemo,
  CSSProperties,
} from "react";
import { ArrowUp, ArrowDown, Plus, Copy, Trash2 } from "lucide-react";
import { APIURLS } from "@/services/config";

/* ═══════════════════════════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════════════════════════ */
const T = {
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

const A4_W = 794;
const A4_H = 1123;
const GRID = 8;
// When a text box auto-grows/shrinks, shift the elements that sit BELOW it by
// the same delta so content never overlaps. Set to false to keep elements
// free-floating (auto-height still works, but siblings won't move).
const REFLOW_TEXT_BELOW = true;
const CANVAS_SCOPE = "pte-canvas-scope";

interface CollageRect {
  fx: number;
  fy: number;
  fw: number;
  fh: number;
}
interface CollageLayoutDef {
  label: string;
  rects: CollageRect[];
}
const COLLAGE_LAYOUTS: Record<string, CollageLayoutDef> = {
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
const DEFAULT_COLLAGE_LAYOUT = "1vh";

function cellFromRect(r: CollageRect): CollageCell {
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

function cellsForLayout(
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

function snapToSpreadStart(idx: number): number {
  if (idx <= 0) return 0;
  return idx - ((idx + 1) % 2);
}

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */
type ElementType = "text" | "image" | "svg" | "collage";

interface CollageCell {
  fx: number;
  fy: number;
  fw: number;
  fh: number;
  src: string;
  scale: number;
  posX: number;
  posY: number;
}

interface Padding {
  t: number;
  r: number;
  b: number;
  l: number;
}
interface BorderRadius {
  tl: number;
  tr: number;
  br: number;
  bl: number;
}

interface SvgColorNode {
  key: string;
  label: string;
  color: string;
}

interface SvgTextNode {
  key: string;
  label: string;
  text: string;
}

interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked: boolean;

  bind: string | null;
  bindSrc: string | null;
  bindFormat: string | null;
  bindPrefix: string;
  bindSuffix: string;

  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  textAlign: string;
  lineHeight: string;
  letterSpacing: string;
  wordSpacing: string;
  textTransform: string;
  textDecoration: string;
  whiteSpace: string;
  textShadow: string;

  src: string;
  objectFit: string;
  imageFilter: string;
  imageScale: number;
  imagePosX: number;
  imagePosY: number;

  background: string;
  padding: Padding;
  borderRadius: BorderRadius;
  borderWidth: number;
  borderStyle: string;
  borderColor: string;
  boxShadow: string;

  svgMarkup: string;
  svgColors: SvgColorNode[];
  svgTexts: SvgTextNode[];

  collageLayout: string;
  collageGap: number;
  collageCells: CollageCell[];

  dataField: string | null;
  spanning: boolean;
}

interface Page {
  id: string;
  name: string;
  bg: string;
  width: number;
  height: number;
  loop: { source: string; iter: string } | null;
  elements: CanvasElement[];
}

interface EditorModel {
  pages: Page[];
  globalStyles: string;
}

interface HistoryState {
  past: EditorModel[];
  present: EditorModel;
  future: EditorModel[];
}

type HistoryAction =
  | { type: "set"; payload: EditorModel }
  | { type: "live"; payload: EditorModel }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; payload: EditorModel };

interface UploadedImage {
  src: string;
  label: string;
}

export interface PropertyTemplateEditorProps {
  initialHtml?: string;
  title?: string;
  data?: Record<string, any>;
  onChange?: (model: EditorModel) => void;
  onSave?: (payload: { model: EditorModel; ejs: string; html: string }) => void;
  onSaveHtml?: (html: string, fileName?: string) => void;
  fileName?: string;
  pendingSaveHtml?: boolean;
  pendingPDF?: boolean;
  pendingSync?: boolean;
  onExportEjs?: (ejs: string) => void;
  images?: UploadedImage[];
  onSyncWebmegler?: (html: string) => void;
}

/* ═══════════════════════════════════════════════════════════════════════
   FALLBACK SAMPLE DATA
   ═══════════════════════════════════════════════════════════════════════ */
const SAMPLE_DATA: Record<string, any> = {
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

/* ═══════════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════════ */
function pxToNum(v: string | undefined): number {
  if (!v) return 0;
  const m = String(v).match(/(-?[\d.]+)px/);
  return m ? parseFloat(m[1]) : parseFloat(v) || 0;
}
function parsePadding(v: string): Padding {
  if (!v) return { t: 0, r: 0, b: 0, l: 0 };
  const parts = v.trim().split(/\s+/).map(pxToNum);
  if (parts.length === 1)
    return { t: parts[0], r: parts[0], b: parts[0], l: parts[0] };
  if (parts.length === 2)
    return { t: parts[0], r: parts[1], b: parts[0], l: parts[1] };
  if (parts.length === 3)
    return { t: parts[0], r: parts[1], b: parts[2], l: parts[1] };
  return { t: parts[0], r: parts[1], b: parts[2], l: parts[3] };
}
function paddingToCss(p: Padding): string {
  if (p.t === p.r && p.r === p.b && p.b === p.l) return `${p.t}px`;
  if (p.t === p.b && p.l === p.r) return `${p.t}px ${p.r}px`;
  return `${p.t}px ${p.r}px ${p.b}px ${p.l}px`;
}
function isPaddingZero(p: Padding) {
  return !p.t && !p.r && !p.b && !p.l;
}

function parseRadius(v: string): BorderRadius {
  if (!v) return { tl: 0, tr: 0, br: 0, bl: 0 };
  const parts = v.trim().split(/\s+/).map(pxToNum);
  if (parts.length === 1)
    return { tl: parts[0], tr: parts[0], br: parts[0], bl: parts[0] };
  if (parts.length === 2)
    return { tl: parts[0], tr: parts[1], br: parts[0], bl: parts[1] };
  if (parts.length === 3)
    return { tl: parts[0], tr: parts[1], b: parts[2], bl: parts[1] } as any;
  return { tl: parts[0], tr: parts[1], br: parts[2], bl: parts[3] };
}
function radiusToCss(r: BorderRadius): string {
  if (r.tl === r.tr && r.tr === r.br && r.br === r.bl) return `${r.tl}px`;
  return `${r.tl}px ${r.tr}px ${r.br}px ${r.bl}px`;
}
function isRadiusZero(r: BorderRadius) {
  return !r.tl && !r.tr && !r.br && !r.bl;
}

function genId(prefix = "el"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function defaultElement(type: ElementType): CanvasElement {
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

function blankPage(): Page {
  return {
    id: genId("page"),
    name: "Side 1",
    bg: "#e2cf9e",
    width: A4_W,
    height: A4_H,
    loop: null,
    elements: [],
  };
}

async function cropImageHorizontal(
  src: string,
  startFraction: number,
  endFraction: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const startX = Math.max(0, Math.min(w - 1, Math.floor(w * startFraction)));
      const endX = Math.max(startX + 1, Math.min(w, Math.ceil(w * endFraction)));
      const cropWidth = endX - startX;
      const canvas = document.createElement("canvas");
      canvas.width = cropWidth;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, startX, 0, cropWidth, h, 0, 0, cropWidth, h);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => reject(new Error("Failed to load image — CORS may be blocking canvas access"));
    img.src = src;
  });
}

async function loadImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 800, height: 600 });
    img.src = src;
  });
}

async function cropImageVerticalPixels(src: string, startY: number, endY: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const sY = Math.max(0, Math.min(h - 1, Math.floor(startY)));
      const eY = Math.max(sY + 1, Math.min(h, Math.ceil(endY)));
      const cropHeight = eY - sY;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = cropHeight;
      canvas.getContext("2d")!.drawImage(img, 0, sY, w, cropHeight, 0, 0, w, cropHeight);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => reject(new Error("Failed to load image — CORS may be blocking canvas access"));
    img.src = src;
  });
}

async function cropImageRect(
  src: string, sx: number, sy: number, sw: number, sh: number, dw: number, dh: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      const cSX = Math.max(0, Math.min(natW - 1, Math.round(sx)));
      const cSY = Math.max(0, Math.min(natH - 1, Math.round(sy)));
      const cSW = Math.max(1, Math.min(natW - cSX, Math.round(sw)));
      const cSH = Math.max(1, Math.min(natH - cSY, Math.round(sh)));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(dw));
      canvas.height = Math.max(1, Math.round(dh));
      canvas.getContext("2d")!.drawImage(img, cSX, cSY, cSW, cSH, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => reject(new Error("Failed to load image — CORS may be blocking canvas access"));
    img.src = src;
  });
}

async function fitImageToPage(
  src: string, page: Page, dropX: number, dropY: number,
): Promise<{ x: number; y: number; width: number; height: number }> {
  const { width: natW, height: natH } = await loadImageDimensions(src);
  const aspect = natW > 0 && natH > 0 ? natH / natW : 0.75;

  let w = Math.min(page.width * 0.45, natW > 0 ? natW : page.width * 0.45);
  if (w < 200) w = Math.min(page.width * 0.45, 300);
  let h = w * aspect;
  if (w > page.width) { w = page.width; h = w * aspect; }
  if (h > page.height) { h = page.height; w = aspect > 0 ? h / aspect : page.width; }
  w = Math.round(w);
  h = Math.round(h);

  const others = page.elements.filter((e) => e.type === "image" && !e.spanning);
  const overlaps = (ax: number, ay: number) =>
    others.some((e) => ax < e.x + e.width && ax + w > e.x && ay < e.y + e.height && ay + h > e.y);
  const clamp = (vx: number, vy: number): [number, number] => [
    Math.max(0, Math.min(page.width - w, vx)),
    Math.max(0, Math.min(page.height - h, vy)),
  ];

  let [x, y] = clamp(Math.round(dropX - w / 2), Math.round(dropY - h / 2));

  if (overlaps(x, y)) {
    const stepX = Math.max(16, Math.round(w / 2));
    const stepY = Math.max(16, Math.round(h / 2));
    let placed = false;
    for (let gy = 0; gy + h <= page.height && !placed; gy += stepY) {
      for (let gx = 0; gx + w <= page.width && !placed; gx += stepX) {
        if (!overlaps(gx, gy)) { x = gx; y = gy; placed = true; }
      }
    }
  }

  return { x, y, width: w, height: h };
}

/* ═══════════════════════════════════════════════════════════════════════
   PDF → PAGES IMPORT
   ═══════════════════════════════════════════════════════════════════════ */
interface RenderedPdfPage {
  src: string;
  width: number;
  height: number;
}

async function pdfToPageImages(file: File): Promise<RenderedPdfPage[]> {
  // @ts-ignore — pdfjs-dist types are resolved in the host project, not here.
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf");

  if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
    try {
      pdfjs.GlobalWorkerOptions.workerSrc = await import(
        // @ts-ignore — bundler-resolved URL
        "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url"
      ).then((m: any) => m.default);
    } catch {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }
  }

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;

  const out: RenderedPdfPage[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = A4_W / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D canvas context");

    await page.render({ canvasContext: ctx, viewport }).promise;
    out.push({
      src: canvas.toDataURL("image/jpeg", 0.85),
      width: canvas.width,
      height: canvas.height,
    });
  }
  return out;
}

async function pagesFromPdf(file: File): Promise<Page[]> {
  const rendered = await pdfToPageImages(file);
  const baseName = file.name.replace(/\.pdf$/i, "");
  const pages: Page[] = [];
  let position = 0;

  const makeImageEl = (src: string, height: number): CanvasElement => ({
    ...defaultElement("image"),
    id: genId("image"),
    src,
    x: 0,
    y: 0,
    width: A4_W,
    height,
    objectFit: "fill",
    zIndex: 0,
  });

  const makePage = (src: string, imgHeight: number): Page => {
    position += 1;
    return {
      id: genId("page"),
      name: `${baseName} · ${position}`,
      bg: "#ffffff",
      width: A4_W,
      height: A4_H,
      loop: null,
      elements: [makeImageEl(src, imgHeight)],
    };
  };

  for (const { src, height: renderedHeight } of rendered) {
    if (renderedHeight <= A4_H) { pages.push(makePage(src, renderedHeight)); continue; }
    const numSlices = Math.ceil(renderedHeight / A4_H);
    for (let s = 0; s < numSlices; s++) {
      const startY = s * A4_H;
      const endY = Math.min(renderedHeight, (s + 1) * A4_H);
      const slicedSrc = await cropImageVerticalPixels(src, startY, endY);
      pages.push(makePage(slicedSrc, endY - startY));
    }
  }
  return pages;
}

/* ═══════════════════════════════════════════════════════════════════════
   SVG HELPERS
   ═══════════════════════════════════════════════════════════════════════ */
const SVG_FILL_ATTRS = ["fill", "stroke"] as const;
const SVG_SHAPE_TAGS = new Set(["circle", "rect", "ellipse", "polygon", "polyline", "path", "line", "g"]);

function parseSvgColors(svgMarkup: string): SvgColorNode[] {
  if (!svgMarkup) return [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
    const nodes: SvgColorNode[] = [];
    let shapeIdx = 0;
    const walk = (el: Element) => {
      const tag = el.tagName.toLowerCase();
      if (SVG_SHAPE_TAGS.has(tag)) {
        for (const attr of SVG_FILL_ATTRS) {
          const val = el.getAttribute(attr);
          if (val && val !== "none" && val !== "currentColor")
            nodes.push({ key: `shape-${shapeIdx}-${attr}`, label: `${tag} ${attr}`, color: val });
        }
        shapeIdx++;
      }
      if (tag === "text") {
        const fill = el.getAttribute("fill");
        if (fill && fill !== "none") {
          nodes.push({ key: `text-${shapeIdx}-fill`, label: "tekstfyll", color: fill });
          shapeIdx++;
        }
      }
      Array.from(el.children).forEach(walk);
    };
    const svgEl = doc.querySelector("svg");
    if (svgEl) {
      for (const attr of SVG_FILL_ATTRS) {
        const val = svgEl.getAttribute(attr);
        if (val && val !== "none" && val !== "currentColor")
          nodes.push({ key: `svg-root-${attr}`, label: `svg ${attr}`, color: val });
      }
      Array.from(svgEl.children).forEach(walk);
    }
    return nodes;
  } catch { return []; }
}

function parseSvgTexts(svgMarkup: string): SvgTextNode[] {
  if (!svgMarkup) return [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
    const nodes: SvgTextNode[] = [];
    let idx = 0;
    doc.querySelectorAll("text").forEach((el) => {
      nodes.push({ key: `text-${idx}`, label: `tekst ${idx + 1}`, text: el.textContent?.trim() ?? "" });
      idx++;
    });
    return nodes;
  } catch { return []; }
}

function patchSvgColor(svgMarkup: string, key: string, newColor: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
    const svgEl = doc.querySelector("svg");
    if (!svgEl) return svgMarkup;
    if (key.startsWith("svg-root-")) {
      svgEl.setAttribute(key.replace("svg-root-", ""), newColor);
      return new XMLSerializer().serializeToString(svgEl);
    }
    const parts = key.split("-");
    const attrName = parts[parts.length - 1];
    const targetIdx = parseInt(parts[1], 10);
    let shapeIdx = 0;
    let found = false;
    const walk = (el: Element): boolean => {
      const tag = el.tagName.toLowerCase();
      if (SVG_SHAPE_TAGS.has(tag) || tag === "text") {
        if (shapeIdx === targetIdx) { el.setAttribute(attrName, newColor); found = true; return true; }
        shapeIdx++;
      }
      for (const child of Array.from(el.children)) { if (walk(child)) return true; }
      return false;
    };
    Array.from(svgEl.children).forEach((child) => { if (!found) walk(child); });
    return new XMLSerializer().serializeToString(svgEl);
  } catch { return svgMarkup; }
}

function patchSvgText(svgMarkup: string, key: string, newText: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
    const idx = parseInt(key.replace("text-", ""), 10);
    const textEls = doc.querySelectorAll("text");
    if (textEls[idx]) textEls[idx].textContent = newText;
    const svgEl = doc.querySelector("svg");
    return svgEl ? new XMLSerializer().serializeToString(svgEl) : svgMarkup;
  } catch { return svgMarkup; }
}

function buildSvgElement(svgMarkup: string, rect: DOMRect, pageRect: DOMRect, node: HTMLElement): CanvasElement {
  const cs = window.getComputedStyle(node);
  const markup = svgMarkup.trim();
  return {
    id: node.dataset.el || genId("svg"),
    type: "svg",
    x: rect.left - pageRect.left,
    y: rect.top - pageRect.top,
    width: rect.width || 40,
    height: rect.height || 40,
    rotation: 0,
    opacity: parseFloat(cs.opacity) || 1,
    zIndex: parseInt(cs.zIndex, 10) || 0,
    // SVG elements: respect data-locked if present, default unlocked
    locked: node.dataset.locked === "true",
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
    src: "",
    objectFit: "",
    imageFilter: "none",
    imageScale: 1,
    imagePosX: 50,
    imagePosY: 50,
    background: "",
    padding: { t: 0, r: 0, b: 0, l: 0 },
    borderRadius: { tl: 0, tr: 0, br: 0, bl: 0 },
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: "#000000",
    boxShadow: "none",
    svgMarkup: markup,
    svgColors: parseSvgColors(markup),
    svgTexts: parseSvgTexts(markup),
    collageLayout: "",
    collageGap: 0,
    collageCells: [],
    dataField: node.dataset.field || null,
    spanning: false,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   GLOBAL STYLES SCOPING
   ═══════════════════════════════════════════════════════════════════════ */
function findMatchingBrace(src: string, openIdx: number): number {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) return i; }
  }
  return -1;
}

function scopeGlobalCss(css: string, scope: string): string {
  if (!css) return "";
  let stripped = css.replace(/@page[^{]*\{[^}]*\}/g, "");
  stripped = stripped.replace(/@media\s+print[^{]*\{(?:[^{}]*|\{[^}]*\})*\}/g, "");
  let i = 0;
  let out = "";
  const len = stripped.length;
  while (i < len) {
    const ch = stripped[i];
    if (/\s/.test(ch)) { out += ch; i++; continue; }
    if (stripped.startsWith("/*", i)) {
      const end = stripped.indexOf("*/", i + 2);
      if (end === -1) break;
      out += stripped.slice(i, end + 2);
      i = end + 2;
      continue;
    }
    if (ch === "@") {
      const blockStart = stripped.indexOf("{", i);
      const semi = stripped.indexOf(";", i);
      if (blockStart === -1 || (semi !== -1 && semi < blockStart)) {
        if (semi === -1) break;
        out += stripped.slice(i, semi + 1);
        i = semi + 1;
        continue;
      }
      const blockEnd = findMatchingBrace(stripped, blockStart);
      if (blockEnd === -1) break;
      const head = stripped.slice(i, blockStart + 1);
      const body = stripped.slice(blockStart + 1, blockEnd);
      out += head + scopeGlobalCss(body, scope) + "}";
      i = blockEnd + 1;
      continue;
    }
    const blockStart = stripped.indexOf("{", i);
    if (blockStart === -1) break;
    const blockEnd = findMatchingBrace(stripped, blockStart);
    if (blockEnd === -1) break;
    const selectorList = stripped.slice(i, blockStart);
    const body = stripped.slice(blockStart + 1, blockEnd);
    const scoped = selectorList
      .split(",")
      .map((s) => {
        const t = s.trim();
        if (!t) return "";
        if (/^(html|body|:root)\b/i.test(t)) return `.${scope}`;
        return `.${scope} ${t}`;
      })
      .filter(Boolean)
      .join(", ");
    out += `${scoped} {${body}}`;
    i = blockEnd + 1;
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════
   PARSER
   ═══════════════════════════════════════════════════════════════════════ */
export async function parseTemplate(html: string, data: Record<string, any> = {}): Promise<EditorModel> {
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${A4_W}px`,
    pointerEvents: "none",
    clipPath: "inset(50%)",
    contain: "layout style",
  } as CSSStyleDeclaration);
  document.body.appendChild(container);

  const evalExpr = (expr: string): string => {
    try {
      const fn = new Function(...Object.keys(data), `return (${expr.trim()})`);
      let val = fn(...Object.values(data));
      if (val === undefined || val === null) return "";
      return String(val);
    } catch (err) {
      console.warn("Eval error:", expr, err);
      return "";
    }
  };

  const evaluatedHtml = html.replace(/<%=([\s\S]*?)%>/g, (_, expr) => evalExpr(expr));
  container.innerHTML = evaluatedHtml;

  const images = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    images.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
          setTimeout(resolve, 2000);
        }),
    ),
  );

  container.getBoundingClientRect();
  await new Promise((r) => requestAnimationFrame(() => r(null)));

  try {
    return extractModel(container);
  } finally {
    if (document.body.contains(container)) document.body.removeChild(container);
  }
}

function extractModel(container: HTMLElement): EditorModel {
  const globalStyles = Array.from(container.querySelectorAll("style"))
    .map((s) => s.textContent || "")
    .join("\n")
    .trim();

  let pageContainers = Array.from(
    container.querySelectorAll<HTMLElement>("[data-page], [data-page-template]"),
  );
  if (!pageContainers.length) {
    pageContainers = Array.from(container.querySelectorAll<HTMLElement>('[id^="page_"]'));
  }
  if (!pageContainers.length) {
    pageContainers = [container];
  }

  const pages: Page[] = pageContainers.map((pageEl, idx) => {
    const cs = window.getComputedStyle(pageEl);
    const rect = pageEl.getBoundingClientRect();
    const isLoop = pageEl.hasAttribute("data-page-template");

    return {
      // FIX: prefer the real DOM id so page_93, page_49 etc. survive save/reload
      id: pageEl.id || pageEl.dataset.page || genId("page"),
      name: isLoop
        ? `Løkke · ${pageEl.dataset.pageTemplate || ""}`
        : pageEl.dataset.page || pageEl.id || `Side ${idx + 1}`,
      bg: rgbaToCss(cs.backgroundColor) || "#ffffff",
      width: rect.width || A4_W,
      height: rect.height || A4_H,
      loop: isLoop
        ? { source: pageEl.dataset.pageTemplate || "", iter: pageEl.dataset.pageIter || "item" }
        : null,
      elements: extractElementsFromPage(pageEl),
    };
  });

  return { pages, globalStyles };
}

function extractElementsFromPage(pageEl: HTMLElement): CanvasElement[] {
  const pageRect = pageEl.getBoundingClientRect();
  const explicit = pageEl.querySelectorAll<HTMLElement>("[data-el]");
  const candidates: HTMLElement[] = [];
  if (explicit.length > 0) {
    explicit.forEach((n) => candidates.push(n));
  } else {
    const walk = (node: Element) => {
      const tag = node.tagName.toLowerCase();
      if (tag === "style" || tag === "script") return;
      if (tag === "svg") { candidates.push(node as HTMLElement); return; }
      if (tag === "img") { candidates.push(node as HTMLElement); return; }
      const hasElementChildren = node.children.length > 0;
      if (!hasElementChildren) {
        const txt = (node.textContent || "").trim();
        if (txt) candidates.push(node as HTMLElement);
        return;
      }
      Array.from(node.children).forEach((child) => { if (child instanceof Element) walk(child); });
    };
    Array.from(pageEl.children).forEach((child) => { if (child instanceof Element) walk(child); });
  }
  return candidates.map((node) => extractElement(node, pageRect));
}

function extractElement(node: HTMLElement, pageRect: DOMRect): CanvasElement {
  const tag = node.tagName.toLowerCase();

  // ── Collage ──────────────────────────────────────────────────────────
  if (node.dataset.collage) {
    const rect = node.getBoundingClientRect();
    const cs = window.getComputedStyle(node);
    let parsed: any = null;
    try { parsed = JSON.parse(node.dataset.collage); } catch { parsed = null; }
    const layout: string =
      parsed?.layout && COLLAGE_LAYOUTS[parsed.layout] ? parsed.layout : DEFAULT_COLLAGE_LAYOUT;
    const gap: number = Number.isFinite(parsed?.gap) ? parsed.gap : 6;
    let cells: CollageCell[] = cellsForLayout(layout);
    if (Array.isArray(parsed?.cells)) {
      cells = cells.map((c, i) => {
        const pc = parsed.cells[i];
        if (!pc) return c;
        return {
          ...c,
          src: typeof pc.src === "string" ? pc.src : "",
          scale: Number.isFinite(pc.scale) ? pc.scale : 1,
          posX: Number.isFinite(pc.posX) ? pc.posX : 50,
          posY: Number.isFinite(pc.posY) ? pc.posY : 50,
        };
      });
    }
    return {
      ...defaultElement("collage"),
      id: node.dataset.el || genId("collage"),
      x: rect.left - pageRect.left,
      y: rect.top - pageRect.top,
      width: rect.width || 520,
      height: rect.height || 360,
      opacity: parseFloat(cs.opacity) || 1,
      zIndex: parseInt(cs.zIndex, 10) || 0,
      background: rgbaToCss(cs.backgroundColor) || "transparent",
      collageLayout: layout,
      collageGap: gap,
      collageCells: cells,
      dataField: node.dataset.field || null,
      // Collage: respect data-locked if set, default unlocked
      locked: node.dataset.locked === "true",
    };
  }

  // ── SVG ──────────────────────────────────────────────────────────────
  if (tag === "svg") {
    const rect = node.getBoundingClientRect();
    const serializer = new XMLSerializer();
    const raw = serializer.serializeToString(node).replace(/<\?xml.*?\?>/, "").trim();
    return buildSvgElement(raw, rect, pageRect, node);
  }

  // ── Framed image (zoom/pan wrapper) ──────────────────────────────────
  if (node.dataset.imgframe) {
    const rect = node.getBoundingClientRect();
    const cs = window.getComputedStyle(node);
    const img = node.querySelector("img") as HTMLImageElement | null;
    const imgCs = img ? window.getComputedStyle(img) : null;
    let meta: any = null;
    try { meta = JSON.parse(node.dataset.imgframe); } catch { meta = null; }
    const scale = Number.isFinite(meta?.scale) ? meta.scale : 1;
    const posX = Number.isFinite(meta?.posX) ? meta.posX : 50;
    const posY = Number.isFinite(meta?.posY) ? meta.posY : 50;
    let rot = 0;
    if (cs.transform && cs.transform !== "none") {
      const m = cs.transform.match(/rotate\(([-\d.]+)deg\)/);
      if (m) rot = parseFloat(m[1]);
    }
    const filter =
      imgCs && imgCs.filter !== "none" ? imgCs.filter : cs.filter !== "none" ? cs.filter : "none";
    return {
      ...defaultElement("image"),
      id: node.dataset.el || genId("image"),
      x: rect.left - pageRect.left,
      y: rect.top - pageRect.top,
      width: rect.width,
      height: rect.height,
      rotation: rot,
      opacity: parseFloat(cs.opacity) || 1,
      zIndex: parseInt(cs.zIndex, 10) || 0,
      bind: node.dataset.bind || null,
      bindSrc: node.dataset.bindSrc || null,
      bindFormat: node.dataset.bindFormat || null,
      bindPrefix: node.dataset.bindPrefix || "",
      bindSuffix: node.dataset.bindSuffix || "",
      src: img ? img.src : "",
      objectFit: (imgCs?.objectFit as string) || "cover",
      imageFilter: filter,
      imageScale: scale,
      imagePosX: posX,
      imagePosY: posY,
      background: rgbaToCss(cs.backgroundColor) || "",
      padding: parsePadding(cs.padding),
      borderRadius: parseRadius(cs.borderRadius),
      borderWidth: pxToNum(cs.borderTopWidth || cs.borderWidth),
      borderStyle: cs.borderTopStyle || cs.borderStyle || "solid",
      borderColor: cs.borderTopColor || cs.borderColor || "#000",
      boxShadow: cs.boxShadow !== "none" ? cs.boxShadow : "none",
      dataField: node.dataset.field || null,
      spanning: node.dataset.spanning === "true",
      // Images: respect data-locked if set, default unlocked
      locked: node.dataset.locked === "true",
    };
  }

  const svgChild = node.querySelector("svg");
  if (svgChild && node.children.length === 1) {
    const rect = node.getBoundingClientRect();
    const serializer = new XMLSerializer();
    const raw = serializer.serializeToString(svgChild).replace(/<\?xml.*?\?>/, "").trim();
    return buildSvgElement(raw, rect, pageRect, node);
  }

  const isImg = tag === "img";
  const rect = node.getBoundingClientRect();
  const cs = window.getComputedStyle(node);

  let rotation = 0;
  if (cs.transform && cs.transform !== "none") {
    const m = cs.transform.match(/rotate\(([-\d.]+)deg\)/);
    if (m) rotation = parseFloat(m[1]);
    else {
      const mm = cs.transform.match(/matrix\(([^)]+)\)/);
      if (mm) {
        const [a, b] = mm[1].split(",").map((s) => parseFloat(s.trim()));
        rotation = Math.round((Math.atan2(b, a) * 180) / Math.PI);
      }
    }
  }

  const bgColor = rgbaToCss(cs.backgroundColor);
  const boxShadow = cs.boxShadow !== "none" ? cs.boxShadow : "none";
  const filter = cs.filter !== "none" ? cs.filter : "none";

  const el: CanvasElement = {
    id: node.dataset.el || genId(),
    type: isImg ? "image" : "text",
    x: rect.left - pageRect.left,
    y: rect.top - pageRect.top,
    width: rect.width,
    height: rect.height,
    rotation,
    opacity: parseFloat(cs.opacity) || 1,
    zIndex: parseInt(cs.zIndex, 10) || 0,
    // ── LOCK BEHAVIOUR ON IMPORT ────────────────────────────────────────
    // • If data-locked is explicitly set in the HTML → honour it exactly.
    // • If absent → text elements default to LOCKED (drag-protected but
    //   still fully editable in the inspector); images default to UNLOCKED.
    // This means every text field in an imported template is protected
    // against accidental dragging from the first open. Users can unlock
    // a field with the 🔓 button in the inspector when they need to move it.
    locked:
      node.dataset.locked != null
        ? node.dataset.locked !== "false"
        : !isImg,
    bind: node.dataset.bind || null,
    bindSrc: node.dataset.bindSrc || null,
    bindFormat: node.dataset.bindFormat || null,
    bindPrefix: node.dataset.bindPrefix || "",
    bindSuffix: node.dataset.bindSuffix || "",
    text: isImg ? "" : (node.textContent || "").trim(),
    fontFamily: isImg
      ? ""
      : (cs.fontFamily.split(",")[0] || "").replace(/['"]/g, "").trim(),
    fontSize: isImg ? 0 : parseFloat(cs.fontSize) || 0,
    fontWeight: isImg ? "" : cs.fontWeight,
    fontStyle: isImg ? "" : cs.fontStyle,
    color: isImg ? "" : cs.color,
    textAlign: isImg ? "" : cs.textAlign,
    lineHeight: isImg ? "" : parseFloat(cs.fontSize) > 38 ? "1" : "1.2",
    letterSpacing: isImg ? "" : cs.letterSpacing,
    wordSpacing: isImg ? "" : cs.wordSpacing,
    textTransform: isImg ? "" : cs.textTransform,
    textDecoration: isImg ? "" : cs.textDecorationLine || cs.textDecoration,
    whiteSpace: isImg ? "" : cs.whiteSpace,
    textShadow: isImg ? "" : cs.textShadow !== "none" ? cs.textShadow : "none",
    src: isImg ? (node as HTMLImageElement).src : "",
    objectFit: isImg ? cs.objectFit || "cover" : "",
    imageFilter: filter,
    imageScale: 1,
    imagePosX: 50,
    imagePosY: 50,
    background: bgColor || "",
    padding: parsePadding(cs.padding),
    borderRadius: parseRadius(cs.borderRadius),
    borderWidth: pxToNum(cs.borderTopWidth || cs.borderWidth),
    borderStyle: cs.borderTopStyle || cs.borderStyle || "solid",
    borderColor: cs.borderTopColor || cs.borderColor || "#000",
    boxShadow,
    svgMarkup: "",
    svgColors: [],
    svgTexts: [],
    collageLayout: "",
    collageGap: 0,
    collageCells: [],
    dataField: node.dataset.field || null,
    spanning: node.dataset.spanning === "true",
  };
  if (el.type === "text" && !el.fontFamily) el.fontFamily = "Helvetica";
  return el;
}

function rgbaToCss(c: string): string {
  if (!c || c === "rgba(0, 0, 0, 0)" || c === "transparent") return "";
  return c;
}

/* ═══════════════════════════════════════════════════════════════════════
   BINDING RESOLVER
   ═══════════════════════════════════════════════════════════════════════ */
function getPath(obj: any, path: string): any {
  if (!path || obj == null) return undefined;
  return path.split(".").reduce((acc: any, key: string) => {
    if (acc == null) return undefined;
    return acc[key.replace("?", "")];
  }, obj);
}

function formatBinding(value: any, format: string | null): string {
  if (value == null) return "";
  if (format === "currency-no") {
    const n = Number(value);
    return isFinite(n) ? `kr ${n.toLocaleString("no-NO")},-` : String(value);
  }
  if (format === "area-no") {
    const n = Number(value);
    if (!isFinite(n)) return String(value);
    return `${n.toLocaleString("no-NO", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} m²`;
  }
  if (format === "phone-no") {
    return String(value).replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
  }
  return String(value);
}

function resolvePreview(el: CanvasElement, data: Record<string, any>, loopItem: Record<string, any> | null): string {
  if (!el.bind) return el.text;
  const ctx = loopItem ? { ...data, ...loopItem } : data;
  let v = getPath(ctx, el.bind);
  if (v == null) v = el.text || "";
  if (el.bindFormat) v = formatBinding(v, el.bindFormat);
  return `${el.bindPrefix || ""}${v}${el.bindSuffix || ""}`;
}

function resolveSrc(el: CanvasElement, data: Record<string, any>, loopItem: Record<string, any> | null): string {
  if (el.bindSrc) {
    const ctx = loopItem ? { ...data, ...loopItem } : data;
    const v = getPath(ctx, el.bindSrc);
    if (v) return v;
  }
  return el.src;
}

/* ═══════════════════════════════════════════════════════════════════════
   SERIALIZER
   ═══════════════════════════════════════════════════════════════════════ */
function escapeAttr(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function escapeHtml(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function serializeStyle(el: CanvasElement, opts: { framed?: boolean } = {}): string {
  const p: string[] = [
    "position:absolute",
    `left:${Math.round(el.x)}px`,
    `top:${Math.round(el.y)}px`,
    `width:${Math.ceil(el.width)}px`,
  ];
  // For text we let height grow with the content on export too (min-height keeps
  // the measured height as a floor). Other element types keep a fixed height.
  if (el.type === "text") {
    if (el.height) p.push(`min-height:${Math.round(el.height)}px`);
  } else if (el.height) {
    p.push(`height:${Math.round(el.height)}px`);
  }
  if (el.rotation) p.push(`transform:rotate(${el.rotation}deg)`);
  if (el.opacity !== 1) p.push(`opacity:${el.opacity}`);
  if (el.zIndex) p.push(`z-index:${el.zIndex}`);

  if (el.type === "text") {
    if (el.fontFamily) p.push(`font-family:${el.fontFamily}`);
    if (el.fontSize > 0) p.push(`font-size:${el.fontSize}px`);
    if (el.fontWeight && el.fontWeight !== "normal" && el.fontWeight !== "400")
      p.push(`font-weight:${el.fontWeight}`);
    if (el.fontStyle && el.fontStyle !== "normal") p.push(`font-style:${el.fontStyle}`);
    if (el.color) p.push(`color:${el.color}`);
    if (el.textAlign && el.textAlign !== "left" && el.textAlign !== "start")
      p.push(`text-align:${el.textAlign}`);
    if (el.lineHeight && el.lineHeight !== "normal") p.push(`line-height:${el.lineHeight}`);
    if (el.letterSpacing && el.letterSpacing !== "normal" && el.letterSpacing !== "0px")
      p.push(`letter-spacing:${el.letterSpacing}`);
    if (el.wordSpacing && el.wordSpacing !== "normal" && el.wordSpacing !== "0px")
      p.push(`word-spacing:${el.wordSpacing}`);
    if (el.textTransform && el.textTransform !== "none") p.push(`text-transform:${el.textTransform}`);
    if (el.textDecoration && el.textDecoration !== "none") p.push(`text-decoration:${el.textDecoration}`);
    if (el.whiteSpace && el.whiteSpace !== "normal") p.push(`white-space:${el.whiteSpace}`);
    if (el.textShadow && el.textShadow !== "none") p.push(`text-shadow:${el.textShadow}`);
    // Allow long words to wrap so exported text matches the editor's wrapping.
    p.push("word-break:break-word");
  } else if (el.type === "image") {
    if (opts.framed) {
      p.push("overflow:hidden");
    } else {
      if (el.objectFit) p.push(`object-fit:${el.objectFit}`);
      if (el.imageFilter && el.imageFilter !== "none") p.push(`filter:${el.imageFilter}`);
    }
  }

  if (el.background && el.background !== "transparent") p.push(`background:${el.background}`);
  if (!isPaddingZero(el.padding)) {
    p.push(`padding:${paddingToCss(el.padding)}`);
    p.push("box-sizing:border-box");
  }
  if (!isRadiusZero(el.borderRadius)) p.push(`border-radius:${radiusToCss(el.borderRadius)}`);
  if (el.borderWidth > 0)
    p.push(`border:${el.borderWidth}px ${el.borderStyle || "solid"} ${el.borderColor || "#000"}`);
  if (el.boxShadow && el.boxShadow !== "none") p.push(`box-shadow:${el.boxShadow}`);

  return p.join(";");
}

function serializeElement(el: CanvasElement, mode: "editable" | "ejs"): string {
  const attrs: string[] = [`data-el="${escapeAttr(el.id)}"`];
  if (el.bind) attrs.push(`data-bind="${escapeAttr(el.bind)}"`);
  if (el.bindSrc) attrs.push(`data-bind-src="${escapeAttr(el.bindSrc)}"`);
  if (el.bindFormat) attrs.push(`data-bind-format="${escapeAttr(el.bindFormat)}"`);
  if (el.bindPrefix) attrs.push(`data-bind-prefix="${escapeAttr(el.bindPrefix)}"`);
  if (el.bindSuffix) attrs.push(`data-bind-suffix="${escapeAttr(el.bindSuffix)}"`);
  if (el.dataField) attrs.push(`data-field="${escapeAttr(el.dataField)}"`);
  if (el.spanning) attrs.push(`data-spanning="true"`);
  // FIX: persist lock state so it survives save → reload → save cycles
  if (el.locked) attrs.push(`data-locked="true"`);

  const style = serializeStyle(el);

  if (el.type === "collage") {
    const meta = JSON.stringify({
      layout: el.collageLayout,
      gap: el.collageGap,
      cells: el.collageCells.map((c) => ({ src: c.src, scale: c.scale, posX: c.posX, posY: c.posY })),
    });
    attrs.push(`data-collage="${escapeAttr(meta)}"`);
    const gap = el.collageGap || 0;
    const cellsHtml = el.collageCells
      .map((c) => {
        const cellStyle = [
          "position:absolute",
          `left:${(c.fx * 100).toFixed(4)}%`,
          `top:${(c.fy * 100).toFixed(4)}%`,
          `width:${(c.fw * 100).toFixed(4)}%`,
          `height:${(c.fh * 100).toFixed(4)}%`,
          `padding:${gap / 2}px`,
          "box-sizing:border-box",
        ].join(";");
        const clipStyle = "width:100%;height:100%;overflow:hidden;position:relative";
        if (!c.src)
          return `    <div style="${cellStyle}"><div style="${clipStyle}"></div></div>`;
        const imgStyle = [
          "width:100%",
          "height:100%",
          "object-fit:cover",
          `object-position:${c.posX}% ${c.posY}%`,
          `transform:scale(${c.scale})`,
          "transform-origin:center",
          "display:block",
        ].join(";");
        return `    <div style="${cellStyle}"><div style="${clipStyle}"><img src="${escapeAttr(c.src)}" style="${imgStyle}" /></div></div>`;
      })
      .join("\n");
    return `  <div ${attrs.join(" ")} style="${style}">\n${cellsHtml}\n  </div>`;
  }

  if (el.type === "svg") {
    return `  <div ${attrs.join(" ")} style="${style}">${el.svgMarkup}</div>`;
  }

  if (el.type === "image") {
    const src = mode === "ejs" && el.bindSrc ? `<%= ${el.bindSrc} %>` : el.src || "";
    const scale = el.imageScale ?? 1;
    const px = el.imagePosX ?? 50;
    const py = el.imagePosY ?? 50;
    const framed = scale !== 1 || px !== 50 || py !== 50;

    if (!framed) {
      return `  <img ${attrs.join(" ")} src="${escapeAttr(src)}" style="${serializeStyle(el)}" />`;
    }

    const wrapperStyle = serializeStyle(el, { framed: true });
    attrs.push(`data-imgframe="${escapeAttr(JSON.stringify({ scale, posX: px, posY: py }))}"`);
    const imgStyle = [
      "width:100%",
      "height:100%",
      `object-fit:${el.objectFit || "cover"}`,
      `object-position:${px}% ${py}%`,
      `transform:scale(${scale})`,
      "transform-origin:center",
      "display:block",
      el.imageFilter && el.imageFilter !== "none" ? `filter:${el.imageFilter}` : "",
    ]
      .filter(Boolean)
      .join(";");
    return `  <div ${attrs.join(" ")} style="${wrapperStyle}"><img src="${escapeAttr(src)}" style="${imgStyle}" /></div>`;
  }

  let inner: string;
  if (mode === "ejs" && el.bind) {
    const expr = el.bind;
    if (el.bindFormat === "currency-no") {
      inner = `kr <%= ${expr}.toLocaleString("no-NO") %>,-`;
    } else if (el.bindFormat === "area-no") {
      inner = `<%= ${expr}.toLocaleString("no-NO", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) %> m²`;
    } else {
      inner = `${escapeHtml(el.bindPrefix || "")}<%= ${expr} %>${escapeHtml(el.bindSuffix || "")}`;
    }
  } else {
    inner = escapeHtml(el.text || "");
  }
  return `  <div ${attrs.join(" ")} style="${style}">${inner}</div>`;
}

function serializePage(page: Page, mode: "editable" | "ejs", isLast: boolean): string {
  const attrs: string[] = [];
  let openWrap = "";
  let closeWrap = "";

  if (page.loop) {
    attrs.push(`data-page-template="${escapeAttr(page.loop.source)}"`);
    attrs.push(`data-page-iter="${escapeAttr(page.loop.iter)}"`);
    if (mode === "ejs") {
      openWrap = `<% ${page.loop.source}.forEach(function(${page.loop.iter}, index) { %>\n`;
      closeWrap = `\n<% }); %>`;
    }
  } else {
    // FIX: use page.id (stable structural key) NOT page.name ("Side N" changes every render
    // and breaks the accordion sync selectors on subsequent saves).
    attrs.push(`data-page="${escapeAttr(page.id)}"`);
  }
  attrs.push(`data-page-bg="${escapeAttr(page.bg)}"`);

  const breakAfter = isLast ? "" : "page-break-after:always;break-after:page;";
  const style = `position:relative;width:${page.width}px;height:${page.height}px;background:${page.bg};overflow:hidden;${breakAfter}`;

  const els = [...page.elements]
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((el) => serializeElement(el, mode))
    .join("\n");

  // FIX: removed dead ternary (both branches returned "page")
  return `${openWrap}<div id="${page.id}" class="page" ${attrs.join(" ")} style="${style}">
${els}
</div>${closeWrap}`;
}

const PRINT_CSS = `@page { size: A4; margin: 0; }
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

export function serializeTemplate(model: EditorModel, mode: "editable" | "ejs" = "editable", title?: string): string {
  const lastIdx = model.pages.length - 1;
  const pagesHtml = model.pages.map((p, i) => serializePage(p, mode, i === lastIdx)).join("\n\n");
  const styleBody = `${(model.globalStyles || "").trim()}\n${PRINT_CSS}`.trim();
  const styleBlock = `<style>\n${styleBody}\n</style>\n`;

  if (mode === "ejs") {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
${styleBlock}</head><body>
${pagesHtml}
</body></html>`;
  }
  return `<!DOCTYPE html>
<html><head><title>${title}</title><meta charset="utf-8"/>
${styleBlock}</head><body>
${pagesHtml}
</body></html>`;
}

/* ═══════════════════════════════════════════════════════════════════════
   HISTORY REDUCER
   ═══════════════════════════════════════════════════════════════════════ */
function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "set": {
      const past = [...state.past, state.present];
      return { past, present: action.payload, future: [] };
    }
    case "live":
      return { ...state, present: action.payload };
    case "undo": {
      if (!state.past.length) return state;
      const past = state.past.slice(0, -1);
      const present = state.past[state.past.length - 1];
      return { past, present, future: [state.present, ...state.future] };
    }
    case "redo": {
      if (!state.future.length) return state;
      const [present, ...future] = state.future;
      return { past: [...state.past, state.present], present, future };
    }
    case "reset":
      return { past: [], present: action.payload, future: [] };
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   SMART GUIDELINES
   ═══════════════════════════════════════════════════════════════════════ */
const SNAP_THRESHOLD = 6;

interface Guideline {
  axis: "h" | "v";
  pos: number;
  label?: string;
}

function computeGuidelines(
  x: number, y: number, w: number, h: number, pageW: number, pageH: number,
): { snappedX: number; snappedY: number; guidelines: Guideline[] } {
  const lines: Guideline[] = [];
  let sx = x;
  let sy = y;
  const pageCX = pageW / 2;
  const pageCY = pageH / 2;
  const elCX = x + w / 2;
  const elCY = y + h / 2;

  const vAnchors = [
    { elEdge: elCX, pageAnchor: pageCX, label: "Senter" },
    { elEdge: x, pageAnchor: pageCX, label: "Senter" },
    { elEdge: x + w, pageAnchor: pageCX, label: "Senter" },
    { elEdge: x, pageAnchor: 0, label: "Kant" },
    { elEdge: x + w, pageAnchor: pageW, label: "Kant" },
  ];
  for (const { elEdge, pageAnchor, label } of vAnchors) {
    if (Math.abs(elEdge - pageAnchor) <= SNAP_THRESHOLD) {
      sx = x + (pageAnchor - elEdge);
      lines.push({ axis: "v", pos: pageAnchor, label });
      break;
    }
  }

  const hAnchors = [
    { elEdge: elCY, pageAnchor: pageCY, label: "Senter" },
    { elEdge: y, pageAnchor: pageCY, label: "Senter" },
    { elEdge: y + h, pageAnchor: pageCY, label: "Senter" },
    { elEdge: y, pageAnchor: 0, label: "Kant" },
    { elEdge: y + h, pageAnchor: pageH, label: "Kant" },
  ];
  for (const { elEdge, pageAnchor, label } of hAnchors) {
    if (Math.abs(elEdge - pageAnchor) <= SNAP_THRESHOLD) {
      sy = y + (pageAnchor - elEdge);
      lines.push({ axis: "h", pos: pageAnchor, label });
      break;
    }
  }

  return { snappedX: sx, snappedY: sy, guidelines: lines };
}

/* ═══════════════════════════════════════════════════════════════════════
   ELEMENT VIEW
   ═══════════════════════════════════════════════════════════════════════ */
const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;
type HandleDir = (typeof HANDLES)[number];

// Text boxes are content-driven on the vertical axis, so we only expose the
// horizontal/diagonal handles for them — dragging a vertical-only handle would
// just snap back once the ResizeObserver re-measures.
const TEXT_HANDLES = ["nw", "ne", "se", "sw", "e", "w"] as const;

interface DragState {
  mode: "move" | "resize" | "rotate" | "pan";
  handle?: HandleDir;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origW: number;
  origH: number;
  cx: number;
  cy: number;
  startAngle: number;
  origPosX?: number;
  origPosY?: number;
}

interface ElementViewProps {
  el: CanvasElement;
  isSelected: boolean;
  zoom: number;
  data: Record<string, any>;
  loopItem: Record<string, any> | null;
  onSelect: (id: string) => void;
  onChange: (el: CanvasElement, live?: boolean) => void;
  onCommit: () => void;
  pointerEvents?: "auto" | "none";
  onDropToCell?: (elId: string, cellIndex: number, src: string) => void;
  onGuidelineChange?: (lines: Guideline[]) => void;
  pageWidth?: number;
  pageHeight?: number;
}

function ElementView({
  el,
  isSelected,
  zoom,
  data,
  loopItem,
  onSelect,
  onChange,
  onCommit,
  pointerEvents,
  onDropToCell,
  onGuidelineChange,
  pageWidth = A4_W,
  pageHeight = A4_H,
}: ElementViewProps) {
  const dragRef = useRef<DragState | null>(null);
  const elRef = useRef(el);
  elRef.current = el;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;
  const onGuidelineRef = useRef(onGuidelineChange);
  onGuidelineRef.current = onGuidelineChange;
  const pageWRef = useRef(pageWidth);
  pageWRef.current = pageWidth;
  const pageHRef = useRef(pageHeight);
  pageHRef.current = pageHeight;

  // ── AUTO-HEIGHT for text ───────────────────────────────────────────────
  // Measures the real rendered height of the text content and writes it back to
  // the element so the box grows to fit. The `> 1` guard prevents an update loop
  // (once el.height matches the measured height, no further change fires).
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (elRef.current.type !== "text") return;
    const node = contentRef.current;
    if (!node) return;
    const measure = () => {
      const h = Math.ceil(node.scrollHeight);
      const cur = elRef.current;
      if (h > 0 && Math.abs(h - cur.height) > 1) {
        // live update keeps undo history clean and syncs height for export/reflow
        onChangeRef.current({ ...cur, height: h }, true);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  // Re-run when the text content or typography that affects wrapping changes.
  }, [
    el.text,
    el.bind,
    el.fontFamily,
    el.fontSize,
    el.fontWeight,
    el.lineHeight,
    el.letterSpacing,
    el.wordSpacing,
    el.whiteSpace,
    el.width,
    el.padding.t,
    el.padding.r,
    el.padding.b,
    el.padding.l,
  ]);

  const startDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Always select on mousedown so locked text can be edited in the inspector.
    onSelect(el.id);
    // Locked elements: selection is allowed, but dragging/moving is blocked.
    if (el.locked) return;

    if (el.type === "image" && e.altKey) {
      e.preventDefault();
      dragRef.current = {
        mode: "pan",
        startX: e.clientX,
        startY: e.clientY,
        origX: el.x,
        origY: el.y,
        origW: el.width,
        origH: el.height,
        cx: 0,
        cy: 0,
        startAngle: 0,
        origPosX: el.imagePosX ?? 50,
        origPosY: el.imagePosY ?? 50,
      };
      document.body.style.cursor = "grabbing";
      return;
    }

    dragRef.current = {
      mode: "move",
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
      origW: el.width,
      origH: el.height,
      cx: 0,
      cy: 0,
      startAngle: 0,
    };
    document.body.style.cursor = "grabbing";
  };

  const startResize = (handle: HandleDir) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = {
      mode: "resize",
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
      origW: el.width,
      origH: el.height,
      cx: 0,
      cy: 0,
      startAngle: 0,
    };
  };

  const startRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    dragRef.current = {
      mode: "rotate",
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
      origW: el.width,
      origH: el.height,
      cx,
      cy,
      startAngle:
        (Math.atan2(e.clientY - cy * zoom, e.clientX - cx * zoom) * 180) / Math.PI - el.rotation,
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const zoom = zoomRef.current;
      const el = elRef.current;
      // For text, width-only resizes are valid; vertical changes are ignored
      // because height is content-driven.
      const isText = el.type === "text";
      if (d.mode === "move") {
        const dx = (e.clientX - d.startX) / zoom;
        const dy = (e.clientY - d.startY) / zoom;
        if (e.shiftKey) {
          const nx = Math.round((d.origX + dx) / GRID) * GRID;
          const ny = Math.round((d.origY + dy) / GRID) * GRID;
          onGuidelineRef.current?.([]);
          onChangeRef.current({ ...el, x: nx, y: ny }, true);
        } else {
          const rawX = Math.round(d.origX + dx);
          const rawY = Math.round(d.origY + dy);
          const { snappedX, snappedY, guidelines } = computeGuidelines(
            rawX, rawY, el.width, el.height, pageWRef.current, pageHRef.current,
          );
          onGuidelineRef.current?.(guidelines);
          onChangeRef.current({ ...el, x: snappedX, y: snappedY }, true);
        }
      } else if (d.mode === "resize" && d.handle) {
        const dx = (e.clientX - d.startX) / zoom;
        const dy = (e.clientY - d.startY) / zoom;
        let { origX: x, origY: y, origW: w, origH: h } = d;
        if (d.handle.includes("e")) w = Math.max(20, d.origW + dx);
        if (d.handle.includes("w")) { w = Math.max(20, d.origW - dx); x = d.origX + (d.origW - w); }
        // Skip vertical handle math for text — its height follows content.
        if (!isText) {
          if (d.handle.includes("s")) h = Math.max(20, d.origH + dy);
          if (d.handle.includes("n")) { h = Math.max(20, d.origH - dy); y = d.origY + (d.origH - h); }
        }
        const rx = Math.round(x), ry = Math.round(y), rw = Math.round(w), rh = Math.round(h);
        const { guidelines } = computeGuidelines(rx, ry, rw, rh, pageWRef.current, pageHRef.current);
        onGuidelineRef.current?.(guidelines);
        if (isText) {
          // Only commit x/width; height re-measures via the ResizeObserver.
          onChangeRef.current({ ...el, x: rx, width: rw }, true);
        } else {
          onChangeRef.current({ ...el, x: rx, y: ry, width: rw, height: rh }, true);
        }
      } else if (d.mode === "pan") {
        const dx = (e.clientX - d.startX) / zoom;
        const dy = (e.clientY - d.startY) / zoom;
        const w = d.origW || 1;
        const h = d.origH || 1;
        const nx = Math.max(0, Math.min(100, (d.origPosX ?? 50) - (dx / w) * 100));
        const ny = Math.max(0, Math.min(100, (d.origPosY ?? 50) - (dy / h) * 100));
        onChangeRef.current({ ...el, imagePosX: Math.round(nx), imagePosY: Math.round(ny) }, true);
      } else if (d.mode === "rotate") {
        const angle =
          (Math.atan2(e.clientY - d.cy * zoom, e.clientX - d.cx * zoom) * 180) / Math.PI;
        onChangeRef.current({ ...el, rotation: Math.round(angle - d.startAngle) }, true);
      }
    };
    const onUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        document.body.style.cursor = "";
        onGuidelineRef.current?.([]);
        onCommitRef.current();
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const wrapperStyle: CSSProperties = {
    position: "absolute",
    left: el.x,
    top: el.y,
    width: el.width,
    // Text hugs its content height; other types keep their fixed height.
    height: el.type === "text" ? "auto" : (el.height || undefined),
    minHeight: el.type === "text" ? el.height || undefined : undefined,
    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
    opacity: isSelected ? 0.85 : el.opacity,
    // Locked = default cursor so user knows it's selectable but not draggable
    cursor: el.locked ? "default" : "grab",
    userSelect: "none",
    boxSizing: "border-box",
    outline: isSelected
      ? `4.5px solid ${el.locked ? T.accent : T.selection}`
      : "none",
    outlineOffset: 0,
    zIndex: isSelected ? 999 : el.zIndex,
    pointerEvents: pointerEvents,
  };

  const innerCommon: CSSProperties = {
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
    pointerEvents: "none",
  };
  if (el.background && el.background !== "transparent") innerCommon.background = el.background;
  if (!isPaddingZero(el.padding)) innerCommon.padding = paddingToCss(el.padding);
  if (!isRadiusZero(el.borderRadius)) innerCommon.borderRadius = radiusToCss(el.borderRadius);
  if (el.borderWidth > 0)
    innerCommon.border = `${el.borderWidth}px ${el.borderStyle || "solid"} ${el.borderColor || "#000"}`;
  if (el.boxShadow && el.boxShadow !== "none") innerCommon.boxShadow = el.boxShadow;

  let content: JSX.Element;

  if (el.type === "collage") {
    const gap = el.collageGap || 0;
    content = (
      <div style={{ ...innerCommon, position: "relative", pointerEvents: "auto" }}>
        {el.collageCells.map((c, idx) => (
          <div
            key={idx}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
            onDrop={(e) => {
              const src = e.dataTransfer.getData("imageSrc");
              if (!src) return;
              e.preventDefault();
              e.stopPropagation();
              onDropToCell?.(el.id, idx, src);
            }}
            style={{
              position: "absolute",
              left: `${c.fx * 100}%`,
              top: `${c.fy * 100}%`,
              width: `${c.fw * 100}%`,
              height: `${c.fh * 100}%`,
              padding: gap / 2,
              boxSizing: "border-box",
            }}
          >
            <div style={{
              width: "100%", height: "100%", overflow: "hidden", position: "relative",
              background: c.src ? "transparent" : T.panelHi,
              border: c.src ? "none" : `1px dashed ${T.borderHi}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {c.src ? (
                <img
                  src={c.src}
                  alt=""
                  draggable={false}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    objectPosition: `${c.posX}% ${c.posY}%`,
                    transform: `scale(${c.scale})`, transformOrigin: "center",
                    display: "block", pointerEvents: "none",
                  }}
                />
              ) : (
                <span style={{
                  color: T.textDim, fontSize: 11, fontFamily: "ui-monospace, monospace",
                  pointerEvents: "none", textAlign: "center", padding: 4,
                }}>
                  Slipp bilde her
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  } else if (el.type === "svg") {
    content = (
      <div
        style={{ ...innerCommon, display: "flex", alignItems: "center", justifyContent: "center" }}
        dangerouslySetInnerHTML={{ __html: el.svgMarkup }}
      />
    );
  } else if (el.type === "image") {
    const scale = el.imageScale ?? 1;
    const px = el.imagePosX ?? 50;
    const py = el.imagePosY ?? 50;
    content = (
      <div style={{ ...innerCommon, position: "relative" }}>
        <img
          src={resolveSrc(el, data, loopItem)}
          alt=""
          draggable={false}
          style={{
            width: "100%", height: "100%",
            objectFit: (el.objectFit as any) || undefined,
            objectPosition: `${px}% ${py}%`,
            transform: scale !== 1 ? `scale(${scale})` : undefined,
            transformOrigin: "center",
            filter: el.imageFilter && el.imageFilter !== "none" ? el.imageFilter : undefined,
            display: "block", pointerEvents: "none",
          }}
        />
      </div>
    );
  } else {
    const ts: CSSProperties = {};
    if (el.fontFamily) ts.fontFamily = el.fontFamily;
    if (el.fontSize > 0) ts.fontSize = el.fontSize;
    if (el.fontWeight && el.fontWeight !== "normal" && el.fontWeight !== "400") ts.fontWeight = el.fontWeight as any;
    if (el.fontStyle && el.fontStyle !== "normal") ts.fontStyle = el.fontStyle as any;
    if (el.color) ts.color = el.color;
    if (el.textAlign) ts.textAlign = el.textAlign as any;
    if (el.lineHeight && el.lineHeight !== "normal") ts.lineHeight = el.lineHeight;
    if (el.letterSpacing && el.letterSpacing !== "normal") ts.letterSpacing = el.letterSpacing;
    if (el.wordSpacing && el.wordSpacing !== "normal") ts.wordSpacing = el.wordSpacing;
    if (el.textTransform && el.textTransform !== "none") ts.textTransform = el.textTransform as any;
    if (el.textDecoration && el.textDecoration !== "none") ts.textDecoration = el.textDecoration;
    if (el.whiteSpace && el.whiteSpace !== "normal") ts.whiteSpace = el.whiteSpace as any;
    if (el.textShadow && el.textShadow !== "none") ts.textShadow = el.textShadow;
    content = (
      <div
        ref={contentRef}
        style={{
          ...innerCommon,
          ...ts,
          // ── AUTO-HEIGHT: let the text box size to its content ──────────
          height: "auto",
          overflow: "visible",
          wordBreak: "break-word",
        }}
      >
        {resolvePreview(el, data, loopItem)}
      </div>
    );
  }

  // Pick the handle set: text uses width/diagonal handles only.
  const activeHandles = el.type === "text" ? TEXT_HANDLES : HANDLES;

  return (
    <div
      style={wrapperStyle}
      onMouseDown={startDrag}
      onClick={(e) => { e.stopPropagation(); onSelect(el.id); }}
    >
      {content}
      {el.bind && (
        <div style={{
          position: "absolute", top: -16, left: 0, fontSize: 9, color: T.accent,
          background: T.brand, padding: "1px 5px", borderRadius: 2,
          fontFamily: "ui-monospace, monospace", letterSpacing: 0.3, whiteSpace: "nowrap",
          pointerEvents: "none", opacity: isSelected ? 1 : 0, transition: "opacity 0.1s",
        }}>
          {el.bind}
        </div>
      )}
      {/* Lock badge — shown on locked+selected elements so user knows why no handles appear */}
      {isSelected && el.locked && (
        <div style={{
          position: "absolute", top: -31, right: -4, fontSize: 14, color: T.brand,
          background: T.accent, padding: "2px 6px", borderRadius: 2,
          fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap",
          pointerEvents: "none", display: "flex", alignItems: "center", gap: 3,
        }}>
          <Lock size={12} /> Låst
        </div>
      )}
      {/* Resize / rotate handles — only for UNLOCKED selected elements */}
      {isSelected && !el.locked && (
        <>
          {activeHandles.map((h) => (
            <div
              key={h}
              onMouseDown={startResize(h)}
              style={{
                position: "absolute",
                ...handlePos(h),
                width: 8 / zoom,
                height: 8 / zoom,
                background: "#fff",
                border: `1px solid ${T.selection}`,
                cursor: handleCursor(h),
                zIndex: 10,
              }}
            />
          ))}
          <div
            onMouseDown={startRotate}
            style={{
              position: "absolute", left: "50%", top: -28 / zoom,
              transform: "translateX(-50%)", width: 20 / zoom, height: 20 / zoom,
              borderRadius: "50%", background: T.accent, border: `1px solid ${T.brand}`,
              cursor: "grab", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <RotateCw size={12 / zoom} style={{ color: T.brand, pointerEvents: "none" }} />
          </div>
        </>
      )}
    </div>
  );
}

function handlePos(h: HandleDir): CSSProperties {
  const e = -4;
  const m = "calc(50% - 4px)";
  const map: Record<HandleDir, CSSProperties> = {
    nw: { left: e, top: e }, n: { left: m, top: e }, ne: { right: e, top: e },
    e: { right: e, top: m }, se: { right: e, bottom: e }, s: { left: m, bottom: e },
    sw: { left: e, bottom: e }, w: { left: e, top: m },
  };
  return map[h];
}
function handleCursor(h: HandleDir): string {
  return { n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize", ne: "nesw-resize", sw: "nesw-resize", nw: "nwse-resize", se: "nwse-resize" }[h];
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE VIEW
   ═══════════════════════════════════════════════════════════════════════ */
interface PageViewProps {
  page: Page;
  selectedId: string | null;
  zoom: number;
  showGrid: boolean;
  data: Record<string, any>;
  onSelect: (id: string | null) => void;
  onChange: (el: CanvasElement, live?: boolean) => void;
  onCommit: () => void;
  onDropImage: (src: string, x: number, y: number) => void;
  onActivate?: () => void;
  onDropToCell?: (elId: string, cellIndex: number, src: string) => void;
}

function PageView({ page, selectedId, zoom, showGrid, data, onSelect, onChange, onCommit, onDropImage, onActivate, onDropToCell }: PageViewProps) {
  const loopItem = useMemo(() => {
    if (!page.loop) return null;
    const arr = getPath(data, page.loop.source);
    if (Array.isArray(arr) && arr[0]) return { [page.loop.iter]: arr[0] };
    return null;
  }, [page.loop, data]);

  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const src = e.dataTransfer.getData("imageSrc");
    if (!src) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    onDropImage(src, Math.round(x), Math.round(y));
  };

  const hasSelection = !!page.elements.find((e) => e.id === selectedId);

  return (
    <div
      style={{
        width: page.width * zoom, height: page.height * zoom, position: "relative",
        flexShrink: 0, zIndex: hasSelection ? 9999 : 1, overflow: hasSelection ? "visible" : "hidden",
      }}
      onMouseDown={() => { onSelect(null); onActivate?.(); }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className="page"
        style={{
          width: page.width, height: page.height, background: page.bg, position: "relative",
          overflow: hasSelection ? "visible" : "hidden",
          transform: `scale(${zoom})`, transformOrigin: "top left",
        }}
      >
        {showGrid && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 99999,
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)`,
            backgroundSize: `${GRID * 4}px ${GRID * 4}px`, pointerEvents: "none",
          }} />
        )}
        {page.elements.map((el) => (
          <ElementView
            key={el.id}
            el={el}
            isSelected={selectedId === el.id}
            zoom={zoom}
            data={data}
            loopItem={loopItem}
            onSelect={onSelect}
            onChange={onChange}
            onCommit={onCommit}
            onDropToCell={onDropToCell}
            pageWidth={page.width}
            pageHeight={page.height}
            onGuidelineChange={selectedId === el.id ? setGuidelines : undefined}
          />
        ))}
        {guidelines.length > 0 && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 100000 }}>
            {guidelines.map((g, idx) => {
              const isCentre = g.label === "Senter";
              const color = isCentre ? "#f43f5e" : "#3b82f6";
              if (g.axis === "v") {
                return (
                  <React.Fragment key={idx}>
                    <div style={{
                      position: "absolute", left: g.pos, top: 0, width: 1, height: "100%",
                      background: color, opacity: 0.85, transform: "translateX(-0.5px)",
                      borderLeft: `1px ${isCentre ? "solid" : "dashed"} ${color}`,
                    }} />
                    <div style={{
                      position: "absolute", left: g.pos + 4, top: 6, background: color, color: "#fff",
                      fontSize: 9, fontFamily: "ui-monospace, monospace", letterSpacing: 0.5,
                      padding: "1px 5px", borderRadius: 3, opacity: 0.92, whiteSpace: "nowrap",
                    }}>{g.label ?? ""}</div>
                  </React.Fragment>
                );
              } else {
                return (
                  <React.Fragment key={idx}>
                    <div style={{
                      position: "absolute", top: g.pos, left: 0, height: 1, width: "100%",
                      background: color, opacity: 0.85, transform: "translateY(-0.5px)",
                      borderTop: `1px ${isCentre ? "solid" : "dashed"} ${color}`,
                    }} />
                    <div style={{
                      position: "absolute", top: g.pos + 4, left: 6, background: color, color: "#fff",
                      fontSize: 9, fontFamily: "ui-monospace, monospace", letterSpacing: 0.5,
                      padding: "1px 5px", borderRadius: 3, opacity: 0.92, whiteSpace: "nowrap",
                    }}>{g.label ?? ""}</div>
                  </React.Fragment>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SPREAD VIEW
   ═══════════════════════════════════════════════════════════════════════ */
interface SpreadViewProps {
  leftPage: Page;
  rightPage: Page | null;
  selectedId: string | null;
  zoom: number;
  showGrid: boolean;
  data: Record<string, any>;
  onSelect: (id: string | null) => void;
  onChange: (el: CanvasElement, live?: boolean) => void;
  onCommit: () => void;
  onDropImageLeft: (src: string, x: number, y: number) => void;
  onDropImageRight: (src: string, x: number, y: number) => void;
  onAddRightPage: () => void;
  coverOnly?: boolean;
  onActivateLeft?: () => void;
  onActivateRight?: () => void;
  onDropToCell?: (elId: string, cellIndex: number, src: string) => void;
}

function SpreadView({ leftPage, rightPage, selectedId, zoom, showGrid, data, onSelect, onChange, onCommit, onDropImageLeft, onDropImageRight, onAddRightPage, coverOnly, onActivateLeft, onActivateRight, onDropToCell }: SpreadViewProps) {
  const leftFiltered = useMemo(() => ({ ...leftPage, elements: leftPage.elements.filter((e) => !e.spanning) }), [leftPage]);
  const rightFiltered = useMemo(() => rightPage ? { ...rightPage, elements: rightPage.elements.filter((e) => !e.spanning) } : null, [rightPage]);
  const spanningEls = useMemo(() => leftPage.elements.filter((e) => e.spanning), [leftPage.elements]);
  const spreadWidth = leftPage.width + (rightPage?.width ?? 0);
  const spreadHeight = leftPage.height;
  const leftLoopItem = useMemo(() => {
    if (!leftPage.loop) return null;
    const arr = getPath(data, leftPage.loop.source);
    if (Array.isArray(arr) && arr[0]) return { [leftPage.loop.iter]: arr[0] };
    return null;
  }, [leftPage.loop, data]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 0, marginBottom: 6, width: spreadWidth * zoom || leftPage.width * zoom }}>
        <div style={{ width: leftPage.width * zoom, fontSize: 10, color: T.textDim, fontFamily: "ui-monospace, monospace", letterSpacing: 1, textTransform: "uppercase", textAlign: "center" }}>
          {leftPage.name}{leftPage.loop && <span style={{ color: T.accent, marginLeft: 8 }}>⟳</span>}
        </div>
        {!coverOnly && (
          <div style={{ width: (rightPage?.width ?? leftPage.width) * zoom, fontSize: 10, color: T.textDim, fontFamily: "ui-monospace, monospace", letterSpacing: 1, textTransform: "uppercase", textAlign: "center" }}>
            {rightPage ? rightPage.name : "—"}{rightPage?.loop && <span style={{ color: T.accent, marginLeft: 8 }}>⟳</span>}
          </div>
        )}
      </div>
      <div style={{ position: "relative", display: "flex", gap: 0 }}>
        <PageView page={leftFiltered} selectedId={selectedId} zoom={zoom} showGrid={showGrid} data={data} onSelect={onSelect} onChange={onChange} onCommit={onCommit} onDropImage={onDropImageLeft} onActivate={onActivateLeft} onDropToCell={onDropToCell} />
        {!coverOnly && rightFiltered && (
          <PageView page={rightFiltered} selectedId={selectedId} zoom={zoom} showGrid={showGrid} data={data} onSelect={onSelect} onChange={onChange} onCommit={onCommit} onDropImage={onDropImageRight} onActivate={onActivateRight} onDropToCell={onDropToCell} />
        )}
        {rightFiltered && spanningEls.length > 0 && (
          <div style={{ position: "absolute", left: leftPage.width * zoom, top: 0, width: 0, height: spreadHeight * zoom, borderLeft: `1px dashed ${T.accent}55`, pointerEvents: "none", zIndex: 50 }} />
        )}
        {rightFiltered && spanningEls.length > 0 && (
          <div style={{ position: "absolute", left: 0, top: 0, width: spreadWidth * zoom, height: spreadHeight * zoom, pointerEvents: "none", zIndex: 60 }}>
            <div style={{ width: spreadWidth, height: spreadHeight, transform: `scale(${zoom})`, transformOrigin: "top left", position: "relative" }}>
              {spanningEls.map((el) => (
                <ElementView key={el.id} el={el} isSelected={selectedId === el.id} zoom={zoom} data={data} loopItem={leftLoopItem} onSelect={onSelect} onChange={onChange} onCommit={onCommit} pointerEvents="auto" pageWidth={spreadWidth} pageHeight={spreadHeight} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PRIMITIVE UI
   ═══════════════════════════════════════════════════════════════════════ */
const inputStyle = (extra: CSSProperties = {}): CSSProperties => ({
  width: "100%", background: T.panelHi, border: `1px solid ${T.border}`, color: T.text,
  borderRadius: 3, padding: "5px 8px", fontSize: 12, outline: "none",
  fontFamily: "system-ui, sans-serif", boxSizing: "border-box", ...extra,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, letterSpacing: 0.6, color: T.textDim, marginBottom: 3, textTransform: "uppercase" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function SectionLabel({ children, collapsible, open, onToggle }: { children: React.ReactNode; collapsible?: boolean; open?: boolean; onToggle?: () => void }) {
  return (
    <div
      onClick={collapsible ? onToggle : undefined}
      style={{ fontSize: 10, letterSpacing: 1.4, color: T.accent, fontFamily: "ui-monospace, monospace", textTransform: "uppercase", margin: "16px 0 8px", paddingBottom: 6, borderBottom: `1px solid ${T.border}`, cursor: collapsible ? "pointer" : "default", display: "flex", justifyContent: "space-between", userSelect: "none" }}
    >
      <span>{children}</span>
      {collapsible && <span style={{ color: T.textDim }}>{open ? "−" : "+"}</span>}
    </div>
  );
}

function Input({ value, onChange, placeholder, disabled, mono }: { value: string | undefined | null; onChange: (v: string) => void; placeholder?: string; disabled?: boolean; mono?: boolean }) {
  return (
    <input
      type="text" value={value || ""} placeholder={placeholder} disabled={disabled}
      className={disabled ? "cursor-not-allowed" : ""}
      onChange={(e) => onChange(e.target.value)}
      style={inputStyle({ fontFamily: mono ? "ui-monospace, monospace" : undefined, opacity: disabled ? 0.5 : 1 })}
    />
  );
}
function NumInput({ value, onChange, step = 1, min, max }: { value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number }) {
  return (
    <input
      type="number" value={Number.isFinite(value) ? value : 0} step={step} min={min} max={max}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      style={inputStyle()}
    />
  );
}
function ColorInput({ value, onChange, allowTransparent = true }: { value: string; onChange: (v: string) => void; allowTransparent?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <input type="color" value={normalizeColor(value)} onChange={(e) => onChange(e.target.value)} style={{ width: 32, height: 28, border: "none", borderRadius: 3, cursor: "pointer", padding: 0 }} />
      <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} style={inputStyle({ fontFamily: "ui-monospace, monospace" })} />
      {allowTransparent && (
        <button onClick={() => onChange("transparent")} title="Gjennomsiktig" style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.textDim, borderRadius: 3, cursor: "pointer", padding: "0 8px", fontSize: 10 }}>⊘</button>
      )}
    </div>
  );
}
function Select({ value, onChange, options, labels }: { value: string; onChange: (v: string) => void; options: string[]; labels?: Record<string, string> }) {
  return (
    <select value={value || ""} onChange={(e) => onChange(e.target.value)} style={inputStyle()}>
      {options.map((o) => <option key={o} value={o}>{labels?.[o] ?? o}</option>)}
    </select>
  );
}
function IconBtn({ children, onClick, title, color, active = true, disabled }: { children: React.ReactNode; onClick?: () => void; title?: string; color?: string; active?: boolean; disabled?: boolean }) {
  return (
    <button onClick={onClick} title={title} disabled={disabled} style={{ border: `1px solid ${T.accent}`, color: disabled ? T.text : color || T.text, borderRadius: 3, opacity: disabled || !active ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer", padding: "3px 3px", fontSize: 12, lineHeight: 1 }}>
      {children}
    </button>
  );
}
function Sep() {
  return <div style={{ width: 1, height: 22, background: T.border, margin: "0 4px" }} />;
}
function normalizeColor(c: string): string {
  if (!c) return "#000000";
  if (c === "transparent") return "#ffffff";
  if (c.startsWith("#") && (c.length === 4 || c.length === 7)) return c;
  const m = String(c).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) {
    const hex = (n: string) => parseInt(n).toString(16).padStart(2, "0");
    return `#${hex(m[1])}${hex(m[2])}${hex(m[3])}`;
  }
  return "#000000";
}

const btnPrimary: CSSProperties = {
  background: T.accent, color: T.brand, border: "none", padding: "7px 16px",
  borderRadius: 4, cursor: "pointer", fontWeight: 700, fontSize: 12,
};
const btnSecondary: CSSProperties = {
  background: "transparent", color: T.text, border: `1px solid ${T.border}`,
  padding: "7px 7px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 700,
};

function AutoTextarea({ value, onChange, style }: { value: string; onChange: (v: string) => void; style?: CSSProperties }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [value]);
  return (
    <textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} style={{ ...style, resize: "none", overflow: "hidden", minHeight: 60 }} />
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SVG INSPECTOR
   ═══════════════════════════════════════════════════════════════════════ */
interface SvgInspectorProps {
  el: CanvasElement;
  onChange: (el: CanvasElement) => void;
}

function SvgInspector({ el, onChange }: SvgInspectorProps) {
  const update = (patch: Partial<CanvasElement>) => onChange({ ...el, ...patch });
  const handleColorChange = (key: string, newColor: string) => {
    const newMarkup = patchSvgColor(el.svgMarkup, key, newColor);
    const newColors = el.svgColors.map((c) => c.key === key ? { ...c, color: newColor } : c);
    update({ svgMarkup: newMarkup, svgColors: newColors });
  };
  const handleTextChange = (key: string, newText: string) => {
    const newMarkup = patchSvgText(el.svgMarkup, key, newText);
    const newTexts = el.svgTexts.map((t) => t.key === key ? { ...t, text: newText } : t);
    update({ svgMarkup: newMarkup, svgTexts: newTexts });
  };
  const liveColors = el.svgColors.length > 0 ? el.svgColors : parseSvgColors(el.svgMarkup);
  const liveTexts = el.svgTexts.length > 0 ? el.svgTexts : parseSvgTexts(el.svgMarkup);

  return (
    <>
      <div style={{ margin: "8px 0 12px", display: "flex", justifyContent: "center", alignItems: "center", background: T.panelHi, borderRadius: 4, padding: 12, border: `1px solid ${T.border}`, minHeight: 60 }}>
        <div dangerouslySetInnerHTML={{ __html: el.svgMarkup }} />
      </div>
      {liveColors.length > 0 && (
        <><SectionLabel>SVG-farger</SectionLabel>
          {liveColors.map((node) => <Field key={node.key} label={node.label}><ColorInput value={node.color} onChange={(v) => handleColorChange(node.key, v)} /></Field>)}
        </>
      )}
      {liveTexts.length > 0 && (
        <><SectionLabel>SVG-tekst</SectionLabel>
          {liveTexts.map((node) => <Field key={node.key} label={node.label}><Input value={node.text} onChange={(v) => handleTextChange(node.key, v)} /></Field>)}
        </>
      )}
      {liveColors.length === 0 && liveTexts.length === 0 && (
        <div style={{ color: T.textDim, fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>Fant ingen redigerbare farger eller tekster i denne SVG-en.</div>
      )}
      <SectionLabel>Rå SVG-kode</SectionLabel>
      <textarea
        value={el.svgMarkup}
        rows={8}
        onChange={(e) => {
          const newMarkup = e.target.value;
          update({ svgMarkup: newMarkup, svgColors: parseSvgColors(newMarkup), svgTexts: parseSvgTexts(newMarkup) });
        }}
        style={inputStyle({ resize: "vertical", fontFamily: "ui-monospace, monospace", fontSize: 11 })}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   INSPECTOR
   ═══════════════════════════════════════════════════════════════════════ */
interface InspectorProps {
  el: CanvasElement | null;
  page: Page | null;
  onChange: (el: CanvasElement) => void;
  onChangePage: (p: Page) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSplit?: () => void;
  onCopy?: () => void;
  onDeletePage?: () => void;
}

function Inspector({ el, page, onChange, onChangePage, onDelete, onDuplicate, onSplit, onCopy, onDeletePage }: InspectorProps) {
  const [openSections, setOpenSections] = useState({
    typography: true, color: true, box: false, border: false, effects: false, image: true, binding: true,
  });
  const toggle = (k: keyof typeof openSections) => setOpenSections((s) => ({ ...s, [k]: !s[k] }));

  if (!el && !page) return null;

  if (!el && page) {
    return (
      <div style={{ padding: 16 }}>
        <SectionLabel>Side</SectionLabel>
        <Field label="Navn"><Input value={page.name} onChange={(v) => onChangePage({ ...page, name: v })} /></Field>
        <Field label="Bakgrunn"><ColorInput value={page.bg} onChange={(v) => onChangePage({ ...page, bg: v })} /></Field>
        <Field label="størrelse"><p>A4</p></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <Field label="Bredde"><NumInput value={page.width} onChange={(v) => onChangePage({ ...page, width: v })} /></Field>
          <Field label="Høyde"><NumInput value={page.height} onChange={(v) => onChangePage({ ...page, height: v })} /></Field>
        </div>
        {page.loop && (
          <>
            <SectionLabel>Løkkebinding</SectionLabel>
            <Field label="Kildedata"><Input mono value={page.loop.source} onChange={(v) => onChangePage({ ...page, loop: { ...page.loop!, source: v } })} /></Field>
            <Field label="Iterasjonsvariabel"><Input mono value={page.loop.iter} onChange={(v) => onChangePage({ ...page, loop: { ...page.loop!, iter: v } })} /></Field>
            <div style={{ fontSize: 11, color: T.textDim, background: T.panelHi, border: `1px solid ${T.border}`, borderRadius: 4, padding: 10, marginTop: 8, lineHeight: 1.5, fontFamily: "ui-monospace, monospace" }}>
              {`<% ${page.loop.source}.forEach((${page.loop.iter}) => { %> ... <% }); %>`}
            </div>
          </>
        )}
        {onDeletePage && (
          <div style={{ marginTop: 20 }}>
            <button onClick={onDeletePage} style={{ ...btnPrimary, background: T.danger, width: "100%" }}>🗑 Slett denne siden</button>
          </div>
        )}
      </div>
    );
  }

  const e = el!;
  const update = (patch: Partial<CanvasElement>) => onChange({ ...e, ...patch });
  const isText = e.type === "text";

  return (
    <div style={{ padding: 16 }}>
      {/* ── Header row: type label + action buttons ─────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 10, letterSpacing: 1.4, color: T.accent, fontFamily: "ui-monospace, monospace", textTransform: "uppercase" }}>
          {e.type}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {/* ── LOCK TOGGLE ──────────────────────────────────────────────
              Locked   → gold lock icon → click to UNLOCK (allow dragging)
              Unlocked → muted lock icon → click to LOCK (protect position)
              The text in the inspector remains fully editable regardless.   */}
          <IconBtn
            onClick={() => update({ locked: !e.locked })}
            title={e.locked
              ? "Lås opp — tillat at elementet flyttes"
              : "Lås — hindre utilsiktet flytting (tekst forblir redigerbar)"}
            color={e.locked ? T.accent : T.textDim}
          >
            {e.locked ? <Lock size={16} /> : <Unlock size={16} />}
          </IconBtn>

          {onCopy && (
            <IconBtn onClick={onCopy} title="Kopier (⌘C)"><Copy size={16} /></IconBtn>
          )}
          <IconBtn onClick={onDuplicate} title="Dupliser"><CopyPlus size={16} /></IconBtn>
          <IconBtn onClick={onDelete} title="Slett" color={T.danger}><Trash2 size={16} /></IconBtn>
        </div>
      </div>

      {/* ── Lock status hint ──────────────────────────────────────────── */}
      {e.locked && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6, padding: "5px 8px",
          background: `${T.accent}18`, border: `1px solid ${T.accent}44`,
          borderRadius: 4, marginBottom: 10, fontSize: 10, color: T.accent,
          fontFamily: "ui-monospace, monospace",
        }}>
          <Lock size={10} />
          Posisjon låst — tekst kan fremdeles redigeres her
        </div>
      )}

      {e.type === "svg" && <SvgInspector el={e} onChange={onChange} />}

      {e.type === "text" && (
        <>
          <SectionLabel>Tekstinnhold</SectionLabel>
          <Field label={e.bind ? "Reservetekst (bundet)" : "Tekst"}>
            <AutoTextarea value={e.text} onChange={(v) => update({ text: v })} style={inputStyle({ fontFamily: "ui-monospace, monospace" })} />
          </Field>
          {/* Auto-height hint */}
          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5, background: T.panelHi, border: `1px solid ${T.border}`, borderRadius: 4, padding: 10, marginBottom: 4 }}>
            Høyden justeres automatisk etter innholdet. Elementer under flyttes ned ved behov, så teksten aldri overlapper.
          </div>

          <SectionLabel collapsible open={openSections.typography} onToggle={() => toggle("typography")}>Typografi</SectionLabel>
          {openSections.typography && (
            <>
              <Field label="Skriftfamilie">
                <Select value={e.fontFamily} onChange={(v) => update({ fontFamily: v })} options={["Helvetica", "Arial", "Georgia", "Times", "ui-serif", "ui-sans-serif", "ui-monospace"]} />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <Field label="Størrelse"><NumInput value={e.fontSize} onChange={(v) => update({ fontSize: v })} min={6} max={200} /></Field>
                <Field label="Tykkelse"><Select value={e.fontWeight} onChange={(v) => update({ fontWeight: v })} options={["100", "200", "300", "normal", "500", "600", "bold", "800", "900"]} /></Field>
                <Field label="Stil"><Select value={e.fontStyle} onChange={(v) => update({ fontStyle: v })} options={["normal", "italic", "oblique"]} /></Field>
                <Field label="Justering"><Select value={e.textAlign} onChange={(v) => update({ textAlign: v })} options={["left", "center", "right", "justify"]} /></Field>
                <Field label="Linjehøyde"><Input value={e.lineHeight} onChange={(v) => update({ lineHeight: v })} /></Field>
                <Field label="Tegnavst."><Input value={e.letterSpacing} onChange={(v) => update({ letterSpacing: v })} /></Field>
                <Field label="Ordavst."><Input value={e.wordSpacing} onChange={(v) => update({ wordSpacing: v })} /></Field>
                <Field label="Transformasjon"><Select value={e.textTransform} onChange={(v) => update({ textTransform: v })} options={["none", "uppercase", "lowercase", "capitalize"]} /></Field>
                <Field label="Dekorasjon"><Select value={e.textDecoration} onChange={(v) => update({ textDecoration: v })} options={["none", "underline", "line-through", "overline"]} /></Field>
                <Field label="Mellomrom"><Select value={e.whiteSpace} onChange={(v) => update({ whiteSpace: v })} options={["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]} /></Field>
              </div>
              <Field label="Tekstskygge"><Input mono value={e.textShadow} onChange={(v) => update({ textShadow: v })} placeholder="2px 2px 4px rgba(0,0,0,0.3)" /></Field>
            </>
          )}

          <SectionLabel collapsible open={openSections.color} onToggle={() => toggle("color")}>Farge</SectionLabel>
          {openSections.color && (
            <Field label="Tekstfarge"><ColorInput value={e.color} onChange={(v) => update({ color: v })} /></Field>
          )}
        </>
      )}

      {e.type === "image" && (
        <>
          {e.spanning && onSplit && (
            <>
              <SectionLabel>Dobbeltsidebilde</SectionLabel>
              <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5, background: T.panelHi, border: `1px solid ${T.border}`, borderRadius: 4, padding: 10, marginBottom: 8 }}>
                Dette bildet dekker begge sider. Plasser og endre størrelse først, og klikk deretter Del bilde for å dele det ved sidekanten.
              </div>
              <button onClick={onSplit} style={{ ...btnPrimary, width: "100%", marginBottom: 8 }}>✂ Del bilde</button>
            </>
          )}
          <SectionLabel collapsible open={openSections.image} onToggle={() => toggle("image")}>Bildeinnhold</SectionLabel>
          {openSections.image && (
            <>
              <Field label={e.bindSrc ? "Reservekilde (bundet)" : "Kilde-URL"}>
                <Input mono value={e.src} disabled onChange={(v) => update({ src: v })} />
              </Field>
              <Field label="Objekttilpasning">
                <Select value={e.objectFit} onChange={(v) => update({ objectFit: v })} options={["cover", "contain", "fill", "scale-down", "none"]} />
              </Field>
              <Field label="Filter">
                <Input mono value={e.imageFilter} onChange={(v) => update({ imageFilter: v })} placeholder="brightness(1.1) saturate(1.2)" />
              </Field>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {[["Ingen", "none"], ["S&H", "grayscale(1)"], ["Sepia", "sepia(0.6)"], ["Lys", "brightness(1.15) saturate(1.1)"], ["Mørk", "brightness(0.8)"]].map(([label, val]) => (
                  <button key={label} onClick={() => update({ imageFilter: val })} style={{ ...btnSecondary, padding: "3px 8px", fontSize: 10 }}>{label}</button>
                ))}
              </div>

              <SectionLabel>Zoom og plassering</SectionLabel>
              <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5, background: T.panelHi, border: `1px solid ${T.border}`, borderRadius: 4, padding: 10, marginBottom: 6 }}>
                Tips: hold ⌥ Alt og dra i bildet på lerretet for å flytte utsnittet.
              </div>
              <div style={{ width: "100%", height: 80, borderRadius: 3, overflow: "hidden", marginBottom: 8, border: `1px solid ${T.border}`, background: T.bg }}>
                <img src={e.src} alt="" style={{ width: "100%", height: "100%", objectFit: (e.objectFit as any) || "cover", objectPosition: `${e.imagePosX ?? 50}% ${e.imagePosY ?? 50}%`, transform: `scale(${e.imageScale ?? 1})`, transformOrigin: "center", display: "block" }} />
              </div>
              <Field label={`Zoom · ${(e.imageScale ?? 1).toFixed(2)}×`}>
                <input type="range" min={1} max={3} step={0.05} value={e.imageScale ?? 1} onChange={(ev) => update({ imageScale: parseFloat(ev.target.value) })} style={{ width: "100%" }} />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <Field label={`Posisjon X · ${Math.round(e.imagePosX ?? 50)}%`}>
                  <input type="range" min={0} max={100} step={1} value={e.imagePosX ?? 50} onChange={(ev) => update({ imagePosX: parseFloat(ev.target.value) })} style={{ width: "100%" }} />
                </Field>
                <Field label={`Posisjon Y · ${Math.round(e.imagePosY ?? 50)}%`}>
                  <input type="range" min={0} max={100} step={1} value={e.imagePosY ?? 50} onChange={(ev) => update({ imagePosY: parseFloat(ev.target.value) })} style={{ width: "100%" }} />
                </Field>
              </div>
              <button onClick={() => update({ imageScale: 1, imagePosX: 50, imagePosY: 50 })} style={{ ...btnSecondary, width: "100%", padding: "5px 8px", fontSize: 11, marginTop: 6 }}>
                Tilbakestill zoom og plassering
              </button>
            </>
          )}
        </>
      )}

      {e.type === "collage" && (
        <>
          <SectionLabel>Collageoppsett</SectionLabel>
          <Field label="Oppsett">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {Object.entries(COLLAGE_LAYOUTS).map(([key, def]) => {
                const activeLayout = e.collageLayout === key;
                return (
                  <button key={key} onClick={() => update({ collageLayout: key, collageCells: cellsForLayout(key, e.collageCells) })}
                    style={{ ...btnSecondary, padding: "5px 6px", fontSize: 10, borderColor: activeLayout ? T.accent : T.border, color: activeLayout ? T.accent : T.text, background: activeLayout ? T.panelHi : "transparent" }}>
                    {def.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Mellomrom (px)"><NumInput value={e.collageGap} min={0} max={40} onChange={(v) => update({ collageGap: v })} /></Field>
          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5, background: T.panelHi, border: `1px solid ${T.border}`, borderRadius: 4, padding: 10, marginTop: 4, marginBottom: 4 }}>
            Dra et bilde fra sidefeltet til en celle for å fylle den.
          </div>
          <SectionLabel>Celler</SectionLabel>
          {e.collageCells.map((c, idx) => (
            <div key={idx} style={{ border: `1px solid ${T.border}`, borderRadius: 4, padding: 8, marginBottom: 8, background: T.panel }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, letterSpacing: 1, color: T.accent, fontFamily: "ui-monospace, monospace", textTransform: "uppercase" }}>Celle {idx + 1}</span>
                {c.src && (
                  <IconBtn title="Fjern bilde" color={T.danger} onClick={() => {
                    const cells = e.collageCells.map((cc, i) => i === idx ? { ...cc, src: "", scale: 1, posX: 50, posY: 50 } : cc);
                    update({ collageCells: cells });
                  }}><Trash2 size={13} /></IconBtn>
                )}
              </div>
              {c.src ? (
                <>
                  <div style={{ width: "100%", height: 70, borderRadius: 3, overflow: "hidden", marginBottom: 6, border: `1px solid ${T.border}`, background: T.bg }}>
                    <img src={c.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${c.posX}% ${c.posY}%`, transform: `scale(${c.scale})`, transformOrigin: "center", display: "block" }} />
                  </div>
                  <Field label={`Zoom · ${c.scale.toFixed(2)}×`}>
                    <input type="range" min={1} max={3} step={0.05} value={c.scale}
                      onChange={(ev) => { const v = parseFloat(ev.target.value); const cells = e.collageCells.map((cc, i) => i === idx ? { ...cc, scale: v } : cc); update({ collageCells: cells }); }}
                      style={{ width: "100%" }} />
                  </Field>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <Field label={`Posisjon X · ${Math.round(c.posX)}%`}>
                      <input type="range" min={0} max={100} step={1} value={c.posX}
                        onChange={(ev) => { const v = parseFloat(ev.target.value); const cells = e.collageCells.map((cc, i) => i === idx ? { ...cc, posX: v } : cc); update({ collageCells: cells }); }}
                        style={{ width: "100%" }} />
                    </Field>
                    <Field label={`Posisjon Y · ${Math.round(c.posY)}%`}>
                      <input type="range" min={0} max={100} step={1} value={c.posY}
                        onChange={(ev) => { const v = parseFloat(ev.target.value); const cells = e.collageCells.map((cc, i) => i === idx ? { ...cc, posY: v } : cc); update({ collageCells: cells }); }}
                        style={{ width: "100%" }} />
                    </Field>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11, color: T.textDim, textAlign: "center", padding: "8px 4px" }}>Tom — dra et bilde hit på lerretet</div>
              )}
            </div>
          ))}
        </>
      )}

      <SectionLabel>Geometri</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <Field label="X"><NumInput value={e.x} onChange={(v) => update({ x: v })} /></Field>
        <Field label="Y"><NumInput value={e.y} onChange={(v) => update({ y: v })} /></Field>
        <Field label="B"><NumInput value={e.width} onChange={(v) => update({ width: v })} /></Field>
        <Field label={isText ? "H (auto)" : "H"}>
          {/* Height is auto-managed for text; the field is read-only there. */}
          <NumInput value={Math.round(e.height)} onChange={(v) => { if (!isText) update({ height: v }); }} />
        </Field>
        <Field label="Roter (grader)">
          <div style={{ display: "flex", gap: 4 }}>
            <NumInput value={e.rotation} onChange={(v) => update({ rotation: v })} />
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            <button onClick={() => update({ rotation: (((e.rotation - 45) % 360) + 360) % 360 })} title="Roter -45°" style={{ ...btnSecondary, flex: 1, padding: "3px 6px", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
              <RotateCcw size={12} /> -45°
            </button>
            <button onClick={() => update({ rotation: (e.rotation + 45) % 360 })} title="Roter +45°" style={{ ...btnSecondary, flex: 1, padding: "3px 6px", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
              <RotateCw size={12} /> +45°
            </button>
            <button onClick={() => update({ rotation: 0 })} title="Tilbakestill rotasjon" style={{ ...btnSecondary, padding: "3px 8px", fontSize: 11 }}>↺ 0°</button>
          </div>
        </Field>
        <Field label="Z-indeks"><NumInput value={e.zIndex} onChange={(v) => update({ zIndex: v })} /></Field>
      </div>
      <Field label={`Gjennomsiktighet · ${Math.round(e.opacity * 100)}%`}>
        <input type="range" min={0} max={1} step={0.05} value={e.opacity} onChange={(ev) => update({ opacity: parseFloat(ev.target.value) })} style={{ width: "100%" }} />
      </Field>

      <SectionLabel collapsible open={openSections.box} onToggle={() => toggle("box")}>Boks</SectionLabel>
      {openSections.box && (
        <>
          <Field label="Bakgrunn"><ColorInput value={e.background} onChange={(v) => update({ background: v })} allowTransparent /></Field>
          <Field label="Innvendig marg (T H B V)">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
              <NumInput value={e.padding.t} onChange={(v) => update({ padding: { ...e.padding, t: v } })} />
              <NumInput value={e.padding.r} onChange={(v) => update({ padding: { ...e.padding, r: v } })} />
              <NumInput value={e.padding.b} onChange={(v) => update({ padding: { ...e.padding, b: v } })} />
              <NumInput value={e.padding.l} onChange={(v) => update({ padding: { ...e.padding, l: v } })} />
            </div>
          </Field>
          <Field label="Hjørneradius (ØV ØH NH NV)">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
              <NumInput value={e.borderRadius.tl} onChange={(v) => update({ borderRadius: { ...e.borderRadius, tl: v } })} />
              <NumInput value={e.borderRadius.tr} onChange={(v) => update({ borderRadius: { ...e.borderRadius, tr: v } })} />
              <NumInput value={e.borderRadius.br} onChange={(v) => update({ borderRadius: { ...e.borderRadius, br: v } })} />
              <NumInput value={e.borderRadius.bl} onChange={(v) => update({ borderRadius: { ...e.borderRadius, bl: v } })} />
            </div>
          </Field>
        </>
      )}

      <SectionLabel collapsible open={openSections.border} onToggle={() => toggle("border")}>Ramme</SectionLabel>
      {openSections.border && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <Field label="Bredde"><NumInput value={e.borderWidth} onChange={(v) => update({ borderWidth: v })} min={0} /></Field>
            <Field label="Stil"><Select value={e.borderStyle} onChange={(v) => update({ borderStyle: v })} options={["solid", "dashed", "dotted", "double"]} /></Field>
          </div>
          <Field label="Farge"><ColorInput value={e.borderColor} onChange={(v) => update({ borderColor: v })} /></Field>
        </>
      )}

      <SectionLabel collapsible open={openSections.effects} onToggle={() => toggle("effects")}>Effekter</SectionLabel>
      {openSections.effects && (
        <>
          <Field label="Boksskygge"><Input mono value={e.boxShadow} onChange={(v) => update({ boxShadow: v })} placeholder="0 4px 12px rgba(0,0,0,0.15)" /></Field>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {[["Ingen", "none"], ["Myk", "0 2px 8px rgba(0,0,0,0.1)"], ["Kort", "0 4px 16px rgba(0,0,0,0.15)"], ["Løftet", "0 12px 32px rgba(0,0,0,0.2)"]].map(([label, val]) => (
              <button key={label} onClick={() => update({ boxShadow: val })} style={{ ...btnSecondary, padding: "3px 8px", fontSize: 10 }}>{label}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE LIST
   ═══════════════════════════════════════════════════════════════════════ */
interface PageListProps {
  pages: Page[];
  currentIdx: number;
  secondaryIdx?: number;
  data: Record<string, any>;
  onSelect: (i: number) => void;
  onAdd: () => void;
  onDelete: (i: number) => void;
  onMove: (i: number, dir: -1 | 1) => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
  onReorderMulti: (indices: number[], toIdx: number) => void;
  onDeleteMulti: (indices: number[]) => void;
  onDuplicate: (i: number) => void;
  onInsertAfter: (i: number) => void;
  TabComponent: React.FC;
}

function PageList({ pages, currentIdx, secondaryIdx, data, onSelect, onAdd, onDelete, onMove, onReorder, onReorderMulti, onDeleteMulti, onDuplicate, onInsertAfter, TabComponent }: PageListProps) {
  const [selectedSet, setSelectedSet] = useState<Set<number>>(new Set());
  const anchorRef = useRef<number>(0);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const computeDropIdx = (e: React.DragEvent<HTMLDivElement>, hoverIdx: number) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return e.clientY - rect.top > rect.height / 2 ? hoverIdx + 1 : hoverIdx;
  };

  const selectedArr = useMemo(() => Array.from(selectedSet).sort((a, b) => a - b), [selectedSet]);
  const multiSelected = selectedSet.size > 1;

  useEffect(() => {
    setSelectedSet((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => { if (i < pages.length) next.add(i); });
      return next.size === prev.size ? prev : next;
    });
  }, [pages.length]);

  const handleItemClick = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const meta = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    if (shift) {
      const lo = Math.min(anchorRef.current, i);
      const hi = Math.max(anchorRef.current, i);
      const range = new Set<number>();
      for (let x = lo; x <= hi; x++) range.add(x);
      setSelectedSet(range);
    } else if (meta) {
      setSelectedSet((prev) => { const next = new Set(prev); if (next.has(i)) next.delete(i); else next.add(i); return next; });
      anchorRef.current = i;
    } else {
      setSelectedSet(new Set([i]));
      anchorRef.current = i;
      onSelect(i);
    }
  };

  const handleDragStart = (i: number, e: React.DragEvent) => {
    setDragIdx(i);
    e.dataTransfer.effectAllowed = "move";
    if (!selectedSet.has(i)) { setSelectedSet(new Set([i])); anchorRef.current = i; }
    e.dataTransfer.setData("text/plain", String(i));
  };
  const handleDragEnd = () => { setDragIdx(null); setDropIdx(null); };

  const handleDrop = (e: React.DragEvent) => {
    if (dragIdx === null) return;
    e.preventDefault();
    const target = dropIdx ?? pages.length;
    const dragging = selectedSet.has(dragIdx) && selectedSet.size > 1 ? selectedArr : [dragIdx];
    if (dragging.length === 1) {
      if (target !== dragging[0] && target !== dragging[0] + 1) onReorder(dragging[0], target > dragging[0] ? target - 1 : target);
    } else {
      const minSelected = dragging[0];
      const maxSelected = dragging[dragging.length - 1];
      if (target < minSelected || target > maxSelected + 1) onReorderMulti(dragging, target);
    }
    setDragIdx(null);
    setDropIdx(null);
  };

  const isDraggingItem = (i: number) => {
    if (dragIdx === null) return false;
    if (selectedSet.has(dragIdx)) return selectedSet.has(i);
    return dragIdx === i;
  };

  const selectionBar = selectedSet.size > 0 && (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", background: T.panelHi, borderBottom: `1px solid ${T.border}`, fontSize: 10, color: T.accent, fontFamily: "ui-monospace, monospace", letterSpacing: 0.5, flexShrink: 0, gap: 6 }}>
      <span style={{ whiteSpace: "nowrap" }}>{selectedSet.size} valgt</span>
      <div style={{ display: "flex", gap: 4 }}>
        {multiSelected && (
          <>
            <button title="Flytt valgte opp" disabled={selectedArr[0] === 0}
              onClick={(e) => { e.stopPropagation(); if (selectedArr[0] === 0) return; onReorderMulti(selectedArr, selectedArr[0] - 1); setSelectedSet(new Set(selectedArr.map((x) => x - 1))); }}
              style={{ ...btnSecondary, padding: "2px 6px", fontSize: 10, opacity: selectedArr[0] === 0 ? 0.4 : 1 }}>
              <ArrowUp size={11} />
            </button>
            <button title="Flytt valgte ned" disabled={selectedArr[selectedArr.length - 1] === pages.length - 1}
              onClick={(e) => { e.stopPropagation(); const last = selectedArr[selectedArr.length - 1]; if (last >= pages.length - 1) return; onReorderMulti(selectedArr, last + 2); setSelectedSet(new Set(selectedArr.map((x) => x + 1))); }}
              style={{ ...btnSecondary, padding: "2px 6px", fontSize: 10, opacity: selectedArr[selectedArr.length - 1] === pages.length - 1 ? 0.4 : 1 }}>
              <ArrowDown size={11} />
            </button>
          </>
        )}
        <button title="Fjern valg" onClick={(e) => { e.stopPropagation(); setSelectedSet(new Set()); }} style={{ ...btnSecondary, padding: "2px 6px", fontSize: 10 }}>✕</button>
        {multiSelected && (
          <button title="Slett valgte sider"
            onClick={(e) => { e.stopPropagation(); if (pages.length - selectedSet.size < 1) return; if (!window.confirm(`Slett ${selectedSet.size} sider?`)) return; onDeleteMulti(selectedArr); setSelectedSet(new Set()); }}
            style={{ ...btnSecondary, padding: "2px 6px", fontSize: 10, color: T.danger, borderColor: T.danger }}>
            <Trash2 size={11} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="space-y-2" style={{ padding: "8px", borderBottom: `1px solid ${T.border}` }}>
        <TabComponent />
        <button onClick={onAdd} style={{ ...btnPrimary, width: "100%", padding: "6px", fontSize: 11 }}>+ Ny side</button>
      </div>
      <div style={{ padding: "4px 8px", fontSize: 9, color: T.textDim, letterSpacing: 0.3, borderBottom: `1px solid ${T.border}`, flexShrink: 0, fontFamily: "ui-monospace, monospace", lineHeight: 1.4 }}>
        ⌘/Ctrl+klikk for flervalg · Shift+klikk for område · Dra for å flytte
      </div>
      {selectionBar}
      <div className="flex-1 overflow-y-auto py-3 px-2"
        onDragOver={(e) => { if (dragIdx !== null) e.preventDefault(); }}
        onDrop={handleDrop}
        onClick={() => setSelectedSet(new Set())}
      >
        {pages.map((p, i) => {
          const arr = p.loop && getPath(data, p.loop.source);
          const loopItem = Array.isArray(arr) && arr[0] ? { [p.loop!.iter]: arr[0] } : null;
          const isActive = i === currentIdx || i === secondaryIdx;
          const isSelected = selectedSet.has(i);
          const isDraggingThis = isDraggingItem(i);
          const draggingIndices = dragIdx !== null && selectedSet.has(dragIdx) ? selectedArr : dragIdx !== null ? [dragIdx] : [];
          const isDraggedOver = draggingIndices.length > 0 && !draggingIndices.includes(i);
          const showTopBar = dropIdx === i && isDraggedOver && dragIdx !== i - 1;
          const showBottomBar = dropIdx === i + 1 && isDraggedOver && dragIdx !== i + 1;
          const borderColor = isSelected ? T.accent : isActive ? T.selection : T.border;
          const bgColor = isSelected ? `${T.accent}18` : isActive ? T.panelHi : T.panel;

          return (
            <div
              key={p.id}
              draggable
              onDragStart={(e) => handleDragStart(i, e)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => { if (dragIdx === null) return; e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "move"; const next = computeDropIdx(e, i); if (next !== dropIdx) setDropIdx(next); }}
              onDragLeave={() => { }}
              onClick={(e) => handleItemClick(i, e)}
              style={{ marginBottom: 8, border: `1px solid ${borderColor}`, background: bgColor, borderRadius: 4, cursor: isDraggingThis ? "grabbing" : "grab", overflow: "hidden", boxShadow: isSelected ? `0 0 0 2px ${T.accent}66` : isActive ? `0 0 0 1px ${T.selection}` : "none", opacity: isDraggingThis ? 0.35 : 1, borderTop: showTopBar ? `3px solid ${T.accent}` : undefined, borderBottom: showBottomBar ? `3px solid ${T.accent}` : undefined, transition: "opacity 0.12s, box-shadow 0.12s, border-color 0.12s", position: "relative" }}
            >
              {isSelected && (
                <div style={{ position: "absolute", top: 5, left: 5, width: 16, height: 16, borderRadius: 3, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, fontSize: 10, color: T.brand, fontWeight: 700, boxShadow: "0 1px 3px rgba(0,0,0,0.4)", pointerEvents: "none" }}>✓</div>
              )}
              {isDraggingThis && multiSelected && dragIdx === i && (
                <div style={{ position: "absolute", top: 5, right: 5, background: T.accent, color: T.brand, borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700, zIndex: 10, pointerEvents: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{selectedSet.size}</div>
              )}
              <div style={{ position: "relative", width: "100%", aspectRatio: `${A4_W} / ${A4_H}`, background: p.bg, overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, transform: `scale(${196 / p.width})`, transformOrigin: "left top", width: p.width, height: p.height, pointerEvents: "none" }}>
                  {p.elements.map((el) =>
                    el.type === "collage" ? (
                      <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height, background: el.background && el.background !== "transparent" ? el.background : undefined }}>
                        {el.collageCells.map((c, ci) => (
                          <div key={ci} style={{ position: "absolute", left: `${c.fx * 100}%`, top: `${c.fy * 100}%`, width: `${c.fw * 100}%`, height: `${c.fh * 100}%`, padding: (el.collageGap || 0) / 2, boxSizing: "border-box" }}>
                            <div style={{ width: "100%", height: "100%", overflow: "hidden", background: c.src ? "transparent" : "#0002" }}>
                              {c.src && <img src={c.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${c.posX}% ${c.posY}%`, transform: `scale(${c.scale})`, transformOrigin: "center", display: "block" }} />}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : el.type === "svg" ? (
                      <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height }} dangerouslySetInnerHTML={{ __html: el.svgMarkup }} />
                    ) : el.type === "image" ? (
                      <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height, overflow: "hidden", borderRadius: radiusToCss(el.borderRadius) }}>
                        <img src={resolveSrc(el, data, loopItem)} alt="" style={{ width: "100%", height: "100%", objectFit: (el.objectFit as any) || "cover", objectPosition: `${el.imagePosX ?? 50}% ${el.imagePosY ?? 50}%`, transform: (el.imageScale ?? 1) !== 1 ? `scale(${el.imageScale})` : undefined, transformOrigin: "center", display: "block" }} />
                      </div>
                    ) : (
                      <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: el.width, minHeight: el.height, fontFamily: el.fontFamily || undefined, fontSize: el.fontSize || undefined, fontWeight: (el.fontWeight as any) || undefined, color: el.color || undefined, background: el.background && el.background !== "transparent" ? el.background : undefined, textAlign: (el.textAlign as any) || undefined, lineHeight: el.lineHeight || undefined, padding: !isPaddingZero(el.padding) ? paddingToCss(el.padding) : undefined, boxSizing: "border-box", overflow: "hidden", wordBreak: "break-word" }}>
                        {resolvePreview(el, data, loopItem)}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div style={{ padding: "4px 6px", fontSize: 10, color: T.text, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isSelected ? T.accent : T.text, fontWeight: isSelected ? 600 : undefined }}>
                  {p.name}{p.loop && <span style={{ color: T.accent }}> ⟳</span>}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <IconBtn title="Flytt opp" onClick={() => onMove(i, -1)} disabled={i === 0}><ArrowUp size={12} /></IconBtn>
                  <IconBtn title="Flytt ned" onClick={() => onMove(i, 1)} disabled={i === pages.length - 1}><ArrowDown size={12} /></IconBtn>
                  <IconBtn title="Sett inn side etter" onClick={() => onInsertAfter(i)}><Plus size={12} /></IconBtn>
                  <IconBtn title="Dupliser" onClick={() => onDuplicate(i)}><Copy size={12} /></IconBtn>
                  <IconBtn title="Slett" onClick={() => onDelete(i)} color={T.danger}><Trash2 size={12} /></IconBtn>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ASSET SIDEBAR
   ═══════════════════════════════════════════════════════════════════════ */
function AssetSidebar({ images, uploaded, onUpload, TabComponent, onImageClick, onDelete, imageSelected }: { images: UploadedImage[]; uploaded: UploadedImage[]; onDelete: (src: string) => void; onUpload: (images: { src: string; name: string }[]) => void; TabComponent: React.FC; onImageClick?: (src: string) => void; imageSelected?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const id = useSearchParams().get("path");
  const intialPage = APIURLS?.frontendUrl + "logo.png";
  const all = [{ src: intialPage, label: "logo", deletable: false }, ...uploaded.map((img) => ({ ...img, deletable: true })), ...images.map((img) => ({ ...img, deletable: false }))];

  const handleDelete = (src: string) => {
    if (id) {
      const existingImages: { src: string; name: string }[] = JSON.parse(localStorage.getItem(`uploaded-images-${id}`) || "[]");
      localStorage.setItem(`uploaded-images-${id}`, JSON.stringify(existingImages.filter((img) => img.src !== src)));
    }
    onDelete(src);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const results: { src: string; name: string }[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      const src = await new Promise<string>((res) => { const r = new FileReader(); r.onload = (e) => res(e.target?.result as string); r.readAsDataURL(f); });
      results.push({ src, name: f.name });
    }
    if (id) {
      const existingImages: { src: string; name: string }[] = JSON.parse(localStorage.getItem(`uploaded-images-${id}`) || "[]");
      const newOnly = results.filter((r) => !existingImages.some((e) => e.src === r.src));
      localStorage.setItem(`uploaded-images-${id}`, JSON.stringify([...existingImages, ...newOnly]));
      onUpload(newOnly);
    } else {
      onUpload(results);
    }
  };

  useEffect(() => {
    if (!id) return;
    const savedImages: { src: string; name: string }[] = JSON.parse(localStorage.getItem(`uploaded-images-${id}`) || "[]");
    if (savedImages.length) onUpload(savedImages);
  }, [id]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
      <div className="space-y-2" style={{ padding: "8px", borderBottom: `1px solid ${T.border}` }}>
        <TabComponent />
        <button onClick={() => fileRef.current?.click()} style={{ ...btnPrimary, width: "100%", padding: "6px", fontSize: 11 }}>+ Last opp bilde</button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { handleFiles(e.target.files); if (fileRef.current) fileRef.current.value = ""; }} />
      </div>
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {imageSelected && <div style={{ background: T.accent + "22", border: `1px solid ${T.accent}`, borderRadius: 4, padding: "6px 8px", marginBottom: 8, fontSize: 11, color: T.accent, textAlign: "center" }}>Klikk på et bilde for å erstatte det valgte</div>}
        {all.length === 0 && <div style={{ color: T.textDim, fontSize: 11, textAlign: "center", marginTop: 24, lineHeight: 1.5, padding: "0 8px" }}>Last opp bilder eller<br />slipp dem her</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {all.map((img, i) => (
            <div key={i} draggable onDragStart={(e) => e.dataTransfer.setData("imageSrc", img.src)} onClick={() => onImageClick?.(img.src)} title={imageSelected ? "Klikk for å erstatte valgt bilde" : img.label || "Dra til lerret"} style={{ position: "relative", aspectRatio: "1", borderRadius: 3, overflow: "hidden", cursor: imageSelected ? "pointer" : "grab", border: `1px solid ${imageSelected ? T.accent : T.border}`, background: T.bg }}>
              <img src={img.src} alt={img.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }} />
              {img.deletable && <button onClick={(e) => { e.stopPropagation(); handleDelete(img.src); }} style={{ position: "absolute", top: 3, right: 3, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, padding: 0 }}>✕</button>}
              {imageSelected && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}><span style={{ fontSize: 18 }}>⇄</span></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocumentSidebar({ images = [], TabComponent, isLoadingDoc, progress, onImageClick, imageSelected }: { images: string[]; TabComponent: React.FC; isLoadingDoc?: boolean; progress?: { done: number; total: number }; onImageClick?: (src: string) => void; imageSelected?: boolean }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="space-y-2" style={{ padding: "8px", borderBottom: `1px solid ${T.border}` }}>
        <TabComponent />
        {progress && <p className="text-center">Dokumenter lastet {progress.done} / {progress.total}</p>}
      </div>
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {imageSelected && <div style={{ background: T.accent + "22", border: `1px solid ${T.accent}`, borderRadius: 4, padding: "6px 8px", marginBottom: 8, fontSize: 11, color: T.accent, textAlign: "center" }}>Klikk på et bilde for å erstatte det valgte</div>}
        {!isLoadingDoc && images.length === 0 && <div style={{ color: T.textDim, fontSize: 11, textAlign: "center", marginTop: 24, lineHeight: 1.5, padding: "0 8px" }}>Ingen dokumenter funnet</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {images.map((img, i) => (
            <div key={i} draggable onDragStart={(e) => e.dataTransfer.setData("imageSrc", img)} onClick={() => onImageClick?.(img)} title={imageSelected ? "Klikk for å erstatte valgt bilde" : "Dra til lerret"} style={{ position: "relative", aspectRatio: "1", borderRadius: 3, overflow: "hidden", cursor: imageSelected ? "pointer" : "grab", border: `1px solid ${imageSelected ? T.accent : T.border}`, background: T.bg }}>
              <img src={img} alt="dokument" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }} />
              {imageSelected && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}><span style={{ fontSize: 18 }}>⇄</span></div>}
            </div>
          ))}
          {isLoadingDoc && <Loader2 size={30} className="animate-spin self-center mx-auto" />}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   IO MODAL
   ═══════════════════════════════════════════════════════════════════════ */
function IOModal({ mode, content, onClose, onLoad }: { mode: "import" | "ejs" | "editable"; content: string; onClose: () => void; onLoad?: (html: string) => void }) {
  const [text, setText] = useState(content);
  useEffect(() => setText(content), [content]);
  const copy = () => { navigator.clipboard?.writeText(text); showToast.success("Kopiert til utklippstavlen"); onClose(); };
  const download = () => {
    const blob = new Blob([text], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "ejs" ? "template.ejs" : "template.html";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 6, width: "min(900px, 100%)", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: T.accent, fontSize: 13, letterSpacing: 1, fontFamily: "ui-monospace, monospace" }}>
            {mode === "import" ? "IMPORTER MAL" : mode === "ejs" ? "EKSPORTER · EJS" : "EKSPORTER · REDIGERBAR HTML"}
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.text, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} style={{ flex: 1, minHeight: 320, background: T.bg, color: T.text, border: "none", padding: 16, fontFamily: "ui-monospace, monospace", fontSize: 12, outline: "none", resize: "none" }} />
        <div style={{ padding: 12, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {mode !== "import" && (<><button onClick={copy} style={btnSecondary}>Kopier</button><button onClick={download} style={btnSecondary}>Last ned</button></>)}
          {mode === "import" && onLoad && <button onClick={() => onLoad(text)} style={btnPrimary}>Last inn mal</button>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ROOT COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function PropertyTemplateEditor({
  initialHtml, title, data, onChange, onSave, onSaveHtml, fileName,
  pendingPDF, pendingSaveHtml, pendingSync, images = [], onSyncWebmegler = () => { },
}: PropertyTemplateEditorProps) {
  const effectiveData = data ?? SAMPLE_DATA;
  const router = useRouter();
  const id = useSearchParams().get("path");
  const [documentImages, setDocuments] = useState<string[]>([]);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [_error, setError] = useState<string | null>(null);
  const [showFileNameModal, setShowFileNameModal] = useState(false);
  const [fileNameInput, setFileNameInput] = useState("");

  const [history, dispatch] = useReducer(historyReducer, null, () => ({
    past: [],
    present: { pages: [blankPage()], globalStyles: "" },
    future: [],
  }));

  const model = {
    ...history.present,
    pages: history.present?.pages?.map((d, i) => ({
      ...d,
      name: `Side ${i + 1}`,
    })),
  };

  const modelRef = useRef(model);
  modelRef.current = model;

  const scopedCss = useMemo(() => scopeGlobalCss(model.globalStyles, CANVAS_SCOPE), [model.globalStyles]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialHtml) {
      setIsLoading(true);
      parseTemplate(initialHtml, effectiveData)
        .then((parsed) => { dispatch({ type: "reset", payload: parsed }); setPageIdx(0); setSelectedId(null); })
        .catch((err) => console.error("Failed to parse initialHtml:", err))
        .finally(() => setIsLoading(false));
    }
  }, [initialHtml]);

  useEffect(() => {
    const controller = new AbortController();
    setDocuments([]);
    setError(null);
    setIsLoadingDoc(true);
    const buffer: string[] = [];
    let rafId: number | null = null;
    let completed = false;
    const flush = () => { if (buffer.length === 0) return; const batch = buffer.splice(0); setDocuments((prev) => [...prev, ...batch]); };
    const scheduleFlush = () => { if (rafId !== null) return; rafId = requestAnimationFrame(() => { rafId = null; flush(); }); };
    fetchDocumentImages({
      tenantId: 381, propertyId: id || 3000006, signal: controller.signal,
      onDocument: (doc) => { buffer.push(...doc.images); scheduleFlush(); },
      onProgress: (done, total) => { setProgress({ done, total }); if (done >= total) completed = true; },
      onError: (err) => setError(err),
    })
      .catch(() => { })
      .finally(() => {
        if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
        flush();
        if (completed || !controller.signal.aborted) setIsLoadingDoc(false);
      });
    return () => { controller.abort(); if (rafId !== null) cancelAnimationFrame(rafId); };
  }, [id]);

  useEffect(() => { onChange?.(model); }, [model, onChange]);

  const [pageIdx, setPageIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<CanvasElement | null>(null);
  const [zoom, setZoom] = useState(0.6);
  const [showGrid, setShowGrid] = useState(false);
  const [tab, setTab] = useState("pages");
  const [uploaded, setUploaded] = useState<UploadedImage[]>([]);
  const [io, setIO] = useState<{ mode: "import" | "ejs" | "editable"; content: string } | null>(null);
  const [viewMode, setViewMode] = useState<"single" | "spread">("spread");

  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const programmaticScrollRef = useRef(false);
  const visibilityMapRef = useRef<Map<number, number>>(new Map());

  const currentPage = model.pages[Math.min(pageIdx, model.pages.length - 1)];

  const spreads = useMemo(() => {
    const list: { leftIdx: number; coverOnly: boolean }[] = [];
    if (model.pages.length === 0) return list;
    list.push({ leftIdx: 0, coverOnly: true });
    for (let i = 1; i < model.pages.length; i += 2) list.push({ leftIdx: i, coverOnly: false });
    return list;
  }, [model.pages.length]);

  const spreadLeftIdx = snapToSpreadStart(pageIdx);
  const spreadCoverOnly = spreadLeftIdx === 0;

  const selectedEl = useMemo<CanvasElement | null>(() => {
    if (!selectedId) return null;
    for (const p of model.pages) {
      const found = p.elements.find((e) => e.id === selectedId);
      if (found) return found;
    }
    return null;
  }, [model.pages, selectedId]);

  const scrollToPage = useCallback((idx: number) => {
    const target = viewMode === "spread" ? snapToSpreadStart(idx) : idx;
    const el = pageRefs.current.get(target);
    if (!el) return;
    programmaticScrollRef.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => { programmaticScrollRef.current = false; }, 700);
  }, [viewMode]);

  // Auto-fit: size zoom so the page(s) fill the canvas horizontally without overflow.
  // Spread mode targets 2× the page width; single mode targets 1×.
  const autoFitZoom = useCallback(() => {
    const canvas = canvasScrollRef.current;
    if (!canvas) return;
    const availW = canvas.clientWidth - 40; // 40 px total horizontal padding
    const pageW = currentPage?.width ?? A4_W;
    const targetW = viewMode === "spread" ? pageW * 2 : pageW;
    const newZoom = Math.max(0.2, Math.min(2, availW / targetW));
    setZoom(parseFloat(newZoom.toFixed(2)));
  }, [currentPage?.width, viewMode]);

  useEffect(() => {
    const root = canvasScrollRef.current;
    if (!root) return;
    visibilityMapRef.current.clear();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = parseInt((entry.target as HTMLElement).dataset.pageIndex || "-1", 10);
          if (idx < 0) continue;
          visibilityMapRef.current.set(idx, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        if (programmaticScrollRef.current) return;
let bestIdx = -1; let bestRatio = 0;
        visibilityMapRef.current.forEach((ratio, idx) => { if (ratio > bestRatio) { bestRatio = ratio; bestIdx = idx; } });
        if (bestIdx >= 0) setPageIdx((prev) => (prev === bestIdx ? prev : bestIdx));
      },
      { root, threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );
    pageRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [model.pages.length, viewMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { dispatch({ type: "undo" }); e.preventDefault(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) { dispatch({ type: "redo" }); e.preventDefault(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedEl) { setClipboard({ ...selectedEl }); e.preventDefault(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === "v" && clipboard) {
        const dup: CanvasElement = { ...clipboard, id: genId(clipboard.type), x: clipboard.x + 20, y: clipboard.y + 20 };
        const m = modelRef.current;
        dispatch({ type: "set", payload: { ...m, pages: m.pages.map((p, i) => i !== pageIdx ? p : { ...p, elements: [...p.elements, dup] }) } });
        setSelectedId(dup.id);
        e.preventDefault();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) { deleteSelected(); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const updateModel = (m: EditorModel) => dispatch({ type: "set", payload: m });

  // ── ELEMENT CHANGE + AUTO-REFLOW ──────────────────────────────────────
  // When a text element's height changes (because its content grew/shrank via
  // the ResizeObserver), shift every element that sits BELOW it on the same
  // page by the same delta so content never overlaps. Skips when:
  //  • REFLOW_TEXT_BELOW is off
  //  • the element was dragged vertically (y changed) — that's a manual move
  //  • the sibling is spanning (double-page image)
  const handleElementChange = useCallback((updated: CanvasElement, live = false) => {
    const m = modelRef.current;
    const newPages = m.pages.map((p) => {
      const prev = p.elements.find((el) => el.id === updated.id);
      if (!prev) return p;

      const heightDelta = updated.height - prev.height;
      const movedVertically = updated.y !== prev.y;
      const shouldReflow =
        REFLOW_TEXT_BELOW &&
        updated.type === "text" &&
        Math.abs(heightDelta) > 0.5 &&
        !movedVertically;

      const prevBottom = prev.y + prev.height;

      return {
        ...p,
        elements: p.elements.map((el) => {
          if (el.id === updated.id) return updated;
          // Only push elements whose top is at/below the growing box's bottom.
          if (shouldReflow && !el.spanning && el.y >= prevBottom - 1) {
            return { ...el, y: el.y + heightDelta };
          }
          return el;
        }),
      };
    });
    dispatch({ type: live ? "live" : "set", payload: { ...m, pages: newPages } });
  }, []);

  const handleCommit = useCallback(() => { dispatch({ type: "set", payload: modelRef.current }); }, []);

  const addElement = (type: ElementType) => {
    const el = { ...defaultElement(type), x: type === "collage" ? 0 : 200, y: type === "collage" ? 0 : 200 };
    if (type === "svg") { el.svgColors = parseSvgColors(el.svgMarkup); el.svgTexts = parseSvgTexts(el.svgMarkup); }
    const newPages = model.pages.map((p, i) => i !== pageIdx ? p : { ...p, elements: [...p.elements, el] });
    updateModel({ ...model, pages: newPages });
    setSelectedId(el.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    const newPages = model.pages.map((p) => !p.elements.some((e) => e.id === selectedId) ? p : { ...p, elements: p.elements.filter((e) => e.id !== selectedId) });
    updateModel({ ...model, pages: newPages });
    setSelectedId(null);
  };

  const duplicateSelected = () => {
    if (!selectedEl) return;
    const dup = { ...selectedEl, id: genId(selectedEl.type), x: selectedEl.x + 20, y: selectedEl.y + 20 };
    const newPages = model.pages.map((p) => !p.elements.some((e) => e.id === selectedId) ? p : { ...p, elements: [...p.elements, dup] });
    updateModel({ ...model, pages: newPages });
    setSelectedId(dup.id);
  };

  const handleDropImageOnPage = async (src: string, x: number, y: number, targetIdx: number) => {
    const page = modelRef.current.pages[targetIdx];
    if (!page) return;
    const { x: fx, y: fy, width, height } = await fitImageToPage(src, page, x, y);
    const el: CanvasElement = { ...defaultElement("image"), src, x: fx, y: fy, width, height };
    const m = modelRef.current;
    updateModel({ ...m, pages: m.pages.map((p, i) => i !== targetIdx ? p : { ...p, elements: [...p.elements, el] }) });
    setSelectedId(el.id);
  };

  const handleDropImageToCell = (elId: string, cellIndex: number, src: string) => {
    const m = modelRef.current;
    updateModel({
      ...m, pages: m.pages.map((p) => ({
        ...p, elements: p.elements.map((e) => {
          if (e.id !== elId || e.type !== "collage") return e;
          return { ...e, collageCells: e.collageCells.map((c, i) => i === cellIndex ? { ...c, src, scale: 1, posX: 50, posY: 50 } : c) };
        }),
      })),
    });
    setSelectedId(elId);
  };

  const handleSpreadDrop = async (src: string, _x: number, _y: number, leftIdx: number) => {
    const rightIdx = leftIdx + 1;
    if (!model.pages[rightIdx] || leftIdx === 0) { handleDropImageOnPage(src, _x, _y, leftIdx); return; }
    const leftPage = model.pages[leftIdx];
    const rightPage = model.pages[rightIdx];
    const spreadWidth = leftPage.width + rightPage.width;
    const spanningEl: CanvasElement = { ...defaultElement("image"), id: genId("image"), src, x: 0, y: 0, width: spreadWidth, height: leftPage.height, objectFit: "cover", spanning: true };
    updateModel({ ...model, pages: model.pages.map((p, i) => i === leftIdx ? { ...p, elements: [...p.elements, spanningEl] } : p) });
    setSelectedId(spanningEl.id);
  };

  const splitImage = async () => {
    if (!selectedEl || !selectedEl.spanning) return;
    let leftPageIdx = -1;
    let el: CanvasElement | null = null;
    for (let i = 0; i < model.pages.length; i++) {
      const found = model.pages[i].elements.find((e) => e.id === selectedEl.id);
      if (found) { el = found; leftPageIdx = i; break; }
    }
    if (!el || leftPageIdx === -1 || leftPageIdx + 1 >= model.pages.length) return;
    const rightPageIdx = leftPageIdx + 1;
    const leftPage = model.pages[leftPageIdx];
    const rightPage = model.pages[rightPageIdx];

    const elementRight = el.x + el.width;
    const leftElW = Math.min(elementRight, leftPage.width) - Math.max(0, el.x);
    const rightElW = Math.max(0, elementRight - leftPage.width);

    if (leftElW <= 0) {
      alert("Bildet er ikke på venstre side. Flytt det slik at det er på venstre side."); return;
    }

    try {
      const { width: natW, height: natH } = await loadImageDimensions(el.src);
      const sf = Math.max(el.width / natW, el.height / natH);
      const dispW = natW * sf;
      const dispH = natH * sf;
      const offX = (dispW - el.width) / 2;
      const offY = (dispH - el.height) / 2;

      const srcX1 = offX / sf;
      const srcY1 = offY / sf;
      const srcH = el.height / sf;

      const splitSrcX = srcX1 + leftElW / sf;
      const leftSrcW = leftElW / sf;

      const leftCrop = await cropImageRect(
        el.src, srcX1, srcY1, leftSrcW, srcH, leftElW, el.height,
      );
      const leftHalf: CanvasElement = {
        ...el,
        src: leftCrop,
        x: Math.max(0, el.x),
        width: leftElW,
        objectFit: "fill",
        imageScale: 1,
        imagePosX: 50,
        imagePosY: 50,
        spanning: false,
      };

      if (rightElW <= 0) {
        updateModel({
          ...model,
          pages: model.pages.map((p, i) =>
            i !== leftPageIdx ? p : {
              ...p, elements: p.elements.map((e) => e.id === selectedEl.id ? leftHalf : e),
            }
          ),
        });
        setSelectedId(leftHalf.id);
        return;
      }

      const rightSrcW = rightElW / sf;
      const rightCrop = await cropImageRect(
        el.src, splitSrcX, srcY1, rightSrcW, srcH, rightElW, el.height,
      );
      const rightHalf: CanvasElement = {
        ...defaultElement("image"),
        id: genId("image"),
        src: rightCrop,
        x: 0,
        y: el.y,
        width: rightElW,
        height: el.height,
        objectFit: "fill",
        opacity: el.opacity,
        rotation: el.rotation,
        zIndex: el.zIndex,
        spanning: false,
      };

      updateModel({
        ...model, pages: model.pages.map((p, i) => {
          if (i === leftPageIdx) return { ...p, elements: p.elements.map((e) => e.id === selectedEl.id ? leftHalf : e) };
          if (i === rightPageIdx) return { ...p, elements: [...p.elements, rightHalf] };
          return p;
        }),
      });
      setSelectedId(leftHalf.id);
    } catch (err) {
      console.error("Split failed:", err);
      alert("Kunne ikke dele bildet — CORS kan blokkere canvas-tilgangen.");
    }
  };

  const addRightPageInSpread = (leftIdx: number) => {
    const p: Page = { ...blankPage(), name: `Side ${model.pages.length + 1}` };
    const newPages = [...model.pages.slice(0, leftIdx + 1), p, ...model.pages.slice(leftIdx + 1)];
    updateModel({ ...model, pages: newPages });
  };

  const handlePageChange = (page: Page) => {
    updateModel({ ...model, pages: model.pages.map((p) => (p.id === page.id ? page : p)) });
  };
  const addPage = () => {
    const p: Page = { ...blankPage(), name: `Side ${model.pages.length + 1}` };
    const newIdx = model.pages.length;
    updateModel({ ...model, pages: [...model.pages, p] });
    setPageIdx(newIdx);
    window.setTimeout(() => scrollToPage(newIdx), 50);
  };
  const deletePage = (i: number) => {
    if (model.pages.length <= 1) return;
    const newPages = model.pages.filter((_, idx) => idx !== i);
    updateModel({ ...model, pages: newPages });
    setPageIdx(Math.min(pageIdx, newPages.length - 1));
  };
  const duplicatePage = (i: number) => {
    const src = model.pages[i];
    const dup: Page = { ...src, id: genId("page"), name: `${src.name} kopi`, elements: src.elements.map((e) => ({ ...e, id: genId(e.type) })) };
    const newPages = [...model.pages.slice(0, i + 1), dup, ...model.pages.slice(i + 1)];
    updateModel({ ...model, pages: newPages });
    setPageIdx(i + 1);
    window.setTimeout(() => scrollToPage(i + 1), 50);
  };
  const handleSelectEl = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      const pIdx = modelRef.current.pages.findIndex((p) => p.elements.some((e) => e.id === id));
      if (pIdx >= 0) setPageIdx(pIdx);
    }
  }, []);

  const insertPageAfter = (i: number) => {
    const p: Page = { ...blankPage(), name: `Side ${model.pages.length + 1}` };
    const newPages = [...model.pages.slice(0, i + 1), p, ...model.pages.slice(i + 1)];
    updateModel({ ...model, pages: newPages });
    setPageIdx(i + 1);
    window.setTimeout(() => scrollToPage(i + 1), 50);
  };

  const movePage = (i: number, dir: -1 | 1) => {
    const t = i + dir;
    if (t < 0 || t >= model.pages.length) return;
    const newPages = [...model.pages];
    [newPages[i], newPages[t]] = [newPages[t], newPages[i]];
    updateModel({ ...model, pages: newPages });
    setPageIdx(t);
    window.setTimeout(() => scrollToPage(t), 50);
  };

  const reorderPage = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || fromIdx >= model.pages.length || toIdx < 0 || toIdx >= model.pages.length) return;
    const newPages = [...model.pages];
    const [moved] = newPages.splice(fromIdx, 1);
    newPages.splice(toIdx, 0, moved);
    updateModel({ ...model, pages: newPages });
    let newPageIdx = pageIdx;
    if (pageIdx === fromIdx) newPageIdx = toIdx;
    else if (fromIdx < pageIdx && toIdx >= pageIdx) newPageIdx = pageIdx - 1;
    else if (fromIdx > pageIdx && toIdx <= pageIdx) newPageIdx = pageIdx + 1;
    setPageIdx(newPageIdx);
    window.setTimeout(() => scrollToPage(newPageIdx), 50);
  };

  const reorderMultiPage = (indices: number[], toIdx: number) => {
    if (indices.length === 0) return;
    const sorted = [...indices].sort((a, b) => a - b);
    const clampedTo = Math.max(0, Math.min(model.pages.length, toIdx));
    const moved = sorted.map((i) => model.pages[i]);
    const remaining = model.pages.filter((_, i) => !sorted.includes(i));
    const selectedBefore = sorted.filter((i) => i < clampedTo).length;
    const insertAt = Math.max(0, Math.min(remaining.length, clampedTo - selectedBefore));
    const newPages = [...remaining.slice(0, insertAt), ...moved, ...remaining.slice(insertAt)];
    updateModel({ ...model, pages: newPages });
    setPageIdx(insertAt);
    window.setTimeout(() => scrollToPage(insertAt), 50);
  };

  const deleteMultiPage = (indices: number[]) => {
    if (indices.length === 0 || model.pages.length - indices.length < 1) return;
    const sorted = [...indices].sort((a, b) => a - b);
    const newPages = model.pages.filter((_, i) => !sorted.includes(i));
    updateModel({ ...model, pages: newPages });
    const newIdx = Math.min(pageIdx, newPages.length - 1);
    setPageIdx(newIdx);
    window.setTimeout(() => scrollToPage(newIdx), 50);
  };

  const handleImport = (html: string) => {
    setIsLoading(true);
    parseTemplate(html, effectiveData)
      .then((m) => { dispatch({ type: "reset", payload: m }); setPageIdx(0); setSelectedId(null); setIO(null); })
      .catch((err: any) => alert("Kunne ikke tolke malen: " + err.message))
      .finally(() => setIsLoading(false));
  };

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const handlePdfFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") { showToast.error?.("Velg en PDF-fil"); return; }
    setIsLoading(true);
    try {
      const newPages = await pagesFromPdf(file);
      if (!newPages.length) { showToast.error?.("PDF-en ser ut til å være tom"); return; }
      const isBlankStarter = model.pages.length === 1 && model.pages[0].elements.length === 0 && /^(?:Side 1|Page 1|1 Page)$/.test(model.pages[0].name);
      const merged = isBlankStarter ? newPages : [...model.pages, ...newPages];
      updateModel({ ...model, pages: merged });
      setPageIdx(isBlankStarter ? 0 : model.pages.length);
      setSelectedId(null);
      showToast.success?.(`Importerte ${newPages.length} side${newPages.length === 1 ? "" : "r"} fra PDF`);
    } catch (err: any) {
      console.error("PDF import failed:", err);
      alert("Kunne ikke importere PDF: " + (err?.message || "ukjent feil"));
    } finally {
      setIsLoading(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    onSave?.({ model, ejs: serializeTemplate(model, "ejs", title), html: serializeTemplate(model, "editable", title) });
  };

  const handleSaveHtml = () => {
    if (fileName) {
      onSaveHtml?.(serializeTemplate(model, "editable", title), fileName);
    } else {
      setFileNameInput("");
      setShowFileNameModal(true);
    }
  };

  const handleFileNameConfirm = () => {
    if (!fileNameInput.trim()) return;
    setShowFileNameModal(false);
    onSaveHtml?.(serializeTemplate(model, "editable", title), fileNameInput.trim());
  };

  const tabs = [
    { key: "pages", label: "Sider", icon: Layout },
    { key: "assets", label: "Bilder", icon: ImageIcon },
    ...(documentImages.length > 0 ? [{ key: "documents", label: "Dokumenter", icon: FileText }] : []),
  ];

  const TabComponent = () => (
    <div className="flex items-center justify-center gap-3">
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = tab === key;
        return (
          <button key={key} onClick={() => setTab(key)} style={active ? btnPrimary : btnSecondary} className="flex items-center justify-center gap-2 transition-all">
            <Icon size={18} />{active && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{ height: "100vh", width: "100%", background: T.bg, color: T.text, fontFamily: "system-ui, -apple-system, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      {(isLoading || pendingPDF || pendingSaveHtml || pendingSync) && (
        <Dialog open={isLoading || pendingPDF || pendingSaveHtml || pendingSync}>
          <DialogOverlay className="bg-black/10 backdrop-blur-xs" />
          <DialogContent className="w-full bg-transparent border-none text-text-light p-0" hideClose>
            <Loader className="h-full text-white" message={isLoading ? "Laster inn filen ..." : pendingPDF ? "Genererer PDF..." : pendingSync ? "Synkroniserer til Webmegler..." : "Lagrer HTML..."} />
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showFileNameModal} onOpenChange={setShowFileNameModal}>
        <DialogOverlay className="bg-black/10 backdrop-blur-xs" />
        <DialogContent style={{ borderRadius: 10, padding: 28, minWidth: 340, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Save HTML</div>
          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>Enter a file name for this template.</p>
          <input autoFocus type="text" value={fileNameInput} onChange={(e) => setFileNameInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleFileNameConfirm()} placeholder="e.g. 600000017" style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 12px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => setShowFileNameModal(false)} style={btnSecondary}>Cancel</button>
            <button onClick={handleFileNameConfirm} style={btnPrimary} disabled={!fileNameInput.trim()}>Save</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div style={{ background: T.panel, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: 10, gap: 8, flexShrink: 0 }}>
        <IconBtn onClick={() => dispatch({ type: "undo" })} title="Angre (⌘Z)" disabled={!history.past.length}><Undo2 size={14} /></IconBtn>
        <IconBtn onClick={() => dispatch({ type: "redo" })} title="Gjør om (⌘⇧Z)" disabled={!history.future.length}><Redo2 size={14} /></IconBtn>
        <Sep />
        <IconBtn onClick={() => addElement("text")} title="Legg til tekst (starts unlocked)">T+</IconBtn>
        <IconBtn onClick={() => addElement("collage")} title="Legg til collageramme"><LayoutGrid size={14} /></IconBtn>
        {clipboard && (
          <IconBtn onClick={() => {
            const dup: CanvasElement = { ...clipboard, id: genId(clipboard.type), x: clipboard.x + 20, y: clipboard.y + 20 };
            updateModel({ ...model, pages: model.pages.map((p, i) => i !== pageIdx ? p : { ...p, elements: [...p.elements, dup] }) });
            setSelectedId(dup.id);
          }} title="Lim inn element (⌘V)">
            <div className="flex items-center gap-2"><ClipboardPaste size={14} /> Lim inn</div>
          </IconBtn>
        )}
        <Sep />
        <IconBtn onClick={() => setShowGrid((v) => !v)} active={showGrid} title="Rutenett"><Grid2X2 size={12} /></IconBtn>
        <IconBtn
          onClick={() => { setViewMode((v) => { const next = v === "single" ? "spread" : "single"; if (next === "spread") setPageIdx((cur) => snapToSpreadStart(cur)); return next; }); window.requestAnimationFrame(() => autoFitZoom()); }}
          active={viewMode === "spread"}
          title="Vis dobbeltside"
        ><PanelsTopLeft size={12} /></IconBtn>
        <Sep />
        <IconBtn onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))} title="Zoom ut"><Minus size={12} /></IconBtn>
        <span style={{ fontSize: 11, color: T.textDim, minWidth: 42, textAlign: "center", fontFamily: "ui-monospace, monospace" }}>{Math.round(zoom * 100)}%</span>
        <IconBtn onClick={() => setZoom((z) => Math.min(2, z + 0.1))} title="Zoom inn"><Plus size={12} /></IconBtn>
        <IconBtn onClick={autoFitZoom} title="Tilpass til skjerm">Tilpass</IconBtn>
        <Sep />
        <div style={{ flex: 1, height: "100%", display: "flex", alignItems: "center", padding: "0 16px", flexShrink: 0, justifyContent: "center", gap: 10, marginInline: 10 }}>
          <div style={{ fontSize: 17, color: T.accent, letterSpacing: -0.3, fontWeight: "bold" }}>Lokalmegleren Template Editor</div>
          <div style={{ fontSize: 13, color: T.textDim }}>{isLoading ? "Laster ..." : `(${model.pages.length} sider${viewMode === "spread" ? " · dobbeltside" : ""})`}</div>
        </div>
        <Sep />
        <button onClick={() => pdfInputRef.current?.click()} style={btnSecondary} title="Importer PDF">📄 Importer PDF</button>
        <button onClick={() => onSyncWebmegler(serializeTemplate(model, "editable", title))} style={btnPrimary} disabled={pendingSaveHtml} title="Sync to Webmegler">
          {pendingSync ? "Synkroniserer..." : "Sync to Webmegler"}
        </button>
        <input ref={pdfInputRef} type="file" accept="application/pdf,.pdf" style={{ display: "none" }} onChange={(e) => handlePdfFile(e.target.files?.[0])} />
        {onSaveHtml && <button onClick={handleSaveHtml} style={btnSecondary} disabled={pendingSaveHtml}>{pendingSaveHtml ? "Lagrer ..." : "Lagre HTML"}</button>}
        {onSave && <button onClick={handleSave} style={btnPrimary} disabled={pendingPDF}>{pendingPDF ? "Genererer PDF ..." : "Åpne PDF"}</button>}
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* ── Left sidebar ─────────────────────────────────────────────── */}
        {tab === "pages" ? (
          <div style={{ width: 230, background: T.panel, borderRight: `1px solid ${T.border}`, flexShrink: 0 }}>
            <PageList
              pages={model.pages} currentIdx={pageIdx}
              secondaryIdx={viewMode === "spread" && !spreadCoverOnly ? spreadLeftIdx + 1 : undefined}
              data={effectiveData}
              onSelect={(i) => { const target = viewMode === "spread" ? snapToSpreadStart(i) : i; setPageIdx(target); setSelectedId(null); scrollToPage(target); }}
              onAdd={addPage} onDelete={deletePage} TabComponent={TabComponent}
              onMove={movePage} onReorder={reorderPage} onReorderMulti={reorderMultiPage}
              onDeleteMulti={deleteMultiPage} onDuplicate={duplicatePage} onInsertAfter={insertPageAfter}
            />
          </div>
        ) : tab === "documents" && documentImages.length > 0 ? (
          <div style={{ width: 230, background: T.panel, borderRight: `1px solid ${T.border}`, flexShrink: 0 }}>
            <DocumentSidebar images={documentImages} TabComponent={TabComponent} isLoadingDoc={isLoadingDoc} progress={progress} imageSelected={selectedEl?.type === "image"} onImageClick={(src) => { if (!selectedEl || selectedEl.type !== "image") return; handleElementChange({ ...selectedEl, src }); }} />
          </div>
        ) : (
          <div style={{ width: 230, background: T.panel, borderRight: `1px solid ${T.border}`, flexShrink: 0 }}>
            <AssetSidebar images={images} TabComponent={TabComponent} uploaded={uploaded}
              onUpload={(imgs) => setUploaded((prev) => { const existingSrcs = new Set(prev.map((p) => p.src)); return [...prev, ...imgs.filter((img) => !existingSrcs.has(img.src)).map((img) => ({ src: img.src, label: img.name }))]; })}
              onDelete={(src) => setUploaded((prev) => prev.filter((img) => img.src !== src))}
              imageSelected={selectedEl?.type === "image"}
              onImageClick={(src) => { if (!selectedEl || selectedEl.type !== "image") return; handleElementChange({ ...selectedEl, src }); }}
            />
          </div>
        )}

        {/* ── Scrollable canvas ─────────────────────────────────────────── */}
        <div
          ref={canvasScrollRef}
          className={CANVAS_SCOPE}
          style={{ flex: 1, overflow: "auto", background: "#0d1925", backgroundImage: "radial-gradient(circle at 20% 20%, rgba(226,207,158,0.04), transparent 50%)", padding: 10 }}
          onClick={() => setSelectedId(null)}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
            {viewMode === "single" && model.pages.map((page, i) => (
              <div
                key={page.id}
                ref={(el) => { if (el) pageRefs.current.set(i, el); else pageRefs.current.delete(i); }}
                data-page-index={i}
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <div style={{ fontSize: 10, color: i === pageIdx ? T.accent : T.textDim, fontFamily: "ui-monospace, monospace", letterSpacing: 1, textTransform: "uppercase", textAlign: "center", transition: "color 0.15s" }}>
                  {page.name}{page.loop && <span style={{ color: T.accent, marginLeft: 8 }}>⟳ løkke · {page.loop.source}</span>}
                </div>
                <PageView page={page} selectedId={selectedId} zoom={zoom} showGrid={showGrid} data={effectiveData} onSelect={handleSelectEl} onChange={handleElementChange} onCommit={handleCommit} onDropImage={(src, x, y) => handleDropImageOnPage(src, x, y, i)} onActivate={() => setPageIdx(i)} onDropToCell={handleDropImageToCell} />
              </div>
            ))}

            {viewMode === "spread" && spreads.map((spread) => {
              const leftPage = model.pages[spread.leftIdx];
              const rightPage = spread.coverOnly ? null : (model.pages[spread.leftIdx + 1] ?? null);
              if (!leftPage) return null;
              return (
                <div
                  key={leftPage.id}
                  ref={(el) => { if (el) pageRefs.current.set(spread.leftIdx, el); else pageRefs.current.delete(spread.leftIdx); }}
                  data-page-index={spread.leftIdx}
                >
                  <SpreadView
                    leftPage={leftPage} rightPage={rightPage} coverOnly={spread.coverOnly}
                    selectedId={selectedId} zoom={zoom} showGrid={showGrid} data={effectiveData}
                    onSelect={handleSelectEl} onChange={handleElementChange} onCommit={handleCommit}
                    onDropImageLeft={(src, x, y) => { if (spread.coverOnly) handleDropImageOnPage(src, x, y, spread.leftIdx); else handleSpreadDrop(src, x, y, spread.leftIdx); }}
                    onDropImageRight={(src, x, y) => handleSpreadDrop(src, x + leftPage.width, y, spread.leftIdx)}
                    onAddRightPage={() => addRightPageInSpread(spread.leftIdx)}
                    onActivateLeft={() => setPageIdx(spread.leftIdx)}
                    onActivateRight={() => setPageIdx(spread.leftIdx + 1)}
                    onDropToCell={handleDropImageToCell}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right inspector ───────────────────────────────────────────── */}
        <div style={{ width: 300, background: T.panel, borderLeft: `1px solid ${T.border}`, overflowY: "auto", flexShrink: 0 }}>
          <Inspector
            el={selectedEl}
            page={!selectedEl ? currentPage : null}
            onChange={handleElementChange}
            onChangePage={handlePageChange}
            onDelete={deleteSelected}
            onDuplicate={duplicateSelected}
            onSplit={selectedEl?.spanning && viewMode === "spread" ? splitImage : undefined}
            onCopy={selectedEl ? () => setClipboard({ ...selectedEl }) : undefined}
            onDeletePage={() => deletePage(pageIdx)}
          />
        </div>
      </div>

      {io && <IOModal mode={io.mode} content={io.content} onClose={() => setIO(null)} onLoad={io.mode === "import" ? handleImport : undefined} />}
    </div>
  );
}