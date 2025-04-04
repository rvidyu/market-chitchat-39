
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth/useAuth";
import { LogIn, UserPlus, LogOut, User, ShoppingBag, Store, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const { user, logout } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Fetch user avatar when component mounts or user changes
  useEffect(() => {
    const fetchAvatar = async () => {
      if (!user?.id) return;
      
      try {
        const { data: publicUrl } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(`${user.id}/avatar`);
        
        if (publicUrl?.publicUrl) {
          // Check if the file exists by making a HEAD request
          const response = await fetch(publicUrl.publicUrl, { method: 'HEAD' });
          if (response.ok) {
            // Add a cache-busting timestamp parameter
            setAvatarUrl(`${publicUrl.publicUrl}?t=${Date.now()}`);
          }
        }
      } catch (error) {
        console.error("Error fetching avatar:", error);
      }
    };

    fetchAvatar();
    
    // Set up interval to refresh the avatar URL every minute
    const intervalId = setInterval(fetchAvatar, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, [user]);

  // Generate initials for avatar fallback
  const getInitials = (name: string): string => {
    if (!name) return "U";
    return name.split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/">
          <h1 className="text-2xl font-bold text-messaging-primary">Handmade & Vintage Marketplace</h1>
        </Link>
        
        <div className="flex items-center gap-4">
          {user && (
            <nav className="hidden md:flex items-center space-x-4 mr-4">
              <Link to="/chat" className="text-messaging-primary hover:text-messaging-accent flex items-center">
                <MessageSquare className="mr-1 h-4 w-4" /> Messages
              </Link>
              {user.role === "seller" ? (
                <Link to="/seller-shop" className="text-messaging-primary hover:text-messaging-accent flex items-center">
                  <Store className="mr-1 h-4 w-4" /> My Shop
                </Link>
              ) : (
                <Link to="/buyer-dashboard" className="text-messaging-primary hover:text-messaging-accent flex items-center">
                  <ShoppingBag className="mr-1 h-4 w-4" /> Discover Sellers
                </Link>
              )}
            </nav>
          )}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={user.name} />
                    ) : (
                      <AvatarFallback className="bg-messaging-primary text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {user.role && (
                    <Badge className="absolute -bottom-2 -right-2 px-1.5 py-0.5 text-[10px]" variant={user.role === "seller" ? "default" : "secondary"}>
                      {user.role === "seller" ? (
                        <span className="flex items-center"><Store className="mr-1 h-2.5 w-2.5" /> Seller</span>
                      ) : (
                        <span className="flex items-center"><ShoppingBag className="mr-1 h-2.5 w-2.5" /> Buyer</span>
                      )}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>{user.name}</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center w-full cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/chat" className="flex items-center w-full cursor-pointer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Messages</span>
                  </Link>
                </DropdownMenuItem>
                {user.role === "seller" ? (
                  <DropdownMenuItem asChild>
                    <Link to="/seller-shop" className="flex items-center w-full cursor-pointer">
                      <Store className="mr-2 h-4 w-4" />
                      <span>My Shop</span>
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/buyer-dashboard" className="flex items-center w-full cursor-pointer">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>Discover Sellers</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role && (
                  <DropdownMenuItem className="flex items-center">
                    {user.role === "seller" ? (
                      <>
                        <Store className="mr-2 h-4 w-4" />
                        <span>Seller Account</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span>Buyer Account</span>
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center cursor-pointer" onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link to="/login" className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" /> Log in
                </Link>
              </Button>
              <Button className="bg-messaging-primary hover:bg-messaging-accent" asChild>
                <Link to="/register" className="flex items-center">
                  <UserPlus className="mr-2 h-4 w-4" /> Sign up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
