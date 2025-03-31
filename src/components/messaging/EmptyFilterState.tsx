
import { ReactNode } from "react";
import { FilterType } from "./types/FilterTypes";

interface EmptyFilterStateProps {
  activeFilter: FilterType;
  icon: ReactNode;
}

export default function EmptyFilterState({ activeFilter, icon }: EmptyFilterStateProps) {
  const getMessage = (filter: FilterType) => {
    switch (filter) {
      case "inbox":
        return "Your inbox is empty";
      case "sent":
        return "You haven't sent any messages";
      case "unread":
        return "No unread messages";
      case "spam":
        return "No messages have been marked as spam";
      default:
        return "No messages found";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-40 text-center p-4">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-600">No {activeFilter} messages</p>
      <p className="text-xs text-gray-500 mt-1">
        {getMessage(activeFilter)}
      </p>
    </div>
  );
}
