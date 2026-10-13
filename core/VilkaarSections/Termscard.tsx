"use client";
import React from "react";
import { TERMS_FIELD_META } from "./Constants";
import { TermsSection } from "./types";
import SectionCard from "@/components/dynamicPages/Sectioncard";

interface TermsCardProps {
  section: TermsSection;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const TermsCard = (props: TermsCardProps) => (
  <SectionCard {...props} fieldMeta={TERMS_FIELD_META} />
);

export default TermsCard;
