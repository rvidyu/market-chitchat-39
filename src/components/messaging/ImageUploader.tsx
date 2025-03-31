
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Image, X, Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImagesSelected: (images: File[]) => void;
  className?: string;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const validateFiles = (files: File[]): boolean => {
    // Check if adding these files would exceed the limit
    if (selectedImages.length + files.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} images.`);
      return false;
    }

    // Check each file's size and type
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.');
        return false;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        setError('Images cannot be larger than 5 MB.');
        return false;
      }
    }

    setError(null);
    return true;
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      // If file is already small enough, don't compress
      if (file.size < MAX_FILE_SIZE / 2) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > 1200) {
            const ratio = 1200 / width;
            width = 1200;
            height = height * ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with reduced quality
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Fix: Properly create a new File object with the required arguments
                const newFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(newFile);
              } else {
                resolve(file); // Fallback to original if compression fails
              }
            },
            'image/jpeg',
            0.8
          );
        };
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    
    const filesArray = Array.from(fileList);
    
    if (validateFiles(filesArray)) {
      try {
        setIsProcessing(true);
        
        // Process files (compress if needed)
        const processedFiles: File[] = [];
        const newPreviewUrls: string[] = [];
        
        for (const file of filesArray) {
          const processedFile = await compressImage(file);
          processedFiles.push(processedFile);
          newPreviewUrls.push(URL.createObjectURL(processedFile));
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
    URL.revokeObjectURL(newPreviewUrls[index]);
    
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
          <div key={index} className="relative w-16 h-16 rounded-md overflow-hidden border">
            <img 
              src={url} 
              alt={`Preview ${index}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-0 right-0 bg-gray-800 bg-opacity-70 rounded-bl-md p-1"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
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
