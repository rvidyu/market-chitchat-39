
/**
 * Utility functions for file validation
 */

export const MAX_FILES = 5;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validates image files against size and type constraints
 * @param files - Array of files to validate
 * @param existingCount - Number of existing files
 * @returns Validation result with status and error message if applicable
 */
export const validateImageFiles = (files: File[], existingCount: number = 0): ValidationResult => {
  // Check if adding these files would exceed the limit
  if (existingCount + files.length > MAX_FILES) {
    return {
      isValid: false,
      error: `You can only upload up to ${MAX_FILES} images.`
    };
  }

  // Check each file's size and type
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      return {
        isValid: false,
        error: 'Only image files are allowed.'
      };
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'Images cannot be larger than 5 MB.'
      };
    }
  }

  return {
    isValid: true,
    error: null
  };
};
