/**
 * PropertyTemplateEditor.tsx
 * Production-grade visual editor for backend-driven HTML/EJS templates.
 * Stack: React (hooks) + react-konva + Zustand (reducer) + html2canvas
 *
 * - Full CSS support via hidden DOM rendering + getComputedStyle
 * - Multi-page A4 canvas editor (react‑konva)
 * - Sidebar with drag‑&‑drop images, split large images into multiple pages
 * - Undo/Redo (history reducer)
 * - Export JSON, HTML, PNG (html2canvas)
 */

"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useReducer,
  ChangeEvent,
} from "react";
import {
  Stage,
  Layer,
  Rect,
  Image as KonvaImage,
  Text as KonvaText,
  Transformer,
  Line,
} from "react-konva";
import useImage from "use-image";
import { KonvaEventObject } from "konva/lib/Node";
import html2canvas from "html2canvas";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const A4_W = 794; // px at 96dpi
const A4_H = 1123;
const SNAP = 10;
const COLORS = {
  bg: "#18344e",
  accent: "#e2cf9e",
  dark: "#0d1f2d",
  light: "#f5f0e8",
  border: "#2a4a6a",
  sidebar: "#162a3a",
  toolbar: "#0f2030",
  text: "#e8dcc8",
  muted: "#7a9ab5",
  danger: "#c0392b",
};

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface BaseElement {
  id: string;
  type: "image" | "text";
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  locked: boolean;
}

interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  width: number;
  height: number;
  crop: { x: number; y: number; width: number; height: number } | null;
}

interface TextElement extends BaseElement {
  type: "text";
  text: string;
  width: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  padding?: number;
  fontStyle: "normal" | "italic";
  fontWeight: "normal" | "bold";
  align: "left" | "center" | "right";
}

type CanvasElement = ImageElement | TextElement;

interface Page {
  id: string;
  bgColor: string;
  title: string;
  elements: CanvasElement[];
  domId?: string;
}

interface EditorModel {
  pages: Page[];
  globalStyles: string; // concatenated CSS from <style> tags
}

interface HistoryState {
  past: EditorModel[];
  present: EditorModel;
  future: EditorModel[];
}

type HistoryAction =
  | { type: "PUSH"; payload: EditorModel }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET"; payload: EditorModel };

interface UploadedImage {
  src: string;
  label: string;
}

// ─── HTML → JSON PARSER (async, full CSS via getComputedStyle) ──────────────
export async function parseHtmlToEditorModel(
  htmlString: string,
): Promise<EditorModel> {
  // Create hidden container
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = `${A4_W}px`;
  container.style.visibility = "hidden";
  document.body.appendChild(container);

  container.innerHTML = htmlString;

  // Wait for all images to load
  const images = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) resolve();
          else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        }),
    ),
  );

  // Give browser a moment to finish layout
  await new Promise((resolve) => setTimeout(resolve, 50));

  const model = extractModelFromRenderedDOM(container);
  document.body.removeChild(container);
  return model;
}

