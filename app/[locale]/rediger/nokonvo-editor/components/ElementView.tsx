"use client";

import React, { useEffect, useRef, CSSProperties } from "react";
import { RotateCw, Lock, AlertTriangle } from "lucide-react";

import { T, A4_W, A4_H, GRID, HANDLES, TEXT_HANDLES } from "../constants";
import type { HandleDir } from "../constants";
import type { CanvasElement, Guideline, DragState } from "../types";
import { isPaddingZero, paddingToCss, isRadiusZero, radiusToCss, elementOverflow } from "../utils/geometry";

// Amber used to flag content that overflows the page boundary.
const OVERFLOW_COLOR = "#f59e0b";
import { resolvePreview, resolveSrc } from "../utils/binding";
import { computeGuidelines, handlePos, handleCursor } from "../utils/guidelines";
import { usePermissions } from "../utils/permissions";
import RichFlowView from "./RichFlowView";

/* ═══════════════════════════════════════════════════════════════════════
   ELEMENT VIEW
   ═══════════════════════════════════════════════════════════════════════ */
interface ElementViewProps {
  el: CanvasElement;
  isSelected: boolean;
  zoom: number;
  data: Record<string, any>;
  loopItem: Record<string, any> | null;
  onSelect: (id: string) => void;
  onChange: (el: CanvasElement, live?: boolean) => void;
  onCommit: () => void;
  pointerEvents?: "auto" | "none";
  onDropToCell?: (elId: string, cellIndex: number, src: string) => void;
  onGuidelineChange?: (lines: Guideline[]) => void;
  pageWidth?: number;
  pageHeight?: number;
  /** 1-based position of this element's page in the document. Drives the live
   *  value of a `data-field="page-num"` badge so it tracks page reordering. */
  pageNumber?: number;
  /** The owning page's background colour. The page-number badge is a circle
   *  punched through the footer rule with the PAGE colour, so its background must
   *  always match the page (blue page → blue badge), even after a live bg change. */
  pageBg?: string;
}

