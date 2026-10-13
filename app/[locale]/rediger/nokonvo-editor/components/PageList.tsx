"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ArrowUp, ArrowDown, Plus, Copy, Trash2 } from "lucide-react";

import { T, A4_W, A4_H, CANVAS_SCOPE } from "../constants";
import type { Page, FlowBlock } from "../types";
import { getPath, resolvePreview, resolveSrc } from "../utils/binding";
import { isPaddingZero, paddingToCss, radiusToCss } from "../utils/geometry";
import { computeBookletNumbers } from "../utils/pagination";
import { blockStyleToReact } from "../utils/blockStyle";
import { usePermissions } from "../utils/permissions";
import { IconBtn, btnPrimary, btnSecondary } from "./primitives";

/* ═══════════════════════════════════════════════════════════════════════
   PAGE LIST
   ═══════════════════════════════════════════════════════════════════════ */
interface PageListProps {
  pages: Page[];
  currentIdx: number;
  secondaryIdx?: number;
  data: Record<string, any>;
  onSelect: (i: number) => void;
  onAdd: () => void;
  onDelete: (i: number) => void;
  onMove: (i: number, dir: -1 | 1) => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
  onReorderMulti: (indices: number[], toIdx: number) => void;
  onDeleteMulti: (indices: number[]) => void;
  onDuplicate: (i: number) => void;
  onInsertAfter: (i: number) => void;
  TabComponent: React.FC;
  // Per-frame flow slices so Rich Text (richflow) blocks render in the thumbnails.
  richFlowSlices?: Record<string, FlowBlock[]>;
}

