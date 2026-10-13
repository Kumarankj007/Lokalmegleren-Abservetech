import { List } from "lucide-react";
import { OmOssSection } from "./types";

export const EMPTY_OMOSS_SECTION: OmOssSection = {
    title: "",
    li: [],
};

export const OMOSS_FIELD_META = [
    {
        key: "li",
        icon: List,
        label: "List",
        cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
] as const;