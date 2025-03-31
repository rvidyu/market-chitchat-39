
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProfileEditor from "@/components/profile/ProfileEditor";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      // Fetch user's avatar
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

      fetchAvatar();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-messaging-primary mb-4" />
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">My Account</h1>
          <p className="text-gray-600">
            Manage your profile information
          </p>
        </div>
        
        <ProfileEditor />
      </div>
    </div>
  );
};

export default ProfilePage;
