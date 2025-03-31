
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { User, Mail, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const ProfileView = () => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Fetch avatar
      const fetchAvatar = async () => {
        try {
          const { data } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(`${user.id}/avatar`);
          
          if (data?.publicUrl) {
            // Check if the file exists
            const response = await fetch(data.publicUrl, { method: 'HEAD' });
            if (response.ok) {
              setAvatarUrl(data.publicUrl);
            }
          }
        } catch (error) {
          console.error("Error fetching avatar:", error);
        }
      };

      // Fetch profile data including bio
      const fetchProfileData = async () => {
        setLoading(true);
        try {
          const { data } = await supabase
            .from('profiles')
            .select('shop_description')
            .eq('id', user.id)
            .single();
            
          if (data?.shop_description) {
            setBio(data.shop_description);
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAvatar();
      fetchProfileData();
    }
  }, [user]);

  if (!user) return null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Your personal and account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={user.name || "Profile"} />
            ) : (
              <AvatarFallback className="text-lg bg-gradient-to-r from-primary to-secondary text-white">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
              <p className="text-base">{user.name || "Not provided"}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
              <p className="text-base">{user.email || "Not provided"}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">About / Bio</h3>
              <p className="text-base">{loading ? "Loading..." : bio || "No bio provided"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileView;
