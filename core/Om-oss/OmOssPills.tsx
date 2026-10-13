import React from "react";
import { OmOssSection } from "./types";
import { OMOSS_FIELD_META } from "./Constants";
import SectionPills from "@/components/dynamicPages/Sectionpills";

const OmOssPills = ({ section }: { section: OmOssSection }) => (
  <SectionPills section={section} fieldMeta={OMOSS_FIELD_META} />
);

export default OmOssPills;
