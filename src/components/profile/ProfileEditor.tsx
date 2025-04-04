import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import AvatarUploader from "./AvatarUploader";
import { supabase } from "@/integrations/supabase/client";

const ProfileEditor = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  
  const { 
    avatarUrl, 
    avatarFile, 
    handleFileChange, 
    uploadAvatar,
    refreshAvatar 
  } = useAvatarUpload({ userId: user?.id });
  
  const { 
    name, 
    setName,
    email,
    setEmail,
    bio,
    setBio,
    isLoading, 
    setIsLoading,
    updateProfile 
  } = useProfileUpdate({ userId: user?.id, session });

  // Initialize profile data from user
  useEffect(() => {
    if (user) {
      if (user.email) setEmail(user.email);
      
      // Fetch the shop description (bio) and name if it exists
      const fetchProfileData = async () => {
        if (!user.id) return;
        
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('shop_description, name')
            .eq('id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching profile data:", error);
            return;
          }
            
          if (data) {
            console.log("Fetched profile data:", data);
            if (data.shop_description) {
              setBio(data.shop_description);
            }
            if (data.name) {
              setName(data.name);
            }
          }
        } catch (error) {
          console.error("Exception fetching profile data:", error);
        }
      };
      
      fetchProfileData();
    }
  }, [user, setName, setEmail, setBio]);

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      console.log("Starting profile update with name:", name);
      
      // Update profile data
      const { error: profileError } = await updateProfile();
      
      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      console.log("Profile successfully updated");

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

      // Force a refresh of the avatar to ensure latest version is shown
      setTimeout(() => {
        refreshAvatar();
      }, 500);

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
          <Label htmlFor="name">Profile Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
          <p className="text-xs text-muted-foreground">This is how you'll appear to others</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">About / Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself or your shop..."
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleProfileUpdate} 
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
