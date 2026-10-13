"use client";
import React from "react";
import SectionCard from "@/components/dynamicPages/Sectioncard";
import { BoligstoffSection } from "./types";
import { BOLIGSTOFF_FIELD_META } from "./Constants";

interface BoligstoffCardProps {
  section: BoligstoffSection;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const BoligstoffCard = (props: BoligstoffCardProps) => (
  <SectionCard {...props} fieldMeta={BOLIGSTOFF_FIELD_META} />
);

export default BoligstoffCard;
