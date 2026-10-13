"use client";
import React from "react";
import SectionEditDialog, {
  SectionEditDialogProps,
} from "@/components/dynamicPages/Sectioneditdialog";
import { VacancyEditDialogProps, VacancySection } from "./types";
import VacancyFormBody from "./Vacancyformbody";

type WithTitle = VacancySection & { title: string };

const LABELS: SectionEditDialogProps<WithTitle>["labels"] = {
  addTitle: "New Item",
  editTitle: "Edit Item",
  addDescription: "Add a new vacancy item",
  editDescription: "Update this item's content",
  addButton: "Add Item",
  saveButton: "Save Changes",
};

const VacancyEditDialog: React.FC<VacancyEditDialogProps> = (props) => (
  <SectionEditDialog<WithTitle>
    {...(props as unknown as SectionEditDialogProps<WithTitle>)}
    initial={props.initial as WithTitle}
    onSave={props.onSave as (data: WithTitle) => void}
    labels={LABELS}
    isValid={(form) => ((form as VacancySection).head?.trim().length ?? 0) > 0}
    renderForm={(form, set) => (
      <VacancyFormBody
        form={form as VacancySection}
        set={set as (field: keyof VacancySection, value: unknown) => void}
      />
    )}
  />
);

export default VacancyEditDialog;
