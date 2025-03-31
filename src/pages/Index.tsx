
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import FeaturedShops from "@/components/shop/FeaturedShops";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is logged in, redirect them to the appropriate dashboard
    if (user) {
      if (user.role === "seller") {
        navigate("/seller-shop");
      } else {
        navigate("/buyer-dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to the Handmade & Vintage Marketplace</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover unique handmade and vintage items from talented sellers around the world.
          </p>
        </div>

        <div className="my-12">
          <FeaturedShops />
        </div>
      </div>
    </div>
  );
};

export default Index;
