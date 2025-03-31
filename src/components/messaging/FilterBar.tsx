
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FilterOption, FilterType } from "./types/FilterTypes";

interface FilterBarProps {
  filterOptions: FilterOption[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function FilterBar({ 
  filterOptions, 
  activeFilter, 
  onFilterChange 
}: FilterBarProps) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Filter Messages</h3>
        <button 
          className="text-xs text-messaging-primary hover:text-messaging-accent transition-colors"
          onClick={() => onFilterChange("all")}
        >
          Reset
        </button>
      </div>
      <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-none">
        {filterOptions.map((option) => (
          // Skip rendering the Inbox and Sent filter options
          option.value !== "inbox" && option.value !== "sent" && (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full transition-all text-sm",
                activeFilter === option.value 
                  ? "bg-messaging-primary text-white shadow-md" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {option.icon}
              <span>{option.label}</span>
              {option.count !== undefined && option.count > 0 && (
                <span className={cn(
                  "inline-flex items-center justify-center rounded-full text-xs font-medium",
                  activeFilter === option.value 
                    ? "bg-white text-messaging-primary h-5 min-w-5 px-1" 
                    : "bg-messaging-primary text-white h-4 min-w-4 px-1"
                )}>
                  {option.count}
                </span>
              )}
            </button>
          )
        ))}
      </div>
    </div>
  );
}
