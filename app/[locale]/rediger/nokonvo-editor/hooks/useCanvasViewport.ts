import React, { useState, useRef, useCallback, useEffect } from "react";

import { snapToSpreadStart } from "../utils/factories";
import { A4_W } from "../constants";

export function useCanvasViewport(opts: {
  viewMode: "single" | "spread";
  currentPageWidth: number | undefined;
  pagesLength: number;
  setPageIdx: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [zoom, setZoom] = useState(0.6);

  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const programmaticScrollRef = useRef(false);
  const visibilityMapRef = useRef<Map<number, number>>(new Map());

  const scrollToPage = useCallback((idx: number) => {
    const target = opts.viewMode === "spread" ? snapToSpreadStart(idx) : idx;
    const el = pageRefs.current.get(target);
    if (!el) return;
    programmaticScrollRef.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => { programmaticScrollRef.current = false; }, 700);
  }, [opts.viewMode]);

  // Auto-fit: size zoom so the page(s) fill the canvas horizontally without overflow.
  // Spread mode targets 2× the page width; single mode targets 1×.
  const autoFitZoom = useCallback(() => {
    const canvas = canvasScrollRef.current;
    if (!canvas) return;
    const availW = canvas.clientWidth - 40; // 40 px total horizontal padding
    const pageW = opts.currentPageWidth ?? A4_W;
    const targetW = opts.viewMode === "spread" ? pageW * 2 : pageW;
    const newZoom = Math.max(0.2, Math.min(2, availW / targetW));
    setZoom(parseFloat(newZoom.toFixed(2)));
  }, [opts.currentPageWidth, opts.viewMode]);

  useEffect(() => {
    const root = canvasScrollRef.current;
    if (!root) return;
    visibilityMapRef.current.clear();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = parseInt((entry.target as HTMLElement).dataset.pageIndex || "-1", 10);
          if (idx < 0) continue;
          visibilityMapRef.current.set(idx, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        if (programmaticScrollRef.current) return;
let bestIdx = -1; let bestRatio = 0;
        visibilityMapRef.current.forEach((ratio, idx) => { if (ratio > bestRatio) { bestRatio = ratio; bestIdx = idx; } });
        if (bestIdx >= 0) opts.setPageIdx((prev) => (prev === bestIdx ? prev : bestIdx));
      },
      { root, threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );
    pageRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [opts.pagesLength, opts.viewMode]);

  return { zoom, setZoom, canvasScrollRef, pageRefs, scrollToPage, autoFitZoom };
}
