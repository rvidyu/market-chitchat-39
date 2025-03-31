
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { fetchSellers, SellerData } from "@/data/sellers";
import ShopOverview from "@/components/shop/ShopOverview";
import { Store } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [sellers, setSellers] = useState<SellerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSellers = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching sellers...");
        const sellerData = await fetchSellers();
        console.log("Sellers fetched:", sellerData);
        setSellers(sellerData);
        
        if (sellerData.length === 0) {
          toast({
            title: "No sellers found",
            description: "There are currently no sellers in the marketplace.",
          });
        }
      } catch (error) {
        console.error("Failed to load sellers:", error);
        toast({
          title: "Error",
          description: "Failed to load sellers. Please try again later.",
          variant: "destructive",
        });
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
            <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-xl font-medium text-gray-700 mb-2">No sellers found</p>
            <p className="text-gray-500">There are currently no sellers in our marketplace. Check back later!</p>
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
