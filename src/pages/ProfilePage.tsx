
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProfileEditor from "@/components/profile/ProfileEditor";
import ProfileView from "@/components/profile/ProfileView";
import { useAuth } from "@/contexts/auth";
import { Loader2, Pencil, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">My Account</h1>
            <p className="text-gray-600">
              {editMode ? "Edit your profile information" : "View your profile information"}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2"
          >
            {editMode ? (
              <>
                <Eye className="h-4 w-4" />
                View Mode
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Edit Mode
              </>
            )}
          </Button>
        </div>
        
        {editMode ? <ProfileEditor /> : <ProfileView />}
      </div>
    </div>
  );
};

export default ProfilePage;
