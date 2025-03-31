import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flag, MoreVertical, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/data/types";

interface ConversationHeaderProps {
  participants: User[];
  onReportSpam?: (conversationId: string) => void;
  conversationId: string;
  isBlocked?: boolean;
}

export default function ConversationHeader({ 
  participants, 
  onReportSpam,
  conversationId,
  isBlocked = false
}: ConversationHeaderProps) {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [otherUserName, setOtherUserName] = useState<string>("User");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingProfile(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          setCurrentUserId(userData.user.id);
          
          const otherParticipant = participants.find(
            p => p.id !== userData.user.id
          );
          
          if (otherParticipant) {
            const cacheKey = `profile_${otherParticipant.id}`;
            const cachedProfile = sessionStorage.getItem(cacheKey);
            
            if (cachedProfile) {
              const profileData = JSON.parse(cachedProfile);
              setOtherUserName(profileData.name || `User ${otherParticipant.id.substring(0, 8)}`);
            } else {
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', otherParticipant.id)
                .maybeSingle();
                
              if (error) {
                console.error("Error fetching other user profile:", error);
                setOtherUserName(`User ${otherParticipant.id.substring(0, 8)}`);
              } else if (profileData) {
                setOtherUserName(profileData.name || `User ${otherParticipant.id.substring(0, 4)}`);
                sessionStorage.setItem(cacheKey, JSON.stringify(profileData));
              }
            }
            
            const avatarCacheKey = `avatar_${otherParticipant.id}`;
            const cachedAvatarUrl = sessionStorage.getItem(avatarCacheKey);
            
            if (cachedAvatarUrl) {
              if (cachedAvatarUrl !== "null") {
                setAvatarUrl(cachedAvatarUrl);
              }
            } else {
              const { data: publicUrl } = supabase
                .storage
                .from('avatars')
                .getPublicUrl(`${otherParticipant.id}/avatar`);
              
              if (publicUrl?.publicUrl) {
                try {
                  const response = await fetch(publicUrl.publicUrl, { method: 'HEAD' });
                  if (response.ok) {
                    setAvatarUrl(publicUrl.publicUrl);
                    sessionStorage.setItem(avatarCacheKey, publicUrl.publicUrl);
                  } else {
                    sessionStorage.setItem(avatarCacheKey, "null");
                  }
                } catch (err) {
                  sessionStorage.setItem(avatarCacheKey, "null");
                }
              } else {
                sessionStorage.setItem(avatarCacheKey, "null");
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchData();
  }, [participants]);

  const otherParticipant = participants.find(
    (p) => p.id !== currentUserId
  );

  const getInitials = () => {
    if (!otherUserName) return "U";
    return otherUserName.split(" ")
      .map(part => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleReportSpam = () => {
    if (onReportSpam) {
      onReportSpam(conversationId);
    }
  };

  if (!otherParticipant) return null;

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center gap-3">
        <Avatar>
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={otherUserName} />
          ) : (
            <AvatarFallback className="bg-purple-100 text-purple-500">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">
              {isLoadingProfile ? "Loading..." : otherUserName}
            </h3>
            {isBlocked && (
              <ShieldAlert className="h-4 w-4 text-red-500" title="Blocked for spam" />
            )}
          </div>
          <p className="text-sm text-messaging-muted">
            {isBlocked ? "Blocked" : otherParticipant.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isBlocked && (
            <DropdownMenuItem 
              onClick={handleReportSpam}
              className="text-red-600 cursor-pointer"
            >
              <Flag className="h-4 w-4 mr-2" />
              Report as spam
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
