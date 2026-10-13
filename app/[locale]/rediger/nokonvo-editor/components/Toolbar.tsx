"use client";

import {
  Redo2,
  Undo2,
  ClipboardPaste,
  Grid2X2,
  PanelsTopLeft,
  LayoutGrid,
  Minus,
  Plus,
  Menu,
} from "lucide-react";

import { T } from "../constants";
import type { ElementType, CanvasElement } from "../types";
import { getEditorRole, usePermissions } from "../utils/permissions";

import { btnPrimary, btnSecondary, IconBtn, Sep } from "./primitives";
import { getUser } from "@/services/authService";

interface ToolbarProps {
  /** Toggle the off-canvas left sidebar (burger, shown only on small screens). */
  onToggleSidebar?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAddElement: (type: ElementType) => void;
  clipboard: CanvasElement | null;
  onPaste: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  viewMode: "single" | "spread";
  onToggleViewMode: () => void;
  zoom: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onAutoFit: () => void;
  pageCount: number;
  isLoading: boolean;
  onPdfClick: () => void;
  pdfInputRef: React.RefObject<HTMLInputElement>;
  onPdfFile: (file: File | null | undefined) => void;
  onSyncWebmegler: () => void;
  showSync?: boolean;
  pendingSync?: boolean;
  pendingSaveHtml?: boolean;
  pendingPDF?: boolean;
  showSaveHtml: boolean;
  showSave: boolean;
  onSaveHtml?: () => void;
  onSave?: () => void;
}

export default function Toolbar({
  onToggleSidebar,
  canUndo, canRedo, onUndo, onRedo, onAddElement, clipboard, onPaste,
  showGrid, onToggleGrid, viewMode, onToggleViewMode, zoom, onZoomOut, onZoomIn, onAutoFit,
  pageCount, isLoading, onPdfClick, pdfInputRef, onPdfFile, onSyncWebmegler,
  showSync = true, pendingSync, pendingSaveHtml, pendingPDF, showSaveHtml, showSave, onSaveHtml, onSave,
}: ToolbarProps) {
  // Regular users cannot add or paste elements — hide those tools entirely.
  const { canAddElements } = usePermissions();
  const role = getEditorRole();
  const syncBtnDisabled =pendingSaveHtml || role == "USER";
  return (
    <div className="nokonvo-toolbar" style={{ background: `linear-gradient(180deg, ${T.panelHi}, ${T.panel})`, borderBottom: `1px solid ${T.border}`, boxShadow: "0 1px 0 rgba(0,0,0,0.25), 0 3px 10px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", padding: 10, gap: 8, flexShrink: 0, flexWrap: "wrap", rowGap: 8, zIndex: 5 }}>
      <button className="nokonvo-burger" onClick={onToggleSidebar} title="Vis/skjul sidepanel" style={{ border: `1px solid ${T.accent}`, color: T.text, background: "transparent", borderRadius: 4, cursor: "pointer", padding: "4px 6px" }}><Menu size={16} /></button>
      <IconBtn onClick={onUndo} title="Angre (⌘Z)" disabled={!canUndo}><Undo2 size={14} /></IconBtn>
      <IconBtn onClick={onRedo} title="Gjør om (⌘⇧Z)" disabled={!canRedo}><Redo2 size={14} /></IconBtn>
      {canAddElements && (
        <>
          <Sep />
          <IconBtn onClick={() => onAddElement("text")} title="Legg til tekst (starts unlocked)">T+</IconBtn>
          <IconBtn onClick={() => onAddElement("collage")} title="Legg til collageramme"><LayoutGrid size={14} /></IconBtn>
          {clipboard && (
            <IconBtn onClick={onPaste} title="Lim inn element (⌘V)">
              <div className="flex items-center gap-2"><ClipboardPaste size={14} /> Lim inn</div>
            </IconBtn>
          )}
        </>
      )}
      <Sep />
      <IconBtn onClick={onToggleGrid} active={showGrid} title="Rutenett"><Grid2X2 size={12} /></IconBtn>
      <IconBtn
        onClick={onToggleViewMode}
        active={viewMode === "spread"}
        title="Vis dobbeltside"
      ><PanelsTopLeft size={12} /></IconBtn>
      <Sep />
      <IconBtn onClick={onZoomOut} title="Zoom ut"><Minus size={12} /></IconBtn>
      <span style={{ fontSize: 11, color: T.textDim, minWidth: 42, textAlign: "center", fontFamily: "ui-monospace, monospace" }}>{Math.round(zoom * 100)}%</span>
      <IconBtn onClick={onZoomIn} title="Zoom inn"><Plus size={12} /></IconBtn>
      <IconBtn onClick={onAutoFit} title="Tilpass til skjerm">Tilpass</IconBtn>
      <Sep />
      <div className="nokonvo-toolbar-title" style={{ flex: "1 1 auto", minWidth: 0, height: "100%", display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "center", gap: 10, marginInline: 10 }}>
        <div style={{ fontSize: 17, color: T.accent, letterSpacing: -0.3, fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Lokalmegleren Template Editor</div>
        <div style={{ fontSize: 13, color: T.textDim, whiteSpace: "nowrap" }}>{isLoading ? "Laster ..." : `(${pageCount} sider${viewMode === "spread" ? " · dobbeltside" : ""})`}</div>
      </div>
      <Sep />
      {role == "ADMIN" && (
      <button onClick={onPdfClick} style={{ ...btnPrimary, cursor: syncBtnDisabled ? "not-allowed" : "pointer",opacity: syncBtnDisabled ? 0.5 : 1 }} disabled={syncBtnDisabled} title={syncBtnDisabled ? "kun tilgang for administrator" : "Importer PDF"}>📄 Importer PDF</button>
      )}
      {showSync && (
      <button onClick={onSyncWebmegler} style={{ ...btnSecondary, cursor: syncBtnDisabled ? "not-allowed" : "pointer",opacity: syncBtnDisabled ? 0.5 : 1 }} disabled={syncBtnDisabled} title={syncBtnDisabled ? "kun tilgang for administrator" : "Synkroniser fra Webmegler"}>
        {pendingSync ? "Synkroniserer..." : "Synkroniser fra Webmegler"}
      </button>
      )}
      <input ref={pdfInputRef} type="file" accept="application/pdf,.pdf" style={{ display: "none" }} onChange={(e) => onPdfFile(e.target.files?.[0])} />
      {showSaveHtml && <button onClick={onSaveHtml} style={btnPrimary} disabled={pendingSaveHtml}>{pendingSaveHtml ? "Lagrer ..." : "Lagre HTML"}</button>}
      {showSave && <button onClick={onSave} style={btnSecondary} disabled={pendingPDF}>{pendingPDF ? "Genererer PDF ..." : "Åpne PDF"}</button>}
    </div>
  );
}
