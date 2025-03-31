
import { useState, useEffect } from "react";
import { SellerData, fetchSellers } from "@/data/sellers";
import ShopOverview from "./ShopOverview";
import { Award, TrendingUp, Store } from "lucide-react";

const FeaturedShops = () => {
  const [sellers, setSellers] = useState<SellerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSellers = async () => {
      setIsLoading(true);
      try {
        console.log("FeaturedShops: Fetching sellers...");
        // Fetch sellers from Supabase or fallback to mock data
        const sellerData = await fetchSellers();
        console.log("FeaturedShops: Sellers fetched:", sellerData);
        setSellers(sellerData);
      } catch (error) {
        console.error("Failed to load sellers:", error);
        setSellers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSellers();
  }, []);
  
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6">
          <Award className="h-6 w-6 text-messaging-primary" />
          <h2 className="text-2xl font-bold text-messaging-primary">Featured Sellers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (sellers.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6">
          <Award className="h-6 w-6 text-messaging-primary" />
          <h2 className="text-2xl font-bold text-messaging-primary">Featured Sellers</h2>
        </div>
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Store className="h-10 w-10 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-600 mb-2">No shops found</p>
          <p className="text-gray-500">Be the first one to create a shop and showcase your handmade or vintage products!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <Award className="h-6 w-6 text-messaging-primary" />
        <h2 className="text-2xl font-bold text-messaging-primary">Featured Sellers</h2>
        <span className="text-sm bg-messaging-accent/10 text-messaging-accent px-2 py-0.5 rounded-full flex items-center ml-2">
          <TrendingUp className="h-3.5 w-3.5 mr-1" /> Trending
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((seller) => (
          <ShopOverview key={seller.id} seller={seller} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedShops;
