"use client";

/* ═══════════════════════════════════════════════════════════════════════
   CONTINUOUS RICH-TEXT COLUMN FLOW  (richflow elements)
   ───────────────────────────────────────────────────────────────────────
   A "flow" is the set of richflow elements that share `flowId`, ordered by
   (pageIndex, flowOrder). The master (order 0) carries the full ordered
   `blocks` stream. This module measures each frame's fixed-height, 2-column
   box and greedily fills it with whole blocks, cascading the remainder into
   the next existing frame — column 1 → column 2 (native CSS columns) → next
   page's box → …  No pages are created; if content exceeds the last frame the
   flow is flagged "overset" so the UI can warn.

   Measurement uses a hidden node wrapped in the canvas scope class so the
   template's own scoped CSS (.cols-2, h1.megler-name, h3, p …) applies, then
   reads scrollHeight of an auto-height column-balanced box.

   Phase 2 = whole-block packing (a block never splits). Mid-paragraph word
   splitting is a Phase 3 follow-up.
   ═══════════════════════════════════════════════════════════════════════ */

import { createContext, useContext, useEffect, useState } from "react";
import { CANVAS_SCOPE } from "../constants";
import type { CanvasElement, EditorModel, FlowBlock, Page } from "../types";
import { blockStyleToCss } from "../utils/blockStyle";

/* The blocks each frame should display, keyed by element id. */
export const RichFlowSlicesContext = createContext<Record<string, FlowBlock[]>>({});
export function useRichFlowSlice(id: string): FlowBlock[] | undefined {
  return useContext(RichFlowSlicesContext)[id];
}

/* The master-block index of each DISPLAYED block, parallel to the slice — lets
   the canvas map a clicked block back to the one master block it represents so a
   single line can be selected/edited (instead of the whole page). */
export const RichFlowIndicesContext = createContext<Record<string, number[]>>({});
export function useRichFlowIndices(id: string): number[] | undefined {
  return useContext(RichFlowIndicesContext)[id];
}

/* The currently-selected flow block (by flowId + master index) plus the click
   handler, so RichFlowView can highlight just that line and report clicks. */
export interface BlockSelection {
  flowId: string | null;
  mi: number | null;
  onSelect: (frameId: string, mi: number) => void;
}
export const RichFlowSelectionContext = createContext<BlockSelection>({
  flowId: null,
  mi: null,
  onSelect: () => {},
});
export function useRichFlowSelection(): BlockSelection {
  return useContext(RichFlowSelectionContext);
}

interface FlowFrame {
  id: string;
  pageIndex: number;
  flowOrder: number;
  width: number;
  height: number;
  padT: number;
  padR: number;
  padB: number;
  padL: number;
  border: number;
  colCount: number;
  colGap: number;
}

export interface RichFlowResult {
  slices: Record<string, FlowBlock[]>; // elementId -> blocks to DISPLAY (may include split paragraph halves)
  // elementId -> master-block index for each DISPLAYED block (parallel to slices).
  // A split paragraph's head and tail both carry their parent block's index, so
  // clicking either selects/edits the whole source paragraph.
  indices: Record<string, number[]>;
  // elementId -> [start,end) range of WHOLE master blocks this frame OWNS for
  // editing. Ranges are contiguous and partition the master stream exactly, so
  // editing one page can only ever replace its own slice — never duplicate
  // neighbours. A paragraph split across a page boundary is owned by the page
  // where it BEGINS (so it appears whole in that page's editor box).
  ranges: Record<string, [number, number]>;
  overset: Record<string, boolean>; // flowId -> true if content didn't fit
}

function frameFromEl(el: CanvasElement, pageIndex: number): FlowFrame {
  return {
    id: el.id,
    pageIndex,
    flowOrder: el.flowOrder ?? 0,
    width: el.width,
    height: el.height,
    padT: el.padding?.t || 0,
    padR: el.padding?.r || 0,
    padB: el.padding?.b || 0,
    padL: el.padding?.l || 0,
    border: el.borderWidth || 0,
    colCount: el.colCount ?? 2,
    colGap: el.colGap ?? 32,
  };
}

