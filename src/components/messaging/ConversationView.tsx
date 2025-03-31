
import { useRef, useEffect, useState } from "react";
import { Conversation } from "@/data/types";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Flag, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

interface ConversationViewProps {
  conversation: Conversation;
  onSendMessage: (text: string, images?: File[]) => void;
  onReportSpam?: (conversationId: string) => void;
}

export default function ConversationView({ conversation, onSendMessage, onReportSpam }: ConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [otherUserName, setOtherUserName] = useState<string>("User");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Get current user ID and other participant's info
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingProfile(true);
      try {
        // Get current user ID
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          setCurrentUserId(userData.user.id);
          
          // Find the other participant
          const otherParticipantId = conversation.participants.find(
            p => p.id !== userData.user.id
          )?.id;
          
          if (otherParticipantId) {
            // Fetch their profile
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', otherParticipantId)
              .single();
              
            if (error) {
              console.error("Error fetching other user profile:", error);
              setOtherUserName(`User ${otherParticipantId.substring(0, 8)}`);
            } else if (profileData) {
              // Use full name from profile
              setOtherUserName(profileData.name || `User ${otherParticipantId.substring(0, 4)}`);
            }
            
            // Fetch avatar
            const { data: publicUrl } = supabase
              .storage
              .from('avatars')
              .getPublicUrl(`${otherParticipantId}/avatar`);
            
            if (publicUrl?.publicUrl) {
              // Check if the file exists by making a HEAD request
              const response = await fetch(publicUrl.publicUrl, { method: 'HEAD' });
              if (response.ok) {
                setAvatarUrl(publicUrl.publicUrl);
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
  }, [conversation.participants]);
  
  // Find the other participant (not the current user)
  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUserId
  );
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);
  
  const handleReportSpam = () => {
    if (onReportSpam) {
      onReportSpam(conversation.id);
    }
  };
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ")
      .map(part => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };
  
  if (!otherParticipant) return null;
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Avatar>
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={otherUserName} />
            ) : (
              <AvatarFallback className="bg-purple-100 text-purple-500">
                {getInitials(otherUserName)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="font-semibold">
              {isLoadingProfile ? "Loading..." : otherUserName}
            </h3>
            <p className="text-sm text-messaging-muted">
              {otherParticipant.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        
        {/* Report Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={handleReportSpam}
              className="text-red-600 cursor-pointer"
            >
              <Flag className="h-4 w-4 mr-2" />
              Report as spam
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-messaging-background">
        {conversation.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input with Safety Warning */}
      <div className="p-4 border-t bg-white space-y-3">
        <Alert className="bg-yellow-50 border-yellow-100 text-yellow-800 text-xs py-2">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-xs">
            To stay protected, stay on Kifgo. Never follow links to other sites, and don't share contact, account, or financial info with anyone in Messages. Learn how to spot spam.
          </AlertDescription>
        </Alert>
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
