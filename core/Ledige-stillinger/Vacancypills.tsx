import React from "react";
import SectionPills from "@/components/dynamicPages/Sectionpills";
import { VACANCY_FIELD_META } from "./Constants";
import { VacancySection } from "./types";

const VacancyPills = ({ section }: { section: VacancySection }) => (
  <SectionPills section={section} fieldMeta={VACANCY_FIELD_META} />
);

export default VacancyPills;
