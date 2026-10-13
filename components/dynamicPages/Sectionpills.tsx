import React from "react";
import { LucideIcon } from "lucide-react";

export interface FieldMeta<T> {
  key: keyof T;
  icon: LucideIcon;
  label: string;
  cls: string;
}

interface SectionPillsProps<T> {
  section: T;
  fieldMeta: readonly FieldMeta<T>[];
}

const SectionPills = <T,>({ section, fieldMeta }: SectionPillsProps<T>) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {fieldMeta.map(({ key, icon: Icon, label, cls }) => {
      const value = section[key];
      if (!value) return null;
      const count = Array.isArray(value) ? value.length : undefined;
      return (
        <span
          key={String(key)}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${cls}`}
        >
          <Icon className="w-2.5 h-2.5" />
          {label}
          {count !== undefined && (
            <span className="opacity-60 font-normal ml-0.5">{count}</span>
          )}
        </span>
      );
    })}
  </div>
);

export default SectionPills;
