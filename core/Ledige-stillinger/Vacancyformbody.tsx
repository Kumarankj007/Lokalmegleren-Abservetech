"use client";
import React from "react";
import { Heading2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FieldLabel } from "@/core/personvernerkl-ringen/FormDialogComponents/FieldToggle";
import ImageUploader from "./Imageuploader";
import { VacancySection } from "./types";

interface VacancyFormBodyProps {
  form: VacancySection;
  set: (field: keyof VacancySection, value: unknown) => void;
}

const VacancyFormBody = ({ form, set }: VacancyFormBodyProps) => {
  const hasDetail = !!(
    form.detailTitle !== undefined ||
    form.detailDesc !== undefined ||
    form.detailImage !== undefined
  );

  return (
    <div className="space-y-5">
      {/* ── Image ── */}
      <ImageUploader
        value={form.image}
        onChange={(file) => set("image", file)}
        label="Image"
        accentClass="border-pink-500/30 bg-pink-500/5"
      />

      <Separator className="opacity-30" />

      {/* ── Heading ── */}
      <div>
        <FieldLabel required>Heading</FieldLabel>
        <Input
          value={form.head ?? ""}
          onChange={(e) => set("head", e.target.value)}
          placeholder="Card heading…"
          autoFocus
        />
      </div>

      {/* ── Paragraph ── */}
      <div>
        <FieldLabel>Paragraph</FieldLabel>
        <Textarea
          value={form.p ?? ""}
          onChange={(e) => set("p", e.target.value)}
          placeholder="Card paragraph…"
          rows={5}
          className="resize-none text-sm"
        />
      </div>

      <Separator className="opacity-30" />
    </div>
  );
};

export default VacancyFormBody;
