import React, { useEffect } from "react";

import { genId } from "../utils/factories";
import { isTextEditingContext } from "../utils/dom";
import type { CanvasElement, EditorModel, HistoryAction } from "../types";
import type { EditorPermissions } from "../utils/permissions";

export function useKeyboardShortcuts(opts: {
  selectedElRef: React.MutableRefObject<CanvasElement | null>;
  clipboardRef: React.MutableRefObject<CanvasElement | null>;
  pageIdxRef: React.MutableRefObject<number>;
  selectedIdRef: React.MutableRefObject<string | null>;
  deleteSelectedRef: React.MutableRefObject<() => void>;
  modelRef: React.MutableRefObject<EditorModel>;
  dispatch: React.Dispatch<HistoryAction>;
  setClipboard: React.Dispatch<React.SetStateAction<CanvasElement | null>>;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  permissions: EditorPermissions;
}) {
  const {
    selectedElRef,
    clipboardRef,
    pageIdxRef,
    selectedIdRef,
    deleteSelectedRef,
    modelRef,
    dispatch,
    setClipboard,
    setSelectedId,
    permissions,
  } = opts;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ── TEXT MODE ──────────────────────────────────────────────────────
      // If the cursor is inside an editable text context (input / textarea /
      // select / contenteditable), let the browser handle copy/cut/paste/undo
      // natively and bypass ALL custom element shortcuts. This is what keeps
      // copy-pasting a sentence from duplicating whole blocks/elements.
      if (isTextEditingContext(document.activeElement)) return;
      // ── ELEMENT MODE ───────────────────────────────────────────────────
      const curSelectedEl = selectedElRef.current;
      const curClipboard = clipboardRef.current;
      const curPageIdx = pageIdxRef.current;
      const curSelectedId = selectedIdRef.current;
      // Undo/redo stay available to everyone (they only affect the user's own
      // permitted edits — regular users can't make layout changes to undo).
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { dispatch({ type: "undo" }); e.preventDefault(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) { dispatch({ type: "redo" }); e.preventDefault(); }
      // ── Copy / paste / delete of whole elements = add/delete of layout, so
      // they are gated behind the corresponding permission. Regular users are
      // rejected here even though these shortcuts have no visible button.
      // richflow elements are continuous text containers — copying/pasting them
      // as whole elements would duplicate the entire content block. Skip them;
      // sentence-level copy/paste happens natively inside the flow text editor.
      else if ((e.ctrlKey || e.metaKey) && e.key === "c" && permissions.canAddElements && curSelectedEl && curSelectedEl.type !== "richflow") { setClipboard({ ...curSelectedEl }); e.preventDefault(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === "v" && permissions.canAddElements && curClipboard && curClipboard.type !== "richflow") {
        const dup: CanvasElement = { ...curClipboard, id: genId(curClipboard.type), x: curClipboard.x + 20, y: curClipboard.y + 20 };
        const m = modelRef.current;
        dispatch({ type: "set", payload: { ...m, pages: m.pages.map((p, i) => i !== curPageIdx ? p : { ...p, elements: [...p.elements, dup] }) } });
        setSelectedId(dup.id);
        e.preventDefault();
      } else if ((e.key === "Delete" || e.key === "Backspace") && permissions.canDeleteElements && curSelectedId) { deleteSelectedRef.current(); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [permissions]);
}
