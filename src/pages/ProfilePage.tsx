
import React from "react";
import Header from "@/components/Header";
import ProfileEditor from "@/components/profile/ProfileEditor";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";

const ProfilePage = () => {
  const { user, loading } = useAuth();

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
