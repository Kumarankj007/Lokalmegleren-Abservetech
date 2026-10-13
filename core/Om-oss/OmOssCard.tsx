"use client";
import React from "react";
import { OmOssSection } from "./types";
import { OMOSS_FIELD_META } from "./Constants";
import SectionCard from "@/components/dynamicPages/Sectioncard";

interface OmOssCardProps {
  section: OmOssSection;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const OmOssCard = (props: OmOssCardProps) => (
  <SectionCard {...props} fieldMeta={OMOSS_FIELD_META} />
);

export default OmOssCard;
