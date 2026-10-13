export interface LabeledItem {
    label?: string;
    data: string;
}

export interface TermsSection {
    _id?: string;
    order?: number;
    title: string;
    p1?: string;
    p2?: string;
    liTitle?: string;
    li?: LabeledItem[];
}

export interface TermsEditDialogProps {
    open: boolean;
    onClose: () => void;
    initial: TermsSection;
    onSave: (data: TermsSection) => void;
    isSaving: boolean;
    mode: "add" | "edit";
}