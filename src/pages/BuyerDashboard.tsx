
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import FeaturedShops from "@/components/shop/FeaturedShops";
import { useAuth } from "@/contexts/auth";

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
          <h1 className="text-2xl font-bold mb-2">
            {greeting}, {user?.name || "Buyer"}!
          </h1>
          <p className="text-gray-600">
            Discover unique handmade and vintage items from talented sellers around the world.
          </p>
        </div>

        <div className="my-8">
          <FeaturedShops />
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
