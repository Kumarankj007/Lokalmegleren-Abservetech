"use client";
import React from "react";
import SectionEditDialog, {
  SectionEditDialogProps,
} from "@/components/dynamicPages/Sectioneditdialog";
import { BoligstoffSection, BoligstoffEditDialogProps } from "./types";
import BoligstoffFormBody from "./Boligstoffformbody";

const LABELS: SectionEditDialogProps<BoligstoffSection>["labels"] = {
  addTitle: "New Article",
  editTitle: "Edit Article",
  addDescription: "Add a new Boligstoff article",
  editDescription: "Update this article's content",
  addButton: "Add Article",
  saveButton: "Save Changes",
};

const BoligstoffEditDialog: React.FC<BoligstoffEditDialogProps> = (props) => (
  <SectionEditDialog
    {...props}
    labels={LABELS}
    renderForm={(form, set) => <BoligstoffFormBody form={form} set={set} />}
  />
);

export default BoligstoffEditDialog;
