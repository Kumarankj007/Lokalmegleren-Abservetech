"use client";

import React from "react";
import { T, FLOW_BLOCK_MARGIN, FLOW_BLOCK_LINE_HEIGHT } from "../constants";
import type { CanvasElement, FlowBlock } from "../types";
import {
  useRichFlowSlice,
  useRichFlowIndices,
  useRichFlowSelection,
} from "../hooks/useRichFlow";
import { blockStyleToReact } from "../utils/blockStyle";

/**
 * Renders a richflow element: a fixed-height, multi-column container holding a
 * slice of an accordion stream. The browser's native CSS columns handle the
 * left/right split inside the page. The template's own scoped CSS (.cols-2,
 * h1.megler-name, h3, p …) styles the blocks — we add inline column fallbacks.
 *
 * `blocks` is the slice to display. In Phase 1 it's just the element's own
 * `blocks`; later the live flow engine passes a computed slice.
 *
 * Each block is individually selectable: clicking one reports its master-block
 * index so a single LINE can be made active and edited (instead of the whole
 * page), and the selected line — not the frame — gets the active outline.
 */
export default function RichFlowView({
  el,
  blocks,
}: {
  el: CanvasElement;
  blocks?: FlowBlock[];
}) {
  // The live flow engine's computed slice for this frame wins; fall back to the
  // element's own blocks (e.g. before the layout effect runs, or for the master).
  const slice = useRichFlowSlice(el.id);
  const idxs = useRichFlowIndices(el.id);
  const sel = useRichFlowSelection();
  const list = blocks ?? slice ?? el.blocks ?? [];
  // Only wire per-line selection when we have a master-index map for this slice.
  const selectable = !!idxs && idxs.length === list.length;
  return (
    <div
      className="cols-2"
      style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        columnCount: el.colCount ?? 2,
        columnGap: el.colGap ?? 32,
        // Mirror the export container (serializer.ts): fill column 1 to the
        // bottom of the box before starting column 2, and DON'T clip —
        // overflow:visible means the preview never hides a line the exported
        // PDF would show. The page itself still clips to the sheet.
        columnFill: "auto",
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      {list.map((b, i) => {
        const mi = selectable ? idxs![i] : undefined;
        const active =
          mi != null && sel.mi != null && sel.flowId != null &&
          el.flowId === sel.flowId && mi === sel.mi;
        return React.createElement(b.tag || "p", {
          key: i,
          className: b.cls || undefined,
          // Tag the rendered line so its live computed style can seed the inspector.
          ["data-flow-block" as any]: mi != null ? `${el.flowId}:${mi}` : undefined,
          style: {
            // Mirror the export's per-block rules (serializer.ts) so the canvas
            // preview matches the PDF: tight margin + line-height, applied FIRST
            // so the line's own override still wins.
            marginBlock: FLOW_BLOCK_MARGIN,
            lineHeight: FLOW_BLOCK_LINE_HEIGHT,
            // The line's own style override (typography/colour/box/…) wins…
            ...blockStyleToReact(b.style),
            // …then flow rules: body copy splits across the column break (fills
            // both columns, no gaps); headings stay whole so they're never cut.
            breakInside: /^h[1-6]$/i.test(b.tag || "p") ? "avoid" : "auto",
            // Per-line selection: re-enable pointer events for the block only
            // (the container stays "none" so gaps don't swallow frame clicks).
            ...(mi != null
              ? { pointerEvents: "auto" as const, cursor: "text" }
              : null),
            // Active LINE outline — not the whole page/frame.
            ...(active
              ? {
                  outline: `2px solid ${T.selection}`,
                  outlineOffset: 2,
                  background: `${T.selection}1f`,
                  borderRadius: 2,
                }
              : null),
          },
          // stopPropagation so the click selects the line, not the frame, and
          // doesn't bubble to the page (which would clear the selection).
          onMouseDown:
            mi != null ? (e: React.MouseEvent) => e.stopPropagation() : undefined,
          onClick:
            mi != null
              ? (e: React.MouseEvent) => {
                  e.stopPropagation();
                  sel.onSelect(el.id, mi);
                }
              : undefined,
          dangerouslySetInnerHTML: { __html: b.html },
        });
      })}
    </div>
  );
}
