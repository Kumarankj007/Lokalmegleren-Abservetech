"use client";

/* ═══════════════════════════════════════════════════════════════════════
   CONTINUOUS TEXT FLOW (linked frames)  —  dependency-free
   ───────────────────────────────────────────────────────────────────────
   A "flow" is a set of existing text elements that share `flowId`, ordered
   by (page index, flowOrder). The first frame (lowest order) is the MASTER
   and owns the full text in its `text` field. This module measures each
   frame's content box and greedily fills it with whole words, cascading the
   remainder to the next frame:

       column 1  →  column 2  →  next page column 1  →  ...

   • Words are atomic tokens, so they never break mid-word.
   • Whitespace/newlines are preserved (paragraphs & spacing survive).
   • Nothing is invented about pagination — text is only distributed across
     frames that already exist. If the text exceeds every frame, the flow is
     flagged "overset" so the UI can warn instead of silently clipping.

   It does NOT support inline mixed formatting (heading + bold + list in one
   stream) — formatting is uniform per flow, matching the existing per-box
   model. That would require a rich-text engine.
   ═══════════════════════════════════════════════════════════════════════ */

import React, { createContext, useContext, useLayoutEffect, useState } from "react";

/* The chunk each frame should display, keyed by element id. */
export const FlowChunksContext = createContext<Record<string, string>>({});
export function useFlowChunk(id: string, fallback: string): string {
  const map = useContext(FlowChunksContext);
  return map[id] ?? fallback;
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
  // typography (mirrors what ElementView applies, for accurate measurement)
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  lineHeight: string;
  letterSpacing: string;
  wordSpacing: string;
  textTransform: string;
  textAlign: string;
}

/* Words (\S+) and whitespace runs (\s+, incl. newlines) become atomic tokens.
   Joining a slice back with "" reproduces the exact original spacing. */
function tokenize(text: string): string[] {
  return text.match(/\S+|\s+/g) ?? [];
}

/* Build the measuring node's style for a given frame. */
function applyMeasureStyle(node: HTMLDivElement, f: FlowFrame) {
  const contentW = Math.max(1, f.width - f.padL - f.padR - 2 * f.border);
  node.style.width = contentW + "px";
  node.style.height = "auto";
  node.style.fontFamily = f.fontFamily || "Helvetica";
  node.style.fontSize = (f.fontSize || 16) + "px";
  node.style.fontWeight = f.fontWeight && f.fontWeight !== "normal" ? f.fontWeight : "normal";
  node.style.fontStyle = f.fontStyle || "normal";
  node.style.lineHeight = f.lineHeight && f.lineHeight !== "normal" ? f.lineHeight : "normal";
  node.style.letterSpacing =
    f.letterSpacing && f.letterSpacing !== "normal" ? f.letterSpacing : "normal";
  node.style.wordSpacing = f.wordSpacing && f.wordSpacing !== "normal" ? f.wordSpacing : "normal";
  node.style.textTransform = (f.textTransform as any) || "none";
  node.style.textAlign = (f.textAlign as any) || "left";
}

export interface FlowResult {
  chunks: Record<string, string>; // elementId -> text to display
  overset: Record<string, boolean>; // flowId -> true if text didn't fit
}

/* Pure-ish: reads model values, measures via a hidden DOM node, returns the
   per-frame chunks. No React, safe to call from a layout effect. */
