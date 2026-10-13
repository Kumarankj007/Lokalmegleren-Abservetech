"use client";
import React from "react";
import {
  Plus,
  X,
  GripVertical,
  Phone,
  Info,
  Image as ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { HjemData, ContactUsItem } from "./types";
import ImageUploader from "../Ledige-stillinger/Imageuploader";

// ─── FieldLabel

const FieldLabel = ({
  children,
  required,
  hint,
}: {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) => (
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

// SectionHeader

const SectionHeader = ({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
}) => (
  <div className={`flex items-center gap-2 mb-3`}>
    <Icon className={`w-3.5 h-3.5 ${color}`} />
    <span className={`text-xs font-semibold uppercase tracking-wider ${color}`}>
      {label}
    </span>
  </div>
);

// StringListEditor (for disc[] and aboutUs[])

const StringListEditor = ({
  items,
  onChange,
  placeholder,
  rows = 2,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  rows?: number;
}) => {
  const add = () => onChange([...items, ""]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, value: string) =>
    onChange(items.map((item, idx) => (idx === i ? value : item)));

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <div className="text-xs text-muted-foreground/50 py-3 text-center border border-dashed border-border/40 rounded-lg">
          No items yet
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
            placeholder={placeholder ?? `Item ${i + 1}…`}
            rows={rows}
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
        className="flex items-center gap-1.5 text-xs text-primary/60 hover:text-primary font-medium transition-colors py-0.5 ml-7"
      >
        <Plus className="w-3.5 h-3.5" />
        Add item
      </button>
    </div>
  );
};

// ─── ContactUsEditor

const ContactUsEditor = ({
  items,
  onChange,
}: {
  items: ContactUsItem[];
  onChange: (items: ContactUsItem[]) => void;
}) => {
  const add = () => onChange([...items, { head: "", desc: "" }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof ContactUsItem, value: string) =>
    onChange(
      items.map((item, idx) =>
        idx === i ? { ...item, [field]: value } : item,
      ),
    );

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <div className="text-xs text-muted-foreground/50 py-3 text-center border border-dashed border-emerald-500/20 rounded-lg">
          No contact items yet
        </div>
      )}
      {items.map((item, i) => (
        <div
          key={item._id ?? i}
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
              value={item.head}
              onChange={(e) => update(i, "head", e.target.value)}
              placeholder="Heading (e.g. Skal selge:)"
              className="h-7 text-xs"
            />
            <Textarea
              value={item.desc}
              onChange={(e) => update(i, "desc", e.target.value)}
              placeholder="Description…"
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
        Add contact item
      </button>
    </div>
  );
};

// Main form body

interface HjemFormBodyProps {
  form: HjemData;
  set: (path: string, value: unknown) => void;
}

const HjemFormBody = ({ form, set }: HjemFormBodyProps) => (
  <div className="space-y-6">
    {/* BANNER  */}
    <div className="rounded-lg border border-pink-500/20 bg-pink-500/5 p-4 space-y-4">
      <SectionHeader icon={ImageIcon} label="Banner" color="text-pink-400" />

      <ImageUploader
        value={form.banner.image}
        onChange={(file) => set("banner.image", file)}
        label="Banner Image"
        accentClass="border-pink-500/30 bg-pink-500/5"
      />

      <div>
        <FieldLabel required>Title</FieldLabel>
        <Input
          value={form.banner.title}
          onChange={(e) => set("banner.title", e.target.value)}
          placeholder="Banner title…"
        />
      </div>

      <div>
        <FieldLabel>
          Disc items
          {form.banner.disc.length > 0 && (
            <span className="ml-1.5 text-[10px] font-bold bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded normal-case tracking-normal">
              {form.banner.disc.length}
            </span>
          )}
        </FieldLabel>
        <StringListEditor
          items={form.banner.disc}
          onChange={(items) => set("banner.disc", items)}
          placeholder="Disc item…"
          rows={2}
        />
      </div>
    </div>

    <Separator className="opacity-30" />

    {/*  CONTACT US  */}
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-4">
      <SectionHeader icon={Phone} label="Contact Us" color="text-emerald-400" />

      <div>
        <FieldLabel required>Section Title</FieldLabel>
        <Input
          value={form.contactUs.title}
          onChange={(e) => set("contactUs.title", e.target.value)}
          placeholder="e.g. Kontakt oss for en uforpliktende prat…"
        />
      </div>

      <div>
        <FieldLabel>
          Contact items
          {form.contactUs.data.length > 0 && (
            <span className="ml-1.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded normal-case tracking-normal">
              {form.contactUs.data.length}
            </span>
          )}
        </FieldLabel>
        <ContactUsEditor
          items={form.contactUs.data}
          onChange={(items) => set("contactUs.data", items)}
        />
      </div>
    </div>

    <Separator className="opacity-30" />

    {/*  ABOUT US  */}
    <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 space-y-4">
      <SectionHeader icon={Info} label="About Us" color="text-sky-400" />

      <div>
        <FieldLabel>
          About items
          {form.aboutUs.length > 0 && (
            <span className="ml-1.5 text-[10px] font-bold bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded normal-case tracking-normal">
              {form.aboutUs.length}
            </span>
          )}
        </FieldLabel>
        <StringListEditor
          items={form.aboutUs}
          onChange={(items) => set("aboutUs", items)}
          placeholder="About us paragraph…"
          rows={3}
        />
      </div>
    </div>
  </div>
);

export default HjemFormBody;
