import { AlignLeft, List } from "lucide-react";
import { TermsSection } from "./types";

export const EMPTY_TERMS_SECTION: TermsSection = {
    title: "",
    p1: undefined,
    p2: undefined,
    liTitle: undefined,
    li: undefined,
};

export const TERMS_FIELD_META = [
    {
        key: "p1" as keyof TermsSection,
        icon: AlignLeft,
        label: "P1",
        cls: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    },
    {
        key: "p2" as keyof TermsSection,
        icon: AlignLeft,
        label: "P2",
        cls: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    },
    {
        key: "li" as keyof TermsSection,
        icon: List,
        label: "List",
        cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
] as const;