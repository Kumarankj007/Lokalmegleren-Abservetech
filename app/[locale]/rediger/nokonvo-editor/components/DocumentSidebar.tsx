"use client";

import React from "react";
import { Loader2 } from "lucide-react";

import { T } from "../constants";

function DocumentSidebar({ images = [], TabComponent, isLoadingDoc, progress, onImageClick, imageSelected }: { images: string[]; TabComponent: React.FC; isLoadingDoc?: boolean; progress?: { done: number; total: number }; onImageClick?: (src: string) => void; imageSelected?: boolean }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="space-y-2" style={{ padding: "8px", borderBottom: `1px solid ${T.border}` }}>
        <TabComponent />
        {progress && <p className="text-center">Dokumenter lastet {progress.done} / {progress.total}</p>}
      </div>
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {imageSelected && <div style={{ background: T.accent + "22", border: `1px solid ${T.accent}`, borderRadius: 4, padding: "6px 8px", marginBottom: 8, fontSize: 11, color: T.accent, textAlign: "center" }}>Klikk på et bilde for å erstatte det valgte</div>}
        {!isLoadingDoc && images.length === 0 && <div style={{ color: T.textDim, fontSize: 11, textAlign: "center", marginTop: 24, lineHeight: 1.5, padding: "0 8px" }}>Ingen dokumenter funnet</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {images.map((img, i) => (
            <div key={i} draggable onDragStart={(e) => e.dataTransfer.setData("imageSrc", img)} onClick={() => onImageClick?.(img)} title={imageSelected ? "Klikk for å erstatte valgt bilde" : "Dra til lerret"} style={{ position: "relative", aspectRatio: "1", borderRadius: 3, overflow: "hidden", cursor: imageSelected ? "pointer" : "grab", border: `1px solid ${imageSelected ? T.accent : T.border}`, background: T.bg }}>
              <img src={img} alt="dokument" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }} />
              {imageSelected && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}><span style={{ fontSize: 18 }}>⇄</span></div>}
            </div>
          ))}
          {isLoadingDoc && <Loader2 size={30} className="animate-spin self-center mx-auto" />}
        </div>
      </div>
    </div>
  );
}

export default DocumentSidebar;
