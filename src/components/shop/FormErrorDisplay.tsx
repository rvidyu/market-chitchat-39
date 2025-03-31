
import React from "react";
import { FieldErrors } from "react-hook-form";

interface FormErrorDisplayProps {
  errors: FieldErrors;
}

const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({ errors }) => {
  if (!errors.root?.message) return null;
  
  return (
    <p className="text-sm font-medium text-destructive">{errors.root.message}</p>
  );
};

export default FormErrorDisplay;
