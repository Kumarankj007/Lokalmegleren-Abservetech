"use client";
import React, { useEffect, useState } from "react";
import { Plus, Pencil, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface SectionEditDialogProps<T extends { title: string }> {
  open: boolean;
  onClose: () => void;
  initial: T;
  onSave: (data: T) => void;
  isSaving: boolean;
  mode: "add" | "edit";
  labels: {
    addTitle: string;
    editTitle: string;
    addDescription: string;
    editDescription: string;
    addButton: string;
    saveButton?: string;
  };
  renderForm: (
    form: T,
    set: (field: keyof T, value: unknown) => void,
  ) => React.ReactNode;
  isValid?: (form: T) => boolean;
}

const SectionEditDialog = <T extends { title: string }>({
  open,
  onClose,
  initial,
  onSave,
  isSaving,
  mode,
  labels,
  renderForm,
  isValid,
}: SectionEditDialogProps<T>) => {
  const [form, setForm] = useState<T>(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  const set = (field: keyof T, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Default validation: title must be non-empty
  const valid = isValid ? isValid(form) : form.title.trim().length > 0;

  const handleSave = () => {
    if (!valid || isSaving) return;
    onSave(form);
  };

  const isAdding = mode === "add";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        size="lg"
        className="flex flex-col max-h-[90dvh] p-0 gap-0 overflow-hidden"
      >
        {/* ── Header ── */}
        <DialogHeader className="shrink-0 px-4 sm:px-6 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              {isAdding ? (
                <Plus className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Pencil className="w-3 h-3 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold leading-tight">
                {isAdding ? labels.addTitle : labels.editTitle}
              </DialogTitle>
              <DialogDescription>
                <span className="text-[11px] text-muted-foreground">
                  {isAdding ? labels.addDescription : labels.editDescription}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Scrollable form body ── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 min-h-0">
          {renderForm(form, set)}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 flex items-center gap-2 px-4 sm:px-6 py-4 border-t border-border/60 bg-muted/10">
          <Button
            type="button"
            color="primary"
            size="md"
            disabled={!valid || isSaving}
            onClick={handleSave}
            className="gap-1.5"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isSaving
              ? "Saving…"
              : isAdding
                ? labels.addButton
                : (labels.saveButton ?? "Save Changes")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            color="secondary"
            size="md"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SectionEditDialog;
