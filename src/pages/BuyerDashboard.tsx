
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import FeaturedShops from "@/components/shop/FeaturedShops";
import RecentProducts from "@/components/shop/RecentProducts";
import { useAuth } from "@/contexts/auth";
import { ShoppingBag, Clock, Star, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good day");

  useEffect(() => {
    // Set greeting based on time of day
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting("Good morning");
    } else if (hours < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {greeting}, {user?.name || "Buyer"}!
              </h1>
              <p className="text-gray-600">
                Discover unique handmade and vintage items from talented sellers around the world.
              </p>
            </div>
            <Link to="/profile">
              <Button variant="outline" className="flex items-center gap-2">
                <User size={16} />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-messaging-primary" />
                Recent Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">You haven't made any purchases yet.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-messaging-accent" />
                Recently Viewed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Browse our marketplace to discover unique items.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Star className="h-5 w-5 mr-2 text-messaging-secondary" />
                Recommended For You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Personalized recommendations will appear here.</p>
            </CardContent>
          </Card>
        </div>

        <div className="my-8">
          <FeaturedShops />
        </div>

        <div className="my-8">
          <RecentProducts />
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
