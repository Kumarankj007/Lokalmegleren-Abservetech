import type { CSSProperties } from "react";

import type { CanvasElement, FlowBlock, FlowBlockStyle } from "../types";
import { defaultElement } from "./factories";
import { rgbaToCss } from "./color";
import {
  parsePadding,
  parseRadius,
  paddingToCss,
  radiusToCss,
  isPaddingZero,
  isRadiusZero,
  pxToNum,
} from "./geometry";

/* ═══════════════════════════════════════════════════════════════════════
   FLOW-LINE STYLE  ⇄  inline CSS / synthetic text element
   ───────────────────────────────────────────────────────────────────────
   A flow line (FlowBlock) can carry an optional `style` (the stylable subset of
   a text element, minus position). These helpers convert it to/from inline CSS
   (for measuring, serialising and re-importing) and to/from a synthetic text
   CanvasElement so the SAME inspector that styles text elements can style a line.
   ═══════════════════════════════════════════════════════════════════════ */

/** Strip tags + unescape entities → the plain editable text of a block. */
export function blockHtmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** Escape plain text back into block HTML. */
export function textToBlockHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ── FlowBlockStyle → CSS string (measurement + serialiser) ───────────── */
export function blockStyleToCss(s?: FlowBlockStyle): string {
  if (!s) return "";
  const p: string[] = [];
  if (s.fontFamily) p.push(`font-family:${s.fontFamily}`);
  if (s.fontSize && s.fontSize > 0) p.push(`font-size:${s.fontSize}px`);
  if (s.fontWeight && s.fontWeight !== "normal" && s.fontWeight !== "400")
    p.push(`font-weight:${s.fontWeight}`);
  if (s.fontStyle && s.fontStyle !== "normal") p.push(`font-style:${s.fontStyle}`);
  if (s.color) p.push(`color:${s.color}`);
  if (s.textAlign && s.textAlign !== "left" && s.textAlign !== "start")
    p.push(`text-align:${s.textAlign}`);
  if (s.lineHeight && s.lineHeight !== "normal") p.push(`line-height:${s.lineHeight}`);
  if (s.letterSpacing && s.letterSpacing !== "normal" && s.letterSpacing !== "0px")
    p.push(`letter-spacing:${s.letterSpacing}`);
  if (s.wordSpacing && s.wordSpacing !== "normal" && s.wordSpacing !== "0px")
    p.push(`word-spacing:${s.wordSpacing}`);
  if (s.textTransform && s.textTransform !== "none") p.push(`text-transform:${s.textTransform}`);
  if (s.textDecoration && s.textDecoration !== "none") p.push(`text-decoration:${s.textDecoration}`);
  if (s.whiteSpace && s.whiteSpace !== "normal") p.push(`white-space:${s.whiteSpace}`);
  if (s.textShadow && s.textShadow !== "none") p.push(`text-shadow:${s.textShadow}`);
  if (s.background && s.background !== "transparent") p.push(`background:${s.background}`);
  if (s.padding && !isPaddingZero(s.padding)) {
    p.push(`padding:${paddingToCss(s.padding)}`);
    p.push("box-sizing:border-box");
  }
  if (s.borderRadius && !isRadiusZero(s.borderRadius)) p.push(`border-radius:${radiusToCss(s.borderRadius)}`);
  if (s.borderWidth && s.borderWidth > 0)
    p.push(`border:${s.borderWidth}px ${s.borderStyle || "solid"} ${s.borderColor || "#000"}`);
  if (s.boxShadow && s.boxShadow !== "none") p.push(`box-shadow:${s.boxShadow}`);
  if (s.opacity != null && s.opacity !== 1) p.push(`opacity:${s.opacity}`);
  return p.join(";");
}

