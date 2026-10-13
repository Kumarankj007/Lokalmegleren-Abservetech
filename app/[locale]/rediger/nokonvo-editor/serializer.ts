import { PRINT_CSS, FLOW_BLOCK_MARGIN, FLOW_BLOCK_LINE_HEIGHT } from "./constants";
import type { CanvasElement, Page, EditorModel } from "./types";
import { paddingToCss, radiusToCss, isPaddingZero, isRadiusZero } from "./utils/geometry";
import { computeBookletNumbers, normalizeOmPills } from "./utils/pagination";
import { blockStyleToCss } from "./utils/blockStyle";

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

function serializeElement(el: CanvasElement, mode: "editable" | "ejs", pageNum?: number, pageBg?: string): string {
  // The page-number badge fills with the PAGE colour (blue page → blue badge) so
  // it reads as a disc on the footer rule — bake that into the exported style too.
  if (el.dataField === "page-num" && pageBg && el.background !== pageBg) {
    el = { ...el, background: pageBg };
  }
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

  if (el.type === "richflow") {
    attrs.push(`data-richtext="true"`);
    const colCount = el.colCount ?? 2;
    const colGap = el.colGap ?? 32;
    // Container layout (inline, overriding the .cols-2 class defaults):
    //   • column-fill:auto — fill column 1 completely top-to-bottom before
    //     starting column 2. The class default `balance` equalises the two
    //     columns and leaves matching empty gaps at the bottom.
    //   • overflow:visible — the class forces overflow:hidden, which silently
    //     CLIPS any content that renders past the box. Making it visible means
    //     nothing is hidden; the page's own overflow:hidden still clips anything
    //     that would spill beyond the printed sheet.
    const colStyle = `${style};column-count:${colCount};column-gap:${colGap}px;column-fill:auto;overflow:visible`;
    // Per-block export rules, emitted BEFORE the per-block style so any explicit
    // per-line override still wins:
    //   • margin-block:2px + line-height:1.4 — the browser's user-agent
    //     margin-block:1em would otherwise inflate every paragraph.
    //   • break-inside:auto (body copy only) — the .cols-2 class forces
    //     break-inside:avoid on EVERY child, so a paragraph that doesn't fit
    //     jumps whole to the next column (empty gaps) and, in the last column,
    //     spills past the 2 columns (clipped → hidden). Letting body paragraphs
    //     split at the column boundary flows the text continuously so both
    //     columns fill and nothing overflows. Headings keep the class default
    //     (avoid) so a heading is never split down the middle.
    const RICH_BLOCK_RESET = `margin-block:${FLOW_BLOCK_MARGIN}px;line-height:${FLOW_BLOCK_LINE_HEIGHT}`;
    const FLOW_SPLIT = "break-inside:auto;-webkit-column-break-inside:auto;page-break-inside:auto";
    const blocksHtml = (el.blocks ?? [])
      .map((b) => {
        const tag = b.tag || "p";
        const cls = b.cls ? ` class="${escapeAttr(b.cls)}"` : "";
        const bs = blockStyleToCss(b.style);
        const base = /^h[1-6]$/i.test(tag) ? RICH_BLOCK_RESET : `${RICH_BLOCK_RESET};${FLOW_SPLIT}`;
        const style = ` style="${escapeAttr(bs ? `${base};${bs}` : base)}"`;
        return `    <${tag}${cls}${style}>${b.html}</${tag}>`;
      })
      .join("\n");
    return `  <div ${attrs.join(" ")} class="cols-2" style="${colStyle}">\n${blocksHtml}\n  </div>`;
  }

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
      // Zoom anchored at the pan point (matches ElementView) so posX/posY pan the
      // zoomed image in the exported HTML/PDF exactly as in the editor.
      `transform-origin:${px}% ${py}%`,
      "display:block",
      el.imageFilter && el.imageFilter !== "none" ? `filter:${el.imageFilter}` : "",
    ]
      .filter(Boolean)
      .join(";");
    return `  <div ${attrs.join(" ")} style="${wrapperStyle}"><img src="${escapeAttr(src)}" style="${imgStyle}" /></div>`;
  }

  let inner: string;
  // A `page-num` badge always reflects its page's current 1-based position, so
  // reordering/swapping pages renumbers them instead of keeping stale text.
  if (el.dataField === "page-num" && pageNum != null) {
    inner = escapeHtml(String(pageNum));
  } else if (mode === "ejs" && el.bind) {
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

function serializePage(page: Page, mode: "editable" | "ejs", isLast: boolean, pageNum?: number): string {
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
  if (page.dataField) attrs.push(`data-field="${escapeAttr(page.dataField)}"`);

  const breakAfter = isLast ? "" : "page-break-after:always;break-after:page;";
  const style = `position:relative;width:${page.width}px;height:${page.height}px;background:${page.bg};overflow:hidden;${breakAfter}`;

  const els = [...page.elements]
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((el) => serializeElement(el, mode, pageNum, page.bg))
    .join("\n");

  // FIX: removed dead ternary (both branches returned "page")
  return `${openWrap}<div id="${page.id}" class="page" ${attrs.join(" ")} style="${style}">
${els}
</div>${closeWrap}`;
}

export function serializeTemplate(model: EditorModel, mode: "editable" | "ejs" = "editable", title?: string): string {
  // Re-align the "OM EIENDOMMEN" running-header pill to the outer corner of each
  // spread (odd → right, even → left) with its inner-edge radius BEFORE emitting,
  // so the exported HTML/PDF is always correct even if the live model missed a
  // normalize pass (e.g. a pill left stale by an edit that wasn't a page op).
  const pages = normalizeOmPills(model.pages);
  // Hidden extra-pages get a null number — they are skipped entirely so the
  // exported booklet keeps an even page count, and the remaining pages number
  // contiguously. The last VISIBLE page must not carry a page-break-after.
  const numbers = computeBookletNumbers(pages);
  let lastVisible = -1;
  numbers.forEach((n, i) => { if (n != null) lastVisible = i; });
  const pagesHtml = pages
    .map((p, i) => (numbers[i] == null ? null : serializePage(p, mode, i === lastVisible, numbers[i]!)))
    .filter((s): s is string => s != null)
    .join("\n\n");
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
