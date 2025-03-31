
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useNavigate, useParams } from "react-router-dom";
import { Store, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import ShopProfile from "@/components/shop/ShopProfile";
import ShopStats from "@/components/shop/ShopStats";
import ProductsGrid from "@/components/shop/ProductsGrid";
import { SellerData, MOCK_SELLERS } from "@/data/sellers";
import { getProductsBySellerId, Product } from "@/data/products";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import AddProductForm from "@/components/shop/AddProductForm";
import { supabase } from "@/integrations/supabase/client";

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
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);

  // Function to load products from Supabase
  const loadSupabaseProducts = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', id);

      if (error) {
        console.error("Error fetching products:", error);
        return [];
      }

      // Convert Supabase products to our Product interface format
      return data.map(item => ({
        id: item.id,
        sellerId: item.seller_id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image_url,
        category: item.category,
        stock: item.stock,
        createdAt: item.created_at
      }));
    } catch (err) {
      console.error("Error in loadSupabaseProducts:", err);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Choose which seller ID to use
      const targetSellerId = sellerId || (user?.id || "");
      
      if (isOwnShop && user) {
        // If it's the user's own shop and they're logged in
        if (user.role !== "seller") {
          navigate("/"); // Redirect non-sellers trying to view their own shop
          return;
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
        
        // Try to get products from Supabase first
        const supabaseProducts = await loadSupabaseProducts(user.id);
        
        // If no Supabase products, fall back to mock data
        const allProducts = supabaseProducts.length > 0 
          ? supabaseProducts 
          : getProductsBySellerId(user.id);
          
        setProducts(allProducts);
      } else {
        // Viewing another seller's shop or public view
        // Fetch the seller data based on the sellerId
        const sellerData = MOCK_SELLERS[targetSellerId] || null;
        
        if (sellerData) {
          setShopData(sellerData);
          
          // Try to get products from Supabase first
          const supabaseProducts = await loadSupabaseProducts(sellerData.id);
          
          // If no Supabase products, fall back to mock data
          const allProducts = supabaseProducts.length > 0 
            ? supabaseProducts 
            : getProductsBySellerId(sellerData.id);
            
          setProducts(allProducts);
        } else if (targetSellerId) {
          console.error(`Seller with ID ${targetSellerId} not found`);
          // Try to find any shop to display
          const availableSellers = Object.values(MOCK_SELLERS);
          if (availableSellers.length > 0) {
            const defaultSeller = availableSellers[0];
            setShopData(defaultSeller);
            
            // Try to get products from Supabase first
            const supabaseProducts = await loadSupabaseProducts(defaultSeller.id);
            
            // If no Supabase products, fall back to mock data
            const allProducts = supabaseProducts.length > 0 
              ? supabaseProducts 
              : getProductsBySellerId(defaultSeller.id);
              
            setProducts(allProducts);
          } else {
            // No sellers available at all
            navigate("/");
            return;
          }
        } else {
          // No sellerId and not logged in - show a default shop
          const defaultSeller = MOCK_SELLERS["seller-1"];
          setShopData(defaultSeller);
          
          // Try to get products from Supabase first
          const supabaseProducts = await loadSupabaseProducts(defaultSeller.id);
          
          // If no Supabase products, fall back to mock data
          const allProducts = supabaseProducts.length > 0 
            ? supabaseProducts 
            : getProductsBySellerId(defaultSeller.id);
            
          setProducts(allProducts);
        }
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [sellerId, user, isOwnShop, navigate]);

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

  // Handler for successfully adding a product
  const handleProductAdded = (newProduct: Product) => {
    // Add the new product to the local state
    setProducts(prev => [newProduct, ...prev]);
    setShowAddProductDialog(false);
    
    // Show success message
    toast({
      title: "Product Added",
      description: `${newProduct.name} has been added to your shop.`,
    });
  };

  // If still loading shop data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[300px]">
          <p>Loading shop data...</p>
        </div>
      </div>
    );
  }

  // If we have no shop data, something went wrong
  if (!shopData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                <Store className="h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Shop Not Found</h2>
                <p className="text-gray-500 mb-4">
                  We couldn't find the shop you're looking for.
                </p>
                <Button onClick={() => navigate("/")}>Return Home</Button>
              </div>
            </CardContent>
          </Card>
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
              {isOwnShop && user?.role === "seller" && (
                <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="bg-white text-messaging-primary hover:bg-gray-100"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add New Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                      <DialogDescription>
                        Enter the details for your new product. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <AddProductForm 
                      sellerId={user?.id || ''} 
                      onSuccess={handleProductAdded} 
                      onCancel={() => setShowAddProductDialog(false)}
                    />
                  </DialogContent>
                </Dialog>
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
