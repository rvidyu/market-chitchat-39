import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { SellerData, getSellerById } from "@/data/sellers";
import { fetchProductsBySellerId, Product } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";

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

export const useShopData = (sellerId?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Determine if viewing own shop or another seller's shop
  const isOwnShop = !sellerId || (user?.id === sellerId);
  
  // State for shop data and products
  const [shopData, setShopData] = useState<SellerData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        
        // Get the seller data
        const sellerData = await getSellerById(user.id);
        
        if (sellerData) {
          setShopData(sellerData);
          
          // Try to get products from Supabase first
          const supabaseProducts = await loadSupabaseProducts(user.id);
          
          // If no Supabase products, fall back to mock data
          const allProducts = supabaseProducts.length > 0 
            ? supabaseProducts 
            : await fetchProductsBySellerId(user.id);
            
          setProducts(allProducts);
        } else {
          // Fallback for new sellers with no profile yet
          const defaultSellerData: SellerData = {
            id: user.id,
            name: user.name,
            shopDescription: "Welcome to my handmade and vintage shop! I specialize in creating unique, one-of-a-kind items made with love and care.",
            stats: {
              itemsSold: 0,
              rating: 0,
              products: 0,
              reviews: 0
            },
            role: "seller"
          };
          setShopData(defaultSellerData);
          setProducts([]);
        }
      } else {
        // Viewing another seller's shop or public view
        // Fetch the seller data based on the sellerId
        if (targetSellerId) {
          const sellerData = await getSellerById(targetSellerId);
          
          if (sellerData) {
            setShopData(sellerData);
            
            // Try to get products from Supabase first
            const supabaseProducts = await loadSupabaseProducts(sellerData.id);
            
            // If no Supabase products, fall back to mock data
            const allProducts = supabaseProducts.length > 0 
              ? supabaseProducts 
              : await fetchProductsBySellerId(sellerData.id);
              
            setProducts(allProducts);
          } else {
            console.error(`Seller with ID ${targetSellerId} not found`);
            // If seller not found, show not found UI but don't redirect
            setShopData(null);
            setProducts([]);
          }
        } else {
          // No sellerId and not logged in - show error
          setShopData(null);
          setProducts([]);
        }
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [sellerId, user, isOwnShop, navigate]);

  // Handler to update shop description
  const handleUpdateDescription = async (newDescription: string) => {
    if (shopData) {
      // Create updated shop data
      const updatedShopData = {
        ...shopData,
        shopDescription: newDescription
      };
      
      setShopData(updatedShopData);
      
      // Also update in Supabase if it's the user's own shop
      if (isOwnShop && user) {
        try {
          // Update the shop description in Supabase
          const { error } = await supabase
            .from('profiles')
            .update({ shop_description: newDescription })
            .eq('id', user.id);
            
          if (error) {
            console.error("Error updating shop description:", error);
          }
        } catch (err) {
          console.error("Error in handleUpdateDescription:", err);
        }
      }
    }
  };

  // Handler for adding a new product
  const handleProductAdded = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  return {
    shopData,
    products,
    isLoading,
    isOwnShop,
    handleUpdateDescription,
    handleProductAdded
  };
};
