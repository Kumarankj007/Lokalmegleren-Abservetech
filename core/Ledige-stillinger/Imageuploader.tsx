"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import { APIURLS } from "@/services/config";

interface ImageUploaderProps {
  value: File | string | null | undefined;
  onChange: (file: File | null) => void;
  label?: string;
  hint?: string;
  accentClass?: string;
}

const ImageUploader = ({
  value,
  onChange,
  label = "Image",
  hint,
  accentClass = "border-pink-500/30 bg-pink-500/5",
}: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrl =
    value instanceof File
      ? URL.createObjectURL(value)
      : typeof value === "string" && value
        ? `${APIURLS.imageUrl}${value}`
        : null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) onChange(file);
  };

  return (
    <div className="space-y-1.5">
      {/* ── Label row ── */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          <ImageIcon className="w-3 h-3" />
          {label}
          {hint && (
            <span className="normal-case tracking-normal font-normal text-muted-foreground/50 ml-1">
              — {hint}
            </span>
          )}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-destructive transition-colors"
          >
            <X className="w-3 h-3" />
            Remove
          </button>
        )}
      </div>

      {previewUrl ? (
        /* ── Preview ── */
        <div
          className={`relative rounded-lg overflow-hidden border ${accentClass} group cursor-pointer aspect-video w-full`}
          onClick={() => inputRef.current?.click()}
        >
          <Image
            src={previewUrl}
            alt="preview"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-medium">
            <Upload className="w-4 h-4" />
            Replace image
          </div>
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 h-36 rounded-lg border border-dashed ${accentClass} cursor-pointer hover:opacity-80 transition-opacity`}
        >
          <Upload className="w-5 h-5 text-muted-foreground/40" />
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground">
              Click or drag &amp; drop
            </p>
            <p className="text-[10px] text-muted-foreground/50 mt-0.5">
              PNG, JPG, WEBP
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
};

export default ImageUploader;