function renderBlocks(node: HTMLElement, blocks: FlowBlock[]): void {
  node.innerHTML = blocks
    .map((b) => {
      const tag = b.tag || "p";
      const cls = b.cls ? ` class="${b.cls}"` : "";
      // Per-line override must be measured too, so a custom font size/padding
      // changes how much fits before the line overflows.
      const bs = blockStyleToCss(b.style);
      const style = bs ? `${bs};break-inside:avoid` : "break-inside:avoid";
      return `<${tag}${cls} style="${style}">${b.html}</${tag}>`;
    })
    .join("");
}

// A plain paragraph (no inline tags) may be split mid-text across a boundary.
// Paragraphs containing inline markup (bold/links/br) are moved whole.
function isSplittablePara(b?: FlowBlock): boolean {
  return !!b && (b.tag || "p").toLowerCase() === "p" && !/<[a-z!/]/i.test(b.html);
}

// Split a plain paragraph so the head fills the leftover space after
// `headBlocks` and the tail carries to the next frame. Word tokens stay atomic.
function splitParaToFit(
  meas: HTMLElement,
  headBlocks: FlowBlock[],
  para: FlowBlock,
  contentH: number,
): { head: FlowBlock; tail: FlowBlock } | null {
  const words = para.html.match(/\S+|\s+/g) ?? [];
  if (words.length < 2) return null;
  const fitsWords = (k: number) => {
    renderBlocks(meas, headBlocks);
    const p = document.createElement("p");
    if (para.cls) p.className = para.cls;
    p.style.breakInside = "avoid";
    p.innerHTML = words.slice(0, k).join("");
    meas.appendChild(p);
    return meas.scrollHeight <= contentH + 0.5;
  };
  let lo = 1, hi = words.length - 1, best = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (fitsWords(mid)) { best = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  if (best <= 0) return null; // not even a word fits — let caller move whole block
  const tailWords = words.slice(best);
  while (tailWords.length && /^\s+$/.test(tailWords[0])) tailWords.shift();
  if (!tailWords.length) return null; // whole paragraph actually fit; no split
  return {
    head: { tag: "p", cls: para.cls, html: words.slice(0, best).join("").trimEnd() },
    tail: { tag: "p", cls: para.cls, html: tailWords.join("") },
  };
}

/* Reads the model, measures via a hidden scoped node, returns per-frame block
   slices. No React state — safe to call from a layout effect or before save. */
export function computeRichFlowSlices(pages: Page[]): RichFlowResult {
  const slices: Record<string, FlowBlock[]> = {};
  const indices: Record<string, number[]> = {};
  const ranges: Record<string, [number, number]> = {};
  const overset: Record<string, boolean> = {};

  const flows: Record<string, FlowFrame[]> = {};
  const masterBlocksById: Record<string, FlowBlock[]> = {};
  pages.forEach((p, pageIndex) => {
    (p.elements || []).forEach((el) => {
      if (el.type !== "richflow" || !el.flowId) return;
      masterBlocksById[el.id] = el.blocks ?? [];
      (flows[el.flowId] ||= []).push(frameFromEl(el, pageIndex));
    });
  });

  const flowIds = Object.keys(flows);
  if (!flowIds.length || typeof document === "undefined") return { slices, indices, ranges, overset };

  // Hidden measuring node, wrapped in the canvas scope so scoped template CSS
  // (.cols-2 / h1.megler-name / h3 / p) applies during measurement.
  const scope = document.createElement("div");
  scope.className = CANVAS_SCOPE;
  Object.assign(scope.style, {
    position: "absolute",
    left: "-99999px",
    top: "0",
    visibility: "hidden",
    pointerEvents: "none",
  } as CSSStyleDeclaration);
  const meas = document.createElement("div");
  meas.className = "cols-2";
  scope.appendChild(meas);
  document.body.appendChild(scope);

  try {
    for (const fid of flowIds) {
      const frames = flows[fid].sort(
        (a, b) => a.pageIndex - b.pageIndex || a.flowOrder - b.flowOrder,
      );
      // Carry each block's ORIGINAL master index alongside it so that, after
      // any paragraph split, we can still map displayed slices back to whole
      // master blocks for the per-page editor. A split paragraph's tail keeps
      // the parent block's index, so it is never counted as a new block.
      const master = masterBlocksById[frames[0].id] ?? [];
      let remaining: { b: FlowBlock; mi: number }[] = master.map((b, mi) => ({ b, mi }));
      let cursor = 0; // first master index not yet OWNED by an earlier frame
      let oversetFlag = false;

      frames.forEach((f, i) => {
        const contentW = Math.max(1, f.width - f.padL - f.padR - 2 * f.border);
        const contentH = Math.max(1, f.height - f.padT - f.padB - 2 * f.border);
        // NB: this hidden node stays `balance` even though the rendered boxes
        // (RichFlowView / serializer / .cols-2) are `auto`. It is not a render —
        // it is the capacity probe, and it has NO definite height. With
        // column-fill:auto and an auto height the browser stacks everything into
        // column 1 (measured: 1200px vs 600px for the same 60 lines), so
        // scrollHeight would report the FULL stream height instead of the
        // 2-column height, and every frame would take barely half the text it
        // should. `balance` on an auto-height node gives ceil(total / colCount),
        // which is exactly the "does this fit the box?" number the packer needs.
        Object.assign(meas.style, {
          width: contentW + "px",
          height: "auto",
          columnCount: String(f.colCount),
          columnGap: f.colGap + "px",
          columnFill: "balance",
        } as CSSStyleDeclaration);
        const isLast = i === frames.length - 1;

        if (isLast) {
          // Last frame absorbs everything left — and owns the rest of the stream.
          slices[f.id] = remaining.map((x) => x.b);
          indices[f.id] = remaining.map((x) => x.mi);
          ranges[f.id] = [Math.min(cursor, master.length), master.length];
          cursor = master.length;
          renderBlocks(meas, slices[f.id]);
          if (slices[f.id].length && meas.scrollHeight > contentH + 0.5) oversetFlag = true;
          remaining = [];
          return;
        }
        if (!remaining.length) {
          slices[f.id] = [];
          indices[f.id] = [];
          ranges[f.id] = [cursor, cursor];
          return;
        }

        // Binary-search the largest whole-block prefix that fits (monotonic:
        // more blocks => taller-or-equal balanced height).
        const fits = (k: number) => {
          renderBlocks(meas, remaining.slice(0, k).map((x) => x.b));
          return meas.scrollHeight <= contentH + 0.5;
        };
        let lo = 0, hi = remaining.length, best = 0;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          if (fits(mid)) { best = mid; lo = mid + 1; }
          else hi = mid - 1;
        }

        // Never end a frame on a heading — pull trailing headings back out so a
        // heading is not orphaned at the bottom of a column/page.
        while (best > 0 && /^h[1-6]$/i.test(remaining[best - 1].b.tag || "")) best--;

        // Try to split the next plain paragraph into the leftover space.
        const nextItem = remaining[best];
        const split =
          best < remaining.length && isSplittablePara(nextItem?.b)
            ? splitParaToFit(meas, remaining.slice(0, best).map((x) => x.b), nextItem.b, contentH)
            : null;

        let lastMi: number;
        if (split) {
          // The paragraph being split is OWNED by this frame (its head shows
          // here); its tail keeps the same master index and flows on for display.
          slices[f.id] = [...remaining.slice(0, best).map((x) => x.b), split.head];
          indices[f.id] = [...remaining.slice(0, best).map((x) => x.mi), nextItem.mi];
          lastMi = nextItem.mi;
          remaining = [{ b: split.tail, mi: nextItem.mi }, ...remaining.slice(best + 1)];
        } else {
          if (best === 0) best = 1; // nothing fit & can't split — force one block forward
          slices[f.id] = remaining.slice(0, best).map((x) => x.b);
          indices[f.id] = remaining.slice(0, best).map((x) => x.mi);
          lastMi = remaining[best - 1].mi;
          remaining = remaining.slice(best);
        }
        // Own whole master blocks [cursor, lastMi+1); clamp so a frame that only
        // displays a carried tail (already owned upstream) gets an empty range.
        const start = cursor;
        const end = Math.max(start, lastMi + 1);
        ranges[f.id] = [start, end];
        cursor = end;
      });

      overset[fid] = oversetFlag;
    }
  } finally {
    document.body.removeChild(scope);
  }

  return { slices, indices, ranges, overset };
}

