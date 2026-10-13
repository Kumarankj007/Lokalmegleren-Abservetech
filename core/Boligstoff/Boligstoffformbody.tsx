"use client";
import React, { useRef } from "react";
import { Plus, X, ImagePlus, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { APIURLS } from "@/services/config";
import { BoligstoffSection } from "./types";

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

// ─── ImageUpload

interface ImageUploadProps {
  existingUrl?: string[];
  file?: File;
  onChange: (file: File | undefined) => void;
}

const ImageUpload = ({ existingUrl, file, onChange }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const existingPath = existingUrl?.[0];
  const previewSrc = file
    ? URL.createObjectURL(file)
    : existingPath
      ? `${APIURLS.imageUrl}${existingPath}`
      : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    onChange(picked ?? undefined);
    e.target.value = "";
  };

  const handleClear = () => {
    onChange(undefined);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {previewSrc ? (
        <div className="relative group rounded-xl overflow-hidden border border-border/60 bg-muted/20 aspect-video w-full">
          <Image
            src={previewSrc}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
          {/* Overlay actions */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-colors backdrop-blur-sm"
            >
              <ImagePlus className="w-3.5 h-3.5" />
              Change
            </button>
            {!existingPath && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/70 hover:bg-destructive text-white text-xs font-medium border border-white/10 transition-colors backdrop-blur-sm"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-border/50 hover:border-primary/40 bg-muted/10 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all gap-2"
        >
          <ImagePlus className="w-7 h-7 opacity-40" />
          <span className="text-xs font-medium">Click to upload image</span>
          <span className="text-[11px] text-muted-foreground/50">
            PNG, JPG, WEBP supported
          </span>
        </button>
      )}

      {file && (
        <p className="text-[11px] text-muted-foreground/60 truncate pl-0.5">
          {file.name} — {(file.size / 1024).toFixed(0)} KB
        </p>
      )}
    </div>
  );
};

// ─── ParagraphEditor

const ParagraphEditor = ({
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
          No paragraphs yet — add the first one below
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
            placeholder={`Paragraph ${i + 1}…`}
            rows={3}
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
        Add paragraph
      </button>
    </div>
  );
};

// ─── Main form body

interface BoligstoffFormBodyProps {
  form: BoligstoffSection;
  set: (field: keyof BoligstoffSection, value: unknown) => void;
}

const BoligstoffFormBody = ({ form, set }: BoligstoffFormBodyProps) => (
  <div className="space-y-5">
    {/* ── Image upload ── */}
    <div>
      <FieldLabel>Image</FieldLabel>
      <ImageUpload
        existingUrl={form.images}
        file={form.imageFile}
        onChange={(file) => set("imageFile", file)}
      />
    </div>

    <Separator className="opacity-30" />

    {/* ── Title ── */}
    <div>
      <FieldLabel required>Title</FieldLabel>
      <Input
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        placeholder="Article title…"
        autoFocus
      />
    </div>

    <Separator className="opacity-30" />

    {/* ── Paragraphs ── */}
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <List className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          Paragraphs
        </span>
        {Array.isArray(form.paragraph) && form.paragraph.length > 0 && (
          <span className="ml-auto text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
            {form.paragraph.length}
          </span>
        )}
      </div>
      <ParagraphEditor
        items={form.paragraph ?? []}
        onChange={(items) => set("paragraph", items)}
      />
    </div>
  </div>
);

export default BoligstoffFormBody;
