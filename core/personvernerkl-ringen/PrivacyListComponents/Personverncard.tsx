"use client";
import React from "react";
import { FIELD_META } from "./Constants";
import { ContentSection } from "../FormDialogComponents/types";
import SectionCard from "@/components/dynamicPages/Sectioncard";

interface PersonvernCardProps {
  section: ContentSection;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const PersonvernCard = (props: PersonvernCardProps) => (
  <SectionCard {...props} fieldMeta={FIELD_META} />
);

export default PersonvernCard;
