export interface OmOssSection {
    _id?: string;
    order?: number;
    title: string;
    li?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface OmOssEditDialogProps {
    open: boolean;
    onClose: () => void;
    initial: OmOssSection;
    onSave: (data: OmOssSection) => void;
    isSaving: boolean;
    mode: "add" | "edit";
}