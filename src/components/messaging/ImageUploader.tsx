
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Image, X, Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { compressImage, createImagePreview, revokeImagePreview } from "@/utils/imageCompression";
import { validateImageFiles, MAX_FILES, MAX_FILE_SIZE } from "@/utils/fileValidation";
import { ImagePreview } from "./ImagePreview";

interface ImageUploaderProps {
  onImagesSelected: (images: File[]) => void;
  className?: string;
}

const ImageUploader = ({ onImagesSelected, className }: ImageUploaderProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => revokeImagePreview(url));
    };
  }, [previewUrls]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    
    const filesArray = Array.from(fileList);
    
    const validation = validateImageFiles(filesArray, selectedImages.length);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    setError(null);
    
    try {
      setIsProcessing(true);
      
      // Process files (compress if needed)
      const processedFiles: File[] = [];
      const newPreviewUrls: string[] = [];
      
      for (const file of filesArray) {
        const processedFile = await compressImage(file);
        processedFiles.push(processedFile);
        newPreviewUrls.push(createImagePreview(processedFile));
      }
      
      // Update state
      setSelectedImages(prev => [...prev, ...processedFiles]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      
      // Notify parent component
      onImagesSelected([...selectedImages, ...processedFiles]);
      
      setIsProcessing(false);
    } catch (err) {
      console.error("Error processing images:", err);
      toast({
        variant: "destructive",
        title: "Error processing images",
        description: "Failed to process one or more images.",
      });
      setIsProcessing(false);
    }
    
    // Reset input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    // Remove the image at the specified index
    const newImages = [...selectedImages];
    const newPreviewUrls = [...previewUrls];
    
    // Revoke the object URL to avoid memory leaks
    revokeImagePreview(newPreviewUrls[index]);
    
    newImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setSelectedImages(newImages);
    setPreviewUrls(newPreviewUrls);
    onImagesSelected(newImages);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-wrap gap-2 mb-2">
        {previewUrls.map((url, index) => (
          <ImagePreview 
            key={index}
            url={url}
            onRemove={() => removeImage(index)}
          />
        ))}
        
        {selectedImages.length < MAX_FILES && !isProcessing && (
          <button
            type="button"
            onClick={handleTriggerFileInput}
            className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center hover:border-messaging-primary transition-colors"
          >
            <Upload className="h-5 w-5 text-gray-400" />
          </button>
        )}
        
        {isProcessing && (
          <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-messaging-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      <div className="flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mr-2 text-messaging-primary border-messaging-primary hover:bg-messaging-primary/10"
          onClick={handleTriggerFileInput}
          disabled={selectedImages.length >= MAX_FILES || isProcessing}
        >
          <Image className="h-4 w-4 mr-2" />
          Add Images
        </Button>
        
        <p className="text-xs text-gray-500">
          You can upload up to {MAX_FILES} images. Max 5MB each.
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;
