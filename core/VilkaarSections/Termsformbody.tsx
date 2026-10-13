"use client";
import React from "react";
import { List, Plus, X, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { TermsSection, LabeledItem } from "./types";

// ─── Field primitives

interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}

export const FieldLabel = ({ children, required, hint }: FieldLabelProps) => (
  <Label className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
    {children}
    {required && <span className="text-destructive">*</span>}
    {hint && (
      <span className="normal-case tracking-normal font-normal text-muted-foreground/50 ml-1">
        — {hint}
      </span>
    )}
  </Label>
);

// ─── Labeled list editor

const LabeledListEditor = ({
  items,
  onChange,
}: {
  items: LabeledItem[];
  onChange: (items: LabeledItem[]) => void;
}) => {
  const add = () => onChange([...items, { label: "", data: "" }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof LabeledItem, value: string) =>
    onChange(
      items.map((item, idx) =>
        idx === i ? { ...item, [field]: value } : item,
      ),
    );

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <div className="text-xs text-muted-foreground/50 py-3 text-center border border-dashed border-emerald-500/20 rounded-lg">
          No items yet
        </div>
      )}
      {items.map((item, i) => (
        <div
          key={i}
          className="grid grid-cols-[20px_1fr_28px] gap-2 items-start p-3 bg-muted/20 rounded-lg border border-border/40 hover:border-border/60 transition-colors"
        >
          <div className="flex flex-col items-center gap-1 pt-0.5">
            <GripVertical className="w-3 h-3 text-muted-foreground/25" />
            <span className="text-[9px] font-bold text-muted-foreground/40 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="space-y-1.5 min-w-0">
            <Input
              value={item.label ?? ""}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="Label (optional)"
              className="h-7 text-xs"
            />
            <Textarea
              value={item.data}
              onChange={(e) => update(i, "data", e.target.value)}
              placeholder="Item content *"
              rows={2}
              className="text-xs resize-none"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="mt-0.5 p-1 rounded text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-emerald-500/70 hover:text-emerald-400 font-medium transition-colors py-0.5"
      >
        <Plus className="w-3.5 h-3.5" />
        Add item
      </button>
    </div>
  );
};

// ─── Main form body

interface TermsFormBodyProps {
  form: TermsSection;
  set: (field: keyof TermsSection, value: unknown) => void;
}

const TermsFormBody = ({ form, set }: TermsFormBodyProps) => {
  const toggleLi = () => set("li", form.li !== undefined ? undefined : []);

  return (
    <div className="space-y-5">
      {/* ── Title ── */}
      <div>
        <FieldLabel required>Title</FieldLabel>
        <Input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Section title…"
          autoFocus
        />
      </div>

      <Separator className="opacity-30" />

      {/* ── Paragraphs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel hint="opening">Paragraph 1</FieldLabel>
          <Textarea
            value={form.p1 ?? ""}
            onChange={(e) => set("p1", e.target.value || undefined)}
            placeholder="Opening paragraph…"
            rows={4}
            className="resize-none text-sm"
          />
        </div>
        <div>
          <FieldLabel hint="closing">Paragraph 2</FieldLabel>
          <Textarea
            value={form.p2 ?? ""}
            onChange={(e) => set("p2", e.target.value || undefined)}
            placeholder="Closing paragraph…"
            rows={4}
            className="resize-none text-sm"
          />
        </div>
      </div>

      <Separator className="opacity-30" />

      {/* ── List (always visible, toggleable) ── */}
      <div className="space-y-3">
        {/* Toggle button */}
        <button
          type="button"
          onClick={toggleLi}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all duration-150 w-full ${
            form.li !== undefined
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:border-border"
          }`}
        >
          <List className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left">List items</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
              form.li !== undefined
                ? "bg-white/10 text-current"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {form.li !== undefined ? "ON" : "OFF"}
          </span>
        </button>

        {/* Expanded list panel */}
        {form.li !== undefined && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <List className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                List
              </span>
              {form.li.length > 0 && (
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                  {form.li.length}
                </span>
              )}
            </div>

            {/* Optional list heading */}
            <div className="mb-3">
              <FieldLabel hint="optional intro">List heading</FieldLabel>
              <Input
                value={form.liTitle ?? ""}
                onChange={(e) => set("liTitle", e.target.value || undefined)}
                placeholder="e.g. Følgende satser gjelder…"
                className="h-8 text-xs"
              />
            </div>

            <LabeledListEditor
              items={(form.li as LabeledItem[]) ?? []}
              onChange={(items) => set("li", items)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsFormBody;
