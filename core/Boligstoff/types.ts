export interface BoligstoffSection {
    _id?: string;
    order?: number;
    title: string;
    images?: string[];
    imageFile?: File;
    paragraph?: string[];
}

export interface BoligstoffEditDialogProps {
    open: boolean;
    onClose: () => void;
    initial: BoligstoffSection;
    onSave: (data: BoligstoffSection) => void;
    isSaving: boolean;
    mode: "add" | "edit";
}