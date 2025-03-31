
import { useState, useEffect } from "react";
import { SellerData, fetchSellers, MOCK_SELLERS } from "@/data/sellers";
import ShopOverview from "./ShopOverview";

const FeaturedShops = () => {
  const [sellers, setSellers] = useState<SellerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSellers = async () => {
      setIsLoading(true);
      try {
        // Fetch real sellers from Supabase
        const realSellers = await fetchSellers();
        
        if (realSellers.length > 0) {
          setSellers(realSellers);
        } else {
          // Fallback to mock sellers if no real ones are found
          const mockSellersList = Object.values(MOCK_SELLERS).filter(seller => seller.role === "seller");
          setSellers(mockSellersList);
        }
      } catch (error) {
        console.error("Failed to load sellers:", error);
        // Fallback to mock sellers
        const mockSellersList = Object.values(MOCK_SELLERS).filter(seller => seller.role === "seller");
        setSellers(mockSellersList);
      } finally {
        setIsLoading(false);
      }
    };

    loadSellers();
  }, []);
  
  if (isLoading) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 text-messaging-primary">Featured Sellers</h2>
        <div className="p-6 text-center">
          <p>Loading shops...</p>
        </div>
      </div>
    );
  }

  if (sellers.length === 0) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 text-messaging-primary">Featured Sellers</h2>
        <div className="p-6 text-center bg-gray-50 rounded-lg">
          <p>No shops found. Be the first one to create a shop!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-messaging-primary">Featured Sellers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((seller) => (
          <ShopOverview key={seller.id} seller={seller} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedShops;