/* ── FlowBlockStyle → React style object (canvas display) ─────────────── */
export function blockStyleToReact(s?: FlowBlockStyle): CSSProperties {
  const o: CSSProperties = {};
  if (!s) return o;
  if (s.fontFamily) o.fontFamily = s.fontFamily;
  if (s.fontSize && s.fontSize > 0) o.fontSize = s.fontSize;
  if (s.fontWeight && s.fontWeight !== "normal") o.fontWeight = s.fontWeight as any;
  if (s.fontStyle && s.fontStyle !== "normal") o.fontStyle = s.fontStyle as any;
  if (s.color) o.color = s.color;
  if (s.textAlign && s.textAlign !== "left" && s.textAlign !== "start") o.textAlign = s.textAlign as any;
  if (s.lineHeight && s.lineHeight !== "normal") o.lineHeight = s.lineHeight;
  if (s.letterSpacing && s.letterSpacing !== "normal") o.letterSpacing = s.letterSpacing;
  if (s.wordSpacing && s.wordSpacing !== "normal") o.wordSpacing = s.wordSpacing;
  if (s.textTransform && s.textTransform !== "none") o.textTransform = s.textTransform as any;
  if (s.textDecoration && s.textDecoration !== "none") o.textDecoration = s.textDecoration;
  if (s.whiteSpace && s.whiteSpace !== "normal") o.whiteSpace = s.whiteSpace as any;
  if (s.textShadow && s.textShadow !== "none") o.textShadow = s.textShadow;
  if (s.background && s.background !== "transparent") o.background = s.background;
  if (s.padding && !isPaddingZero(s.padding)) { o.padding = paddingToCss(s.padding); o.boxSizing = "border-box"; }
  if (s.borderRadius && !isRadiusZero(s.borderRadius)) o.borderRadius = radiusToCss(s.borderRadius);
  if (s.borderWidth && s.borderWidth > 0)
    o.border = `${s.borderWidth}px ${s.borderStyle || "solid"} ${s.borderColor || "#000"}`;
  if (s.boxShadow && s.boxShadow !== "none") o.boxShadow = s.boxShadow;
  if (s.opacity != null && s.opacity !== 1) o.opacity = s.opacity;
  return o;
}

/* ── inline CSS string → FlowBlockStyle (re-import) ───────────────────── */
export function cssToBlockStyle(css: string): FlowBlockStyle | undefined {
  if (!css) return undefined;
  const map: Record<string, string> = {};
  css.split(";").forEach((decl) => {
    const i = decl.indexOf(":");
    if (i < 0) return;
    const k = decl.slice(0, i).trim().toLowerCase();
    const v = decl.slice(i + 1).trim();
    if (k && v) map[k] = v;
  });
  const s: FlowBlockStyle = {};
  if (map["font-family"]) s.fontFamily = map["font-family"];
  if (map["font-size"]) s.fontSize = pxToNum(map["font-size"]);
  if (map["font-weight"]) s.fontWeight = map["font-weight"];
  if (map["font-style"]) s.fontStyle = map["font-style"];
  if (map["color"]) s.color = map["color"];
  if (map["text-align"]) s.textAlign = map["text-align"];
  if (map["line-height"]) s.lineHeight = map["line-height"];
  if (map["letter-spacing"]) s.letterSpacing = map["letter-spacing"];
  if (map["word-spacing"]) s.wordSpacing = map["word-spacing"];
  if (map["text-transform"]) s.textTransform = map["text-transform"];
  if (map["text-decoration"]) s.textDecoration = map["text-decoration"];
  if (map["white-space"]) s.whiteSpace = map["white-space"];
  if (map["text-shadow"]) s.textShadow = map["text-shadow"];
  if (map["background"]) s.background = map["background"];
  else if (map["background-color"]) s.background = map["background-color"];
  if (map["padding"]) s.padding = parsePadding(map["padding"]);
  if (map["border-radius"]) s.borderRadius = parseRadius(map["border-radius"]);
  const border = map["border"];
  if (border) {
    const m = border.match(/([\d.]+)px\s+(\w+)\s+(.+)/);
    if (m) { s.borderWidth = parseFloat(m[1]); s.borderStyle = m[2]; s.borderColor = m[3].trim(); }
  }
  if (map["border-width"]) s.borderWidth = pxToNum(map["border-width"]);
  if (map["box-shadow"]) s.boxShadow = map["box-shadow"];
  if (map["opacity"]) s.opacity = parseFloat(map["opacity"]);
  return Object.keys(s).length ? s : undefined;
}

