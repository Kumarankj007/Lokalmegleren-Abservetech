import React, { useCallback } from "react";

import { REFLOW_TEXT_BELOW } from "../constants";
import { genId, defaultElement } from "../utils/factories";
import { parseSvgColors, parseSvgTexts } from "../utils/svg";
import type { CanvasElement, ElementType, EditorModel, HistoryAction } from "../types";
import type { EditorPermissions } from "../utils/permissions";

export function useElementOps(opts: {
  modelRef: React.MutableRefObject<EditorModel>;
  updateModel: (m: EditorModel) => void;
  selectedElRef: React.MutableRefObject<CanvasElement | null>;
  selectedIdRef: React.MutableRefObject<string | null>;
  pageIdxRef: React.MutableRefObject<number>;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setClipboard: React.Dispatch<React.SetStateAction<CanvasElement | null>>;
  dispatch: React.Dispatch<HistoryAction>;
  permissions: EditorPermissions;
}) {
  const { modelRef, updateModel, selectedElRef, selectedIdRef, pageIdxRef, setSelectedId, dispatch, permissions } = opts;

  // ── ELEMENT CHANGE + AUTO-REFLOW ──────────────────────────────────────
  // When a text element's height changes (because its content grew/shrank via
  // the ResizeObserver), shift every element that sits BELOW it on the same
  // page by the same delta so content never overlaps. Skips when:
  //  • REFLOW_TEXT_BELOW is off
  //  • the element was dragged vertically (y changed) — that's a manual move
  //  • the sibling is spanning (double-page image)
  const handleElementChange = useCallback((updated: CanvasElement, live = false) => {
    const m = modelRef.current;
    const newPages = m.pages.map((p) => {
      const prev = p.elements.find((el) => el.id === updated.id);
      if (!prev) return p;

      const heightDelta = updated.height - prev.height;
      const movedVertically = updated.y !== prev.y;
      const shouldReflow =
        REFLOW_TEXT_BELOW &&
        updated.type === "text" &&
        Math.abs(heightDelta) > 0.5 &&
        !movedVertically;

      const prevBottom = prev.y + prev.height;

      return {
        ...p,
        elements: p.elements.map((el) => {
          if (el.id === updated.id) return updated;
          // Never reflow the page-number footer chrome (the number badge + the
          // grey rule): it is pinned to the bottom of every page and must not
          // shift when a text box above it grows. Without this, typing into any
          // box pushed the whole page-num-bar down off its fixed position.
          const isPageNumChrome =
            el.dataField === "page-num" || (el.locked && el.y >= p.height - 60);
          // Only push elements whose top is at/below the growing box's bottom.
          if (shouldReflow && !el.spanning && !isPageNumChrome && el.y >= prevBottom - 1) {
            return { ...el, y: el.y + heightDelta };
          }
          return el;
        }),
      };
    });
    dispatch({ type: live ? "live" : "set", payload: { ...m, pages: newPages } });
  }, []);

  const handleCommit = useCallback(() => { dispatch({ type: "set", payload: modelRef.current }); }, []);

  const addElement = useCallback((type: ElementType) => {
    // Adding a new element is a layout action — admins only.
    if (!permissions.canAddElements) return;
    const m = modelRef.current;
    const curPageIdx = pageIdxRef.current;
    const el = { ...defaultElement(type), x: type === "collage" ? 0 : 200, y: type === "collage" ? 0 : 200 };
    if (type === "svg") { el.svgColors = parseSvgColors(el.svgMarkup); el.svgTexts = parseSvgTexts(el.svgMarkup); }
    const newPages = m.pages.map((p, i) => i !== curPageIdx ? p : { ...p, elements: [...p.elements, el] });
    updateModel({ ...m, pages: newPages });
    setSelectedId(el.id);
  }, [updateModel, permissions]);

  const deleteSelected = useCallback(() => {
    // Deleting an element is a layout action — admins only.
    if (!permissions.canDeleteElements) return;
    const m = modelRef.current;
    const curSelectedId = selectedIdRef.current;
    if (!curSelectedId) return;
    const newPages = m.pages.map((p) => !p.elements.some((e) => e.id === curSelectedId) ? p : { ...p, elements: p.elements.filter((e) => e.id !== curSelectedId) });
    updateModel({ ...m, pages: newPages });
    setSelectedId(null);
  }, [updateModel, permissions]);

  const duplicateSelected = useCallback(() => {
    // Duplicating an element is a layout action — admins only.
    if (!permissions.canDuplicateElements) return;
    const m = modelRef.current;
    const curSelectedEl = selectedElRef.current;
    const curSelectedId = selectedIdRef.current;
    if (!curSelectedEl) return;
    const dup = { ...curSelectedEl, id: genId(curSelectedEl.type), x: curSelectedEl.x + 20, y: curSelectedEl.y + 20 };
    const newPages = m.pages.map((p) => !p.elements.some((e) => e.id === curSelectedId) ? p : { ...p, elements: [...p.elements, dup] });
    updateModel({ ...m, pages: newPages });
    setSelectedId(dup.id);
  }, [updateModel, permissions]);

  return { handleElementChange, handleCommit, addElement, deleteSelected, duplicateSelected };
}
