"use client";
import React from "react";
import SectionCard from "@/components/dynamicPages/Sectioncard";
import { VacancySection } from "./types";
import { VACANCY_FIELD_META } from "./Constants";

interface VacancyCardProps {
  section: VacancySection;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const VacancyCard = (props: VacancyCardProps) => {
  const adapted = { ...props.section, title: props.section.head ?? "" };
  return (
    <SectionCard {...props} section={adapted} fieldMeta={VACANCY_FIELD_META} />
  );
};

export default VacancyCard;