/* ── live computed style of the rendered line → FlowBlockStyle ─────────────
   Seeds the inspector with the line's ACTUAL effective style (template CSS +
   any override), so the fields reflect what is on screen rather than defaults. */
export function readComputedBlockStyle(node: Element): FlowBlockStyle {
  const cs = window.getComputedStyle(node);
  const fontSize = parseFloat(cs.fontSize) || 0;
  const lhPx = parseFloat(cs.lineHeight);
  return {
    fontFamily: (cs.fontFamily.split(",")[0] || "").replace(/['"]/g, "").trim(),
    fontSize: fontSize || undefined,
    fontWeight: cs.fontWeight,
    fontStyle: cs.fontStyle,
    color: cs.color,
    textAlign: cs.textAlign,
    lineHeight:
      cs.lineHeight === "normal" || !isFinite(lhPx) || !fontSize
        ? "normal"
        : (lhPx / fontSize).toFixed(2),
    letterSpacing: cs.letterSpacing,
    wordSpacing: cs.wordSpacing,
    textTransform: cs.textTransform,
    textDecoration: (cs as any).textDecorationLine || cs.textDecoration,
    whiteSpace: cs.whiteSpace,
    textShadow: cs.textShadow !== "none" ? cs.textShadow : "none",
    background: rgbaToCss(cs.backgroundColor) || "transparent",
    padding: parsePadding(cs.padding),
    borderRadius: parseRadius(cs.borderRadius),
    borderWidth: pxToNum(cs.borderTopWidth || cs.borderWidth),
    borderStyle: cs.borderTopStyle || cs.borderStyle || "solid",
    borderColor: cs.borderTopColor || cs.borderColor || "#000",
    boxShadow: cs.boxShadow !== "none" ? cs.boxShadow : "none",
    opacity: parseFloat(cs.opacity) || 1,
  };
}

/* ── FlowBlock ⇄ synthetic text CanvasElement (the inspector) ─────────── */
const STYLE_KEYS: (keyof FlowBlockStyle)[] = [
  "fontFamily", "fontSize", "fontWeight", "fontStyle", "color", "textAlign",
  "lineHeight", "letterSpacing", "wordSpacing", "textTransform", "textDecoration",
  "whiteSpace", "textShadow", "background", "padding", "borderRadius",
  "borderWidth", "borderStyle", "borderColor", "boxShadow", "opacity",
];

/** A synthetic, NON-persisted text element representing a line, so the existing
 *  text inspector can edit it. Seeded from the line's stored override, else the
 *  live computed style, else element defaults. */
export function blockToElement(block: FlowBlock, seed?: FlowBlockStyle): CanvasElement {
  const s = block.style ?? seed ?? {};
  const base = defaultElement("text");
  const el: CanvasElement = { ...base, locked: false, text: blockHtmlToText(block.html) };
  for (const k of STYLE_KEYS) {
    const v = s[k];
    if (v != null) (el as any)[k] = v;
  }
  return el;
}

/** Pull the stylable fields back out of the edited synthetic element. */
export function elementToBlockStyle(el: CanvasElement): FlowBlockStyle {
  const s: FlowBlockStyle = {};
  for (const k of STYLE_KEYS) (s as any)[k] = (el as any)[k];
  return s;
}

/** Apply an edited synthetic element back onto its block (text + style).
 *  Preserves the block's ORIGINAL inner HTML (bold / links / lists / spans …)
 *  when only the STYLE changed — a style edit must never flatten rich structure.
 *  The inner HTML is only rebuilt from plain text when the text actually changed. */
export function applyElementToBlock(block: FlowBlock, el: CanvasElement): FlowBlock {
  const textUnchanged = blockHtmlToText(block.html) === el.text;
  return {
    ...block,
    html: textUnchanged ? block.html : textToBlockHtml(el.text),
    style: elementToBlockStyle(el),
  };
}
