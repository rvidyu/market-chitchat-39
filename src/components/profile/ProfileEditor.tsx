
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import AvatarUploader from "./AvatarUploader";

const ProfileEditor = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  
  const { 
    avatarUrl, 
    avatarFile, 
    handleFileChange, 
    uploadAvatar 
  } = useAvatarUpload({ userId: user?.id });
  
  const { 
    name, 
    setName, 
    isLoading, 
    setIsLoading,
    updateProfileName 
  } = useProfileUpdate({ userId: user?.id, session });

  // Initialize name from user data
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user, setName]);

  const updateProfile = async () => {
    setIsLoading(true);
    try {
      // Update profile name
      const { error: nameError } = await updateProfileName();
      
      if (nameError) throw nameError;

      // Upload avatar if selected
      if (avatarFile) {
        const { error: avatarError } = await uploadAvatar() || {};
        
        if (avatarError) {
          console.error("Error uploading avatar:", avatarError);
          // Continue execution even if avatar upload fails
          toast({
            variant: "default",
            title: "Profile partially updated",
            description: "Your profile was updated, but there was an issue uploading your avatar image."
          });
          setIsLoading(false);
          return;
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
        <AvatarUploader 
          avatarUrl={avatarUrl} 
          name={name} 
          handleFileChange={handleFileChange} 
        />

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
