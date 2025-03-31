
import React from "react";
import { FieldErrors } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorDisplayProps {
  errors: FieldErrors;
  className?: string;
}

const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({ errors, className }) => {
  if (!errors.root?.message) return null;
  
  return (
    <div className={cn("flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md", className)}>
      <AlertCircle className="h-5 w-5 text-destructive" />
      <p className="text-sm font-medium text-destructive">{errors.root.message}</p>
    </div>
  );
};

export default FormErrorDisplay;
