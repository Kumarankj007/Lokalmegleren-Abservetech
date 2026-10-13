import React from "react";
import { TERMS_FIELD_META } from "./Constants";
import SectionPills from "@/components/dynamicPages/Sectionpills";
import { TermsSection } from "./types";

const TermsPills = ({ section }: { section: TermsSection }) => (
  <SectionPills section={section} fieldMeta={TERMS_FIELD_META} />
);

export default TermsPills;
