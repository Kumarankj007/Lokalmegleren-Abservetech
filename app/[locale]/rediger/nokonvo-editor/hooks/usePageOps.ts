import React, { useCallback } from "react";

import { genId, blankPage } from "../utils/factories";
import { normalizeOmPills } from "../utils/pagination";
import type { Page, EditorModel } from "../types";
import type { EditorPermissions } from "../utils/permissions";

export function usePageOps(opts: {
  modelRef: React.MutableRefObject<EditorModel>;
  updateModel: (m: EditorModel) => void;
  scrollToPage: (idx: number) => void;
  setPageIdx: React.Dispatch<React.SetStateAction<number>>;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  permissions: EditorPermissions;
}) {
  const { modelRef, updateModel, scrollToPage, setPageIdx, setSelectedId, permissions } = opts;

  const handlePageChange = useCallback((page: Page) => {
    // Editing page-level properties (name/bg/size/loop) is a layout action.
    if (!permissions.canManagePages) return;
    const m = modelRef.current;
    updateModel({ ...m, pages: m.pages.map((p) => (p.id === page.id ? page : p)) });
  }, [updateModel, permissions]);

  const addPage = useCallback(() => {
    if (!permissions.canManagePages) return;
    const m = modelRef.current;
    const p: Page = { ...blankPage(), name: `Side ${m.pages.length + 1}` };
    const newIdx = m.pages.length;
    updateModel({ ...m, pages: [...m.pages, p] });
    setPageIdx(newIdx);
    window.setTimeout(() => scrollToPage(newIdx), 50);
  }, [updateModel, scrollToPage, permissions]);
  const deletePage = useCallback((i: number) => {
    if (!permissions.canManagePages) return;
    const m = modelRef.current;
    if (m.pages.length <= 1) return;
    const newPages = normalizeOmPills(m.pages.filter((_, idx) => idx !== i));
    updateModel({ ...m, pages: newPages });
    setPageIdx((cur) => Math.min(cur, newPages.length - 1));
  }, [updateModel, permissions]);

  const duplicatePage = useCallback((i: number) => {
    if (!permissions.canManagePages) return;
    const m = modelRef.current;
    const src = m.pages[i];
    const dup: Page = { ...src, id: genId("page"), name: `${src.name} kopi`, elements: src.elements.map((e) => ({ ...e, id: genId(e.type) })) };
    // normalizeOmPills re-aligns the "OM EIENDOMMEN" running-header pill by the
    // NEW booklet-page parity: the duplicate (and every page it pushes down) may
    // now land on the opposite spread corner (odd → right, even → left).
    const newPages = normalizeOmPills([...m.pages.slice(0, i + 1), dup, ...m.pages.slice(i + 1)]);
    updateModel({ ...m, pages: newPages });
    setPageIdx(i + 1);
    window.setTimeout(() => scrollToPage(i + 1), 50);
  }, [updateModel, scrollToPage, permissions]);
  const handleSelectEl = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      const pIdx = modelRef.current.pages.findIndex((p) => p.elements.some((e) => e.id === id));
      if (pIdx >= 0) setPageIdx(pIdx);
    }
  }, []);

  const insertPageAfter = useCallback((i: number) => {
    if (!permissions.canManagePages) return;
    const m = modelRef.current;
    const p: Page = { ...blankPage(), name: `Side ${m.pages.length + 1}` };
    const newPages = normalizeOmPills([...m.pages.slice(0, i + 1), p, ...m.pages.slice(i + 1)]);
    updateModel({ ...m, pages: newPages });
    setPageIdx(i + 1);
    window.setTimeout(() => scrollToPage(i + 1), 50);
  }, [updateModel, scrollToPage, permissions]);

  const movePage = useCallback((i: number, dir: -1 | 1) => {
    if (!permissions.canManagePages) return;
    const m = modelRef.current;
    const t = i + dir;
    if (t < 0 || t >= m.pages.length) return;
    const swapped = [...m.pages];
    [swapped[i], swapped[t]] = [swapped[t], swapped[i]];
    const newPages = normalizeOmPills(swapped);
    updateModel({ ...m, pages: newPages });
    setPageIdx(t);
    window.setTimeout(() => scrollToPage(t), 50);
  }, [updateModel, scrollToPage, permissions]);

  const reorderPage = useCallback((fromIdx: number, toIdx: number) => {
    if (!permissions.canManagePages) return;
    const m = modelRef.current;
    if (fromIdx === toIdx || fromIdx < 0 || fromIdx >= m.pages.length || toIdx < 0 || toIdx >= m.pages.length) return;
    const reordered = [...m.pages];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const newPages = normalizeOmPills(reordered);
    updateModel({ ...m, pages: newPages });
    setPageIdx((cur) => {
      let next = cur;
      if (cur === fromIdx) next = toIdx;
      else if (fromIdx < cur && toIdx >= cur) next = cur - 1;
      else if (fromIdx > cur && toIdx <= cur) next = cur + 1;
      window.setTimeout(() => scrollToPage(next), 50);
      return next;
    });
  }, [updateModel, scrollToPage, permissions]);

  const reorderMultiPage = useCallback((indices: number[], toIdx: number) => {
    if (!permissions.canManagePages) return;
    const m = modelRef.current;
    if (indices.length === 0) return;
    const sorted = [...indices].sort((a, b) => a - b);
    const clampedTo = Math.max(0, Math.min(m.pages.length, toIdx));
    const moved = sorted.map((i) => m.pages[i]);
    const remaining = m.pages.filter((_, i) => !sorted.includes(i));
    const selectedBefore = sorted.filter((i) => i < clampedTo).length;
    const insertAt = Math.max(0, Math.min(remaining.length, clampedTo - selectedBefore));
    const newPages = normalizeOmPills([...remaining.slice(0, insertAt), ...moved, ...remaining.slice(insertAt)]);
    updateModel({ ...m, pages: newPages });
    setPageIdx(insertAt);
    window.setTimeout(() => scrollToPage(insertAt), 50);
  }, [updateModel, scrollToPage, permissions]);

  const deleteMultiPage = useCallback((indices: number[]) => {
    if (!permissions.canManagePages) return;
    const m = modelRef.current;
    if (indices.length === 0 || m.pages.length - indices.length < 1) return;
    const sorted = [...indices].sort((a, b) => a - b);
    const newPages = normalizeOmPills(m.pages.filter((_, i) => !sorted.includes(i)));
    updateModel({ ...m, pages: newPages });
    setPageIdx((cur) => {
      const newIdx = Math.min(cur, newPages.length - 1);
      window.setTimeout(() => scrollToPage(newIdx), 50);
      return newIdx;
    });
  }, [updateModel, scrollToPage, permissions]);

  return {
    handlePageChange,
    addPage,
    deletePage,
    duplicatePage,
    handleSelectEl,
    insertPageAfter,
    movePage,
    reorderPage,
    reorderMultiPage,
    deleteMultiPage,
  };
}
