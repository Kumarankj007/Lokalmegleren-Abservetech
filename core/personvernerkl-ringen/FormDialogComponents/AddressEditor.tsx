import React from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AddressEditorProps {
  lines: string[];
  onChange: (lines: string[]) => void;
}

const AddressEditor = ({ lines, onChange }: AddressEditorProps) => {
  const add = () => onChange([...lines, ""]);
  const remove = (i: number) => onChange(lines.filter((_, idx) => idx !== i));
  const update = (i: number, value: string) =>
    onChange(lines.map((line, idx) => (idx === i ? value : line)));

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground/40 w-4 text-right shrink-0">
            {i + 1}
          </span>
          <Input
            value={line}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Line ${i + 1}`}
            className="h-7 text-xs"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="p-1 rounded text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-sky-500/70 hover:text-sky-400 font-medium transition-colors py-0.5 ml-6"
      >
        <Plus className="w-3.5 h-3.5" />
        Add line
      </button>
    </div>
  );
};

export default AddressEditor;
