
import { ReactNode } from "react";

// Filter types for categorizing messages
export type FilterType = "all" | "unread" | "spam";

export interface FilterOption {
  value: FilterType;
  label: string;
  icon: ReactNode;
  count?: number;
}