function extractModelFromRenderedDOM(container: HTMLElement): EditorModel {
  // Extract all <style> content
  const styleNodes = container.querySelectorAll("style");
  let globalStyles = "";
  styleNodes.forEach((style) => {
    globalStyles += style.textContent + "\n";
  });

  // Identify page containers (elements with id starting with "page_")
  let pageContainers: Element[] = [];
  const pageEls = container.querySelectorAll('[id^="page_"]');
  if (pageEls.length === 0) {
    pageContainers = [container];
  } else {
    pageContainers = Array.from(pageEls);
  }

  const pages: Page[] = pageContainers.map((pageEl, idx) => {
    const computedBg = window.getComputedStyle(
      pageEl as HTMLElement,
    ).backgroundColor;
    const bgColor =
      computedBg !== "rgba(0, 0, 0, 0)" ? computedBg : COLORS.accent;

    const elements: CanvasElement[] = [];
    let elId = 0;

    // Process images
    pageEl.querySelectorAll("img").forEach((img) => {
      const rect = img.getBoundingClientRect();
      const containerRect = pageEl.getBoundingClientRect();
      const computed = window.getComputedStyle(img);
      let rotation = 0;
      const transform = computed.transform;
      if (transform && transform !== "none") {
        const match = transform.match(/rotate\(([\d.]+)deg\)/);
        if (match) rotation = parseFloat(match[1]);
      }

      elements.push({
        id: `page${idx}-img-${elId++}`,
        type: "image",
        src: img.src || img.getAttribute("src") || "",
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
        rotation,
        opacity: parseFloat(computed.opacity) || 1,
        crop: null,
        locked: false,
      });
    });

    // Process text elements
    const textSelectors = ["h1", "h2", "h3", "h4", "p", "span", "div", "li"];
    pageEl.querySelectorAll(textSelectors.join(",")).forEach((el) => {
      const text = el.textContent?.trim();
      if (!text) return;
      if (el.closest("img")) return;
      // Skip parent containers that already have text children
      if (
        el.children.length > 0 &&
        Array.from(el.children).some((child) =>
          textSelectors.includes(child.tagName.toLowerCase()),
        )
      ) {
        return;
      }

      const rect = el.getBoundingClientRect();
      const containerRect = pageEl.getBoundingClientRect();
      const computed = window.getComputedStyle(el);

      let fontFamily = computed.fontFamily.split(",")[0].replace(/['"]/g, "");
      if (fontFamily === "serif" || fontFamily === "sans-serif")
        fontFamily = "Helvetica";

      elements.push({
        id: `page${idx}-text-${elId++}`,
        type: "text",
        text: text.slice(0, 200),
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        fontSize: parseFloat(computed.fontSize),
        fontFamily,
        fill: computed.color,
        fontStyle: computed.fontStyle === "italic" ? "italic" : "normal",
        fontWeight: computed.fontWeight === "bold" ? "bold" : "normal",
        align: (computed.textAlign as "left" | "center" | "right") || "left",
        rotation: 0,
        opacity: parseFloat(computed.opacity) || 1,
        locked: false,
      });
    });

    return {
      id: `page-${idx}`,
      domId: pageEl.id,
      elements,
      bgColor,
      title: pageEl.id || `Page ${idx + 1}`,
    };
  });

  return { pages, globalStyles };
}

// ─── JSON → HTML RENDERER (full page) ────────────────────────────────────────
export function renderEditorModelToHtml(model: EditorModel): string {
  const pagesHtml = model.pages
    .map((page) => {
      const elementsHtml = page.elements
        .map((el) => {
          if (el.type === "image") {
            return `<div style="position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;overflow:hidden;">
  <img src="${el.src}" style="width:100%;height:100%;object-fit:cover;transform:rotate(${el.rotation || 0}deg);opacity:${el.opacity};" />
</div>`;
          }
          if (el.type === "text") {
            return `<div style="position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;font-size:${el.fontSize}px;color:${el.fill};font-weight:${el.fontWeight};font-style:${el.fontStyle};text-align:${el.align};transform:rotate(${el.rotation || 0}deg);opacity:${el.opacity};">${el.text}</div>`;
          }
          return "";
        })
        .join("\n");
      return `<div class="page" style="position:relative;width:${A4_W}px;height:${A4_H}px;background:${page.bgColor};overflow:hidden;margin-bottom:20px;">
${elementsHtml}
</div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Property Template</title>
<style>
  /* Global styles from original template */
  ${model.globalStyles}
  /* Additional layout rules */
  body { margin: 0; font-family: Helvetica, sans-serif; }
  .page { box-sizing: border-box; }
  @media print { .page { page-break-after: always; margin: 0 !important; } }
</style>
</head>
<body>
${pagesHtml}
</body>
</html>`;
}

// ─── SINGLE PAGE HTML GENERATOR (for html2canvas) ────────────────────────────
function generateSinglePageHtml(page: Page, globalStyles = ""): string {
  const elementsHtml = page.elements
    .map((el) => {
      if (el.type === "image") {
        if (el.crop) {
          const crop = el.crop;
          const scaleX = el.width / crop.width;
          const scaleY = el.height / crop.height;
          return `<div style="position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;overflow:hidden;">
  <img src="${el.src}" style="position:absolute;left:-${crop.x * scaleX}px;top:-${crop.y * scaleY}px;width:${el.width * (1 / scaleX)}px;height:${el.height * (1 / scaleY)}px;transform:rotate(${el.rotation}deg);opacity:${el.opacity};" />
</div>`;
        } else {
          return `<div style="position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;overflow:hidden;">
  <img src="${el.src}" style="width:100%;height:100%;object-fit:cover;transform:rotate(${el.rotation}deg);opacity:${el.opacity};" />
</div>`;
        }
      }
      if (el.type === "text") {
        return `<div style="position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;font-size:${el.fontSize}px;color:${el.fill};font-family:${el.fontFamily || "Helvetica"};font-weight:${el.fontWeight};font-style:${el.fontStyle};text-align:${el.align};transform:rotate(${el.rotation}deg);opacity:${el.opacity};white-space:pre-wrap;word-wrap:break-word;">${el.text}</div>`;
      }
      return "";
    })
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Page Export</title>
<style>
  /* Global styles from template */
  ${globalStyles}
  /* Page specific overrides */
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: transparent; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: Helvetica, Arial, sans-serif; }
  .export-page { position: relative; width: ${A4_W}px; height: ${A4_H}px; background: ${page.bgColor}; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
</style>
</head>
<body>
<div class="export-page">
${elementsHtml}
</div>
</body>
</html>`;
}

// ─── IMAGE SPLIT ALGORITHM ───────────────────────────────────────────────────
export function splitImage(
  imageSrc: string,
  direction: "vertical" | "horizontal" = "vertical",
  pageWidth: number = A4_W,
  pageHeight: number = A4_H,
): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      const segments: string[] = [];
      if (direction === "vertical") {
        const slices = Math.ceil(h / pageHeight);
        for (let i = 0; i < slices; i++) {
          const canvas = document.createElement("canvas");
          canvas.width = pageWidth;
          canvas.height = pageHeight;
          const ctx = canvas.getContext("2d")!;
          const srcY = i * pageHeight * (h / (slices * pageHeight));
          const srcH = h / slices;
          ctx.drawImage(img, 0, srcY, w, srcH, 0, 0, pageWidth, pageHeight);
          segments.push(canvas.toDataURL("image/jpeg", 0.92));
        }
      } else {
        const slices = Math.ceil(w / pageWidth);
        for (let i = 0; i < slices; i++) {
          const canvas = document.createElement("canvas");
          canvas.width = pageWidth;
          canvas.height = pageHeight;
          const ctx = canvas.getContext("2d")!;
          const srcX = i * pageWidth * (w / (slices * pageWidth));
          const srcW = w / slices;
          ctx.drawImage(img, srcX, 0, srcW, h, 0, 0, pageWidth, pageHeight);
          segments.push(canvas.toDataURL("image/jpeg", 0.92));
        }
      }
      resolve(segments);
    };
    img.onerror = () => resolve([imageSrc]);
    img.src = imageSrc;
  });
}

// ─── UNDO/REDO REDUCER ────────────────────────────────────────────────────────
const MAX_HISTORY = 80;

function historyReducer(
  state: HistoryState,
  action: HistoryAction,
): HistoryState {
  switch (action.type) {
    case "PUSH": {
      const past = [...state.past, state.present].slice(-MAX_HISTORY);
      return { past, present: action.payload, future: [] };
    }
    case "UNDO": {
      if (!state.past.length) return state;
      const past = state.past.slice(0, -1);
      const present = state.past[state.past.length - 1];
      return {
        past,
        present,
        future: [state.present, ...state.future].slice(0, MAX_HISTORY),
      };
    }
    case "REDO": {
      if (!state.future.length) return state;
      const future = state.future.slice(1);
      const present = state.future[0];
      return {
        past: [...state.past, state.present].slice(-MAX_HISTORY),
        present,
        future,
      };
    }
    case "RESET":
      return { past: [], present: action.payload, future: [] };
    default:
      return state;
  }
}

// ─── INITIAL DEMO STATE ───────────────────────────────────────────────────────
function makeInitialState(): EditorModel {
  return {
    pages: [
      {
        id: "page-0",
        bgColor: COLORS.bg,
        title: "Cover Page",
        elements: [
          {
            id: "el-title",
            type: "text",
            text: "Velkommen til din nye bolig",
            x: 80,
            y: 200,
            width: 634,
            padding: 20,
            fontSize: 42,
            fontFamily: "Helvetica",
            fill: COLORS.accent,
            fontStyle: "normal",
            fontWeight: "bold",
            align: "center",
            rotation: 0,
            opacity: 1,
            locked: false,
          },
          {
            id: "el-subtitle",
            type: "text",
            text: "Oslo, Norway",
            x: 80,
            y: 290,
            width: 634,
            fontSize: 22,
            fontFamily: "Helvetica",
            fill: "#e2cf9e",
            fontStyle: "normal",
            fontWeight: "normal",
            align: "center",
            rotation: 0,
            opacity: 1,
            locked: false,
          },
        ],
      },
      {
        id: "page-1",
        bgColor: COLORS.accent,
        title: "Property Photos",
        elements: [],
      },
    ],
    globalStyles: "",
  };
}

// ─── KONVA IMAGE ELEMENT ──────────────────────────────────────────────────────
interface KonvaImageElProps {
  el: ImageElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (el: ImageElement) => void;
  stageRef: React.RefObject<any>;
}

function KonvaImageEl({
  el,
  isSelected,
  onSelect,
  onChange,
  stageRef,
}: KonvaImageElProps) {
  const [img] = useImage(el.src, "anonymous");
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      let x = snap(e.target.x());
      let y = snap(e.target.y());
      onChange({ ...el, x, y });
    },
    [el, onChange],
  );

  const handleTransformEnd = useCallback(() => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      ...el,
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      width: Math.round(Math.max(20, node.width() * scaleX)),
      height: Math.round(Math.max(20, node.height() * scaleY)),
      rotation: Math.round(node.rotation()),
    });
  }, [el, onChange]);

  if (!img && el.src) return null;

  function getCenterCrop(
  image: HTMLImageElement,
  size: { width: number; height: number }
) {
  const ar = size.width / size.height;
  const ir = image.width / image.height;

  const cropWidth = ar >= ir ? image.width : image.height * ar;
  const cropHeight = ar >= ir ? image.width / ar : image.height;

  return {
    cropX: (image.width - cropWidth) / 2,
    cropY: (image.height - cropHeight) / 2,
    cropWidth,
    cropHeight,
  };
}
  let clipProps = {};
  if (img) {
    const crop = getCenterCrop(img, {
      width: el.width,
      height: el.height,
    });

    clipProps = {
      clipX: crop.cropX,
      clipY: crop.cropY,
      clipWidth: crop.cropWidth,
      clipHeight: crop.cropHeight,
    };
  }

  // const clipProps = el.crop
  //   ? {
  //       clipX: el.crop.x,
  //       clipY: el.crop.y,
  //       clipWidth: el.crop.width,
  //       clipHeight: el.crop.height,
  //     }
  //   : {};

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={img}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        rotation={el.rotation}
        opacity={el.opacity}
        draggable={!el.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        {...clipProps}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          keepRatio={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

// ─── KONVA TEXT ELEMENT ───────────────────────────────────────────────────────
interface KonvaTextElProps {
  el: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (el: TextElement) => void;
  onDblClick: () => void;
}

function KonvaTextEl({
  el,
  isSelected,
  onSelect,
  onChange,
  onDblClick,
}: KonvaTextElProps) {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      onChange({ ...el, x: snap(e.target.x()), y: snap(e.target.y()) });
    },
    [el, onChange],
  );

  const handleTransformEnd = useCallback(() => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      ...el,
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      width: Math.round(Math.max(40, node.width() * scaleX)),
      rotation: Math.round(node.rotation()),
    });
  }, [el, onChange]);

  return (
    <>
      <KonvaText
        ref={shapeRef}
        x={el.x}
        y={el.y}
        width={el.width}
        text={el.text}
        padding={el.padding}
        fontSize={el.fontSize}
        fontFamily={el.fontFamily}
        fill={el.fill}
        fontStyle={
          el.fontStyle === "italic"
            ? "italic"
            : el.fontWeight === "bold"
              ? "bold"
              : "normal"
        }
        align={el.align}
        rotation={el.rotation}
        opacity={el.opacity}
        draggable={!el.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={onDblClick}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        wrap="word"
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={["middle-left", "middle-right"]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 40) return oldBox;
            return { ...newBox, height: oldBox.height };
          }}
        />
      )}
    </>
  );
}

function snap(v: number): number {
  return Math.round(v / SNAP) * SNAP;
}

// ─── CANVAS STAGE FOR ONE PAGE ────────────────────────────────────────────────
interface CanvasPageProps {
  page: Page;
  selectedId: string | null;
  zoom: number;
  onSelectEl: (id: string | null) => void;
  onChangeEl: (el: CanvasElement) => void;
  onDropImage: (src: string, x: number, y: number) => void;
  onTextDblClick: (el: TextElement) => void;
  showGrid: boolean;
}

function CanvasPage({
  page,
  selectedId,
  zoom,
  onSelectEl,
  onChangeEl,
  onDropImage,
  onTextDblClick,
  showGrid,
}: CanvasPageProps) {
  const stageRef = useRef<any>(null);
  const w = A4_W * zoom;
  const h = A4_H * zoom;

  const handleStageDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleStageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!stageRef.current) return;
    stageRef.current.setPointersPositions(e);
    const pos = stageRef.current.getPointerPosition();
    const src = e.dataTransfer.getData("imageSrc");
    if (src && pos) {
      onDropImage(src, Math.round(pos.x / zoom), Math.round(pos.y / zoom));
    }
  };

  const gridLines: JSX.Element[] = [];
  if (showGrid) {
    for (let x = 0; x <= A4_W; x += SNAP * 5) {
      gridLines.push(
        <Line
          key={`v${x}`}
          points={[x, 0, x, A4_H]}
          stroke="#ffffff18"
          strokeWidth={0.5}
        />,
      );
    }
    for (let y = 0; y <= A4_H; y += SNAP * 5) {
      gridLines.push(
        <Line
          key={`h${y}`}
          points={[0, y, A4_W, y]}
          stroke="#ffffff18"
          strokeWidth={0.5}
        />,
      );
    }
  }

  return (
    <div
      style={{
        width: w,
        height: h,
        boxShadow: "0 8px 32px #00000088",
        flexShrink: 0,
      }}
      onDragOver={handleStageDragOver}
      onDrop={handleStageDrop}
    >
      <Stage
        ref={stageRef}
        width={w}
        height={h}
        scaleX={zoom}
        scaleY={zoom}
        onClick={(e) => {
          if (e.target === e.target.getStage()) onSelectEl(null);
        }}
      >
        <Layer>
          <Rect x={0} y={0} width={A4_W} height={A4_H} fill={page.bgColor} />
          {showGrid && gridLines}
          {page.elements.map((el) => {
            const commonProps = {
              key: el.id,
              isSelected: selectedId === el.id,
              onSelect: () => onSelectEl(el.id),
              onChange: onChangeEl,
            };
            if (el.type === "image") {
              return (
                <KonvaImageEl {...commonProps} el={el} stageRef={stageRef} />
              );
            }
            if (el.type === "text") {
              return (
                <KonvaTextEl
                  {...commonProps}
                  el={el}
                  onDblClick={() => onTextDblClick(el)}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
}

// ─── TEXT EDITOR MODAL ────────────────────────────────────────────────────────
interface TextEditorModalProps {
  el: TextElement;
  onClose: () => void;
  onSave: (el: TextElement) => void;
}

function TextEditorModal({ el, onClose, onSave }: TextEditorModalProps) {
  const [text, setText] = useState(el.text);
  const [fontSize, setFontSize] = useState(el.fontSize);
  const [fill, setFill] = useState(el.fill);
  const [fontWeight, setFontWeight] = useState<"normal" | "bold">(
    el.fontWeight || "normal",
  );
  const [fontStyle, setFontStyle] = useState<"normal" | "italic">(
    el.fontStyle || "normal",
  );
  const [align, setAlign] = useState<"left" | "center" | "right">(
    el.align || "left",
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000aa",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: COLORS.dark,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          padding: 28,
          width: 520,
          maxWidth: "95vw",
        }}
      >
        <h3 style={{ color: COLORS.accent, margin: "0 0 16px", fontSize: 18 }}>
          Edit Text
        </h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: "100%",
            minHeight: 100,
            background: "#1a3448",
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
            borderRadius: 6,
            padding: 10,
            fontSize: 15,
            fontFamily: "Helvetica",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        <div
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}
        >
          <label
            style={{
              color: COLORS.muted,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Size
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(+e.target.value)}
              min={8}
              max={120}
              style={{
                width: 60,
                background: "#1a3448",
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
                borderRadius: 4,
                padding: "3px 6px",
              }}
            />
          </label>
          <label
            style={{
              color: COLORS.muted,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Color
            <input
              type="color"
              value={fill}
              onChange={(e) => setFill(e.target.value)}
              style={{
                width: 36,
                height: 28,
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            />
          </label>
          <label
            style={{
              color: COLORS.muted,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <input
              type="checkbox"
              checked={fontWeight === "bold"}
              onChange={(e) =>
                setFontWeight(e.target.checked ? "bold" : "normal")
              }
            />
            Bold
          </label>
          <label
            style={{
              color: COLORS.muted,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <input
              type="checkbox"
              checked={fontStyle === "italic"}
              onChange={(e) =>
                setFontStyle(e.target.checked ? "italic" : "normal")
              }
            />
            Italic
          </label>
          <select
            value={align}
            onChange={(e) =>
              setAlign(e.target.value as "left" | "center" | "right")
            }
            style={{
              background: "#1a3448",
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
              borderRadius: 4,
              padding: "3px 6px",
              fontSize: 13,
            }}
          >
            {["left", "center", "right"].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 20,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              background: "transparent",
              border: `1px solid ${COLORS.border}`,
              color: COLORS.muted,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                ...el,
                text,
                fontSize,
                fill,
                fontWeight,
                fontStyle,
                align,
              })
            }
            style={{
              padding: "8px 18px",
              background: COLORS.accent,
              border: "none",
              color: COLORS.bg,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
interface SidebarProps {
  apiImages: UploadedImage[];
  uploadedImages: UploadedImage[];
  onUpload: (src: string, name: string) => void;
  onSplitImage: (src: string, direction: "vertical" | "horizontal") => void;
}

function Sidebar({
  apiImages,
  uploadedImages,
  onUpload,
  onSplitImage,
}: SidebarProps) {
  const allImages = [...apiImages, ...uploadedImages];
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const src = await fileToDataUrl(file);
      onUpload(src, file.name);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleBodyDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    for (const file of files) {
      const src = await fileToDataUrl(file);
      onUpload(src, file.name);
    }
  };

  return (
    <div
      style={{
        width: 220,
        background: COLORS.sidebar,
        borderRight: `1px solid ${COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flexShrink: 0,
      }}
      onDragOver={handleDragOver}
      onDrop={handleBodyDrop}
    >
      <div
        style={{
          padding: "14px 12px 8px",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{
            color: COLORS.accent,
            fontSize: 11,
            fontWeight: "bold",
            letterSpacing: 1,
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          Images
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            width: "100%",
            padding: "7px 0",
            background: COLORS.accent,
            color: COLORS.bg,
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 13,
          }}
        >
          + Upload Image
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {allImages.length === 0 && (
          <div
            style={{
              color: COLORS.muted,
              fontSize: 12,
              textAlign: "center",
              marginTop: 24,
              lineHeight: 1.6,
            }}
          >
            Upload images or
            <br />
            drop them here
          </div>
        )}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}
        >
          {allImages.map((img, i) => (
            <SidebarImage
              key={i}
              src={img.src}
              label={img.label}
              onSplitImage={onSplitImage}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface SidebarImageProps {
  src: string;
  label: string;
  onSplitImage: (src: string, direction: "vertical" | "horizontal") => void;
}

function SidebarImage({ src, label, onSplitImage }: SidebarImageProps) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <div
        draggable
        onDragStart={(e) => e.dataTransfer.setData("imageSrc", src)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          aspectRatio: "4/3",
          borderRadius: 6,
          overflow: "hidden",
          cursor: "grab",
          border: hover
            ? `1.5px solid ${COLORS.accent}`
            : `1px solid ${COLORS.border}`,
          transition: "border-color 0.15s",
          background: "#0d1f2d",
          position: "relative",
        }}
        title={label || "Drag to canvas"}
      >
        <img
          src={src}
          alt={label}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        {hover && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#00000066",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 9, color: "#fff", fontWeight: "bold" }}>
              DRAG
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              style={{
                fontSize: 9,
                padding: "2px 6px",
                background: COLORS.accent,
                color: COLORS.bg,
                border: "none",
                borderRadius: 3,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              SPLIT
            </button>
          </div>
        )}
      </div>
      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 100,
            background: COLORS.dark,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 6,
            padding: "6px 0",
            minWidth: 130,
          }}
        >
          {(["vertical", "horizontal"] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => {
                onSplitImage(src, dir);
                setMenuOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "6px 12px",
                background: "transparent",
                border: "none",
                color: COLORS.text,
                cursor: "pointer",
                textAlign: "left",
                fontSize: 12,
              }}
            >
              Split {dir}
            </button>
          ))}
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              display: "block",
              width: "100%",
              padding: "6px 12px",
              background: "transparent",
              border: "none",
              color: COLORS.muted,
              cursor: "pointer",
              textAlign: "left",
              fontSize: 12,
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PAGE MANAGER ─────────────────────────────────────────────────────────────
interface PageManagerProps {
  pages: Page[];
  currentPageIdx: number;
  onSelect: (idx: number) => void;
  onAdd: () => void;
  onDelete: (idx: number) => void;
  onMove: (idx: number, dir: -1 | 1) => void;
}

function PageManager({
  pages,
  currentPageIdx,
  onSelect,
  onAdd,
  onDelete,
  onMove,
}: PageManagerProps) {
  return (
    <div
      style={{
        width: 160,
        background: COLORS.toolbar,
        borderLeft: `1px solid ${COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "12px 10px 6px",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: COLORS.accent,
            fontSize: 11,
            fontWeight: "bold",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Pages
        </span>
        <button
          onClick={onAdd}
          title="Add page"
          style={{
            background: COLORS.accent,
            color: COLORS.bg,
            border: "none",
            borderRadius: 4,
            width: 22,
            height: 22,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 16,
            lineHeight: "22px",
            textAlign: "center",
            padding: 0,
          }}
        >
          +
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 6px" }}>
        {pages.map((page, idx) => (
          <div
            key={page.id}
            style={{
              marginBottom: 6,
              borderRadius: 6,
              border:
                idx === currentPageIdx
                  ? `1.5px solid ${COLORS.accent}`
                  : `1px solid ${COLORS.border}`,
              background: idx === currentPageIdx ? "#1c3d55" : "#0f2030",
              cursor: "pointer",
              overflow: "hidden",
            }}
            onClick={() => onSelect(idx)}
          >
            <div
              style={{
                height: 72,
                background: page.bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: page.bgColor === COLORS.bg ? COLORS.accent : COLORS.bg,
                  opacity: 0.6,
                }}
              >
                {idx + 1}
              </span>
            </div>
            <div
              style={{
                padding: "4px 6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  color: COLORS.text,
                  fontSize: 10,
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {page.title || `Page ${idx + 1}`}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(idx);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: COLORS.danger,
                  cursor: "pointer",
                  fontSize: 12,
                  padding: "0 2px",
                  lineHeight: 1,
                }}
                title="Delete page"
              >
                ✕
              </button>
            </div>
            <div style={{ display: "flex", padding: "0 4px 4px", gap: 3 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(idx, -1);
                }}
                disabled={idx === 0}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.muted,
                  cursor: idx === 0 ? "default" : "pointer",
                  borderRadius: 3,
                  fontSize: 10,
                  padding: "1px 0",
                }}
              >
                ↑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(idx, 1);
                }}
                disabled={idx === pages.length - 1}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.muted,
                  cursor: idx === pages.length - 1 ? "default" : "pointer",
                  borderRadius: 3,
                  fontSize: 10,
                  padding: "1px 0",
                }}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TOOLBAR ──────────────────────────────────────────────────────────────────
interface ToolbarProps {
  zoom: number;
  onZoom: (delta: number, absolute?: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onAddText: () => void;
  onExportJson: () => void;
  onExportHtml: () => void;
  onExportPng: () => Promise<void>;
  showGrid: boolean;
  onToggleGrid: () => void;
  onLoadTemplate: (html: string) => void;
  selectedEl: CanvasElement | null;
  onUpdateEl: (el: CanvasElement) => void;
  onDeleteEl: () => void;
  onLockEl: (locked: boolean) => void;
}

function Toolbar({
  zoom,
  onZoom,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onAddText,
  onExportJson,
  onExportHtml,
  onExportPng,
  showGrid,
  onToggleGrid,
  onLoadTemplate,
  selectedEl,
  onUpdateEl,
  onDeleteEl,
  onLockEl,
}: ToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPngClick = async () => {
    setIsExporting(true);
    try {
      await onExportPng();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      style={{
        background: COLORS.toolbar,
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexWrap: "wrap",
        minHeight: 50,
      }}
    >
      <ToolBtn onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
        ↩
      </ToolBtn>
      <ToolBtn onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
        ↪
      </ToolBtn>
      <Sep />
      <ToolBtn onClick={() => onZoom(-0.1)} title="Zoom out">
        −
      </ToolBtn>
      <span
        style={{
          color: COLORS.muted,
          fontSize: 12,
          minWidth: 40,
          textAlign: "center",
        }}
      >
        {Math.round(zoom * 100)}%
      </span>
      <ToolBtn onClick={() => onZoom(0.1)} title="Zoom in">
        +
      </ToolBtn>
      <ToolBtn
        onClick={() => onZoom(0, 1)}
        title="Reset zoom"
        style={{ fontSize: 11 }}
      >
        100%
      </ToolBtn>
      <Sep />
      <ToolBtn onClick={onAddText} title="Add text block">
        T+
      </ToolBtn>
      <Sep />
      <ToolBtn
        onClick={onToggleGrid}
        title="Toggle grid"
        style={{ background: showGrid ? COLORS.accent + "33" : undefined }}
      >
        ⊞
      </ToolBtn>
      <Sep />
      <label title="Load HTML/EJS template" style={{ cursor: "pointer" }}>
        <input
          type="file"
          accept=".html,.ejs,.htm"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              const r = new FileReader();
              r.onload = (ev) => onLoadTemplate(ev.target?.result as string);
              r.readAsText(f);
            }
            if (e.target) e.target.value = "";
          }}
        />
        <span
          style={{
            padding: "4px 10px",
            background: "#1c3d55",
            color: COLORS.accent,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 5,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Load Template
        </span>
      </label>
      <Sep />
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            padding: "4px 12px",
            background: COLORS.accent,
            color: COLORS.bg,
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 12,
          }}
        >
          Export ▾
        </button>
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              zIndex: 200,
              background: COLORS.dark,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              padding: "4px 0",
              minWidth: 130,
              marginTop: 4,
            }}
          >
            {[
              { label: "JSON", action: onExportJson },
              { label: "HTML", action: onExportHtml },
              { label: "PNG (html2canvas)", action: handleExportPngClick },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={() => {
                  action();
                  setMenuOpen(false);
                }}
                disabled={label === "PNG (html2canvas)" && isExporting}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "7px 14px",
                  background: "transparent",
                  border: "none",
                  color: COLORS.text,
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 13,
                  opacity:
                    label === "PNG (html2canvas)" && isExporting ? 0.5 : 1,
                }}
              >
                {label} {label === "PNG (html2canvas)" && isExporting && "⏳"}
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedEl && (
        <>
          <Sep />
          <span style={{ color: COLORS.muted, fontSize: 11 }}>
            {selectedEl.type.toUpperCase()}
          </span>
          <ToolBtn
            onClick={onDeleteEl}
            title="Delete element"
            style={{ color: COLORS.danger }}
          >
            🗑
          </ToolBtn>
          <ToolBtn
            onClick={() => onLockEl(!selectedEl.locked)}
            title={selectedEl.locked ? "Unlock" : "Lock"}
          >
            {selectedEl.locked ? "🔒" : "🔓"}
          </ToolBtn>
          {selectedEl.type === "text" && (
            <label
              style={{
                color: COLORS.muted,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Color
              <input
                type="color"
                value={selectedEl.fill}
                onChange={(e) =>
                  onUpdateEl({ ...selectedEl, fill: e.target.value })
                }
                style={{
                  width: 28,
                  height: 24,
                  border: "none",
                  borderRadius: 3,
                  cursor: "pointer",
                }}
              />
            </label>
          )}
          <label
            style={{
              color: COLORS.muted,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Opacity
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={selectedEl.opacity ?? 1}
              onChange={(e) =>
                onUpdateEl({ ...selectedEl, opacity: +e.target.value })
              }
              style={{ width: 70 }}
            />
          </label>
        </>
      )}
    </div>
  );
}

function ToolBtn({
  children,
  onClick,
  disabled,
  title,
  style: s,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: "4px 8px",
        background: "transparent",
        border: `1px solid ${COLORS.border}`,
        color: disabled ? COLORS.border : COLORS.text,
        borderRadius: 5,
        cursor: disabled ? "default" : "pointer",
        fontSize: 13,
        lineHeight: 1,
        ...s,
      }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return (
    <div
      style={{
        width: 1,
        height: 24,
        background: COLORS.border,
        margin: "0 2px",
      }}
    />
  );
}

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = (e) => resolve(e.target?.result as string);
    r.readAsDataURL(file);
  });
}

function downloadBlob(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCanvasAsPng(
  canvas: HTMLCanvasElement,
  filename: string,
): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function genId(): string {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function PropertyTemplateEditor({initialHtml = ""}: {initialHtml?: string}) {
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: makeInitialState(),
    future: [],
  });
  const editorState = history.present;

  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.7);
  const [showGrid, setShowGrid] = useState(false);
  const [apiImages] = useState<UploadedImage[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [editingText, setEditingText] = useState<TextElement | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const pages = editorState.pages;
  const currentPage = pages[Math.min(currentPageIdx, pages.length - 1)];

  useEffect(()=> {
    handleLoadTemplate(initialHtml)
  },[initialHtml])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          dispatch({ type: "UNDO" });
          e.preventDefault();
        }
        if (e.key === "y") {
          dispatch({ type: "REDO" });
          e.preventDefault();
        }
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          selectedId &&
          document.activeElement?.tagName !== "TEXTAREA" &&
          document.activeElement?.tagName !== "INPUT"
        ) {
          handleDeleteElement();
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId]);

  const pushState = (newState: EditorModel) =>
    dispatch({ type: "PUSH", payload: newState });

  const updatePage = useCallback(
    (updatedPage: Page) => {
      const newPages = pages.map((p) =>
        p.id === updatedPage.id ? updatedPage : p,
      );
      pushState({ pages: newPages, globalStyles: editorState.globalStyles });
    },
    [pages, editorState.globalStyles],
  );

  const handleChangeEl = useCallback(
    (updatedEl: CanvasElement) => {
      const newElements = currentPage.elements.map((el) =>
        el.id === updatedEl.id ? updatedEl : el,
      );
      updatePage({ ...currentPage, elements: newElements });
    },
    [currentPage, updatePage],
  );

  const handleDropImage = useCallback(
    (src: string, x: number, y: number) => {
      const newEl: ImageElement = {
        id: genId(),
        type: "image",
        src,
        x,
        y,
        width: 300,
        height: 200,
        rotation: 0,
        opacity: 1,
        crop: null,
        locked: false,
      };
      updatePage({
        ...currentPage,
        elements: [...currentPage.elements, newEl],
      });
      setSelectedId(newEl.id);
      notify("Image added to canvas");
    },
    [currentPage, updatePage],
  );

  const handleAddText = useCallback(() => {
    const newEl: TextElement = {
      id: genId(),
      type: "text",
      text: "New text",
      x: 80,
      y: 80,
      width: 400,
      fontSize: 24,
      fontFamily: "Helvetica",
      fill: "#000000",
      fontStyle: "normal",
      fontWeight: "normal",
      align: "left",
      rotation: 0,
      opacity: 1,
      locked: false,
    };
    updatePage({ ...currentPage, elements: [...currentPage.elements, newEl] });
    setSelectedId(newEl.id);
    setEditingText(newEl);
  }, [currentPage, updatePage]);

  const handleDeleteElement = useCallback(() => {
    if (!selectedId) return;
    updatePage({
      ...currentPage,
      elements: currentPage.elements.filter((el) => el.id !== selectedId),
    });
    setSelectedId(null);
  }, [selectedId, currentPage, updatePage]);

  const handleLockEl = useCallback(
    (locked: boolean) => {
      const el = currentPage.elements.find((e) => e.id === selectedId);
      if (!el) return;
      handleChangeEl({ ...el, locked });
    },
    [selectedId, currentPage, handleChangeEl],
  );

  const handleAddPage = useCallback(() => {
    const newPage: Page = {
      id: genId(),
      bgColor: COLORS.accent,
      title: `Page ${pages.length + 1}`,
      elements: [],
    };
    pushState({
      pages: [...pages, newPage],
      globalStyles: editorState.globalStyles,
    });
    setCurrentPageIdx(pages.length);
  }, [pages, editorState.globalStyles]);

  const handleDeletePage = useCallback(
    (idx: number) => {
      if (pages.length <= 1) {
        notify("Cannot delete last page");
        return;
      }
      const newPages = pages.filter((_, i) => i !== idx);
      pushState({ pages: newPages, globalStyles: editorState.globalStyles });
      setCurrentPageIdx(Math.min(currentPageIdx, newPages.length - 1));
    },
    [pages, currentPageIdx, editorState.globalStyles],
  );

  const handleMovePage = useCallback(
    (idx: number, dir: -1 | 1) => {
      const newPages = [...pages];
      const target = idx + dir;
      if (target < 0 || target >= newPages.length) return;
      [newPages[idx], newPages[target]] = [newPages[target], newPages[idx]];
      pushState({ pages: newPages, globalStyles: editorState.globalStyles });
      setCurrentPageIdx(target);
    },
    [pages, editorState.globalStyles],
  );

  const handleUpload = useCallback((src: string, name: string) => {
    setUploadedImages((prev) => [...prev, { src, label: name }]);
    notify("Image uploaded");
  }, []);

  const handleSplitImage = useCallback(
    async (src: string, dir: "vertical" | "horizontal") => {
      notify("Splitting image into pages...");
      const segments = await splitImage(src, dir);
      const newPages: Page[] = segments.map((segSrc, i) => ({
        id: genId(),
        bgColor: "#ffffff",
        title: `Split ${i + 1}`,
        elements: [
          {
            id: genId(),
            type: "image",
            src: segSrc,
            x: 0,
            y: 0,
            width: A4_W,
            height: A4_H,
            rotation: 0,
            opacity: 1,
            crop: null,
            locked: false,
          },
        ],
      }));
      pushState({
        pages: [...pages, ...newPages],
        globalStyles: editorState.globalStyles,
      });
      setCurrentPageIdx(pages.length);
      notify(`Split into ${segments.length} pages`);
    },
    [pages, editorState.globalStyles],
  );

  const handleLoadTemplate = useCallback(async (html: string) => {
    try {
      const model = await parseHtmlToEditorModel(html);
      dispatch({ type: "RESET", payload: model });
      setCurrentPageIdx(0);
      setSelectedId(null);
      notify(`Template loaded: ${model.pages.length} pages`);
    } catch (err) {
      console.error("Failed to parse template", err);
      notify("Failed to load template. Check console for errors.");
    }
  }, []);

  const handleExportJson = useCallback(() => {
    downloadBlob(
      JSON.stringify(editorState, null, 2),
      "property-template.json",
      "application/json",
    );
    notify("JSON exported");
  }, [editorState]);

  const handleExportHtml = useCallback(() => {
    const html = renderEditorModelToHtml(editorState);
    downloadBlob(html, "property-template.html", "text/html");
    notify("HTML exported");
  }, [editorState]);

  const handleExportPng = useCallback(async () => {
    if (!currentPage) {
      notify("No page to export");
      return;
    }
    notify("Generating PNG with html2canvas...");
    const containerId = "html2canvas-export-container";
    let existingContainer = document.getElementById(containerId);
    if (existingContainer) document.body.removeChild(existingContainer);
    const container = document.createElement("div");
    container.id = containerId;
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.zIndex = "-9999";
    container.style.width = `${A4_W}px`;
    container.style.height = `${A4_H}px`;
    document.body.appendChild(container);
    try {
      const pageHtml = generateSinglePageHtml(
        currentPage,
        editorState.globalStyles,
      );
      container.innerHTML = pageHtml;
      const images = container.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve(null);
              else {
                img.onload = () => resolve(null);
                img.onerror = () => resolve(null);
              }
            }),
        ),
      );
      const targetElement = container.querySelector(
        ".export-page",
      ) as HTMLElement;
      if (!targetElement) throw new Error("Export page element not found");
      const canvas = await html2canvas(targetElement, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });
      downloadCanvasAsPng(
        canvas,
        `page-${currentPageIdx + 1}-${currentPage.title || "export"}.png`,
      );
      notify("PNG exported successfully!");
    } catch (error) {
      console.error("html2canvas export error:", error);
      notify("Export failed: " + (error as Error).message);
    } finally {
      if (container && document.body.contains(container))
        document.body.removeChild(container);
    }
  }, [currentPage, currentPageIdx, editorState.globalStyles]);

  const handleZoom = useCallback((delta: number, absolute?: number) => {
    if (absolute !== undefined) setZoom(absolute);
    else setZoom((z) => Math.min(2, Math.max(0.2, +(z + delta).toFixed(2))));
  }, []);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };
  const selectedEl =
    currentPage?.elements.find((e) => e.id === selectedId) || null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 0px)",
        background: COLORS.dark,
        fontFamily: "Helvetica, Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: COLORS.bg,
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          height: 48,
          flexShrink: 0,
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: COLORS.accent,
            }}
          />
          <span
            style={{
              color: COLORS.accent,
              fontSize: 14,
              fontWeight: "bold",
              letterSpacing: 0.5,
            }}
          >
            Lokalmegleren Rediger
          </span>
        </div>
        {/* <span style={{ color: COLORS.muted, fontSize: 12 }}>
          for Lokalmegleren / EJS templates
        </span> */}
        <div style={{ flex: 1 }} />
        <span style={{ color: COLORS.muted, fontSize: 14 }}>
          {pages.length} page{pages.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Toolbar */}
      <Toolbar
        zoom={zoom}
        onZoom={handleZoom}
        onUndo={() => dispatch({ type: "UNDO" })}
        onRedo={() => dispatch({ type: "REDO" })}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        onAddText={handleAddText}
        onExportJson={handleExportJson}
        onExportHtml={handleExportHtml}
        onExportPng={handleExportPng}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((v) => !v)}
        onLoadTemplate={handleLoadTemplate}
        selectedEl={selectedEl}
        onUpdateEl={handleChangeEl}
        onDeleteEl={handleDeleteElement}
        onLockEl={handleLockEl}
      />

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar
          apiImages={apiImages}
          uploadedImages={uploadedImages}
          onUpload={handleUpload}
          onSplitImage={handleSplitImage}
        />
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "auto",
            padding: "30px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            background: "#1a2d3d",
          }}
        >
          {currentPage && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div
                style={{
                  marginBottom: 8,
                  color: COLORS.muted,
                  fontSize: 11,
                  textAlign: "center",
                }}
              >
                {currentPage.title || `Page ${currentPageIdx + 1}`} — A4 ({A4_W}
                ×{A4_H}px)
              </div>
              <CanvasPage
                page={currentPage}
                selectedId={selectedId}
                zoom={zoom}
                showGrid={showGrid}
                onSelectEl={setSelectedId}
                onChangeEl={handleChangeEl}
                onDropImage={handleDropImage}
                onTextDblClick={setEditingText}
              />
            </div>
          )}
        </div>
        <PageManager
          pages={pages}
          currentPageIdx={currentPageIdx}
          onSelect={setCurrentPageIdx}
          onAdd={handleAddPage}
          onDelete={handleDeletePage}
          onMove={handleMovePage}
        />
      </div>

      {editingText && (
        <TextEditorModal
          el={editingText}
          onClose={() => setEditingText(null)}
          onSave={handleChangeEl}
        />
      )}
      {notification && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: COLORS.bg,
            color: COLORS.accent,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            padding: "10px 22px",
            fontSize: 13,
            zIndex: 9999,
            boxShadow: "0 4px 20px #00000066",
          }}
        >
          {notification}
        </div>
      )}
    </div>
  );
}
