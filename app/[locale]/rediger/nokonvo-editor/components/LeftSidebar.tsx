"use client";

import { T } from "../constants";
import type { Page, CanvasElement, FlowBlock, UploadedImage } from "../types";

import PageList from "./PageList";
import AssetSidebar from "./AssetSidebar";
import DocumentSidebar from "./DocumentSidebar";

interface LeftSidebarProps {
  tab: string;
  pages: Page[];
  pageIdx: number;
  viewMode: "single" | "spread";
  spreadCoverOnly: boolean;
  spreadLeftIdx: number;
  data: Record<string, any>;
  documentImages: string[];
  isLoadingDoc: boolean;
  progress: { done: number; total: number };
  images: UploadedImage[];
  uploaded: UploadedImage[];
  selectedEl: CanvasElement | null;
  richFlowSlices: Record<string, FlowBlock[]>;
  TabComponent: React.FC;
  onSelectPage: (i: number) => void;
  onAddPage: () => void;
  onDeletePage: (i: number) => void;
  onMovePage: (i: number, dir: -1 | 1) => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
  onReorderMulti: (indices: number[], toIdx: number) => void;
  onDeleteMulti: (indices: number[]) => void;
  onDuplicatePage: (i: number) => void;
  onInsertAfter: (i: number) => void;
  onDocImageClick: (src: string) => void;
  onUpload: (images: { src: string; name: string }[]) => void;
  onDeleteUploaded: (src: string) => void;
  onAssetImageClick: (src: string) => void;
}

export default function LeftSidebar({
  tab, pages, pageIdx, viewMode, spreadCoverOnly, spreadLeftIdx, data,
  documentImages, isLoadingDoc, progress, images, uploaded, selectedEl, richFlowSlices, TabComponent,
  onSelectPage, onAddPage, onDeletePage, onMovePage, onReorder, onReorderMulti,
  onDeleteMulti, onDuplicatePage, onInsertAfter, onDocImageClick, onUpload, onDeleteUploaded, onAssetImageClick,
}: LeftSidebarProps) {
  return tab === "pages" ? (
    <div style={{ width: "clamp(190px, 18vw, 230px)", background: T.panel, borderRight: `1px solid ${T.border}`, flexShrink: 0 }}>
      <PageList
        pages={pages} currentIdx={pageIdx}
        secondaryIdx={viewMode === "spread" && !spreadCoverOnly ? spreadLeftIdx + 1 : undefined}
        data={data}
        onSelect={onSelectPage}
        onAdd={onAddPage} onDelete={onDeletePage} TabComponent={TabComponent}
        onMove={onMovePage} onReorder={onReorder} onReorderMulti={onReorderMulti}
        onDeleteMulti={onDeleteMulti} onDuplicate={onDuplicatePage} onInsertAfter={onInsertAfter}
        richFlowSlices={richFlowSlices}
      />
    </div>
  ) : tab === "documents" && documentImages.length > 0 ? (
    <div style={{ width: "clamp(190px, 18vw, 230px)", background: T.panel, borderRight: `1px solid ${T.border}`, flexShrink: 0 }}>
      <DocumentSidebar images={documentImages} TabComponent={TabComponent} isLoadingDoc={isLoadingDoc} progress={progress} imageSelected={selectedEl?.type === "image"} onImageClick={onDocImageClick} />
    </div>
  ) : (
    <div style={{ width: "clamp(190px, 18vw, 230px)", background: T.panel, borderRight: `1px solid ${T.border}`, flexShrink: 0 }}>
      <AssetSidebar images={images} TabComponent={TabComponent} uploaded={uploaded}
        onUpload={onUpload}
        onDelete={onDeleteUploaded}
        imageSelected={selectedEl?.type === "image"}
        onImageClick={onAssetImageClick}
      />
    </div>
  );
}
