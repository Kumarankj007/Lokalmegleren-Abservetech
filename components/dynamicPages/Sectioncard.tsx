"use client";
import React from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SectionPills, { FieldMeta } from "./Sectionpills";

interface SectionCardProps<T extends { title: string }> {
  section: T;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  fieldMeta: readonly FieldMeta<T>[];
}

const SectionCard = <T extends { title: string }>({
  section,
  index,
  onEdit,
  onDelete,
  isDeleting,
  fieldMeta,
}: SectionCardProps<T>) => (
  <div className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 rounded-xl border border-border/60 bg-card hover:border-border hover:bg-muted/10 transition-all duration-150 h-full">
    <div className="flex items-start gap-2 sm:contents">
      <span className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-primary/8 border border-primary/15 text-primary text-[11px] sm:text-sm font-bold flex items-center justify-center tabular-nums mt-0.5 sm:mt-0">
        {index + 1}
      </span>

      <div className="flex-1 min-w-0 sm:flex sm:flex-col sm:justify-center sm:gap-2">
        <p className="text-sm sm:text-[15px] font-semibold text-foreground truncate leading-snug">
          {section.title}
        </p>
        <div className="hidden sm:block">
          <SectionPills section={section} fieldMeta={fieldMeta} />
        </div>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity sm:ml-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Edit
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Delete
          </TooltipContent>
        </Tooltip>
      </div>
    </div>

    <div className="pl-8 sm:hidden">
      <SectionPills section={section} fieldMeta={fieldMeta} />
    </div>
  </div>
);

export default SectionCard;
