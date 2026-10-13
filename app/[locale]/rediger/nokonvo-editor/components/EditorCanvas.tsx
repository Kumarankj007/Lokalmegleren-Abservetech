"use client";

import { T, CANVAS_SCOPE } from "../constants";
import type { Page, CanvasElement, FlowBlock } from "../types";

import PageView from "./PageView";
import SpreadView from "./SpreadView";
import {
  RichFlowSlicesContext,
  RichFlowIndicesContext,
  RichFlowSelectionContext,
} from "../hooks/useRichFlow";

interface EditorCanvasProps {
  canvasScrollRef: React.RefObject<HTMLDivElement>;
  pageRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
  viewMode: "single" | "spread";
  pages: Page[];
  pageIdx: number;
  selectedId: string | null;
  zoom: number;
  showGrid: boolean;
  data: Record<string, any>;
  spreads: { leftIdx: number; coverOnly: boolean }[];
  onClearSelection: () => void;
  onSelect: (id: string | null) => void;
  onChange: (updated: CanvasElement, live?: boolean) => void;
  onCommit: () => void;
  onDropImageOnPage: (src: string, x: number, y: number, i: number) => void;
  onDropToCell: (elId: string, cellIndex: number, src: string) => void;
  onActivatePage: (i: number) => void;
  onSpreadDrop: (src: string, x: number, y: number, leftIdx: number) => void;
  onAddRightPage: (leftIdx: number) => void;
  richFlowSlices: Record<string, FlowBlock[]>;
  /** Master-block index per displayed block, keyed by frame id. */
  richFlowIndices: Record<string, number[]>;
  /** Selected flow line (flowId + master index) and the click handler. */
  selectedBlock: { flowId: string; mi: number } | null;
  onSelectBlock: (frameId: string, mi: number) => void;
  /** Booklet number per page (null = hidden extra-page), parallel to `pages`. */
  pageNumbers: (number | null)[];
}

export default function EditorCanvas({
  canvasScrollRef, pageRefs, viewMode, pages, pageIdx, selectedId, zoom, showGrid, data, spreads,
  onClearSelection, onSelect, onChange, onCommit, onDropImageOnPage, onDropToCell, onActivatePage, onSpreadDrop, onAddRightPage,
  richFlowSlices, richFlowIndices, selectedBlock, onSelectBlock, pageNumbers,
}: EditorCanvasProps) {
  // Each richflow frame's computed slice / master-index map / line selection is
  // provided via context (computed once in the parent so the inspector and the
  // canvas share the same data).
  return (
    <RichFlowSlicesContext.Provider value={richFlowSlices}>
    <RichFlowIndicesContext.Provider value={richFlowIndices}>
    <RichFlowSelectionContext.Provider value={{ flowId: selectedBlock?.flowId ?? null, mi: selectedBlock?.mi ?? null, onSelect: onSelectBlock }}>
    <div
      ref={canvasScrollRef}
      className={CANVAS_SCOPE}
      style={{ flex: 1, overflow: "auto", background: "#0d1925", backgroundImage: "radial-gradient(circle at 20% 20%, rgba(226,207,158,0.04), transparent 50%)", padding: 10 }}
      onClick={onClearSelection}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        {viewMode === "single" && pages.map((page, i) => (
          <div
            key={page.id}
            ref={(el) => { if (el) pageRefs.current.set(i, el); else pageRefs.current.delete(i); }}
            data-page-index={i}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            <div style={{ fontSize: 10, color: i === pageIdx ? T.accent : T.textDim, fontFamily: "ui-monospace, monospace", letterSpacing: 1, textTransform: "uppercase", textAlign: "center", transition: "color 0.15s" }}>
              {page.name}{page.loop && <span style={{ color: T.accent, marginLeft: 8 }}>⟳ løkke · {page.loop.source}</span>}
            </div>
            <PageView page={page} selectedId={selectedId} zoom={zoom} showGrid={showGrid} data={data} onSelect={onSelect} onChange={onChange} onCommit={onCommit} onDropImage={(src, x, y) => onDropImageOnPage(src, x, y, i)} onActivate={() => onActivatePage(i)} onDropToCell={onDropToCell} pageNumber={pageNumbers[i] ?? undefined} hidden={pageNumbers[i] == null} />
          </div>
        ))}

        {viewMode === "spread" && spreads.map((spread) => {
          const leftPage = pages[spread.leftIdx];
          const rightPage = spread.coverOnly ? null : (pages[spread.leftIdx + 1] ?? null);
          if (!leftPage) return null;
          return (
            <div
              key={leftPage.id}
              ref={(el) => { if (el) pageRefs.current.set(spread.leftIdx, el); else pageRefs.current.delete(spread.leftIdx); }}
              data-page-index={spread.leftIdx}
            >
              <SpreadView
                leftPage={leftPage} rightPage={rightPage} coverOnly={spread.coverOnly}
                selectedId={selectedId} zoom={zoom} showGrid={showGrid} data={data}
                onSelect={onSelect} onChange={onChange} onCommit={onCommit}
                onDropImageLeft={(src, x, y) => { if (spread.coverOnly) onDropImageOnPage(src, x, y, spread.leftIdx); else onSpreadDrop(src, x, y, spread.leftIdx); }}
                onDropImageRight={(src, x, y) => onSpreadDrop(src, x + leftPage.width, y, spread.leftIdx)}
                onAddRightPage={() => onAddRightPage(spread.leftIdx)}
                onActivateLeft={() => onActivatePage(spread.leftIdx)}
                onActivateRight={() => onActivatePage(spread.leftIdx + 1)}
                onDropToCell={onDropToCell}
                leftPageNumber={pageNumbers[spread.leftIdx] ?? undefined}
                rightPageNumber={pageNumbers[spread.leftIdx + 1] ?? undefined}
                leftHidden={pageNumbers[spread.leftIdx] == null}
                rightHidden={pageNumbers[spread.leftIdx + 1] == null}
              />
            </div>
          );
        })}
      </div>
    </div>
    </RichFlowSelectionContext.Provider>
    </RichFlowIndicesContext.Provider>
    </RichFlowSlicesContext.Provider>
  );
}
