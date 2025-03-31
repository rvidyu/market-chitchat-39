
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseAvatarUploadProps {
  userId: string | undefined;
}

export const useAvatarUpload = ({ userId }: UseAvatarUploadProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Fetch the avatar on mount
  useEffect(() => {
    if (userId) {
      fetchAvatar();
    }
  }, [userId]);

  const fetchAvatar = async () => {
    try {
      if (!userId) return;
      
      const { data: publicUrl } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(`${userId}/avatar`);
      
      if (publicUrl?.publicUrl) {
        // Check if the file exists by making a HEAD request
        const response = await fetch(publicUrl.publicUrl, { method: 'HEAD' });
        if (response.ok) {
          // Add a cache-busting timestamp parameter to force reload
          setAvatarUrl(`${publicUrl.publicUrl}?t=${Date.now()}`);
        }
      }
    } catch (error) {
      console.error("Error fetching avatar:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Image must be less than 2MB",
        });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an image file",
        });
        return;
      }
      
      setAvatarFile(file);
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };

  const uploadAvatar = async () => {
    if (!userId || !avatarFile) return null;
      
    // Upload to storage with user ID as the folder path
    const filePath = `${userId}/avatar`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { 
        upsert: true,
        contentType: avatarFile.type 
      });
    
    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      return { error: uploadError };
    }
    
    // Get the public URL for future use with cache busting
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    if (publicUrlData) {
      const urlWithCacheBuster = `${publicUrlData.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(urlWithCacheBuster);
    }
    
    return { publicUrl: publicUrlData?.publicUrl || null };
  };

  return {
    avatarUrl,
    avatarFile,
    handleFileChange,
    uploadAvatar,
    refreshAvatar: fetchAvatar // Add a method to refresh the avatar
  };
};
