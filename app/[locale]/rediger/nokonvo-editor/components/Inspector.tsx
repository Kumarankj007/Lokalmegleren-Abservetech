"use client";

import { useState, useMemo } from "react";
import { Lock, Unlock, Copy, CopyPlus, Trash2, RotateCcw, RotateCw } from "lucide-react";

import { T, COLLAGE_LAYOUTS } from "../constants";
import type { CanvasElement, FlowBlock, FlowBlockStyle, Page } from "../types";
import { cellsForLayout } from "../utils/factories";
import { blockToElement } from "../utils/blockStyle";
import { usePermissions } from "../utils/permissions";
import {
  SectionLabel, Field, Input, ColorInput, NumInput, Select, IconBtn, AutoTextarea,
  inputStyle, btnPrimary, btnSecondary,
} from "./primitives";
import SvgInspector from "./SvgInspector";

/* ═══════════════════════════════════════════════════════════════════════
   INSPECTOR
   ═══════════════════════════════════════════════════════════════════════ */
interface InspectorProps {
  el: CanvasElement | null;
  page: Page | null;
  onChange: (el: CanvasElement) => void;
  onChangePage: (p: Page) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSplit?: () => void;
  onCopy?: () => void;
  onDeletePage?: () => void;
  // Richflow editing: the selected accordion LINE, edited through the same text
  // inspector as a normal text element (a synthetic element built from the block).
  // `seed` = the line's live computed style, so fields reflect the real look.
  flowBlock?: {
    block: FlowBlock;
    seed?: FlowBlockStyle;
    onChange: (el: CanvasElement) => void;
    onChangeTag: (tag: string) => void;
    onDelete: () => void;
    onDuplicate: () => void;
  } | null;
}

