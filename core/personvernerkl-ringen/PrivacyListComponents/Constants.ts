import { AlignLeft, StickyNote, List, MapPin } from "lucide-react";
import { ContentSection } from "@/core/personvernerkl-ringen/FormDialogComponents/types";

export const EMPTY_SECTION: ContentSection = {
    title: "",
    p1: "",
    p2: "",
    note: undefined,
    li: undefined,
    address: undefined,
};

export const FIELD_META = [
    {
        key: "p1",
        icon: AlignLeft,
        label: "P1",
        cls: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    },
    {
        key: "note",
        icon: StickyNote,
        label: "Note",
        cls: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
        key: "li",
        icon: List,
        label: "List",
        cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
        key: "p2",
        icon: AlignLeft,
        label: "P2",
        cls: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    },
    {
        key: "address",
        icon: MapPin,
        label: "Address",
        cls: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
] as const;