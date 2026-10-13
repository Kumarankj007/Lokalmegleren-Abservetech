import { FileText, Image, List } from "lucide-react";
import { BoligstoffSection } from "./types";
import { FieldMeta } from "@/components/dynamicPages/Sectionpills";

export const EMPTY_BOLIGSTOFF_SECTION: BoligstoffSection = {
    title: "",
    images: undefined,
    imageFile: undefined,
    paragraph: [],
};

export const BOLIGSTOFF_FIELD_META: readonly FieldMeta<BoligstoffSection>[] = [
    {
        key: "images",
        icon: Image,
        label: "Image",
        cls: "bg-pink-500/10 border-pink-500/20 text-pink-400",
    },
    {
        key: "paragraph",
        icon: List,
        label: "Paragraphs",
        cls: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    },
] as const;