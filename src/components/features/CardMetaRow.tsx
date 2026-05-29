import * as React from "react";
import { cn } from "@/lib/utils";
import { NOTEBOOK_META_ROW_CLASSES } from "@/components/features/notebookCardStyles";

interface CardMetaRowProps {
  children: React.ReactNode;
  className?: string;
}

export function CardMetaRow({ children, className }: CardMetaRowProps) {
  return <div className={cn(NOTEBOOK_META_ROW_CLASSES, className)}>{children}</div>;
}
