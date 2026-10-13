"use client";

import { useRouter } from "@/components/navigation";
import {
  Layout,
  ImageIcon,
  FileText,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";

import {
  T,
  SAMPLE_DATA,
  EDITOR_CHROME_CSS,
} from "./constants";
import type {
  CanvasElement,
  FlowBlock,
  FlowBlockStyle,
  Page,
  UploadedImage,
  PropertyTemplateEditorProps,
} from "./types";

export type { PropertyTemplateEditorProps };

import {
  genId,
  snapToSpreadStart,
  ensureExtraPage,
} from "./utils/factories";
import { parseTemplate } from "./parser";
import { serializeTemplate } from "./serializer";
import { computeBookletNumbers } from "./utils/pagination";
import { applyElementToBlock, readComputedBlockStyle } from "./utils/blockStyle";
import { materializeRichFlow, useRichFlow } from "./hooks/useRichFlow";
import {
  PermissionsContext,
  resolveEditorPermissions,
  type EditorPermissions,
} from "./utils/permissions";

import { btnPrimary, btnSecondary } from "./components/primitives";
import IOModal from "./components/IOModal";
import LoadingOverlay from "./components/LoadingOverlay";
import FileNameModal from "./components/FileNameModal";
import Toolbar from "./components/Toolbar";
import LeftSidebar from "./components/LeftSidebar";
import EditorCanvas from "./components/EditorCanvas";
import RightInspector from "./components/RightInspector";

import { useDocumentImages } from "./hooks/useDocumentImages";
import { useEditorHistory } from "./hooks/useEditorHistory";
import { useCanvasViewport } from "./hooks/useCanvasViewport";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useElementOps } from "./hooks/useElementOps";
import { useImageOps } from "./hooks/useImageOps";
import { usePageOps } from "./hooks/usePageOps";
import { useFileIO } from "./hooks/useFileIO";