/* Cheap structural signature so re-measure only runs when flow-affecting model
   values change (master stream content + every frame's geometry). */
function richFlowSignature(pages: Page[]): string {
  const parts: string[] = [];
  pages.forEach((p, pi) =>
    (p.elements || []).forEach((el) => {
      if (el.type !== "richflow" || !el.flowId) return;
      parts.push(
        [
          pi,
          el.flowId,
          el.flowOrder ?? 0,
          el.id,
          Math.round(el.width),
          Math.round(el.height),
          el.colCount ?? 2,
          el.colGap ?? 32,
          // master stream drives the split; include each block's style so a
          // per-line style change also triggers a re-measure.
          (el.flowOrder ?? 0) === 0
            ? (el.blocks ?? [])
                .map((b) => `${b.tag}:${b.cls || ""}:${b.html}:${b.style ? JSON.stringify(b.style) : ""}`)
                .join("›")
            : "",
        ].join("|"),
      );
    }),
  );
  return parts.join("¶");
}

/* React hook: per-frame slices + overset flags, re-measured (debounced) when
   the flow signature changes — keeps live typing smooth across the chain. */
export function useRichFlow(pages: Page[]): RichFlowResult {
  const [result, setResult] = useState<RichFlowResult>({ slices: {}, indices: {}, ranges: {}, overset: {} });
  const sig = richFlowSignature(pages);
  useEffect(() => {
    const t = setTimeout(() => setResult(computeRichFlowSlices(pages)), 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
  return result;
}

/* ── Master-stream ⇄ editable text (Inspector) ─────────────────────────────
   A simple, robust plain-text representation of the flow's blocks for live
   editing: "# " = h1 heading, "## " = h2, "### " = h3, otherwise a paragraph.
   Inline formatting (bold/links) is dropped — a documented follow-up. */
export function blocksToText(blocks: FlowBlock[]): string {
  return blocks
    .map((b) => {
      const tag = (b.tag || "p").toLowerCase();
      const text = b.html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      if (tag === "h1") return "# " + text;
      if (tag === "h2") return "## " + text;
      if (tag === "h3") return "### " + text;
      return text;
    })
    .join("\n");
}

export function textToBlocks(text: string): FlowBlock[] {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return text
    .split("\n")
    .map((line): FlowBlock => {
      if (line.startsWith("### ")) return { tag: "h3", html: esc(line.slice(4).trim()) };
      if (line.startsWith("## ")) return { tag: "h2", html: esc(line.slice(3).trim()) };
      if (line.startsWith("# ")) return { tag: "h1", cls: "megler-name", html: esc(line.slice(2).trim()) };
      return { tag: "p", html: esc(line.trim()) };
    })
    .filter((b) => b.html.length > 0);
}

/* Returns a model clone with each richflow frame's `blocks` replaced by its
   computed displayed slice — used at SAVE time so exported HTML keeps the same
   per-page .cols-2 distribution the user sees. No-op when there are no flows. */
export function materializeRichFlow(model: EditorModel): EditorModel {
  const hasFlow = model.pages.some((p) =>
    (p.elements || []).some((el) => el.type === "richflow" && el.flowId),
  );
  if (!hasFlow) return model;
  const { slices } = computeRichFlowSlices(model.pages);
  return {
    ...model,
    pages: model.pages.map((p) => ({
      ...p,
      elements: p.elements.map((el) =>
        el.type === "richflow" && slices[el.id] ? { ...el, blocks: slices[el.id] } : el,
      ),
    })),
  };
}