export function computeFlowChunks(pages: any[]): FlowResult {
  const chunks: Record<string, string> = {};
  const overset: Record<string, boolean> = {};

  // group flow frames by flowId
  const flows: Record<string, FlowFrame[]> = {};
  const masterTextById: Record<string, string> = {};
  pages.forEach((p: any, pageIndex: number) => {
    (p.elements || []).forEach((el: any) => {
      if (el.type !== "text" || !el.flowId) return;
      masterTextById[el.id] = el.text || "";
      (flows[el.flowId] ||= []).push({
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
        fontFamily: el.fontFamily,
        fontSize: el.fontSize,
        fontWeight: el.fontWeight,
        fontStyle: el.fontStyle,
        lineHeight: el.lineHeight,
        letterSpacing: el.letterSpacing,
        wordSpacing: el.wordSpacing,
        textTransform: el.textTransform,
        textAlign: el.textAlign,
      });
    });
  });

  const flowIds = Object.keys(flows);
  if (!flowIds.length || typeof document === "undefined") return { chunks, overset };

  const meas = document.createElement("div");
  Object.assign(meas.style, {
    position: "absolute",
    left: "-99999px",
    top: "0",
    visibility: "hidden",
    pointerEvents: "none",
    whiteSpace: "pre-wrap", // preserve paragraphs / spacing while wrapping
    wordBreak: "normal", // never break a word mid-way
    overflowWrap: "normal",
    boxSizing: "content-box",
  } as CSSStyleDeclaration);
  document.body.appendChild(meas);

  try {
    for (const fid of flowIds) {
      const frames = flows[fid].sort(
        (a, b) => a.pageIndex - b.pageIndex || a.flowOrder - b.flowOrder,
      );
      let remaining = tokenize(masterTextById[frames[0].id] ?? "");
      let oversetFlag = false;

      frames.forEach((f, i) => {
        applyMeasureStyle(meas, f);
        const contentH = Math.max(1, f.height - f.padT - f.padB - 2 * f.border);
        const isLast = i === frames.length - 1;

        if (isLast) {
          // Last frame gets whatever is left; flag overset if it doesn't fit.
          const rest = remaining.join("");
          chunks[f.id] = rest;
          meas.textContent = rest;
          if (remaining.length && meas.scrollHeight > contentH + 0.5) oversetFlag = true;
          remaining = [];
          return;
        }

        if (!remaining.length) {
          chunks[f.id] = "";
          return;
        }

        // Binary-search the largest token count that still fits (monotonic
        // under pre-wrap: more tokens => taller-or-equal).
        const fits = (k: number) => {
          meas.textContent = remaining.slice(0, k).join("");
          return meas.scrollHeight <= contentH + 0.5;
        };
        let lo = 0,
          hi = remaining.length,
          best = 0;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          if (fits(mid)) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
        if (best === 0) best = 1; // a single token taller than the frame — force progress

        chunks[f.id] = remaining.slice(0, best).join("");
        remaining = remaining.slice(best);
        // Trim a leading space (not newline) on the carried remainder so the
        // next column doesn't start with an orphaned space.
        while (remaining.length && /^[^\S\n]+$/.test(remaining[0])) remaining.shift();
      });

      overset[fid] = oversetFlag;
    }
  } finally {
    document.body.removeChild(meas);
  }

  return { chunks, overset };
}

/* Cheap structural signature so the layout effect only re-measures when
   something that affects flow actually changes. */
function flowSignature(pages: any[]): string {
  const parts: string[] = [];
  pages.forEach((p: any, pi: number) =>
    (p.elements || []).forEach((el: any) => {
      if (el.type !== "text" || !el.flowId) return;
      parts.push(
        [
          pi,
          el.flowId,
          el.flowOrder ?? 0,
          el.id,
          Math.round(el.width),
          Math.round(el.height),
          el.padding?.t,
          el.padding?.r,
          el.padding?.b,
          el.padding?.l,
          el.borderWidth,
          el.fontFamily,
          el.fontSize,
          el.fontWeight,
          el.fontStyle,
          el.lineHeight,
          el.letterSpacing,
          el.wordSpacing,
          el.textTransform,
          el.textAlign,
          // master text drives the split; include only the master's text
          (el.flowOrder ?? 0) === 0 ? el.text : "",
        ].join("|"),
      );
    }),
  );
  return parts.join("¶");
}

/* React hook: returns the per-frame chunks + overset flags, re-measured after
   layout whenever the flow signature changes. */
export function useFlowChunks(pages: any[]): FlowResult {
  const [result, setResult] = useState<FlowResult>({ chunks: {}, overset: {} });
  const sig = flowSignature(pages);
  useLayoutEffect(() => {
    setResult(computeFlowChunks(pages));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
  return result;
}

/* ── Model helpers for linking frames into a flow ──────────────────────── */

export function flowMasterId(pages: any[], flowId: string): string | null {
  let best: { id: string; pi: number; order: number } | null = null;
  pages.forEach((p: any, pi: number) =>
    (p.elements || []).forEach((el: any) => {
      if (el.type !== "text" || el.flowId !== flowId) return;
      const order = el.flowOrder ?? 0;
      if (!best || pi < best.pi || (pi === best.pi && order < best.order))
        best = { id: el.id, pi, order };
    }),
  );
    return (best as { id: string; pi: number; order: number } | null)?.id ?? null;
}

export function flowMaxOrder(pages: any[], flowId: string): number {
  let max = -1;
  pages.forEach((p: any) =>
    (p.elements || []).forEach((el: any) => {
      if (el.type === "text" && el.flowId === flowId) max = Math.max(max, el.flowOrder ?? 0);
    }),
  );
  return max;
}