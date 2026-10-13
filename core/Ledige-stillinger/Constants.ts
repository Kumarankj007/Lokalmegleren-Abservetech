import { AlignLeft, Heading2, Image, FileText } from "lucide-react";
import { VacancySection } from "./types";
import { FieldMeta } from "@/components/dynamicPages/Sectionpills";

export const EMPTY_VACANCY_SECTION: VacancySection = {
    head: "",
    p: "",
    image: null,
    detailTitle: undefined,
    detailImage: null,
    detailDesc: undefined,
};

export const VACANCY_FIELD_META: readonly FieldMeta<VacancySection>[] = [
    {
        key: "image",
        icon: Image,
        label: "Image",
        cls: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    },
    {
        key: "p",
        icon: AlignLeft,
        label: "Text",
        cls: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    },
    {
        key: "detailTitle",
        icon: Heading2,
        label: "Detail",
        cls: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
    {
        key: "detailDesc",
        icon: FileText,
        label: "Desc",
        cls: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
] as const;