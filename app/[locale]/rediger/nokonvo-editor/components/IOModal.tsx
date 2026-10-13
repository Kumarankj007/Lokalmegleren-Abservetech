"use client";

import { useState, useEffect } from "react";

import { showToast } from "@/lib/toastSonner";
import { T } from "../constants";
import { btnPrimary, btnSecondary } from "./primitives";

/* ═══════════════════════════════════════════════════════════════════════
   IO MODAL
   ═══════════════════════════════════════════════════════════════════════ */
function IOModal({ mode, content, onClose, onLoad }: { mode: "import" | "ejs" | "editable"; content: string; onClose: () => void; onLoad?: (html: string) => void }) {
  const [text, setText] = useState(content);
  useEffect(() => setText(content), [content]);
  const copy = () => { navigator.clipboard?.writeText(text); showToast.success("Kopiert til utklippstavlen"); onClose(); };
  const download = () => {
    const blob = new Blob([text], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "ejs" ? "template.ejs" : "template.html";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 6, width: "min(900px, 100%)", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: T.accent, fontSize: 13, letterSpacing: 1, fontFamily: "ui-monospace, monospace" }}>
            {mode === "import" ? "IMPORTER MAL" : mode === "ejs" ? "EKSPORTER · EJS" : "EKSPORTER · REDIGERBAR HTML"}
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.text, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} style={{ flex: 1, minHeight: 320, background: T.bg, color: T.text, border: "none", padding: 16, fontFamily: "ui-monospace, monospace", fontSize: 12, outline: "none", resize: "none" }} />
        <div style={{ padding: 12, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {mode !== "import" && (<><button onClick={copy} style={btnSecondary}>Kopier</button><button onClick={download} style={btnSecondary}>Last ned</button></>)}
          {mode === "import" && onLoad && <button onClick={() => onLoad(text)} style={btnPrimary}>Last inn mal</button>}
        </div>
      </div>
    </div>
  );
}

export default IOModal;
