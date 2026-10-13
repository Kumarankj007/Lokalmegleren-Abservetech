"use client";
import React from "react";
import {
  ContentSection,
  SectionEditDialogProps as PersonvernDialogProps,
} from "@/core/personvernerkl-ringen/FormDialogComponents/types";
import SectionEditDialog, {
  SectionEditDialogProps,
} from "@/components/dynamicPages/Sectioneditdialog";
import SectionFormBody from "../FormDialogComponents/SectionFormBody";

const LABELS: SectionEditDialogProps<ContentSection>["labels"] = {
  addTitle: "New Section",
  editTitle: "Edit Section",
  addDescription: "Add a new privacy policy section",
  editDescription: "Update this section's content",
  addButton: "Add Section",
  saveButton: "Save Changes",
};

const PersonvernEditDialog: React.FC<PersonvernDialogProps> = (props) => (
  <SectionEditDialog
    {...props}
    labels={LABELS}
    renderForm={(form, set) => <SectionFormBody form={form} set={set} />}
  />
);

export default PersonvernEditDialog;
