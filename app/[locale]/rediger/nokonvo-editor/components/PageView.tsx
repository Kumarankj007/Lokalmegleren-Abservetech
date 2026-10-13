"use client";

import React, { useState, useMemo } from "react";

import { AlertTriangle } from "lucide-react";

import { T, GRID } from "../constants";
import type { Page, CanvasElement, Guideline } from "../types";
import { getPath } from "../utils/binding";
import { elementOverflow } from "../utils/geometry";
import ElementView from "./ElementView";

const OVERFLOW_COLOR = "#f59e0b";

/* ═══════════════════════════════════════════════════════════════════════
   PAGE VIEW
   ═══════════════════════════════════════════════════════════════════════ */
interface PageViewProps {
  page: Page;
  selectedId: string | null;
  zoom: number;
  showGrid: boolean;
  data: Record<string, any>;
  onSelect: (id: string | null) => void;
  onChange: (el: CanvasElement, live?: boolean) => void;
  onCommit: () => void;
  onDropImage: (src: string, x: number, y: number) => void;
  onActivate?: () => void;
  onDropToCell?: (elId: string, cellIndex: number, src: string) => void;
  /** 1-based position of this page in the document, for `page-num` badges. */
  pageNumber?: number;
  /** True when this is an `extra-page` currently dropped from the booklet
   *  (even page count). Shown dimmed with a label so it never silently prints. */
  hidden?: boolean;
}

function PageView({ page, selectedId, zoom, showGrid, data, onSelect, onChange, onCommit, onDropImage, onActivate, onDropToCell, pageNumber, hidden }: PageViewProps) {
  const loopItem = useMemo(() => {
    if (!page.loop) return null;
    const arr = getPath(data, page.loop.source);
    if (Array.isArray(arr) && arr[0]) return { [page.loop.iter]: arr[0] };
    return null;
  }, [page.loop, data]);

  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const src = e.dataTransfer.getData("imageSrc");
    if (!src) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    onDropImage(src, Math.round(x), Math.round(y));
  };

  const hasSelection = !!page.elements.find((e) => e.id === selectedId);

  // Count elements whose content spills past this page's boundary.
  const overflowCount = page.elements.filter(
    (e) => elementOverflow(e, page.width, page.height).any,
  ).length;

  return (
    <div
      style={{
        width: page.width * zoom, height: page.height * zoom, position: "relative",
        flexShrink: 0, zIndex: hasSelection ? 9999 : 1, overflow: hasSelection ? "visible" : "hidden",
        // Dim an extra-page that is currently excluded from the booklet.
        opacity: hidden ? 0.4 : undefined,
        outline: hidden ? `2px dashed ${T.textDim}` : undefined,
        outlineOffset: hidden ? -2 : undefined,
      }}
      onMouseDown={() => { onSelect(null); onActivate?.(); }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className="page"
        style={{
          width: page.width, height: page.height, background: page.bg, position: "relative",
          overflow: hasSelection ? "visible" : "hidden",
          transform: `scale(${zoom})`, transformOrigin: "top left",
        }}
      >
        {showGrid && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 99999,
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)`,
            backgroundSize: `${GRID * 4}px ${GRID * 4}px`, pointerEvents: "none",
          }} />
        )}
        {page.elements.map((el) => (
          <ElementView
            key={el.id}
            el={el}
            isSelected={selectedId === el.id}
            zoom={zoom}
            data={data}
            loopItem={loopItem}
            onSelect={onSelect}
            onChange={onChange}
            onCommit={onCommit}
            onDropToCell={onDropToCell}
            pageWidth={page.width}
            pageHeight={page.height}
            pageNumber={pageNumber}
            pageBg={page.bg}
            onGuidelineChange={selectedId === el.id ? setGuidelines : undefined}
          />
        ))}
        {guidelines.length > 0 && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 100000 }}>
            {guidelines.map((g, idx) => {
              const isCentre = g.label === "Senter";
              const color = isCentre ? "#f43f5e" : "#3b82f6";
              if (g.axis === "v") {
                return (
                  <React.Fragment key={idx}>
                    <div style={{
                      position: "absolute", left: g.pos, top: 0, width: 1, height: "100%",
                      background: color, opacity: 0.85, transform: "translateX(-0.5px)",
                      borderLeft: `1px ${isCentre ? "solid" : "dashed"} ${color}`,
                    }} />
                    <div style={{
                      position: "absolute", left: g.pos + 4, top: 6, background: color, color: "#fff",
                      fontSize: 9, fontFamily: "ui-monospace, monospace", letterSpacing: 0.5,
                      padding: "1px 5px", borderRadius: 3, opacity: 0.92, whiteSpace: "nowrap",
                    }}>{g.label ?? ""}</div>
                  </React.Fragment>
                );
              } else {
                return (
                  <React.Fragment key={idx}>
                    <div style={{
                      position: "absolute", top: g.pos, left: 0, height: 1, width: "100%",
                      background: color, opacity: 0.85, transform: "translateY(-0.5px)",
                      borderTop: `1px ${isCentre ? "solid" : "dashed"} ${color}`,
                    }} />
                    <div style={{
                      position: "absolute", top: g.pos + 4, left: 6, background: color, color: "#fff",
                      fontSize: 9, fontFamily: "ui-monospace, monospace", letterSpacing: 0.5,
                      padding: "1px 5px", borderRadius: 3, opacity: 0.92, whiteSpace: "nowrap",
                    }}>{g.label ?? ""}</div>
                  </React.Fragment>
                );
              }
            })}
          </div>
        )}
      </div>

      {/* {overflowCount > 0 && (
        <div style={{
          position: "absolute", bottom: 4, right: 4, zIndex: 100001,
          display: "flex", alignItems: "center", gap: 4, pointerEvents: "none",
          background: OVERFLOW_COLOR, color: "#1f2937", fontSize: 10,
          fontFamily: "ui-monospace, monospace", letterSpacing: 0.3,
          padding: "2px 7px", borderRadius: 3, whiteSpace: "nowrap",
          boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
        }}>
          <AlertTriangle size={11} />
          {overflowCount} element{overflowCount === 1 ? "" : "er"} utenfor siden
        </div>
      )} */}

      {/* Extra-page excluded from the booklet (even page count) */}
      {hidden && (
        <div style={{
          position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", zIndex: 100001,
          display: "flex", alignItems: "center", gap: 4, pointerEvents: "none",
          background: T.panelHi, color: T.textDim, fontSize: 10,
          fontFamily: "ui-monospace, monospace", letterSpacing: 0.3,
          padding: "2px 8px", borderRadius: 3, whiteSpace: "nowrap",
          border: `1px solid ${T.borderHi}`,
        }}>
          Ekstra side · skjult (partall sideantall)
        </div>
      )}
    </div>
  );
}

export default PageView;
