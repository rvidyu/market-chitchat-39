
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";

const ProfileEditor = () => {
  const { user, session } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Define fetchAvatar function before using it
  const fetchAvatar = async () => {
    try {
      if (!user?.id) return;
      
      const { data: publicUrl } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(`${user.id}/avatar`);
      
      if (publicUrl?.publicUrl) {
        // Check if the file exists by making a HEAD request
        const response = await fetch(publicUrl.publicUrl, { method: 'HEAD' });
        if (response.ok) {
          setAvatarUrl(publicUrl.publicUrl);
        }
      }
    } catch (error) {
      console.error("Error fetching avatar:", error);
    }
  };

  // Use useEffect to fetch avatar on component mount
  useEffect(() => {
    if (user?.id) {
      fetchAvatar();
    }
  }, [user]);

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

  const updateProfile = async () => {
    if (!user?.id || !session) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "You must be logged in to update your profile",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Update profile name
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id);
      
      if (updateError) throw updateError;

      // Upload avatar if selected
      if (avatarFile) {
        // Upload to storage with user ID as the folder path
        const filePath = `${user.id}/avatar`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { 
            upsert: true,
            contentType: avatarFile.type 
          });
        
        if (uploadError) {
          console.error("Error uploading avatar:", uploadError);
          // Continue execution even if avatar upload fails
          toast({
            variant: "default",  // Changed from "warning" to "default"
            title: "Profile partially updated",
            description: "Your profile was updated, but there was an issue uploading your avatar image."
          });
          setIsLoading(false);
          return;
        }
        
        // Get the public URL for future use
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        if (publicUrlData) {
          setAvatarUrl(publicUrlData.publicUrl);
        }
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "There was a problem updating your profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="h-24 w-24">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Profile" />
            ) : (
              <AvatarFallback className="text-lg bg-gradient-to-r from-primary to-secondary text-white">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <Label htmlFor="avatar" className="cursor-pointer flex items-center justify-center gap-2 text-sm text-primary">
              <Upload size={16} />
              Upload Photo
            </Label>
            <Input 
              id="avatar" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={updateProfile} 
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileEditor;
