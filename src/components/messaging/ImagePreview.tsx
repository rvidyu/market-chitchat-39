
import { X } from "lucide-react";

interface ImagePreviewProps {
  url: string;
  onRemove: () => void;
}

export const ImagePreview = ({ url, onRemove }: ImagePreviewProps) => {
  return (
    <div className="relative w-16 h-16 rounded-md overflow-hidden border">
      <img 
        src={url} 
        alt="Image preview" 
        className="w-full h-full object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-0 right-0 bg-gray-800 bg-opacity-70 rounded-bl-md p-1"
      >
        <X className="h-3 w-3 text-white" />
      </button>
    </div>
  );
};
