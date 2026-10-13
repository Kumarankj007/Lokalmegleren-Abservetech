"use client";
import React from "react";

import { OmOssSection, OmOssEditDialogProps } from "./types";
import OmOssFormBody from "./OmOssFormBody";
import SectionEditDialog, {
  SectionEditDialogProps,
} from "@/components/dynamicPages/Sectioneditdialog";

const LABELS: SectionEditDialogProps<OmOssSection>["labels"] = {
  addTitle: "New About Block",
  editTitle: "Edit About Block",
  addDescription: "Add a new Om oss content block",
  editDescription: "Update this block's content",
  addButton: "Add Block",
  saveButton: "Save Changes",
};

const OmOssEditDialog: React.FC<OmOssEditDialogProps> = (props) => (
  <SectionEditDialog
    {...props}
    labels={LABELS}
    renderForm={(form, set) => <OmOssFormBody form={form} set={set} />}
  />
);

export default OmOssEditDialog;
