import { Label } from "@/components/ui/label";
import React from "react";

interface FieldToggleProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  accentClass: string;
}

interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}

export const FieldToggle = ({
  active,
  onClick,
  icon: Icon,
  label,
  accentClass,
}: FieldToggleProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all duration-150 w-full ${
      active
        ? accentClass
        : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:border-border"
    }`}
  >
    <Icon className="w-3.5 h-3.5 shrink-0" />
    <span className="flex-1 text-left">{label}</span>
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
        active ? "bg-white/10 text-current" : "bg-muted text-muted-foreground"
      }`}
    >
      {active ? "ON" : "OFF"}
    </span>
  </button>
);

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
