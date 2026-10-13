export interface LabeledItem {
    label?: string;
    data: string;
}

export interface ContentSection {
    _id?: string;
    order?: number;
    title: string;
    p1?: string;
    p2?: string;
    note?: LabeledItem;
    li?: LabeledItem[];
    address?: string[];
}

export interface SectionEditDialogProps {
    open: boolean;
    onClose: () => void;
    initial: ContentSection;
    onSave: (data: ContentSection) => void;
    isSaving: boolean;
    mode: "add" | "edit";
}
