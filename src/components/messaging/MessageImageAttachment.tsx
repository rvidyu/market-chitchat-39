
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MessageImageAttachmentProps {
  images: string[];
  className?: string;
}

const MessageImageAttachment = ({ images, className }: MessageImageAttachmentProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className={cn("mt-2 flex flex-wrap gap-1", className)}>
        {images.map((image, index) => (
          <div 
            key={index}
            className="cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image}
              alt={`Attachment ${index + 1}`}
              className={cn(
                "object-cover rounded-md border border-gray-200",
                images.length === 1 ? "max-w-[240px] max-h-[240px]" : "w-20 h-20"
              )}
            />
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none">
          <div className="flex items-center justify-center">
            <img
              src={selectedImage || ""}
              alt="Full size attachment"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessageImageAttachment;
