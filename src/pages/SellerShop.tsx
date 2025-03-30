
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { Store, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import ShopProfile from "@/components/shop/ShopProfile";
import ShopStats from "@/components/shop/ShopStats";
import ProductsGrid from "@/components/shop/ProductsGrid";
import { SellerData, MOCK_SELLERS } from "@/data/sellers";
import { getProductsBySellerId, Product } from "@/data/products";

const SellerShop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sellerId } = useParams();
  
  // Determine if viewing own shop or another seller's shop
  const isOwnShop = !sellerId || (user?.id === sellerId);
  
  // Get shop data based on context
  const [shopData, setShopData] = useState<SellerData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOwnShop) {
      // If it's the user's own shop
      if (user?.role !== "seller") {
        setIsLoading(false);
        return; // No shop data if not a seller
      }
      // Use the logged-in seller's data
      setShopData(MOCK_SELLERS[user.id] || {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "seller",
        shopDescription: "Welcome to my handmade and vintage shop! I specialize in creating unique, one-of-a-kind items made with love and care.",
        stats: {
          itemsSold: 0,
          rating: 0,
          products: 0,
          reviews: 0
        }
      });
      
      // Get products for this seller
      setProducts(getProductsBySellerId(user.id));
    } else {
      // Viewing another seller's shop
      // Fetch the seller data based on the sellerId
      const sellerData = MOCK_SELLERS[sellerId || ""] || null;
      if (sellerData) {
        setShopData(sellerData);
        // Get products for this seller
        setProducts(getProductsBySellerId(sellerData.id));
      } else {
        console.error(`Seller with ID ${sellerId} not found`);
        // Set to the default seller if not found
        const defaultSeller = MOCK_SELLERS["seller-1"];
        setShopData(defaultSeller);
        setProducts(getProductsBySellerId(defaultSeller.id));
      }
    }
    setIsLoading(false);
  }, [sellerId, user, isOwnShop]);

  // Handler to update shop description
  const handleUpdateDescription = (newDescription: string) => {
    if (shopData) {
      // Create updated shop data
      const updatedShopData = {
        ...shopData,
        shopDescription: newDescription
      };
      
      setShopData(updatedShopData);
      
      // In a real app, we would also update this in the backend
      // For now, just update the mock data if it's the user's own shop
      if (isOwnShop && user) {
        MOCK_SELLERS[user.id] = updatedShopData;
        console.log("Updated shop description for user:", user.id, newDescription);
      }
    }
  };
  
  // Only sellers should have a shop page when viewing their own shop
  if (isOwnShop && user?.role !== "seller") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                <Store className="h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Seller Shop Not Found</h2>
                <p className="text-gray-500 mb-4">
                  You need to be logged in as a seller to view your shop profile.
                </p>
                <Button onClick={() => navigate("/")}>Return Home</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If still loading shop data
  if (!shopData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[300px]">
          <p>Loading shop data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto p-4">
        <Card className="mb-8">
          <CardHeader className="bg-messaging-primary text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold flex items-center">
                <Store className="mr-2 h-6 w-6" /> 
                {isOwnShop ? "Your Shop Profile" : `${shopData.name}'s Shop`}
              </h1>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ShopProfile 
              shopData={shopData} 
              isOwnShop={isOwnShop} 
              onUpdateDescription={isOwnShop ? handleUpdateDescription : undefined}
            />
          </CardContent>
          <CardFooter className="border-t pt-4">
            <ShopStats stats={shopData.stats} />
          </CardFooter>
        </Card>

        {/* Products Section */}
        <Card className="mb-8">
          <CardHeader className="bg-messaging-primary text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center">
                <Package className="mr-2 h-6 w-6" /> 
                {isOwnShop ? "Your Products" : `${shopData.name}'s Products`}
              </h2>
              {isOwnShop && (
                <Button 
                  variant="outline" 
                  className="bg-white text-messaging-primary hover:bg-gray-100"
                >
                  Add New Product
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ProductsGrid products={products} isLoading={isLoading} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SellerShop;
