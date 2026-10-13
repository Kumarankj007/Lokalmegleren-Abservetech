"use client";
import React from "react";
import { List, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { OmOssSection } from "./types";

interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}

const FieldLabel = ({ children, required, hint }: FieldLabelProps) => (
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

// ─── Plain string list editor

const PlainListEditor = ({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) => {
  const add = () => onChange([...items, ""]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, value: string) =>
    onChange(items.map((item, idx) => (idx === i ? value : item)));

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <div className="text-xs text-muted-foreground/50 py-3 text-center border border-dashed border-emerald-500/20 rounded-lg">
          No items yet — add the first one below
        </div>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-[10px] font-mono text-muted-foreground/40 w-5 text-right shrink-0 pt-2">
            {i + 1}
          </span>
          <Textarea
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Item ${i + 1}`}
            rows={2}
            className="text-xs resize-none flex-1"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="mt-1.5 p-1 rounded text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-emerald-500/70 hover:text-emerald-400 font-medium transition-colors py-0.5 ml-7"
      >
        <Plus className="w-3.5 h-3.5" />
        Add item
      </button>
    </div>
  );
};

// ─── Main form body

interface OmOssFormBodyProps {
  form: OmOssSection;
  set: (field: keyof OmOssSection, value: unknown) => void;
}

const OmOssFormBody = ({ form, set }: OmOssFormBodyProps) => {
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

      {/* ── List items ── */}
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <List className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            List Items
          </span>
          {Array.isArray(form.li) && form.li.length > 0 && (
            <span className="ml-auto text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
              {form.li.length}
            </span>
          )}
        </div>
        <PlainListEditor
          items={form.li ?? []}
          onChange={(items) => set("li", items)}
        />
      </div>
    </div>
  );
};

export default OmOssFormBody;
