
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { fetchSellers, SellerData } from "@/data/sellers";
import ShopOverview from "@/components/shop/ShopOverview";

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [sellers, setSellers] = useState<SellerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSellers = async () => {
      setIsLoading(true);
      try {
        const sellerData = await fetchSellers();
        setSellers(sellerData);
      } catch (error) {
        console.error("Failed to load sellers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSellers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Discover Sellers</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : sellers.length === 0 ? (
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No sellers found. Check back later!</p>
          </CardContent>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller) => (
              <ShopOverview key={seller.id} seller={seller} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BuyerDashboard;
