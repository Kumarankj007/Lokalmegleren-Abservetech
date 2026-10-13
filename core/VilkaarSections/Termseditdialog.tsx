"use client";
import React from "react";
import SectionEditDialog, {
  SectionEditDialogProps,
} from "@/components/dynamicPages/Sectioneditdialog";
import { TermsEditDialogProps, TermsSection } from "./types";
import TermsFormBody from "./Termsformbody";

const LABELS: SectionEditDialogProps<TermsSection>["labels"] = {
  addTitle: "New Terms Section",
  editTitle: "Edit Terms Section",
  addDescription: "Add a new terms & conditions section",
  editDescription: "Update this section's content",
  addButton: "Add Section",
  saveButton: "Save Changes",
};

const TermsEditDialog: React.FC<TermsEditDialogProps> = (props) => (
  <SectionEditDialog
    {...props}
    labels={LABELS}
    renderForm={(form, set) => <TermsFormBody form={form} set={set} />}
  />
);

export default TermsEditDialog;