/* ═══════════════════════════════════════════════════════════════════════
   ROOT COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function PropertyTemplateEditor({
  initialHtml, title, data, onChange, onSave, onSaveHtml, fileName,
  pendingPDF, pendingSaveHtml, pendingSync, images = [], onSyncWebmegler = () => { },
  showSync = true, isTemplateMode = false,
}: PropertyTemplateEditorProps) {
  const effectiveData = data ?? SAMPLE_DATA;
  const router = useRouter();
  const id = useSearchParams().get("path");

  // Role-based access control: resolved once from the auth service. Admins get
  // the full editor; regular users can only edit existing text/image content
  // and save. Passed to the ops hooks (enforcement) and provided via context
  // to the UI (hide/disable layout controls). See utils/permissions.
  const [permissions] = useState<EditorPermissions>(() => resolveEditorPermissions());

  const { documentImages, isLoadingDoc, progress } = useDocumentImages(id);

  const { history, dispatch, model, modelRef, scopedCss, isLoading, setIsLoading, updateModel } = useEditorHistory(onChange);
  console.log(model, "model")
  const [pageIdx, setPageIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The selected flow LINE (a single block within an accordion flow), so a line
  // can be made active and styled on its own — instead of selecting the whole
  // page. `flowId` scopes it to one flow; `mi` is its index in the master stream;
  // `seed` is the line's live computed style captured at selection (seeds the inspector).
  const [selectedBlock, setSelectedBlock] = useState<{ flowId: string; mi: number; seed?: FlowBlockStyle } | null>(null);
  const [clipboard, setClipboard] = useState<CanvasElement | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  // Off-canvas left sidebar on small screens: hidden by default, opened by the
  // toolbar burger (CSS turns .nokonvo-left-wrap into a drawer under ≤1024px).
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [tab, setTab] = useState("pages");
  const [uploaded, setUploaded] = useState<UploadedImage[]>([]);
  const [io, setIO] = useState<{ mode: "import" | "ejs" | "editable"; content: string } | null>(null);
  const [viewMode, setViewMode] = useState<"single" | "spread">("spread");

  const currentPage = model.pages[Math.min(pageIdx, model.pages.length - 1)];

  // Booklet numbering + extra-page visibility, derived from the live page order
  // so badges renumber and the padding page appears/disappears as pages change.
  const pageNumbers = useMemo(() => computeBookletNumbers(model.pages), [model.pages]);

  const { zoom, setZoom, canvasScrollRef, pageRefs, scrollToPage, autoFitZoom } = useCanvasViewport({
    viewMode,
    currentPageWidth: currentPage?.width,
    pagesLength: model.pages.length,
    setPageIdx,
  });

  useEffect(() => {
    if (initialHtml) {
      setIsLoading(true);
      parseTemplate(initialHtml, effectiveData)
        .then((parsed) => { dispatch({ type: "reset", payload: ensureExtraPage(parsed) }); setPageIdx(0); setSelectedId(null); })
        .catch((err) => console.error("Failed to parse initialHtml:", err))
        .finally(() => setIsLoading(false));
    }
  }, [initialHtml]);

  const spreads = useMemo(() => {
    const list: { leftIdx: number; coverOnly: boolean }[] = [];
    if (model.pages.length === 0) return list;
    list.push({ leftIdx: 0, coverOnly: true });
    for (let i = 1; i < model.pages.length; i += 2) list.push({ leftIdx: i, coverOnly: false });
    return list;
  }, [model.pages.length]);

  const spreadLeftIdx = snapToSpreadStart(pageIdx);
  const spreadCoverOnly = spreadLeftIdx === 0;

  const selectedEl = useMemo<CanvasElement | null>(() => {
    if (!selectedId) return null;
    for (const p of model.pages) {
      const found = p.elements.find((e) => e.id === selectedId);
      if (found) return found;
    }
    return null;
  }, [model.pages, selectedId]);

  // Live column flow: compute slices + master-index map once here so the canvas
  // (display) and the inspector's line editor share the same distribution.
  const richFlow = useRichFlow(model.pages);

  // The flow currently being worked on: the selected frame's flow, or the flow
  // that owns the selected line.
  const activeFlowId =
    (selectedEl?.type === "richflow" ? selectedEl.flowId : null) ?? selectedBlock?.flowId ?? null;

  // Every frame of the active flow, ordered. frame[0] is the master that carries
  // the full block stream — the single source of truth for editing.
  const flowFrames = useMemo<CanvasElement[]>(() => {
    if (!activeFlowId) return [];
    const list: CanvasElement[] = [];
    model.pages.forEach((p) =>
      p.elements.forEach((el) => {
        if (el.type === "richflow" && el.flowId === activeFlowId) list.push(el);
      }),
    );
    return list.sort((a, b) => (a.flowOrder ?? 0) - (b.flowOrder ?? 0));
  }, [activeFlowId, model.pages]);

  // Replace exactly ONE master block (the edited line) — a single-block swap can
  // never duplicate neighbours, and the flow engine re-splits the line across
  // columns/pages for display as needed.
  const replaceBlock = (mi: number, makeBlock: (prev: FlowBlock) => FlowBlock | null) => {
    const master = flowFrames[0];
    const blocks = master?.blocks ?? [];
    if (!master || mi < 0 || mi >= blocks.length) return;
    const made = makeBlock(blocks[mi]);
    const next = made
      ? [...blocks.slice(0, mi), made, ...blocks.slice(mi + 1)]
      : [...blocks.slice(0, mi), ...blocks.slice(mi + 1)]; // null = delete the line
    handleElementChange({ ...master, blocks: next }, true);
  };

  // Click a single LINE on the canvas → make just that line active and edit it
  // (no whole-page selection). Resolve the clicked frame's flowId, snapshot the
  // line's live computed style to seed the inspector accurately, remember its
  // master index, and clear the element selection so no frame outline shows.
  const onSelectBlock = (frameId: string, mi: number) => {
    let flowId: string | null = null;
    for (const p of model.pages) {
      const fr = p.elements.find((e) => e.id === frameId);
      if (fr) { flowId = fr.flowId ?? null; break; }
    }
    if (!flowId) return;
    let seed: FlowBlockStyle | undefined;
    if (typeof document !== "undefined") {
      const node = document.querySelector(`[data-flow-block="${flowId}:${mi}"]`);
      if (node) seed = readComputedBlockStyle(node);
    }
    setSelectedId(null);
    setSelectedBlock({ flowId, mi, seed });
  };

  // The selected flow line exposed to the inspector as a styleable unit: the
  // block, its computed-style seed, and handlers that map edits back to the one
  // master block. Null when no line is selected or its index is stale.
  const flowBlock = useMemo(() => {
    if (!selectedBlock) return null;
    const master = flowFrames[0];
    const blocks = master?.blocks ?? [];
    const mi = selectedBlock.mi;
    if (!master || mi < 0 || mi >= blocks.length) return null;
    return {
      block: blocks[mi],
      seed: selectedBlock.seed,
      onChange: (el: CanvasElement) => replaceBlock(mi, (prev) => applyElementToBlock(prev, el)),
      onChangeTag: (tag: string) => replaceBlock(mi, (prev) => ({ ...prev, tag })),
      onDuplicate: () => {
        // Duplicating a line adds content — restricted to admins.
        if (!permissions.canDuplicateElements) return;
        // Insert a copy of the line right after it.
        const next = [...blocks.slice(0, mi + 1), { ...blocks[mi] }, ...blocks.slice(mi + 1)];
        handleElementChange({ ...master, blocks: next }, true);
      },
      onDelete: () => {
        // Deleting a line removes content — restricted to admins.
        if (!permissions.canDeleteElements) return;
        replaceBlock(mi, () => null);
        setSelectedBlock(null);
      },
    };
  }, [selectedBlock, flowFrames, permissions]);

  // Auto-remove flow pages that became empty after content shrank. Only applies
  // to NON-master richflow frames whose computed slice is explicitly empty, so
  // the first page of a flow always survives and non-flow pages are untouched.
  // Empty flow frames are always trailing, so removal can't loop.
  useEffect(() => {
    const slices = richFlow.slices;
    const m = modelRef.current;
    let removed = false;
    const keep = m.pages.filter((p) => {
      const rf = p.elements.find((el) => el.type === "richflow" && el.flowId);
      const emptyFlowPage =
        !!rf && (rf.flowOrder ?? 0) > 0 && Array.isArray(slices[rf.id]) && slices[rf.id].length === 0;
      if (emptyFlowPage) removed = true;
      return !emptyFlowPage;
    });
    if (removed) dispatch({ type: "live", payload: { ...m, pages: keep } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [richFlow.slices]);

  // Auto-GROW flow: when a flow's content overflows its LAST frame (column 2 of
  // the last page is full), append a continuation page so the overflow flows on.
  // The new page clones the last flow page (keeping its page-number badge / bg)
  // and replaces its richflow frame with an empty continuation frame — the master
  // stream stays the single source of truth, so the next measure redistributes
  // into it. Mirrors the auto-remove effect. Guarded so a single block taller
  // than a page (which whole-block packing cannot split) can never loop.
  useEffect(() => {
    const overset = richFlow.overset;
    const oversetIds = Object.keys(overset).filter((fid) => overset[fid]);
    if (!oversetIds.length) return;
    const m = modelRef.current;
    let pages = m.pages;
    let grew = false;
    for (const fid of oversetIds) {
      let lastPageIdx = -1;
      let lastFrame: CanvasElement | undefined;
      let maxOrder = 0;
      pages.forEach((p, pi) =>
        p.elements.forEach((el) => {
          if (el.type === "richflow" && el.flowId === fid) {
            maxOrder = Math.max(maxOrder, el.flowOrder ?? 0);
            if (pi >= lastPageIdx) { lastPageIdx = pi; lastFrame = el; }
          }
        }),
      );
      if (!lastFrame || lastPageIdx < 0) continue;
      // Need >1 block to move; a lone overflowing block can't be split, so
      // growing would add an empty page that the remove-effect deletes → loop.
      if ((richFlow.slices[lastFrame.id]?.length ?? 0) <= 1) continue;
      const basePage = pages[lastPageIdx];
      const newPage: Page = {
        ...basePage,
        id: genId("page"),
        name: `${basePage.name} (forts.)`,
        elements: basePage.elements.map((el) =>
          el.type === "richflow" && el.flowId === fid
            ? { ...el, id: genId("richflow"), flowOrder: maxOrder + 1, blocks: [] }
            : { ...el, id: genId(el.type) },
        ),
      };
      pages = [...pages.slice(0, lastPageIdx + 1), newPage, ...pages.slice(lastPageIdx + 1)];
      grew = true;
    }
    if (grew) dispatch({ type: "live", payload: { ...m, pages } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [richFlow.overset]);

  // Use refs for values consumed inside the keyboard handler so the effect
  // only registers/unregisters once (stable [] dep array).
  const selectedElRef = useRef(selectedEl);
  selectedElRef.current = selectedEl;
  const clipboardRef = useRef(clipboard);
  clipboardRef.current = clipboard;
  const pageIdxRef = useRef(pageIdx);
  pageIdxRef.current = pageIdx;
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const deleteSelectedRef = useRef<() => void>(() => {});

  useKeyboardShortcuts({
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
  });

  const { handleElementChange, handleCommit, addElement, deleteSelected, duplicateSelected } = useElementOps({
    modelRef,
    updateModel,
    selectedElRef,
    selectedIdRef,
    pageIdxRef,
    setSelectedId,
    setClipboard,
    dispatch,
    permissions,
  });

  // Keep the keyboard-handler ref in sync with the latest deleteSelected.
  deleteSelectedRef.current = deleteSelected;

  const { handleDropImageOnPage, handleDropImageToCell, handleSpreadDrop, splitImage, addRightPageInSpread } = useImageOps({
    model,
    modelRef,
    updateModel,
    selectedEl,
    setSelectedId,
    permissions,
  });

  const {
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
  } = usePageOps({
    modelRef,
    updateModel,
    scrollToPage,
    setPageIdx,
    setSelectedId,
    permissions,
  });

  const {
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
  } = useFileIO({
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
  });

  const tabs = [
    { key: "pages", label: "Sider", icon: Layout },
    { key: "assets", label: "Bilder", icon: ImageIcon },
    ...(documentImages.length > 0 ? [{ key: "documents", label: "Dokumenter", icon: FileText }] : []),
  ];

  const TabComponent = () => (
    <div className="flex items-center justify-center gap-3">
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = tab === key;
        return (
          <button key={key} onClick={() => setTab(key)} style={active ? btnPrimary : btnSecondary} className="flex items-center justify-center gap-2 transition-all">
            <Icon size={18} />{active && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <PermissionsContext.Provider value={permissions}>
    <div className="nokonvo-root" style={{ height: "100dvh", width: "100%", background: T.bg, color: T.text, fontFamily: "system-ui, -apple-system, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      {/* Editor chrome polish — theme-consistent scrollbars, button hover/active,
          input focus rings, and responsive helpers. Scoped to .nokonvo-root so it
          never leaks into the rendered brochure pages or the rest of the app. */}
      <style dangerouslySetInnerHTML={{ __html: EDITOR_CHROME_CSS }} />
      <LoadingOverlay isLoading={isLoading} pendingPDF={pendingPDF} pendingSaveHtml={pendingSaveHtml} pendingSync={pendingSync} />

      <FileNameModal
        open={showFileNameModal}
        value={fileNameInput}
        onValueChange={setFileNameInput}
        onConfirm={handleFileNameConfirm}
        onOpenChange={setShowFileNameModal}
        onCancel={() => setShowFileNameModal(false)}
      />

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <Toolbar
        onToggleSidebar={() => setMobileSidebarOpen((v) => !v)}
        canUndo={!!history.past.length}
        canRedo={!!history.future.length}
        onUndo={() => dispatch({ type: "undo" })}
        onRedo={() => dispatch({ type: "redo" })}
        onAddElement={addElement}
        clipboard={clipboard}
        onPaste={() => {
          // Pasting creates a new element — restricted to admins.
          if (!permissions.canAddElements || !clipboard) return;
          const dup: CanvasElement = { ...clipboard, id: genId(clipboard.type), x: clipboard.x + 20, y: clipboard.y + 20 };
          updateModel({ ...model, pages: model.pages.map((p, i) => i !== pageIdx ? p : { ...p, elements: [...p.elements, dup] }) });
          setSelectedId(dup.id);
        }}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((v) => !v)}
        viewMode={viewMode}
        onToggleViewMode={() => { setViewMode((v) => { const next = v === "single" ? "spread" : "single"; if (next === "spread") setPageIdx((cur) => snapToSpreadStart(cur)); return next; }); window.requestAnimationFrame(() => autoFitZoom()); }}
        zoom={zoom}
        onZoomOut={() => setZoom((z) => Math.max(0.2, z - 0.1))}
        onZoomIn={() => setZoom((z) => Math.min(2, z + 0.1))}
        onAutoFit={autoFitZoom}
        pageCount={model.pages.length}
        isLoading={isLoading}
        onPdfClick={() => pdfInputRef.current?.click()}
        pdfInputRef={pdfInputRef}
        onPdfFile={(file) => handlePdfFile(file)}
        onSyncWebmegler={() => onSyncWebmegler(serializeTemplate(materializeRichFlow(model), "editable", title))}
        showSync={showSync}
        pendingSync={pendingSync}
        pendingSaveHtml={pendingSaveHtml}
        pendingPDF={pendingPDF}
        showSaveHtml={!!onSaveHtml}
        showSave={!!onSave}
        onSaveHtml={handleSaveHtml}
        onSave={handleSave}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0, position: "relative" }}>
        {/* Backdrop behind the mobile drawer (CSS hides it on wide screens). */}
        {mobileSidebarOpen && <div className="nokonvo-backdrop" onClick={() => setMobileSidebarOpen(false)} />}
        {/* ── Left sidebar (off-canvas drawer on ≤1024px) ──────────────── */}
        <div className={`nokonvo-left-wrap${mobileSidebarOpen ? " open" : ""}`} style={{ display: "flex", flexShrink: 0 }}>
        <LeftSidebar
          tab={tab}
          pages={model.pages}
          pageIdx={pageIdx}
          viewMode={viewMode}
          spreadCoverOnly={spreadCoverOnly}
          spreadLeftIdx={spreadLeftIdx}
          data={effectiveData}
          documentImages={documentImages}
          isLoadingDoc={isLoadingDoc}
          progress={progress}
          images={images}
          uploaded={uploaded}
          selectedEl={selectedEl}
          richFlowSlices={richFlow.slices}
          TabComponent={TabComponent}
          onSelectPage={(i) => { const target = viewMode === "spread" ? snapToSpreadStart(i) : i; setPageIdx(target); setSelectedId(null); scrollToPage(target); setMobileSidebarOpen(false); }}
          onAddPage={addPage}
          onDeletePage={deletePage}
          onMovePage={movePage}
          onReorder={reorderPage}
          onReorderMulti={reorderMultiPage}
          onDeleteMulti={deleteMultiPage}
          onDuplicatePage={duplicatePage}
          onInsertAfter={insertPageAfter}
          onDocImageClick={(src) => { if (!selectedEl || selectedEl.type !== "image") return; handleElementChange({ ...selectedEl, src }); }}
          onUpload={(imgs) => setUploaded((prev) => { const existingSrcs = new Set(prev.map((p) => p.src)); return [...prev, ...imgs.filter((img) => !existingSrcs.has(img.src)).map((img) => ({ src: img.src, label: img.name }))]; })}
          onDeleteUploaded={(src) => setUploaded((prev) => prev.filter((img) => img.src !== src))}
          onAssetImageClick={(src) => { if (!selectedEl || selectedEl.type !== "image") return; handleElementChange({ ...selectedEl, src }); }}
        />
        </div>

        {/* ── Scrollable canvas ─────────────────────────────────────────── */}
        <EditorCanvas
          canvasScrollRef={canvasScrollRef}
          pageRefs={pageRefs}
          viewMode={viewMode}
          pages={model.pages}
          pageIdx={pageIdx}
          selectedId={selectedId}
          zoom={zoom}
          showGrid={showGrid}
          data={effectiveData}
          spreads={spreads}
          onClearSelection={() => { setSelectedId(null); setSelectedBlock(null); }}
          onSelect={(id) => { setSelectedBlock(null); handleSelectEl(id); }}
          onChange={handleElementChange}
          onCommit={handleCommit}
          onDropImageOnPage={handleDropImageOnPage}
          onDropToCell={handleDropImageToCell}
          onActivatePage={(i) => setPageIdx(i)}
          onSpreadDrop={handleSpreadDrop}
          onAddRightPage={addRightPageInSpread}
          richFlowSlices={richFlow.slices}
          richFlowIndices={richFlow.indices}
          selectedBlock={selectedBlock}
          onSelectBlock={onSelectBlock}
          pageNumbers={pageNumbers}
        />

        {/* ── Right inspector ───────────────────────────────────────────── */}
        <RightInspector
          el={selectedEl}
          page={!selectedEl ? currentPage : null}
          onChange={handleElementChange}
          onChangePage={handlePageChange}
          onDelete={deleteSelected}
          onDuplicate={duplicateSelected}
          onSplit={selectedEl?.spanning && viewMode === "spread" ? splitImage : undefined}
          onCopy={selectedEl ? () => setClipboard({ ...selectedEl }) : undefined}
          onDeletePage={() => deletePage(pageIdx)}
          flowBlock={flowBlock}
        />
      </div>

      {io && <IOModal mode={io.mode} content={io.content} onClose={() => setIO(null)} onLoad={io.mode === "import" ? handleImport : undefined} />}
    </div>
    </PermissionsContext.Provider>
  );
}
