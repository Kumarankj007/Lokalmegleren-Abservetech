import type { SvgColorNode, SvgTextNode, CanvasElement } from "../types";
import { genId } from "./factories";

const SVG_FILL_ATTRS = ["fill", "stroke"] as const;
const SVG_SHAPE_TAGS = new Set(["circle", "rect", "ellipse", "polygon", "polyline", "path", "line", "g"]);

export function parseSvgColors(svgMarkup: string): SvgColorNode[] {
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

export function parseSvgTexts(svgMarkup: string): SvgTextNode[] {
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

export function patchSvgColor(svgMarkup: string, key: string, newColor: string): string {
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

export function patchSvgText(svgMarkup: string, key: string, newText: string): string {
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

export function buildSvgElement(svgMarkup: string, rect: DOMRect, pageRect: DOMRect, node: HTMLElement): CanvasElement {
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