function ElementView({
  el,
  isSelected,
  zoom,
  data,
  loopItem,
  onSelect,
  onChange,
  onCommit,
  pointerEvents,
  onDropToCell,
  onGuidelineChange,
  pageWidth = A4_W,
  pageHeight = A4_H,
  pageNumber,
  pageBg,
}: ElementViewProps) {
  // Regular users can select + edit content but cannot move / resize / rotate
  // elements. `canTransformElements` gates every canvas transform below.
  const { canTransformElements } = usePermissions();
  const dragRef = useRef<DragState | null>(null);
  const elRef = useRef(el);
  elRef.current = el;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;
  const onGuidelineRef = useRef(onGuidelineChange);
  onGuidelineRef.current = onGuidelineChange;
  const pageWRef = useRef(pageWidth);
  pageWRef.current = pageWidth;
  const pageHRef = useRef(pageHeight);
  pageHRef.current = pageHeight;

  // ── AUTO-HEIGHT for text ───────────────────────────────────────────────
  // Measures the real rendered height of the text content and writes it back to
  // the element so the box grows to fit. The `> 1` guard prevents an update loop
  // (once el.height matches the measured height, no further change fires).
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (elRef.current.type !== "text") return;
    const node = contentRef.current;
    if (!node) return;
    const measure = () => {
      const h = Math.ceil(node.scrollHeight);
      const cur = elRef.current;
      if (h > 0 && Math.abs(h - cur.height) > 1) {
        // live update keeps undo history clean and syncs height for export/reflow
        onChangeRef.current({ ...cur, height: h }, true);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  // Re-run when the text content or typography that affects wrapping changes.
  }, [
    el.text,
    el.bind,
    el.fontFamily,
    el.fontSize,
    el.fontWeight,
    el.lineHeight,
    el.letterSpacing,
    el.wordSpacing,
    el.whiteSpace,
    el.width,
    el.padding.t,
    el.padding.r,
    el.padding.b,
    el.padding.l,
  ]);

  const startDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Always select on mousedown so locked text can be edited in the inspector.
    onSelect(el.id);
    // Locked elements: selection is allowed, but dragging/moving is blocked.
    if (el.locked) return;

    if (el.type === "image" && e.altKey) {
      // Alt+drag pans the image CROP (imagePosX/Y), not the element's page
      // position — that's content editing, allowed for regular users too.
      e.preventDefault();
      dragRef.current = {
        mode: "pan",
        startX: e.clientX,
        startY: e.clientY,
        origX: el.x,
        origY: el.y,
        origW: el.width,
        origH: el.height,
        cx: 0,
        cy: 0,
        startAngle: 0,
        origPosX: el.imagePosX ?? 50,
        origPosY: el.imagePosY ?? 50,
      };
      document.body.style.cursor = "grabbing";
      return;
    }

    // Moving the element around the page is a layout action — admins only.
    if (!canTransformElements) return;

    dragRef.current = {
      mode: "move",
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
      origW: el.width,
      origH: el.height,
      cx: 0,
      cy: 0,
      startAngle: 0,
    };
    document.body.style.cursor = "grabbing";
  };

  const startResize = (handle: HandleDir) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Resizing is a layout action — admins only (handles are hidden otherwise).
    if (!canTransformElements) return;
    dragRef.current = {
      mode: "resize",
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
      origW: el.width,
      origH: el.height,
      cx: 0,
      cy: 0,
      startAngle: 0,
    };
  };

  const startRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Rotating is a layout action — admins only (handle is hidden otherwise).
    if (!canTransformElements) return;
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    dragRef.current = {
      mode: "rotate",
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
      origW: el.width,
      origH: el.height,
      cx,
      cy,
      startAngle:
        (Math.atan2(e.clientY - cy * zoom, e.clientX - cx * zoom) * 180) / Math.PI - el.rotation,
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const zoom = zoomRef.current;
      const el = elRef.current;
      // For text, width-only resizes are valid; vertical changes are ignored
      // because height is content-driven.
      const isText = el.type === "text";
      if (d.mode === "move") {
        const dx = (e.clientX - d.startX) / zoom;
        const dy = (e.clientY - d.startY) / zoom;
        if (e.shiftKey) {
          const nx = Math.round((d.origX + dx) / GRID) * GRID;
          const ny = Math.round((d.origY + dy) / GRID) * GRID;
          onGuidelineRef.current?.([]);
          onChangeRef.current({ ...el, x: nx, y: ny }, true);
        } else {
          const rawX = Math.round(d.origX + dx);
          const rawY = Math.round(d.origY + dy);
          const { snappedX, snappedY, guidelines } = computeGuidelines(
            rawX, rawY, el.width, el.height, pageWRef.current, pageHRef.current,
          );
          onGuidelineRef.current?.(guidelines);
          onChangeRef.current({ ...el, x: snappedX, y: snappedY }, true);
        }
      } else if (d.mode === "resize" && d.handle) {
        const dx = (e.clientX - d.startX) / zoom;
        const dy = (e.clientY - d.startY) / zoom;
        let { origX: x, origY: y, origW: w, origH: h } = d;
        if (d.handle.includes("e")) w = Math.max(20, d.origW + dx);
        if (d.handle.includes("w")) { w = Math.max(20, d.origW - dx); x = d.origX + (d.origW - w); }
        // Skip vertical handle math for text — its height follows content.
        if (!isText) {
          if (d.handle.includes("s")) h = Math.max(20, d.origH + dy);
          if (d.handle.includes("n")) { h = Math.max(20, d.origH - dy); y = d.origY + (d.origH - h); }
        }
        const rx = Math.round(x), ry = Math.round(y), rw = Math.round(w), rh = Math.round(h);
        const { guidelines } = computeGuidelines(rx, ry, rw, rh, pageWRef.current, pageHRef.current);
        onGuidelineRef.current?.(guidelines);
        if (isText) {
          // Only commit x/width; height re-measures via the ResizeObserver.
          onChangeRef.current({ ...el, x: rx, width: rw }, true);
        } else {
          onChangeRef.current({ ...el, x: rx, y: ry, width: rw, height: rh }, true);
        }
      } else if (d.mode === "pan") {
        const dx = (e.clientX - d.startX) / zoom;
        const dy = (e.clientY - d.startY) / zoom;
        // Divide the travel by the image scale: a zoomed-in image needs a smaller
        // pan-% per dragged pixel so the crop tracks the cursor instead of racing it.
        const s = el.imageScale ?? 1;
        const w = (d.origW || 1) * s;
        const h = (d.origH || 1) * s;
        const nx = Math.max(0, Math.min(100, (d.origPosX ?? 50) - (dx / w) * 100));
        const ny = Math.max(0, Math.min(100, (d.origPosY ?? 50) - (dy / h) * 100));
        onChangeRef.current({ ...el, imagePosX: Math.round(nx), imagePosY: Math.round(ny) }, true);
      } else if (d.mode === "rotate") {
        const angle =
          (Math.atan2(e.clientY - d.cy * zoom, e.clientX - d.cx * zoom) * 180) / Math.PI;
        onChangeRef.current({ ...el, rotation: Math.round(angle - d.startAngle) }, true);
      }
    };
    const onUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        document.body.style.cursor = "";
        onGuidelineRef.current?.([]);
        onCommitRef.current();
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Flag content that spills past the page boundary (clip + warn — the box is
  // not constrained, only highlighted so the user can fix it).
  const overflow = elementOverflow(el, pageWidth, pageHeight);

  const wrapperStyle: CSSProperties = {
    position: "absolute",
    left: el.x,
    top: el.y,
    width: el.width,
    // Text hugs its content height; other types keep their fixed height.
    height: el.type === "text" ? "auto" : (el.height || undefined),
    minHeight: el.type === "text" ? el.height || undefined : undefined,
    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
    opacity: isSelected ? 0.85 : el.opacity,
    // Default cursor when the element can't be moved (locked, or a regular user
    // who may edit content but not reposition) so it reads as selectable-only.
    cursor: el.locked || !canTransformElements ? "default" : "grab",
    userSelect: "none",
    boxSizing: "border-box",
    // Selection outline wins; otherwise show an amber dashed outline on overflow.
    outline: isSelected
      ? `4.5px solid ${el.locked ? T.accent : T.selection}`
      : overflow.any
        ? `2px dashed ${OVERFLOW_COLOR}`
        : "none",
    outlineOffset: 0,
    zIndex: isSelected ? 999 : el.zIndex,
    pointerEvents: pointerEvents,
  };

  const innerCommon: CSSProperties = {
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
    pointerEvents: "none",
  };
  if (el.background && el.background !== "transparent") innerCommon.background = el.background;
  // Page-number badge always fills with the PAGE colour (blue page → blue badge,
  // beige page → beige badge) so it reads as a disc punched through the footer
  // rule — and it follows a live page-background change immediately.
  if (el.dataField === "page-num" && pageBg) innerCommon.background = pageBg;
  if (!isPaddingZero(el.padding)) innerCommon.padding = paddingToCss(el.padding);
  if (!isRadiusZero(el.borderRadius)) innerCommon.borderRadius = radiusToCss(el.borderRadius);
  if (el.borderWidth > 0)
    innerCommon.border = `${el.borderWidth}px ${el.borderStyle || "solid"} ${el.borderColor || "#000"}`;
  if (el.boxShadow && el.boxShadow !== "none") innerCommon.boxShadow = el.boxShadow;

  let content: JSX.Element;

  if (el.type === "collage") {
    const gap = el.collageGap || 0;
    content = (
      <div style={{ ...innerCommon, position: "relative", pointerEvents: "auto" }}>
        {el.collageCells.map((c, idx) => (
          <div
            key={idx}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
            onDrop={(e) => {
              const src = e.dataTransfer.getData("imageSrc");
              if (!src) return;
              e.preventDefault();
              e.stopPropagation();
              onDropToCell?.(el.id, idx, src);
            }}
            style={{
              position: "absolute",
              left: `${c.fx * 100}%`,
              top: `${c.fy * 100}%`,
              width: `${c.fw * 100}%`,
              height: `${c.fh * 100}%`,
              padding: gap / 2,
              boxSizing: "border-box",
            }}
          >
            <div style={{
              width: "100%", height: "100%", overflow: "hidden", position: "relative",
              background: c.src ? "transparent" : T.panelHi,
              border: c.src ? "none" : `1px dashed ${T.borderHi}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {c.src ? (
                <img
                  src={c.src}
                  alt=""
                  draggable={false}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    objectPosition: `${c.posX}% ${c.posY}%`,
                    transform: `scale(${c.scale})`, transformOrigin: "center",
                    display: "block", pointerEvents: "none",
                  }}
                />
              ) : (
                <span style={{
                  color: T.textDim, fontSize: 11, fontFamily: "ui-monospace, monospace",
                  pointerEvents: "none", textAlign: "center", padding: 4,
                }}>
                  Slipp bilde her
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  } else if (el.type === "richflow") {
    content = <RichFlowView el={el} />;
  } else if (el.type === "svg") {
    content = (
      <div
        style={{ ...innerCommon, display: "flex", alignItems: "center", justifyContent: "center" }}
        dangerouslySetInnerHTML={{ __html: el.svgMarkup }}
      />
    );
  } else if (el.type === "image") {
    const scale = el.imageScale ?? 1;
    const px = el.imagePosX ?? 50;
    const py = el.imagePosY ?? 50;
    content = (
      <div style={{ ...innerCommon, position: "relative" }}>
        <img
          src={resolveSrc(el, data, loopItem)}
          alt=""
          draggable={false}
          style={{
            width: "100%", height: "100%",
            objectFit: (el.objectFit as any) || undefined,
            objectPosition: `${px}% ${py}%`,
            transform: scale !== 1 ? `scale(${scale})` : undefined,
            // Anchor the zoom at the pan point (not the centre) so Posisjon X/Y
            // actually move the zoomed-in view. With a fixed centre origin the
            // zoom always re-centred and the pan controls did nothing once scaled.
            transformOrigin: `${px}% ${py}%`,
            filter: el.imageFilter && el.imageFilter !== "none" ? el.imageFilter : undefined,
            display: "block", pointerEvents: "none",
          }}
        />
      </div>
    );
  } else {
    const ts: CSSProperties = {};
    if (el.fontFamily) ts.fontFamily = el.fontFamily;
    if (el.fontSize > 0) ts.fontSize = el.fontSize;
    if (el.fontWeight && el.fontWeight !== "normal" && el.fontWeight !== "400") ts.fontWeight = el.fontWeight as any;
    if (el.fontStyle && el.fontStyle !== "normal") ts.fontStyle = el.fontStyle as any;
    if (el.color) ts.color = el.color;
    if (el.textAlign) ts.textAlign = el.textAlign as any;
    if (el.lineHeight && el.lineHeight !== "normal") ts.lineHeight = el.lineHeight;
    if (el.letterSpacing && el.letterSpacing !== "normal") ts.letterSpacing = el.letterSpacing;
    if (el.wordSpacing && el.wordSpacing !== "normal") ts.wordSpacing = el.wordSpacing;
    if (el.textTransform && el.textTransform !== "none") ts.textTransform = el.textTransform as any;
    if (el.textDecoration && el.textDecoration !== "none") ts.textDecoration = el.textDecoration;
    if (el.whiteSpace && el.whiteSpace !== "normal") ts.whiteSpace = el.whiteSpace as any;
    if (el.textShadow && el.textShadow !== "none") ts.textShadow = el.textShadow;
    content = (
      <div
        ref={contentRef}
        style={{
          ...innerCommon,
          ...ts,
          // ── AUTO-HEIGHT: let the text box size to its content ──────────
          height: "auto",
          overflow: "visible",
          wordBreak: "break-word",
        }}
      >
        {el.dataField === "page-num"
          ? (pageNumber != null ? String(pageNumber) : "")
          : resolvePreview(el, data, loopItem)}
      </div>
    );
  }

  // Pick the handle set: text uses width/diagonal handles only.
  const activeHandles = el.type === "text" ? TEXT_HANDLES : HANDLES;

  return (
    <div
      style={wrapperStyle}
      onMouseDown={startDrag}
      onClick={(e) => { e.stopPropagation(); onSelect(el.id); }}
    >
      {content}
      {/* Overflow warning — element extends past the page boundary */}
      {/* {overflow.any && (
        <div style={{
          position: "absolute", top: -16, right: 0, fontSize: 9, color: "#1f2937",
          background: OVERFLOW_COLOR, padding: "1px 5px", borderRadius: 2,
          fontFamily: "ui-monospace, monospace", letterSpacing: 0.3, whiteSpace: "nowrap",
          pointerEvents: "none", display: "flex", alignItems: "center", gap: 3, zIndex: 1,
        }}>
          <AlertTriangle size={10} /> Utenfor siden
        </div>
      )} */}
      {el.bind && (
        <div style={{
          position: "absolute", top: -16, left: 0, fontSize: 9, color: T.accent,
          background: T.brand, padding: "1px 5px", borderRadius: 2,
          fontFamily: "ui-monospace, monospace", letterSpacing: 0.3, whiteSpace: "nowrap",
          pointerEvents: "none", opacity: isSelected ? 1 : 0, transition: "opacity 0.1s",
        }}>
          {el.bind}
        </div>
      )}
      {/* Lock badge — shown on locked+selected elements so user knows why no handles appear */}
      {isSelected && el.locked && (
        <div style={{
          position: "absolute", top: -31, right: -4, fontSize: 14, color: T.brand,
          background: T.accent, padding: "2px 6px", borderRadius: 2,
          fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap",
          pointerEvents: "none", display: "flex", alignItems: "center", gap: 3,
        }}>
          <Lock size={12} /> Låst
        </div>
      )}
      {/* Resize / rotate handles — only for UNLOCKED selected elements, and
          only for users allowed to transform (admins). */}
      {isSelected && !el.locked && canTransformElements && (
        <>
          {activeHandles.map((h) => (
            <div
              key={h}
              onMouseDown={startResize(h)}
              style={{
                position: "absolute",
                ...handlePos(h),
                width: 8 / zoom,
                height: 8 / zoom,
                background: "#fff",
                border: `1px solid ${T.selection}`,
                cursor: handleCursor(h),
                zIndex: 10,
              }}
            />
          ))}
          <div
            onMouseDown={startRotate}
            style={{
              position: "absolute", left: "50%", top: -28 / zoom,
              transform: "translateX(-50%)", width: 20 / zoom, height: 20 / zoom,
              borderRadius: "50%", background: T.accent, border: `1px solid ${T.brand}`,
              cursor: "grab", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <RotateCw size={12 / zoom} style={{ color: T.brand, pointerEvents: "none" }} />
          </div>
        </>
      )}
    </div>
  );
}

export default ElementView;
