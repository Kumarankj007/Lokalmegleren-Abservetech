import {
  COLLAGE_LAYOUTS,
  DEFAULT_COLLAGE_LAYOUT,
  A4_W,
  A4_H,
  FLOW_BLOCK_LINE_HEIGHT,
} from "./constants";
import type { EditorModel, Page, CanvasElement, CollageCell, FlowBlock } from "./types";
import { rgbaToCss } from "./utils/color";
import { buildSvgElement } from "./utils/svg";
import { genId, cellsForLayout, defaultElement } from "./utils/factories";
import { parsePadding, parseRadius, pxToNum } from "./utils/geometry";
import { cssToBlockStyle } from "./utils/blockStyle";

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
      // Page-level data-field (e.g. "extra-page" print padding) survives round-trip.
      // Older exports omit it on the page div, so the reserved id `page_1000`
      // is also recognised as the padding page (prevents a duplicate being added).
      dataField:
        pageEl.dataset.field ||
        (pageEl.id === "page_1000" ? "extra-page" : null),
      elements: extractElementsFromPage(pageEl),
    };
  });

  // Thread richflow frames: collect each flow chain (e.g. "accordion") in
  // document order across pages, assign flowOrder, and CONSOLIDATE the whole
  // stream into the master (order 0) frame. Non-master frames keep their
  // geometry but an empty blocks array — the flow engine computes their
  // displayed slice live. This makes the master the single source of truth.
  const flowFrames: Record<string, CanvasElement[]> = {};
  for (const page of pages) {
    for (const el of page.elements) {
      if (el.type === "richflow") {
        const fid = el.flowId || "accordion";
        (flowFrames[fid] ||= []).push(el);
      }
    }
  }
  for (const fid of Object.keys(flowFrames)) {
    const frames = flowFrames[fid];
    const stream = frames.flatMap((el) => el.blocks ?? []);
    frames.forEach((el, i) => {
      el.flowOrder = i;
      el.blocks = i === 0 ? stream : [];
    });
  }

  return { pages, globalStyles };
}

// The serializer bakes an editor-managed layout reset inline on EVERY flow block
// (RICH_BLOCK_RESET + FLOW_SPLIT: margin-block, line-height, break-inside …). That
// is render chrome, not per-line user style. Re-importing it as a block-style
// override would make the flow re-measure at line-height 1.4 instead of the
// template's inherited leading, re-paginating the accordion on every save→reload
// ("Lagre HTML" clumsy re-alignment). Strip those declarations so a saved file
// re-imports to the SAME block.style as the pristine template; genuine per-line
// overrides (a line-height the user actually changed, colour, font …) survive.
function stripFlowResetStyle(style: string): string {
  return style
    .split(";")
    .map((d) => d.trim())
    .filter((d) => {
      if (!d) return false;
      const i = d.indexOf(":");
      if (i < 0) return true;
      const prop = d.slice(0, i).trim().toLowerCase();
      const val = d.slice(i + 1).trim().toLowerCase();
      if (prop === "margin-block") return false;
      if (
        prop === "break-inside" ||
        prop === "-webkit-column-break-inside" ||
        prop === "page-break-inside"
      )
        return false;
      // Drop line-height ONLY when it is the reset default — a user-set leading
      // (any other value) is kept. A genuine 1.4 collapses to the same render.
      if (prop === "line-height" && val === String(FLOW_BLOCK_LINE_HEIGHT)) return false;
      return true;
    })
    .join(";");
}

// Top-level block tags of a rich-text flow container become FlowBlock atoms.
function htmlToBlocks(container: HTMLElement): FlowBlock[] {
  const blocks: FlowBlock[] = [];
  Array.from(container.children).forEach((child) => {
    if (!(child instanceof HTMLElement)) return;
    const tag = child.tagName.toLowerCase();
    if (tag === "style" || tag === "script") return;
    const html = child.innerHTML;
    if (!html || !(child.textContent || "").trim()) return;
    // Preserve any per-line inline style override so styled lines round-trip,
    // but drop the editor's own uniform reset so it never becomes a "real"
    // override that shifts flow measurement on the next load.
    const style = cssToBlockStyle(stripFlowResetStyle(child.getAttribute("style") || ""));
    blocks.push({ tag, cls: child.className || undefined, html, style });
  });
  return blocks;
}

// Build a single richflow element from a multi-column accordion container,
// instead of exploding its headings/paragraphs into positioned text boxes.
function buildRichFlowElement(container: HTMLElement, pageRect: DOMRect): CanvasElement {
  const rect = container.getBoundingClientRect();
  const cs = window.getComputedStyle(container);
  const colCount = parseInt(cs.columnCount, 10) || 2;
  const colGap = pxToNum(cs.columnGap) || 32;
  const field = container.dataset.field || "accordion";
  return {
    ...defaultElement("richflow"),
    id: container.dataset.el || genId("richflow"),
    type: "richflow",
    x: rect.left - pageRect.left,
    y: rect.top - pageRect.top,
    width: rect.width || A4_W,
    height: rect.height || A4_H,
    locked: container.dataset.locked === "true",
    dataField: field,
    flowId: field,
    blocks: htmlToBlocks(container),
    colCount,
    colGap,
  };
}

function extractElementsFromPage(pageEl: HTMLElement): CanvasElement[] {
  const pageRect = pageEl.getBoundingClientRect();
  const result: CanvasElement[] = [];

  // Rich-text multi-column containers (accordion) become one richflow element
  // each; their inner subtree is NOT exploded into individual text boxes.
  const flowContainers = Array.from(
    pageEl.querySelectorAll<HTMLElement>('[data-richtext="true"], .cols-2'),
  );
  const isInsideFlow = (n: Element) =>
    flowContainers.some((fc) => fc === n || fc.contains(n));
  flowContainers.forEach((fc) => result.push(buildRichFlowElement(fc, pageRect)));

  const explicit = pageEl.querySelectorAll<HTMLElement>("[data-el]");
  const candidates: HTMLElement[] = [];
  if (explicit.length > 0) {
    explicit.forEach((n) => { if (!isInsideFlow(n)) candidates.push(n); });
  } else {
    const walk = (node: Element) => {
      if (isInsideFlow(node)) return; // skip flow containers + their subtrees
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
  result.push(...candidates.map((node) => extractElement(node, pageRect)));
  return result;
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

  // ── PAGE-NUMBER RULE (page-num-line) ────────────────────────────────────
  // The thin grey line across the foot of every page is fixed page chrome and
  // must stay pinned at the bottom. Images default to UNLOCKED, so a stray drag
  // while editing content nudges it out of place. Detect it — by its source
  // class (fresh templates) or, once the editor round-trip has stripped the
  // class, by its signature (a hairline, ~full-width image in the bottom strip)
  // — and force it LOCKED so it can never be moved.
  const isPageNumLine =
    isImg &&
    (node.classList.contains("page-num-line") ||
      !!node.closest?.(".page-num-bar") ||
      (rect.width >= pageRect.width * 0.9 &&
        rect.height <= 3 &&
        rect.top - pageRect.top >= pageRect.height - 80));

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
    locked: isPageNumLine
      ? true
      : node.dataset.locked != null
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
