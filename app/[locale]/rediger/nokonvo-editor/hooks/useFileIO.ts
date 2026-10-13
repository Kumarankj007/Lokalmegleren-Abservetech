import React, { useState, useRef, useCallback } from "react";

import { parseTemplate } from "../parser";
import { serializeTemplate } from "../serializer";
import { materializeRichFlow } from "./useRichFlow";
import { ensureExtraPage } from "../utils/factories";
import { pagesFromPdf } from "../utils/pdf";
import { showToast } from "@/lib/toastSonner";
import type { EditorModel, HistoryAction } from "../types";

export function useFileIO(opts: {
  model: EditorModel;
  modelRef: React.MutableRefObject<EditorModel>;
  updateModel: (m: EditorModel) => void;
  effectiveData: Record<string, any>;
  dispatch: React.Dispatch<HistoryAction>;
  setPageIdx: React.Dispatch<React.SetStateAction<number>>;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIO: React.Dispatch<React.SetStateAction<{ mode: "import" | "ejs" | "editable"; content: string } | null>>;
  title?: string;
  fileName?: string;
  /** Master-template edit mode → save straight to the template, skip the
   *  "name your file" modal (the template already has its own identity). */
  isTemplateMode?: boolean;
  onSave?: (payload: { model: EditorModel; ejs: string; html: string }) => void;
  onSaveHtml?: (html: string, fileName?: string) => void;
}) {
  const {
    model,
    modelRef,
    updateModel,
    effectiveData,
    dispatch,
    setPageIdx,
    setSelectedId,
    setIsLoading,
    setIO,
    title,
    fileName,
    isTemplateMode,
    onSave,
    onSaveHtml,
  } = opts;

  const [showFileNameModal, setShowFileNameModal] = useState(false);
  const [fileNameInput, setFileNameInput] = useState("");

  const handleImport = (html: string) => {
    setIsLoading(true);
    parseTemplate(html, effectiveData)
      .then((m) => { dispatch({ type: "reset", payload: ensureExtraPage(m) }); setPageIdx(0); setSelectedId(null); setIO(null); })
      .catch((err: any) => alert("Kunne ikke tolke malen: " + err.message))
      .finally(() => setIsLoading(false));
  };

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const handlePdfFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") { showToast.error?.("Velg en PDF-fil"); return; }
    setIsLoading(true);
    try {
      const newPages = await pagesFromPdf(file);
      if (!newPages.length) { showToast.error?.("PDF-en ser ut til å være tom"); return; }
      const isBlankStarter = model.pages.length === 1 && model.pages[0].elements.length === 0 && /^(?:Side 1|Page 1|1 Page)$/.test(model.pages[0].name);
      const merged = isBlankStarter ? newPages : [...model.pages, ...newPages];
      updateModel({ ...model, pages: merged });
      setPageIdx(isBlankStarter ? 0 : model.pages.length);
      setSelectedId(null);
      showToast.success?.(`Importerte ${newPages.length} side${newPages.length === 1 ? "" : "r"} fra PDF`);
    } catch (err: any) {
      console.error("PDF import failed:", err);
      alert("Kunne ikke importere PDF: " + (err?.message || "ukjent feil"));
    } finally {
      setIsLoading(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const handleSave = useCallback(() => {
    // Materialize the live column-flow distribution so exported HTML matches
    // what the user sees (per-page .cols-2 slices). No-op when no flows.
    const m = materializeRichFlow(modelRef.current);
    onSave?.({ model: m, ejs: serializeTemplate(m, "ejs", title), html: serializeTemplate(m, "editable", title) });
  }, [onSave, title]);

  const handleSaveHtml = useCallback(() => {
    const m = materializeRichFlow(modelRef.current);
    // Master-template mode: save directly, no file-name prompt.
    if (isTemplateMode) {
      onSaveHtml?.(serializeTemplate(m, "editable", title), title);
      return;
    }
    if (fileName) {
      onSaveHtml?.(serializeTemplate(m, "editable", title), fileName);
    } else {
      setFileNameInput("");
      setShowFileNameModal(true);
    }
  }, [onSaveHtml, fileName, title, isTemplateMode]);

  const handleFileNameConfirm = useCallback(() => {
    const m = materializeRichFlow(modelRef.current);
    setFileNameInput((name) => {
      if (!name.trim()) return name;
      setShowFileNameModal(false);
      onSaveHtml?.(serializeTemplate(m, "editable", title), name.trim());
      return name;
    });
  }, [onSaveHtml, title]);

  return {
    showFileNameModal,
    setShowFileNameModal,
    fileNameInput,
    setFileNameInput,
    pdfInputRef,
    handleImport,
    handlePdfFile,
    handleSave,
    handleSaveHtml,
    handleFileNameConfirm,
  };
}
