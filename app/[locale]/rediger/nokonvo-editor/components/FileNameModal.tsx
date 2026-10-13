"use client";

import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";

import { btnPrimary, btnSecondary } from "./primitives";

interface FileNameModalProps {
  open: boolean;
  value: string;
  onValueChange: (v: string) => void;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}

export default function FileNameModal({ open, value, onValueChange, onConfirm, onOpenChange, onCancel }: FileNameModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/10 backdrop-blur-xs" />
      <DialogContent style={{ borderRadius: 10, padding: 28, minWidth: 340, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>Save HTML</div>
        <p style={{ fontSize: 13, color: "#666", margin: 0 }}>Enter a file name for this template.</p>
        <input autoFocus type="text" value={value} onChange={(e) => onValueChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onConfirm()} placeholder="e.g. 600000017" style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 12px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={btnSecondary}>Cancel</button>
          <button onClick={onConfirm} style={btnPrimary} disabled={!value.trim()}>Save</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