function Inspector({ el, page, onChange, onChangePage, onDelete, onDuplicate, onSplit, onCopy, onDeletePage, flowBlock }: InspectorProps) {
  // Regular users may edit content/appearance of existing blocks, but not the
  // layout actions below (transform, copy, duplicate, delete, split, page ops).
  const { canTransformElements, canAddElements, canDuplicateElements, canDeleteElements, canManagePages } = usePermissions();
  const [openSections, setOpenSections] = useState({
    typography: true, color: true, box: false, border: false, effects: false, image: true, binding: true,
  });
  const toggle = (k: keyof typeof openSections) => setOpenSections((s) => ({ ...s, [k]: !s[k] }));

  // A flow LINE is selected → drive the SAME text inspector with a synthetic
  // text element built from the block (so all the styling fields show); edits map
  // back to the line. Recomputed whenever the block or its computed-style seed changes.
  const flowEl = useMemo(
    () => (flowBlock ? blockToElement(flowBlock.block, flowBlock.seed) : null),
    [flowBlock],
  );
  const isFlowBlock = !!flowBlock && !!flowEl;

  if (!flowEl && !el && !page) return null;

  if (!flowEl && !el && page) {
    // Page-level properties are layout settings. Regular users get a read-only
    // summary (no editable fields that would silently no-op) instead.
    if (!canManagePages) {
      return (
        <div style={{ padding: 16 }}>
          <SectionLabel>Side</SectionLabel>
          <Field label="Navn"><div style={{ fontSize: 12, color: T.text }}>{page.name}</div></Field>
          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5, background: T.panelHi, border: `1px solid ${T.border}`, borderRadius: 4, padding: 10, marginTop: 8 }}>
            Velg et tekst- eller bildeelement for å redigere innholdet. Sideoppsett
            kan bare endres av administratorer.
          </div>
        </div>
      );
    }
    return (
      <div style={{ padding: 16 }}>
        <SectionLabel>Side</SectionLabel>
        <Field label="Navn"><Input value={page.name} onChange={(v) => onChangePage({ ...page, name: v })} /></Field>
        <Field label="Bakgrunn"><ColorInput value={page.bg} onChange={(v) => onChangePage({ ...page, bg: v })} /></Field>
        <Field label="størrelse"><p>A4</p></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <Field label="Bredde"><NumInput value={page.width} onChange={(v) => onChangePage({ ...page, width: v })} /></Field>
          <Field label="Høyde"><NumInput value={page.height} onChange={(v) => onChangePage({ ...page, height: v })} /></Field>
        </div>
        {page.loop && (
          <>
            <SectionLabel>Løkkebinding</SectionLabel>
            <Field label="Kildedata"><Input mono value={page.loop.source} onChange={(v) => onChangePage({ ...page, loop: { ...page.loop!, source: v } })} /></Field>
            <Field label="Iterasjonsvariabel"><Input mono value={page.loop.iter} onChange={(v) => onChangePage({ ...page, loop: { ...page.loop!, iter: v } })} /></Field>
            <div style={{ fontSize: 11, color: T.textDim, background: T.panelHi, border: `1px solid ${T.border}`, borderRadius: 4, padding: 10, marginTop: 8, lineHeight: 1.5, fontFamily: "ui-monospace, monospace" }}>
              {`<% ${page.loop.source}.forEach((${page.loop.iter}) => { %> ... <% }); %>`}
            </div>
          </>
        )}
        {onDeletePage && canManagePages && (
          <div style={{ marginTop: 20 }}>
            <button onClick={onDeletePage} style={{ ...btnPrimary, background: T.danger, width: "100%" }}>🗑 Slett denne siden</button>
          </div>
        )}
      </div>
    );
  }

  const e = (flowEl ?? el)!;
  // For a flow line, edits go back to the line (splice the master stream); for a
  // normal element they update the model element.
  const update = (patch: Partial<CanvasElement>) =>
    isFlowBlock ? flowBlock!.onChange({ ...e, ...patch }) : onChange({ ...e, ...patch });
  const isText = e.type === "text";

  return (
    <div style={{ padding: 16 }}>
      {/* ── Header row: type label + action buttons ─────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 10, letterSpacing: 1.4, color: T.accent, fontFamily: "ui-monospace, monospace", textTransform: "uppercase" }}>
          {isFlowBlock ? "linje" : e.type}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {/* ── LOCK TOGGLE ──────────────────────────────────────────────
              Locked   → gold lock icon → click to UNLOCK (allow dragging)
              Unlocked → muted lock icon → click to LOCK (protect position)
              The text in the inspector remains fully editable regardless.
              A flow line has no position, so no lock toggle. Locking only
              matters when the element can be moved → transform-capable users. */}
          {!isFlowBlock && canTransformElements && (
            <IconBtn
              onClick={() => update({ locked: !e.locked })}
              title={e.locked
                ? "Lås opp — tillat at elementet flyttes"
                : "Lås — hindre utilsiktet flytting (tekst forblir redigerbar)"}
              color={e.locked ? T.accent : T.textDim}
            >
              {e.locked ? <Lock size={16} /> : <Unlock size={16} />}
            </IconBtn>
          )}

          {/* Copy/duplicate would clone the whole flow block — not meaningful for
              richflow; for a flow LINE, duplicate/delete act on that one line.
              These add/remove content, so they are gated by role. */}
          {onCopy && e.type !== "richflow" && !isFlowBlock && canAddElements && (
            <IconBtn onClick={onCopy} title="Kopier (⌘C)"><Copy size={16} /></IconBtn>
          )}
          {isFlowBlock
            ? (canDuplicateElements && (
                <IconBtn onClick={flowBlock!.onDuplicate} title="Dupliser linje"><CopyPlus size={16} /></IconBtn>
              ))
            : (e.type !== "richflow" && canDuplicateElements && (
                <IconBtn onClick={onDuplicate} title="Dupliser"><CopyPlus size={16} /></IconBtn>
              ))}
          {canDeleteElements && (
            <IconBtn onClick={isFlowBlock ? flowBlock!.onDelete : onDelete} title={isFlowBlock ? "Slett linje" : "Slett"} color={T.danger}><Trash2 size={16} /></IconBtn>
          )}
        </div>
      </div>

      {/* ── Lock status hint ──────────────────────────────────────────── */}
      {!isFlowBlock && e.locked && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6, padding: "5px 8px",
          background: `${T.accent}18`, border: `1px solid ${T.accent}44`,
          borderRadius: 4, marginBottom: 10, fontSize: 10, color: T.accent,
          fontFamily: "ui-monospace, monospace",
        }}>
          <Lock size={10} />
          Posisjon låst — tekst kan fremdeles redigeres her
        </div>
      )}

      {e.type === "richflow" && (
        <>
          <SectionLabel>Flyt-innhold</SectionLabel>
          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5, background: T.panelHi, border: `1px solid ${T.border}`, borderRadius: 4, padding: 10, marginBottom: 10 }}>
            Klikk på en enkelt linje på siden for å redigere akkurat den linjen —
            ikke hele siden. Linjen blir markert og kan endres her.
          </div>
        </>
      )}

      {e.type === "svg" && <SvgInspector el={e} onChange={onChange} />}

      {e.type === "text" && (
        <>
          <SectionLabel>{isFlowBlock ? "Linjeinnhold" : "Tekstinnhold"}</SectionLabel>
          {isFlowBlock && (
            <Field label="Type">
              <Select
                value={flowBlock!.block.tag || "p"}
                onChange={(v) => flowBlock!.onChangeTag(v)}
                options={["p", "h1", "h2", "h3"]}
                labels={{ p: "Avsnitt", h1: "Overskrift 1", h2: "Overskrift 2", h3: "Overskrift 3" }}
              />
            </Field>
          )}
          <Field label={e.bind ? "Reservetekst (bundet)" : isFlowBlock ? "Linjetekst" : "Tekst"}>
            <AutoTextarea value={e.text} onChange={(v) => update({ text: v })} style={inputStyle({ fontFamily: "ui-monospace, monospace" })} />
          </Field>
          {/* Auto-height hint */}
          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5, background: T.panelHi, border: `1px solid ${T.border}`, borderRadius: 4, padding: 10, marginBottom: 4 }}>
            {isFlowBlock
              ? "Du redigerer kun denne linjen. Endre stil under; linjen flyter automatisk videre hvis den blir for lang."
              : "Høyden justeres automatisk etter innholdet. Elementer under flyttes ned ved behov, så teksten aldri overlapper."}
          </div>

          <SectionLabel collapsible open={openSections.typography} onToggle={() => toggle("typography")}>Typografi</SectionLabel>
          {openSections.typography && (
            <>
              <Field label="Skriftfamilie">
                <Select value={e.fontFamily} onChange={(v) => update({ fontFamily: v })} options={["Helvetica", "Arial", "Georgia", "Times", "ui-serif", "ui-sans-serif", "ui-monospace"]} />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <Field label="Størrelse"><NumInput value={e.fontSize} onChange={(v) => update({ fontSize: v })} min={6} max={200} /></Field>
                <Field label="Tykkelse"><Select value={e.fontWeight} onChange={(v) => update({ fontWeight: v })} options={["100", "200", "300", "normal", "500", "600", "bold", "800", "900"]} /></Field>
                <Field label="Stil"><Select value={e.fontStyle} onChange={(v) => update({ fontStyle: v })} options={["normal", "italic", "oblique"]} /></Field>
                <Field label="Justering"><Select value={e.textAlign} onChange={(v) => update({ textAlign: v })} options={["left", "center", "right", "justify"]} /></Field>
                <Field label="Linjehøyde"><Input value={e.lineHeight} onChange={(v) => update({ lineHeight: v })} /></Field>
                <Field label="Tegnavst."><Input value={e.letterSpacing} onChange={(v) => update({ letterSpacing: v })} /></Field>
                <Field label="Ordavst."><Input value={e.wordSpacing} onChange={(v) => update({ wordSpacing: v })} /></Field>
                <Field label="Transformasjon"><Select value={e.textTransform} onChange={(v) => update({ textTransform: v })} options={["none", "uppercase", "lowercase", "capitalize"]} /></Field>
                <Field label="Dekorasjon"><Select value={e.textDecoration} onChange={(v) => update({ textDecoration: v })} options={["none", "underline", "line-through", "overline"]} /></Field>
                <Field label="Mellomrom"><Select value={e.whiteSpace} onChange={(v) => update({ whiteSpace: v })} options={["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]} /></Field>
              </div>
              <Field label="Tekstskygge"><Input mono value={e.textShadow} onChange={(v) => update({ textShadow: v })} placeholder="2px 2px 4px rgba(0,0,0,0.3)" /></Field>
            </>
          )}

          <SectionLabel collapsible open={openSections.color} onToggle={() => toggle("color")}>Farge</SectionLabel>
          {openSections.color && (
            <Field label="Tekstfarge"><ColorInput value={e.color} onChange={(v) => update({ color: v })} /></Field>
          )}
        </>
      )}

      {e.type === "image" && (
        <>
          {e.spanning && onSplit && canAddElements && (
            <>
              <SectionLabel>Dobbeltsidebilde</SectionLabel>
              <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5, background: T.panelHi, border: `1px solid ${T.border}`, borderRadius: 4, padding: 10, marginBottom: 8 }}>
                Dette bildet dekker begge sider. Plasser og endre størrelse først, og klikk deretter Del bilde for å dele det ved sidekanten.
              </div>
              <button onClick={onSplit} style={{ ...btnPrimary, width: "100%", marginBottom: 8 }}>✂ Del bilde</button>
            </>
          )}
          <SectionLabel collapsible open={openSections.image} onToggle={() => toggle("image")}>Bildeinnhold</SectionLabel>
          {openSections.image && (
            <>
              <Field label={e.bindSrc ? "Reservekilde (bundet)" : "Kilde-URL"}>
                <Input mono value={e.src} disabled onChange={(v) => update({ src: v })} />
              </Field>
              <Field label="Objekttilpasning">
                <Select value={e.objectFit} onChange={(v) => update({ objectFit: v })} options={["cover", "contain", "fill", "scale-down", "none"]} />
              </Field>
              <Field label="Filter">
                <Input mono value={e.imageFilter} onChange={(v) => update({ imageFilter: v })} placeholder="brightness(1.1) saturate(1.2)" />
              </Field>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {[["Ingen", "none"], ["S&H", "grayscale(1)"], ["Sepia", "sepia(0.6)"], ["Lys", "brightness(1.15) saturate(1.1)"], ["Mørk", "brightness(0.8)"]].map(([label, val]) => (
                  <button key={label} onClick={() => update({ imageFilter: val })} style={{ ...btnSecondary, padding: "3px 8px", fontSize: 10 }}>{label}</button>
                ))}
              </div>

              <SectionLabel>Zoom og plassering</SectionLabel>
              <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5, background: T.panelHi, border: `1px solid ${T.border}`, borderRadius: 4, padding: 10, marginBottom: 6 }}>
                Tips: hold ⌥ Alt og dra i bildet på lerretet for å flytte utsnittet.
              </div>
              <div style={{ width: "100%", height: 80, borderRadius: 3, overflow: "hidden", marginBottom: 8, border: `1px solid ${T.border}`, background: T.bg }}>
                <img src={e.src} alt="" style={{ width: "100%", height: "100%", objectFit: (e.objectFit as any) || "cover", objectPosition: `${e.imagePosX ?? 50}% ${e.imagePosY ?? 50}%`, transform: `scale(${e.imageScale ?? 1})`, transformOrigin: `${e.imagePosX ?? 50}% ${e.imagePosY ?? 50}%`, display: "block" }} />
              </div>
              <Field label={`Zoom · ${(e.imageScale ?? 1).toFixed(2)}×`}>
                <input type="range" min={1} max={3} step={0.05} value={e.imageScale ?? 1} onChange={(ev) => update({ imageScale: parseFloat(ev.target.value) })} style={{ width: "100%" }} />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <Field label={`Posisjon X · ${Math.round(e.imagePosX ?? 50)}%`}>
                  <input type="range" min={0} max={100} step={1} value={e.imagePosX ?? 50} onChange={(ev) => update({ imagePosX: parseFloat(ev.target.value) })} style={{ width: "100%" }} />
                </Field>
                <Field label={`Posisjon Y · ${Math.round(e.imagePosY ?? 50)}%`}>
                  <input type="range" min={0} max={100} step={1} value={e.imagePosY ?? 50} onChange={(ev) => update({ imagePosY: parseFloat(ev.target.value) })} style={{ width: "100%" }} />
                </Field>
              </div>
              <button onClick={() => update({ imageScale: 1, imagePosX: 50, imagePosY: 50 })} style={{ ...btnSecondary, width: "100%", padding: "5px 8px", fontSize: 11, marginTop: 6 }}>
                Tilbakestill zoom og plassering
              </button>
            </>
          )}
        </>
      )}

      {e.type === "collage" && (
        <>
          <SectionLabel>Collageoppsett</SectionLabel>
          <Field label="Oppsett">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {Object.entries(COLLAGE_LAYOUTS).map(([key, def]) => {
                const activeLayout = e.collageLayout === key;
                return (
                  <button key={key} onClick={() => update({ collageLayout: key, collageCells: cellsForLayout(key, e.collageCells) })}
                    style={{ ...btnSecondary, padding: "5px 6px", fontSize: 10, borderColor: activeLayout ? T.accent : T.border, color: activeLayout ? T.accent : T.text, background: activeLayout ? T.panelHi : "transparent" }}>
                    {def.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Mellomrom (px)"><NumInput value={e.collageGap} min={0} max={40} onChange={(v) => update({ collageGap: v })} /></Field>
          <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5, background: T.panelHi, border: `1px solid ${T.border}`, borderRadius: 4, padding: 10, marginTop: 4, marginBottom: 4 }}>
            Dra et bilde fra sidefeltet til en celle for å fylle den.
          </div>
          <SectionLabel>Celler</SectionLabel>
          {e.collageCells.map((c, idx) => (
            <div key={idx} style={{ border: `1px solid ${T.border}`, borderRadius: 4, padding: 8, marginBottom: 8, background: T.panel }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, letterSpacing: 1, color: T.accent, fontFamily: "ui-monospace, monospace", textTransform: "uppercase" }}>Celle {idx + 1}</span>
                {c.src && (
                  <IconBtn title="Fjern bilde" color={T.danger} onClick={() => {
                    const cells = e.collageCells.map((cc, i) => i === idx ? { ...cc, src: "", scale: 1, posX: 50, posY: 50 } : cc);
                    update({ collageCells: cells });
                  }}><Trash2 size={13} /></IconBtn>
                )}
              </div>
              {c.src ? (
                <>
                  <div style={{ width: "100%", height: 70, borderRadius: 3, overflow: "hidden", marginBottom: 6, border: `1px solid ${T.border}`, background: T.bg }}>
                    <img src={c.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${c.posX}% ${c.posY}%`, transform: `scale(${c.scale})`, transformOrigin: "center", display: "block" }} />
                  </div>
                  <Field label={`Zoom · ${c.scale.toFixed(2)}×`}>
                    <input type="range" min={1} max={3} step={0.05} value={c.scale}
                      onChange={(ev) => { const v = parseFloat(ev.target.value); const cells = e.collageCells.map((cc, i) => i === idx ? { ...cc, scale: v } : cc); update({ collageCells: cells }); }}
                      style={{ width: "100%" }} />
                  </Field>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <Field label={`Posisjon X · ${Math.round(c.posX)}%`}>
                      <input type="range" min={0} max={100} step={1} value={c.posX}
                        onChange={(ev) => { const v = parseFloat(ev.target.value); const cells = e.collageCells.map((cc, i) => i === idx ? { ...cc, posX: v } : cc); update({ collageCells: cells }); }}
                        style={{ width: "100%" }} />
                    </Field>
                    <Field label={`Posisjon Y · ${Math.round(c.posY)}%`}>
                      <input type="range" min={0} max={100} step={1} value={c.posY}
                        onChange={(ev) => { const v = parseFloat(ev.target.value); const cells = e.collageCells.map((cc, i) => i === idx ? { ...cc, posY: v } : cc); update({ collageCells: cells }); }}
                        style={{ width: "100%" }} />
                    </Field>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11, color: T.textDim, textAlign: "center", padding: "8px 4px" }}>Tom — dra et bilde hit på lerretet</div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Position only applies to absolutely-placed elements — a flow line is
          positioned by the column flow, so the geometry grid is hidden for it.
          Geometry (position/size/rotation/z-index) is layout editing → admins
          only; regular users edit content/appearance but not placement. */}
      {!isFlowBlock && canTransformElements && (
        <>
          <SectionLabel>Geometri</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <Field label="X"><NumInput value={e.x} onChange={(v) => update({ x: v })} /></Field>
            <Field label="Y"><NumInput value={e.y} onChange={(v) => update({ y: v })} /></Field>
            <Field label="B"><NumInput value={e.width} onChange={(v) => update({ width: v })} /></Field>
            <Field label={isText ? "H (auto)" : "H"}>
              {/* Height is auto-managed for text; the field is read-only there. */}
              <NumInput value={Math.round(e.height)} onChange={(v) => { if (!isText) update({ height: v }); }} />
            </Field>
            <Field label="Roter (grader)">
              <div style={{ display: "flex", gap: 4 }}>
                <NumInput value={e.rotation} onChange={(v) => update({ rotation: v })} />
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                <button onClick={() => update({ rotation: (((e.rotation - 45) % 360) + 360) % 360 })} title="Roter -45°" style={{ ...btnSecondary, flex: 1, padding: "3px 6px", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                  <RotateCcw size={12} /> -45°
                </button>
                <button onClick={() => update({ rotation: (e.rotation + 45) % 360 })} title="Roter +45°" style={{ ...btnSecondary, flex: 1, padding: "3px 6px", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                  <RotateCw size={12} /> +45°
                </button>
                <button onClick={() => update({ rotation: 0 })} title="Tilbakestill rotasjon" style={{ ...btnSecondary, padding: "3px 8px", fontSize: 11 }}>↺ 0°</button>
              </div>
            </Field>
            <Field label="Z-indeks"><NumInput value={e.zIndex} onChange={(v) => update({ zIndex: v })} /></Field>
          </div>
        </>
      )}
      <Field label={`Gjennomsiktighet · ${Math.round(e.opacity * 100)}%`}>
        <input type="range" min={0} max={1} step={0.05} value={e.opacity} onChange={(ev) => update({ opacity: parseFloat(ev.target.value) })} style={{ width: "100%" }} />
      </Field>

      <SectionLabel collapsible open={openSections.box} onToggle={() => toggle("box")}>Boks</SectionLabel>
      {openSections.box && (
        <>
          <Field label="Bakgrunn"><ColorInput value={e.background} onChange={(v) => update({ background: v })} allowTransparent /></Field>
          <Field label="Innvendig marg (T H B V)">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
              <NumInput value={e.padding.t} onChange={(v) => update({ padding: { ...e.padding, t: v } })} />
              <NumInput value={e.padding.r} onChange={(v) => update({ padding: { ...e.padding, r: v } })} />
              <NumInput value={e.padding.b} onChange={(v) => update({ padding: { ...e.padding, b: v } })} />
              <NumInput value={e.padding.l} onChange={(v) => update({ padding: { ...e.padding, l: v } })} />
            </div>
          </Field>
          <Field label="Hjørneradius (ØV ØH NH NV)">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
              <NumInput value={e.borderRadius.tl} onChange={(v) => update({ borderRadius: { ...e.borderRadius, tl: v } })} />
              <NumInput value={e.borderRadius.tr} onChange={(v) => update({ borderRadius: { ...e.borderRadius, tr: v } })} />
              <NumInput value={e.borderRadius.br} onChange={(v) => update({ borderRadius: { ...e.borderRadius, br: v } })} />
              <NumInput value={e.borderRadius.bl} onChange={(v) => update({ borderRadius: { ...e.borderRadius, bl: v } })} />
            </div>
          </Field>
        </>
      )}

      <SectionLabel collapsible open={openSections.border} onToggle={() => toggle("border")}>Ramme</SectionLabel>
      {openSections.border && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <Field label="Bredde"><NumInput value={e.borderWidth} onChange={(v) => update({ borderWidth: v })} min={0} /></Field>
            <Field label="Stil"><Select value={e.borderStyle} onChange={(v) => update({ borderStyle: v })} options={["solid", "dashed", "dotted", "double"]} /></Field>
          </div>
          <Field label="Farge"><ColorInput value={e.borderColor} onChange={(v) => update({ borderColor: v })} /></Field>
        </>
      )}

      <SectionLabel collapsible open={openSections.effects} onToggle={() => toggle("effects")}>Effekter</SectionLabel>
      {openSections.effects && (
        <>
          <Field label="Boksskygge"><Input mono value={e.boxShadow} onChange={(v) => update({ boxShadow: v })} placeholder="0 4px 12px rgba(0,0,0,0.15)" /></Field>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {[["Ingen", "none"], ["Myk", "0 2px 8px rgba(0,0,0,0.1)"], ["Kort", "0 4px 16px rgba(0,0,0,0.15)"], ["Løftet", "0 12px 32px rgba(0,0,0,0.2)"]].map(([label, val]) => (
              <button key={label} onClick={() => update({ boxShadow: val })} style={{ ...btnSecondary, padding: "3px 8px", fontSize: 10 }}>{label}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Inspector;
