import type { HandleDir } from "./constants";

/* ═══════════════════════════════════════════════════════════════════════
   COLLAGE
   ═══════════════════════════════════════════════════════════════════════ */
export interface CollageRect {
  fx: number;
  fy: number;
  fw: number;
  fh: number;
}
export interface CollageLayoutDef {
  label: string;
  rects: CollageRect[];
}
export interface CollageCell {
  fx: number;
  fy: number;
  fw: number;
  fh: number;
  src: string;
  scale: number;
  posX: number;
  posY: number;
}

/* ═══════════════════════════════════════════════════════════════════════
   ELEMENT MODEL
   ═══════════════════════════════════════════════════════════════════════ */
export type ElementType = "text" | "image" | "svg" | "collage" | "richflow";

/**
 * One formatted block ("atom") in a rich-text flow: a heading or paragraph
 * with its tag, optional class (e.g. "megler-name"), and inner HTML. Used by
 * `richflow` elements to model continuous multi-column accordion content.
 */
export interface FlowBlock {
  tag: string;
  cls?: string;
  html: string;
  /** Optional per-line style override (typography / colour / box / border /
   *  effects). Absent → the line inherits the template's scoped CSS. Position is
   *  intentionally NOT here: a flowed line has no absolute geometry. */
  style?: FlowBlockStyle;
}

/** The style a single flow line can carry — the stylable subset of a text
 *  element, minus position. Stored on a FlowBlock and applied as inline CSS. */
export interface FlowBlockStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  textAlign?: string;
  lineHeight?: string;
  letterSpacing?: string;
  wordSpacing?: string;
  textTransform?: string;
  textDecoration?: string;
  whiteSpace?: string;
  textShadow?: string;
  background?: string;
  padding?: Padding;
  borderRadius?: BorderRadius;
  borderWidth?: number;
  borderStyle?: string;
  borderColor?: string;
  boxShadow?: string;
  opacity?: number;
}

export interface Padding {
  t: number;
  r: number;
  b: number;
  l: number;
}
export interface BorderRadius {
  tl: number;
  tr: number;
  br: number;
  bl: number;
}

export interface SvgColorNode {
  key: string;
  label: string;
  color: string;
}

export interface SvgTextNode {
  key: string;
  label: string;
  text: string;
}

export interface CanvasElement {
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

  // ── RICH-TEXT FLOW (type === "richflow") ────────────────────────────────
  // A richflow element is one fixed-height, multi-column container that holds a
  // slice of a continuous accordion stream. Frames sharing `flowId` are threaded
  // in `flowOrder`; the master (lowest order) carries the full `blocks` array.
  flowId?: string | null;
  flowOrder?: number;
  blocks?: FlowBlock[];
  colCount?: number;
  colGap?: number;
}

export interface Page {
  id: string;
  name: string;
  bg: string;
  width: number;
  height: number;
  loop: { source: string; iter: string } | null;
  elements: CanvasElement[];
  /**
   * Page-level `data-field`. `"extra-page"` marks the print-padding page that is
   * only included when the booklet would otherwise have an odd page count (so it
   * pads to an even count for double-sided printing). See utils/pagination.
   */
  dataField?: string | null;
}

export interface EditorModel {
  pages: Page[];
  globalStyles: string;
}

/* ═══════════════════════════════════════════════════════════════════════
   HISTORY
   ═══════════════════════════════════════════════════════════════════════ */
export interface HistoryState {
  past: EditorModel[];
  present: EditorModel;
  future: EditorModel[];
}

export type HistoryAction =
  | { type: "set"; payload: EditorModel }
  | { type: "live"; payload: EditorModel }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; payload: EditorModel };

export interface UploadedImage {
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
  /** Show the "Sync to Webmegler" toolbar button. Defaults to true; set false
   *  for master-template editing where there is no property to sync against. */
  showSync?: boolean;
  /** Master-template edit mode → "Lagre HTML" saves straight to the template
   *  instead of prompting for a file name. */
  isTemplateMode?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════
   CANVAS INTERACTION
   ═══════════════════════════════════════════════════════════════════════ */
export interface Guideline {
  axis: "h" | "v";
  pos: number;
  label?: string;
}

export interface DragState {
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
