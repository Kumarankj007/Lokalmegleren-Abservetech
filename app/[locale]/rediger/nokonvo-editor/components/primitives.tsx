"use client";

import React, { useEffect, useRef, CSSProperties } from "react";

import { T } from "../constants";

/* ═══════════════════════════════════════════════════════════════════════
   PRIMITIVE UI
   ═══════════════════════════════════════════════════════════════════════ */
export const inputStyle = (extra: CSSProperties = {}): CSSProperties => ({
  width: "100%", background: T.panelHi, border: `1px solid ${T.border}`, color: T.text,
  borderRadius: 3, padding: "5px 8px", fontSize: 12, outline: "none",
  fontFamily: "system-ui, sans-serif", boxSizing: "border-box", ...extra,
});

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, letterSpacing: 0.6, color: T.textDim, marginBottom: 3, textTransform: "uppercase" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

export function SectionLabel({ children, collapsible, open, onToggle }: { children: React.ReactNode; collapsible?: boolean; open?: boolean; onToggle?: () => void }) {
  return (
    <div
      onClick={collapsible ? onToggle : undefined}
      style={{ fontSize: 10, letterSpacing: 1.4, color: T.accent, fontFamily: "ui-monospace, monospace", textTransform: "uppercase", margin: "16px 0 8px", paddingBottom: 6, borderBottom: `1px solid ${T.border}`, cursor: collapsible ? "pointer" : "default", display: "flex", justifyContent: "space-between", userSelect: "none" }}
    >
      <span>{children}</span>
      {collapsible && <span style={{ color: T.textDim }}>{open ? "−" : "+"}</span>}
    </div>
  );
}

export function Input({ value, onChange, placeholder, disabled, mono }: { value: string | undefined | null; onChange: (v: string) => void; placeholder?: string; disabled?: boolean; mono?: boolean }) {
  return (
    <input
      type="text" value={value || ""} placeholder={placeholder} disabled={disabled}
      className={disabled ? "cursor-not-allowed" : ""}
      onChange={(e) => onChange(e.target.value)}
      style={inputStyle({ fontFamily: mono ? "ui-monospace, monospace" : undefined, opacity: disabled ? 0.5 : 1 })}
    />
  );
}
export function NumInput({ value, onChange, step = 1, min, max }: { value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number }) {
  return (
    <input
      type="number" value={Number.isFinite(value) ? value : 0} step={step} min={min} max={max}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      style={inputStyle()}
    />
  );
}
export function ColorInput({ value, onChange, allowTransparent = true }: { value: string; onChange: (v: string) => void; allowTransparent?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <input type="color" value={normalizeColor(value)} onChange={(e) => onChange(e.target.value)} style={{ width: 32, height: 28, border: "none", borderRadius: 3, cursor: "pointer", padding: 0 }} />
      <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} style={inputStyle({ fontFamily: "ui-monospace, monospace" })} />
      {allowTransparent && (
        <button onClick={() => onChange("transparent")} title="Gjennomsiktig" style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.textDim, borderRadius: 3, cursor: "pointer", padding: "0 8px", fontSize: 10 }}>⊘</button>
      )}
    </div>
  );
}
export function Select({ value, onChange, options, labels }: { value: string; onChange: (v: string) => void; options: string[]; labels?: Record<string, string> }) {
  return (
    <select value={value || ""} onChange={(e) => onChange(e.target.value)} style={inputStyle()}>
      {options.map((o) => <option key={o} value={o}>{labels?.[o] ?? o}</option>)}
    </select>
  );
}
export function IconBtn({ children, onClick, title, color, active = true, disabled }: { children: React.ReactNode; onClick?: () => void; title?: string; color?: string; active?: boolean; disabled?: boolean }) {
  return (
    <button onClick={onClick} title={title} disabled={disabled} style={{ border: `1px solid ${T.accent}`, color: disabled ? T.text : color || T.text, borderRadius: 3, opacity: disabled || !active ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer", padding: "3px 3px", fontSize: 12, lineHeight: 1 }}>
      {children}
    </button>
  );
}
export function Sep() {
  return <div style={{ width: 1, height: 22, background: T.border, margin: "0 4px" }} />;
}
export function normalizeColor(c: string): string {
  if (!c) return "#000000";
  if (c === "transparent") return "#ffffff";
  if (c.startsWith("#") && (c.length === 4 || c.length === 7)) return c;
  const m = String(c).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) {
    const hex = (n: string) => parseInt(n).toString(16).padStart(2, "0");
    return `#${hex(m[1])}${hex(m[2])}${hex(m[3])}`;
  }
  return "#000000";
}

export const btnPrimary: CSSProperties = {
  background: T.accent, color: T.brand, border: "none", padding: "7px 16px",
  borderRadius: 4, cursor: "pointer", fontWeight: 700, fontSize: 12,
};
export const btnSecondary: CSSProperties = {
  background: "transparent", color: T.text, border: `1px solid ${T.border}`,
  padding: "7px 7px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 700,
};

export function AutoTextarea({ value, onChange, style }: { value: string; onChange: (v: string) => void; style?: CSSProperties }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [value]);
  return (
    <textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} style={{ ...style, resize: "none", overflow: "hidden", minHeight: 60 }} />
  );
}
