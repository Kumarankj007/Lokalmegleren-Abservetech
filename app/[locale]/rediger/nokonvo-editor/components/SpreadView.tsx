"use client";

import { useMemo } from "react";

import { T } from "../constants";
import type { Page, CanvasElement } from "../types";
import { getPath } from "../utils/binding";
import PageView from "./PageView";
import ElementView from "./ElementView";

/* ═══════════════════════════════════════════════════════════════════════
   SPREAD VIEW
   ═══════════════════════════════════════════════════════════════════════ */
interface SpreadViewProps {
  leftPage: Page;
  rightPage: Page | null;
  selectedId: string | null;
  zoom: number;
  showGrid: boolean;
  data: Record<string, any>;
  onSelect: (id: string | null) => void;
  onChange: (el: CanvasElement, live?: boolean) => void;
  onCommit: () => void;
  onDropImageLeft: (src: string, x: number, y: number) => void;
  onDropImageRight: (src: string, x: number, y: number) => void;
  onAddRightPage: () => void;
  coverOnly?: boolean;
  onActivateLeft?: () => void;
  onActivateRight?: () => void;
  onDropToCell?: (elId: string, cellIndex: number, src: string) => void;
  /** 1-based document positions of the two pages, for `page-num` badges. */
  leftPageNumber?: number;
  rightPageNumber?: number;
  /** Whether either page is an extra-page currently excluded from the booklet. */
  leftHidden?: boolean;
  rightHidden?: boolean;
}

function SpreadView({ leftPage, rightPage, selectedId, zoom, showGrid, data, onSelect, onChange, onCommit, onDropImageLeft, onDropImageRight, onAddRightPage, coverOnly, onActivateLeft, onActivateRight, onDropToCell, leftPageNumber, rightPageNumber, leftHidden, rightHidden }: SpreadViewProps) {
  const leftFiltered = useMemo(() => ({ ...leftPage, elements: leftPage.elements.filter((e) => !e.spanning) }), [leftPage]);
  const rightFiltered = useMemo(() => rightPage ? { ...rightPage, elements: rightPage.elements.filter((e) => !e.spanning) } : null, [rightPage]);
  const spanningEls = useMemo(() => leftPage.elements.filter((e) => e.spanning), [leftPage.elements]);
  const spreadWidth = leftPage.width + (rightPage?.width ?? 0);
  const spreadHeight = leftPage.height;
  const leftLoopItem = useMemo(() => {
    if (!leftPage.loop) return null;
    const arr = getPath(data, leftPage.loop.source);
    if (Array.isArray(arr) && arr[0]) return { [leftPage.loop.iter]: arr[0] };
    return null;
  }, [leftPage.loop, data]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 0, marginBottom: 6, width: spreadWidth * zoom || leftPage.width * zoom }}>
        <div style={{ width: leftPage.width * zoom, fontSize: 10, color: T.textDim, fontFamily: "ui-monospace, monospace", letterSpacing: 1, textTransform: "uppercase", textAlign: "center" }}>
          {leftPage.name}{leftPage.loop && <span style={{ color: T.accent, marginLeft: 8 }}>⟳</span>}
        </div>
        {!coverOnly && (
          <div style={{ width: (rightPage?.width ?? leftPage.width) * zoom, fontSize: 10, color: T.textDim, fontFamily: "ui-monospace, monospace", letterSpacing: 1, textTransform: "uppercase", textAlign: "center" }}>
            {rightPage ? rightPage.name : "—"}{rightPage?.loop && <span style={{ color: T.accent, marginLeft: 8 }}>⟳</span>}
          </div>
        )}
      </div>
      <div style={{ position: "relative", display: "flex", gap: 0 }}>
        <PageView page={leftFiltered} selectedId={selectedId} zoom={zoom} showGrid={showGrid} data={data} onSelect={onSelect} onChange={onChange} onCommit={onCommit} onDropImage={onDropImageLeft} onActivate={onActivateLeft} onDropToCell={onDropToCell} pageNumber={leftPageNumber} hidden={leftHidden} />
        {!coverOnly && rightFiltered && (
          <PageView page={rightFiltered} selectedId={selectedId} zoom={zoom} showGrid={showGrid} data={data} onSelect={onSelect} onChange={onChange} onCommit={onCommit} onDropImage={onDropImageRight} onActivate={onActivateRight} onDropToCell={onDropToCell} pageNumber={rightPageNumber} hidden={rightHidden} />
        )}
        {rightFiltered && spanningEls.length > 0 && (
          <div style={{ position: "absolute", left: leftPage.width * zoom, top: 0, width: 0, height: spreadHeight * zoom, borderLeft: `1px dashed ${T.accent}55`, pointerEvents: "none", zIndex: 50 }} />
        )}
        {rightFiltered && spanningEls.length > 0 && (
          <div style={{ position: "absolute", left: 0, top: 0, width: spreadWidth * zoom, height: spreadHeight * zoom, pointerEvents: "none", zIndex: 60 }}>
            <div style={{ width: spreadWidth, height: spreadHeight, transform: `scale(${zoom})`, transformOrigin: "top left", position: "relative" }}>
              {spanningEls.map((el) => (
                <ElementView key={el.id} el={el} isSelected={selectedId === el.id} zoom={zoom} data={data} loopItem={leftLoopItem} onSelect={onSelect} onChange={onChange} onCommit={onCommit} pointerEvents="auto" pageWidth={spreadWidth} pageHeight={spreadHeight} pageNumber={leftPageNumber} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpreadView;
