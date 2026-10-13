import type { Padding, BorderRadius, CanvasElement } from "../types";

export function pxToNum(v: string | undefined): number {
  if (!v) return 0;
  const m = String(v).match(/(-?[\d.]+)px/);
  return m ? parseFloat(m[1]) : parseFloat(v) || 0;
}
export function parsePadding(v: string): Padding {
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
export function paddingToCss(p: Padding): string {
  if (p.t === p.r && p.r === p.b && p.b === p.l) return `${p.t}px`;
  if (p.t === p.b && p.l === p.r) return `${p.t}px ${p.r}px`;
  return `${p.t}px ${p.r}px ${p.b}px ${p.l}px`;
}
export function isPaddingZero(p: Padding) {
  return !p.t && !p.r && !p.b && !p.l;
}

export function parseRadius(v: string): BorderRadius {
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
export function radiusToCss(r: BorderRadius): string {
  if (r.tl === r.tr && r.tr === r.br && r.br === r.bl) return `${r.tl}px`;
  return `${r.tl}px ${r.tr}px ${r.br}px ${r.bl}px`;
}
export function isRadiusZero(r: BorderRadius) {
  return !r.tl && !r.tr && !r.br && !r.bl;
}

export interface OverflowEdges {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
  any: boolean;
}

// Reports which page edges an element spills past. Used to flag content that
// overflows the page boundary (the page itself clips it via overflow:hidden).
// `spanning` images intentionally cross a spread, so they never count as overflow.
// A small tolerance avoids false positives from sub-pixel rounding (e.g. a
// full-bleed element sized exactly to the page, or a text box after auto-height).
export function elementOverflow(
  el: CanvasElement,
  pageWidth: number,
  pageHeight: number,
  tol = 0.5,
): OverflowEdges {
  if (el.spanning) {
    return { top: false, right: false, bottom: false, left: false, any: false };
  }
  const top = el.y < -tol;
  const left = el.x < -tol;
  const right = el.x + el.width > pageWidth + tol;
  const bottom = el.y + el.height > pageHeight + tol;
  return { top, right, bottom, left, any: top || right || bottom || left };
}