function PageList({ pages, currentIdx, secondaryIdx, data, onSelect, onAdd, onDelete, onMove, onReorder, onReorderMulti, onDeleteMulti, onDuplicate, onInsertAfter, TabComponent, richFlowSlices = {} }: PageListProps) {
  // Regular users can browse pages but cannot add / delete / duplicate / move /
  // reorder them. `canManagePages` gates every page-structure control below.
  const { canManagePages } = usePermissions();
  const [selectedSet, setSelectedSet] = useState<Set<number>>(new Set());
  const anchorRef = useRef<number>(0);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const computeDropIdx = (e: React.DragEvent<HTMLDivElement>, hoverIdx: number) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return e.clientY - rect.top > rect.height / 2 ? hoverIdx + 1 : hoverIdx;
  };

  const selectedArr = useMemo(() => Array.from(selectedSet).sort((a, b) => a - b), [selectedSet]);
  const multiSelected = selectedSet.size > 1;

  // null entries are extra-pages currently dropped from the booklet (even count).
  const pageNumbers = useMemo(() => computeBookletNumbers(pages), [pages]);

  useEffect(() => {
    setSelectedSet((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => { if (i < pages.length) next.add(i); });
      return next.size === prev.size ? prev : next;
    });
  }, [pages.length]);

  const handleItemClick = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const meta = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    if (shift) {
      const lo = Math.min(anchorRef.current, i);
      const hi = Math.max(anchorRef.current, i);
      const range = new Set<number>();
      for (let x = lo; x <= hi; x++) range.add(x);
      setSelectedSet(range);
    } else if (meta) {
      setSelectedSet((prev) => { const next = new Set(prev); if (next.has(i)) next.delete(i); else next.add(i); return next; });
      anchorRef.current = i;
    } else {
      setSelectedSet(new Set([i]));
      anchorRef.current = i;
      onSelect(i);
    }
  };

  const handleDragStart = (i: number, e: React.DragEvent) => {
    setDragIdx(i);
    e.dataTransfer.effectAllowed = "move";
    if (!selectedSet.has(i)) { setSelectedSet(new Set([i])); anchorRef.current = i; }
    e.dataTransfer.setData("text/plain", String(i));
  };
  const handleDragEnd = () => { setDragIdx(null); setDropIdx(null); };

  const handleDrop = (e: React.DragEvent) => {
    if (dragIdx === null) return;
    e.preventDefault();
    const target = dropIdx ?? pages.length;
    const dragging = selectedSet.has(dragIdx) && selectedSet.size > 1 ? selectedArr : [dragIdx];
    if (dragging.length === 1) {
      if (target !== dragging[0] && target !== dragging[0] + 1) onReorder(dragging[0], target > dragging[0] ? target - 1 : target);
    } else {
      const minSelected = dragging[0];
      const maxSelected = dragging[dragging.length - 1];
      if (target < minSelected || target > maxSelected + 1) onReorderMulti(dragging, target);
    }
    setDragIdx(null);
    setDropIdx(null);
  };

  const isDraggingItem = (i: number) => {
    if (dragIdx === null) return false;
    if (selectedSet.has(dragIdx)) return selectedSet.has(i);
    return dragIdx === i;
  };

  const selectionBar = canManagePages && selectedSet.size > 0 && (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", background: T.panelHi, borderBottom: `1px solid ${T.border}`, fontSize: 10, color: T.accent, fontFamily: "ui-monospace, monospace", letterSpacing: 0.5, flexShrink: 0, gap: 6 }}>
      <span style={{ whiteSpace: "nowrap" }}>{selectedSet.size} valgt</span>
      <div style={{ display: "flex", gap: 4 }}>
        {multiSelected && (
          <>
            <button title="Flytt valgte opp" disabled={selectedArr[0] === 0}
              onClick={(e) => { e.stopPropagation(); if (selectedArr[0] === 0) return; onReorderMulti(selectedArr, selectedArr[0] - 1); setSelectedSet(new Set(selectedArr.map((x) => x - 1))); }}
              style={{ ...btnSecondary, padding: "2px 6px", fontSize: 10, opacity: selectedArr[0] === 0 ? 0.4 : 1 }}>
              <ArrowUp size={11} />
            </button>
            <button title="Flytt valgte ned" disabled={selectedArr[selectedArr.length - 1] === pages.length - 1}
              onClick={(e) => { e.stopPropagation(); const last = selectedArr[selectedArr.length - 1]; if (last >= pages.length - 1) return; onReorderMulti(selectedArr, last + 2); setSelectedSet(new Set(selectedArr.map((x) => x + 1))); }}
              style={{ ...btnSecondary, padding: "2px 6px", fontSize: 10, opacity: selectedArr[selectedArr.length - 1] === pages.length - 1 ? 0.4 : 1 }}>
              <ArrowDown size={11} />
            </button>
          </>
        )}
        <button title="Fjern valg" onClick={(e) => { e.stopPropagation(); setSelectedSet(new Set()); }} style={{ ...btnSecondary, padding: "2px 6px", fontSize: 10 }}>✕</button>
        {multiSelected && (
          <button title="Slett valgte sider"
            onClick={(e) => { e.stopPropagation(); if (pages.length - selectedSet.size < 1) return; if (!window.confirm(`Slett ${selectedSet.size} sider?`)) return; onDeleteMulti(selectedArr); setSelectedSet(new Set()); }}
            style={{ ...btnSecondary, padding: "2px 6px", fontSize: 10, color: T.danger, borderColor: T.danger }}>
            <Trash2 size={11} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="space-y-2" style={{ padding: "8px", borderBottom: `1px solid ${T.border}` }}>
        <TabComponent />
        {canManagePages && (
          <button onClick={onAdd} style={{ ...btnPrimary, width: "100%", padding: "6px", fontSize: 11 }}>+ Ny side</button>
        )}
      </div>
      {canManagePages && (
        <div style={{ padding: "4px 8px", fontSize: 9, color: T.textDim, letterSpacing: 0.3, borderBottom: `1px solid ${T.border}`, flexShrink: 0, fontFamily: "ui-monospace, monospace", lineHeight: 1.4 }}>
          ⌘/Ctrl+klikk for flervalg · Shift+klikk for område · Dra for å flytte
        </div>
      )}
      {selectionBar}
      <div className="flex-1 overflow-y-auto py-3 px-2"
        onDragOver={(e) => { if (dragIdx !== null) e.preventDefault(); }}
        onDrop={handleDrop}
        onClick={() => setSelectedSet(new Set())}
      >
        {pages.map((p, i) => {
          const arr = p.loop && getPath(data, p.loop.source);
          const loopItem = Array.isArray(arr) && arr[0] ? { [p.loop!.iter]: arr[0] } : null;
          const isActive = i === currentIdx || i === secondaryIdx;
          const isSelected = selectedSet.has(i);
          const isDraggingThis = isDraggingItem(i);
          const draggingIndices = dragIdx !== null && selectedSet.has(dragIdx) ? selectedArr : dragIdx !== null ? [dragIdx] : [];
          const isDraggedOver = draggingIndices.length > 0 && !draggingIndices.includes(i);
          const showTopBar = dropIdx === i && isDraggedOver && dragIdx !== i - 1;
          const showBottomBar = dropIdx === i + 1 && isDraggedOver && dragIdx !== i + 1;
          const borderColor = isSelected ? T.accent : isActive ? T.selection : T.border;
          const bgColor = isSelected ? `${T.accent}18` : isActive ? T.panelHi : T.panel;
          const isHidden = pageNumbers[i] == null;

          return (
            <div
              key={p.id}
              draggable={canManagePages}
              onDragStart={canManagePages ? (e) => handleDragStart(i, e) : undefined}
              onDragEnd={canManagePages ? handleDragEnd : undefined}
              onDragOver={canManagePages ? (e) => { if (dragIdx === null) return; e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "move"; const next = computeDropIdx(e, i); if (next !== dropIdx) setDropIdx(next); } : undefined}
              onDragLeave={() => { }}
              onClick={(e) => handleItemClick(i, e)}
              style={{ marginBottom: 8, border: `1px solid ${borderColor}`, background: bgColor, borderRadius: 4, cursor: !canManagePages ? "pointer" : isDraggingThis ? "grabbing" : "grab", overflow: "hidden", boxShadow: isSelected ? `0 0 0 2px ${T.accent}66` : isActive ? `0 0 0 1px ${T.selection}` : "none", opacity: isDraggingThis ? 0.35 : isHidden ? 0.5 : 1, borderTop: showTopBar ? `3px solid ${T.accent}` : undefined, borderBottom: showBottomBar ? `3px solid ${T.accent}` : undefined, transition: "opacity 0.12s, box-shadow 0.12s, border-color 0.12s", position: "relative" }}
            >
              {isSelected && (
                <div style={{ position: "absolute", top: 5, left: 5, width: 16, height: 16, borderRadius: 3, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, fontSize: 10, color: T.brand, fontWeight: 700, boxShadow: "0 1px 3px rgba(0,0,0,0.4)", pointerEvents: "none" }}>✓</div>
              )}
              {isDraggingThis && multiSelected && dragIdx === i && (
                <div style={{ position: "absolute", top: 5, right: 5, background: T.accent, color: T.brand, borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700, zIndex: 10, pointerEvents: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{selectedSet.size}</div>
              )}
              <div style={{ position: "relative", width: "100%", aspectRatio: `${A4_W} / ${A4_H}`, background: p.bg, overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, transform: `scale(${196 / p.width})`, transformOrigin: "left top", width: p.width, height: p.height, pointerEvents: "none" }}>
                  {p.elements.map((el) =>
                    el.type === "collage" ? (
                      <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height, background: el.background && el.background !== "transparent" ? el.background : undefined }}>
                        {el.collageCells.map((c, ci) => (
                          <div key={ci} style={{ position: "absolute", left: `${c.fx * 100}%`, top: `${c.fy * 100}%`, width: `${c.fw * 100}%`, height: `${c.fh * 100}%`, padding: (el.collageGap || 0) / 2, boxSizing: "border-box" }}>
                            <div style={{ width: "100%", height: "100%", overflow: "hidden", background: c.src ? "transparent" : "#0002" }}>
                              {c.src && <img src={c.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${c.posX}% ${c.posY}%`, transform: `scale(${c.scale})`, transformOrigin: "center", display: "block" }} />}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : el.type === "svg" ? (
                      <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height }} dangerouslySetInnerHTML={{ __html: el.svgMarkup }} />
                    ) : el.type === "image" ? (
                      <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height, overflow: "hidden", borderRadius: radiusToCss(el.borderRadius) }}>
                        <img src={resolveSrc(el, data, loopItem)} alt="" style={{ width: "100%", height: "100%", objectFit: (el.objectFit as any) || "cover", objectPosition: `${el.imagePosX ?? 50}% ${el.imagePosY ?? 50}%`, transform: (el.imageScale ?? 1) !== 1 ? `scale(${el.imageScale})` : undefined, transformOrigin: "center", display: "block" }} />
                      </div>
                    ) : el.type === "richflow" ? (
                      // Rich Text: render this frame's computed slice (its blocks) so the
                      // page's rich text shows in the sidebar instead of appearing blank.
                      // Wrapped in the canvas scope + .cols-2 so the template's own CSS
                      // (h1.megler-name, h3, p, columns) styles the preview like the page.
                      <div key={el.id} className={CANVAS_SCOPE} style={{ position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height, overflow: "hidden" }}>
                        <div className="cols-2" style={{ width: "100%", height: "100%", columnCount: el.colCount ?? 2, columnGap: el.colGap ?? 32, boxSizing: "border-box", columnFill: "auto", overflow: "hidden" }}>
                          {(richFlowSlices[el.id] ?? el.blocks ?? []).map((b, bi) =>
                            React.createElement(b.tag || "p", {
                              key: bi,
                              className: b.cls || undefined,
                              // Mirror the export/canvas rules so the thumbnail matches.
                              style: { marginBlock: 2, lineHeight: 1.4, ...blockStyleToReact(b.style), breakInside: /^h[1-6]$/i.test(b.tag || "p") ? "avoid" : "auto" },
                              dangerouslySetInnerHTML: { __html: b.html },
                            }),
                          )}
                        </div>
                      </div>
                    ) : (
                      <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: el.width, minHeight: el.height, fontFamily: el.fontFamily || undefined, fontSize: el.fontSize || undefined, fontWeight: (el.fontWeight as any) || undefined, color: el.color || undefined, background: el.background && el.background !== "transparent" ? el.background : undefined, textAlign: (el.textAlign as any) || undefined, lineHeight: el.lineHeight || undefined, padding: !isPaddingZero(el.padding) ? paddingToCss(el.padding) : undefined, boxSizing: "border-box", overflow: "hidden", wordBreak: "break-word" }}>
                        {resolvePreview(el, data, loopItem)}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div style={{ padding: "4px 6px", fontSize: 10, color: T.text, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isSelected ? T.accent : T.text, fontWeight: isSelected ? 600 : undefined }}>
                  {p.name}{p.loop && <span style={{ color: T.accent }}> ⟳</span>}{isHidden && <span style={{ color: T.textDim }}> · skjult</span>}
                </span>
                {canManagePages && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <IconBtn title="Flytt opp" onClick={() => onMove(i, -1)} disabled={i === 0}><ArrowUp size={12} /></IconBtn>
                    <IconBtn title="Flytt ned" onClick={() => onMove(i, 1)} disabled={i === pages.length - 1}><ArrowDown size={12} /></IconBtn>
                    <IconBtn title="Sett inn side etter" onClick={() => onInsertAfter(i)}><Plus size={12} /></IconBtn>
                    <IconBtn title="Dupliser" onClick={() => onDuplicate(i)}><Copy size={12} /></IconBtn>
                    <IconBtn title="Slett" onClick={() => onDelete(i)} color={T.danger}><Trash2 size={12} /></IconBtn>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PageList;
