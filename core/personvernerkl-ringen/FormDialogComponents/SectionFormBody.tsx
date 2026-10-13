import React from "react";
import { StickyNote, List, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ContentSection } from "./types";
import { FieldLabel, FieldToggle } from "./FieldToggle";
import ListItemEditor from "./ListItemEditor";
import AddressEditor from "./AddressEditor";

interface SectionFormBodyProps {
  form: ContentSection;
  set: (field: keyof ContentSection, value: unknown) => void;
}

const SectionFormBody = ({ form, set }: SectionFormBodyProps) => {
  const toggleNote = () =>
    set("note", form.note ? undefined : { label: "", data: "" });
  const toggleLi = () => set("li", form.li ? undefined : []);
  const toggleAddress = () => set("address", form.address ? undefined : [""]);

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <FieldLabel required>Title</FieldLabel>
        <Input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Section title…"
          autoFocus
        />
      </div>

      <Separator className="opacity-30" />

      {/* Paragraphs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel hint="opening">Paragraph 1</FieldLabel>
          <Textarea
            value={form.p1 ?? ""}
            onChange={(e) => set("p1", e.target.value)}
            placeholder="Opening paragraph…"
            rows={4}
            className="resize-none text-sm"
          />
        </div>
        <div>
          <FieldLabel hint="closing">Paragraph 2</FieldLabel>
          <Textarea
            value={form.p2 ?? ""}
            onChange={(e) => set("p2", e.target.value)}
            placeholder="Closing paragraph…"
            rows={4}
            className="resize-none text-sm"
          />
        </div>
      </div>

      <Separator className="opacity-30" />

      {/* Optional fields */}
      <div className="space-y-3">
        <FieldLabel>Optional fields</FieldLabel>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <FieldToggle
            active={!!form.note}
            onClick={toggleNote}
            icon={StickyNote}
            label="Note"
            accentClass="bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
          />
          <FieldToggle
            active={!!form.li}
            onClick={toggleLi}
            icon={List}
            label="List items"
            accentClass="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
          />
          <FieldToggle
            active={!!form.address}
            onClick={toggleAddress}
            icon={MapPin}
            label="Address"
            accentClass="bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500/20"
          />
        </div>

        <div className="space-y-3">
          {form.note && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <StickyNote className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Note
                </span>
              </div>
              <Input
                value={form.note.label ?? ""}
                onChange={(e) =>
                  set("note", { ...form.note!, label: e.target.value })
                }
                placeholder="Note label (optional)"
                className="h-8 text-xs"
              />
              <Textarea
                value={form.note.data}
                onChange={(e) =>
                  set("note", { ...form.note!, data: e.target.value })
                }
                placeholder="Note content…"
                rows={3}
                className="resize-none text-sm"
              />
            </div>
          )}

          {form.li && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <List className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  List Items
                </span>
                {form.li.length > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                    {form.li.length}
                  </span>
                )}
              </div>
              <ListItemEditor
                items={form.li}
                onChange={(items) => set("li", items)}
              />
            </div>
          )}

          {form.address && (
            <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                  Address
                </span>
              </div>
              <AddressEditor
                lines={form.address}
                onChange={(lines) => set("address", lines)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionFormBody;
