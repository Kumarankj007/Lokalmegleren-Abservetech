import React from "react";
import { FIELD_META } from "./Constants";
import { ContentSection } from "../FormDialogComponents/types";
import SectionPills from "@/components/dynamicPages/Sectionpills";

const PersonvernPills = ({ section }: { section: ContentSection }) => (
  <SectionPills section={section} fieldMeta={FIELD_META} />
);

export default PersonvernPills;
