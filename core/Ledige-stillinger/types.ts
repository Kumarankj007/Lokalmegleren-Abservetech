export interface VacancySection {
    _id?: string;
    order?: number;
    head?: string;
    p?: string;
    image?: File | string | null;
    detailTitle?: string | null;
    detailImage?: File | string | null;
    detailDesc?: string;
}

export interface VacancyEditDialogProps {
    open: boolean;
    onClose: () => void;
    initial: VacancySection;
    onSave: (data: VacancySection) => void;
    isSaving: boolean;
    mode: "add" | "edit";
}