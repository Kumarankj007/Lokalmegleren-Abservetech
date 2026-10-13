"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { APIURLS } from "@/services/config";
import { T } from "../constants";
import type { UploadedImage } from "../types";
import { btnPrimary } from "./primitives";

/* ═══════════════════════════════════════════════════════════════════════
   ASSET SIDEBAR
   ═══════════════════════════════════════════════════════════════════════ */
function AssetSidebar({ images, uploaded, onUpload, TabComponent, onImageClick, onDelete, imageSelected }: { images: UploadedImage[]; uploaded: UploadedImage[]; onDelete: (src: string) => void; onUpload: (images: { src: string; name: string }[]) => void; TabComponent: React.FC; onImageClick?: (src: string) => void; imageSelected?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const id = useSearchParams().get("path");
  const intialPage = APIURLS?.frontendUrl + "logo.png";
  const all = [{ src: intialPage, label: "logo", deletable: false }, ...uploaded.map((img) => ({ ...img, deletable: true })), ...images.map((img) => ({ ...img, deletable: false }))];

  const handleDelete = (src: string) => {
    if (id) {
      const existingImages: { src: string; name: string }[] = JSON.parse(localStorage.getItem(`uploaded-images-${id}`) || "[]");
      localStorage.setItem(`uploaded-images-${id}`, JSON.stringify(existingImages.filter((img) => img.src !== src)));
    }
    onDelete(src);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const results: { src: string; name: string }[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      const src = await new Promise<string>((res) => { const r = new FileReader(); r.onload = (e) => res(e.target?.result as string); r.readAsDataURL(f); });
      results.push({ src, name: f.name });
    }
    if (id) {
      const existingImages: { src: string; name: string }[] = JSON.parse(localStorage.getItem(`uploaded-images-${id}`) || "[]");
      const newOnly = results.filter((r) => !existingImages.some((e) => e.src === r.src));
      localStorage.setItem(`uploaded-images-${id}`, JSON.stringify([...existingImages, ...newOnly]));
      onUpload(newOnly);
    } else {
      onUpload(results);
    }
  };

  useEffect(() => {
    if (!id) return;
    const savedImages: { src: string; name: string }[] = JSON.parse(localStorage.getItem(`uploaded-images-${id}`) || "[]");
    if (savedImages.length) onUpload(savedImages);
  }, [id]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
      <div className="space-y-2" style={{ padding: "8px", borderBottom: `1px solid ${T.border}` }}>
        <TabComponent />
        <button onClick={() => fileRef.current?.click()} style={{ ...btnPrimary, width: "100%", padding: "6px", fontSize: 11 }}>+ Last opp bilde</button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { handleFiles(e.target.files); if (fileRef.current) fileRef.current.value = ""; }} />
      </div>
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {imageSelected && <div style={{ background: T.accent + "22", border: `1px solid ${T.accent}`, borderRadius: 4, padding: "6px 8px", marginBottom: 8, fontSize: 11, color: T.accent, textAlign: "center" }}>Klikk på et bilde for å erstatte det valgte</div>}
        {all.length === 0 && <div style={{ color: T.textDim, fontSize: 11, textAlign: "center", marginTop: 24, lineHeight: 1.5, padding: "0 8px" }}>Last opp bilder eller<br />slipp dem her</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {all.map((img, i) => (
            <div key={i} draggable onDragStart={(e) => e.dataTransfer.setData("imageSrc", img.src)} onClick={() => onImageClick?.(img.src)} title={imageSelected ? "Klikk for å erstatte valgt bilde" : img.label || "Dra til lerret"} style={{ position: "relative", aspectRatio: "1", borderRadius: 3, overflow: "hidden", cursor: imageSelected ? "pointer" : "grab", border: `1px solid ${imageSelected ? T.accent : T.border}`, background: T.bg }}>
              <img src={img.src} alt={img.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }} />
              {img.deletable && <button onClick={(e) => { e.stopPropagation(); handleDelete(img.src); }} style={{ position: "absolute", top: 3, right: 3, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, padding: 0 }}>✕</button>}
              {imageSelected && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}><span style={{ fontSize: 18 }}>⇄</span></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AssetSidebar;
