
/**
 * Utility functions for image compression and processing
 */

const MAX_IMAGE_DIMENSION = 1024;

/**
 * Compresses an image file to reduce its size while maintaining quality
 * @param file - The image file to compress
 * @returns A promise that resolves to the compressed file
 */
export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // If file is already small enough, don't compress
    if (file.size < 2.5 * 1024 * 1024) { // 2.5MB
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
        if (width > MAX_IMAGE_DIMENSION) {
          const ratio = MAX_IMAGE_DIMENSION / width;
          width = MAX_IMAGE_DIMENSION;
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
              // Create a new File object with the compressed blob
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

/**
 * Creates a preview URL for an image file
 * @param file - The image file to preview
 * @returns The object URL for the file
 */
export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revokes a preview URL to free up memory
 * @param url - The URL to revoke
 */
export const revokeImagePreview = (url: string): void => {
  URL.revokeObjectURL(url);
};
