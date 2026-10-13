"use client";

import { T } from "../constants";
import type { CanvasElement } from "../types";
import { parseSvgColors, parseSvgTexts, patchSvgColor, patchSvgText } from "../utils/svg";
import { SectionLabel, Field, ColorInput, Input, inputStyle } from "./primitives";

/* ═══════════════════════════════════════════════════════════════════════
   SVG INSPECTOR
   ═══════════════════════════════════════════════════════════════════════ */
interface SvgInspectorProps {
  el: CanvasElement;
  onChange: (el: CanvasElement) => void;
}

function SvgInspector({ el, onChange }: SvgInspectorProps) {
  const update = (patch: Partial<CanvasElement>) => onChange({ ...el, ...patch });
  const handleColorChange = (key: string, newColor: string) => {
    const newMarkup = patchSvgColor(el.svgMarkup, key, newColor);
    const newColors = el.svgColors.map((c) => c.key === key ? { ...c, color: newColor } : c);
    update({ svgMarkup: newMarkup, svgColors: newColors });
  };
  const handleTextChange = (key: string, newText: string) => {
    const newMarkup = patchSvgText(el.svgMarkup, key, newText);
    const newTexts = el.svgTexts.map((t) => t.key === key ? { ...t, text: newText } : t);
    update({ svgMarkup: newMarkup, svgTexts: newTexts });
  };
  const liveColors = el.svgColors.length > 0 ? el.svgColors : parseSvgColors(el.svgMarkup);
  const liveTexts = el.svgTexts.length > 0 ? el.svgTexts : parseSvgTexts(el.svgMarkup);

  return (
    <>
      <div style={{ margin: "8px 0 12px", display: "flex", justifyContent: "center", alignItems: "center", background: T.panelHi, borderRadius: 4, padding: 12, border: `1px solid ${T.border}`, minHeight: 60 }}>
        <div dangerouslySetInnerHTML={{ __html: el.svgMarkup }} />
      </div>
      {liveColors.length > 0 && (
        <><SectionLabel>SVG-farger</SectionLabel>
          {liveColors.map((node) => <Field key={node.key} label={node.label}><ColorInput value={node.color} onChange={(v) => handleColorChange(node.key, v)} /></Field>)}
        </>
      )}
      {liveTexts.length > 0 && (
        <><SectionLabel>SVG-tekst</SectionLabel>
          {liveTexts.map((node) => <Field key={node.key} label={node.label}><Input value={node.text} onChange={(v) => handleTextChange(node.key, v)} /></Field>)}
        </>
      )}
      {liveColors.length === 0 && liveTexts.length === 0 && (
        <div style={{ color: T.textDim, fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>Fant ingen redigerbare farger eller tekster i denne SVG-en.</div>
      )}
      <SectionLabel>Rå SVG-kode</SectionLabel>
      <textarea
        value={el.svgMarkup}
        rows={8}
        onChange={(e) => {
          const newMarkup = e.target.value;
          update({ svgMarkup: newMarkup, svgColors: parseSvgColors(newMarkup), svgTexts: parseSvgTexts(newMarkup) });
        }}
        style={inputStyle({ resize: "vertical", fontFamily: "ui-monospace, monospace", fontSize: 11 })}
      />
    </>
  );
}

export default SvgInspector;
