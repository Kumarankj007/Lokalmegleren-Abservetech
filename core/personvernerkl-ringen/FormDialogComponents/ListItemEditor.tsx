import React from "react";
import { Plus, X, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LabeledItem } from "./types";

interface ListItemEditorProps {
  items: LabeledItem[];
  onChange: (items: LabeledItem[]) => void;
}

const ListItemEditor = ({ items, onChange }: ListItemEditorProps) => {
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
        <div className="text-xs text-muted-foreground/50 py-3 text-center border border-dashed border-emerald-500/20 rounded-lg bg-emerald-500/3">
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
        Add list item
      </button>
    </div>
  );
};

export default ListItemEditor;
