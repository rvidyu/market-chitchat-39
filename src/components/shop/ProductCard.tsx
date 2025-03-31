
import { useState, useEffect } from "react";
import { Product } from "@/data/products";
import { SellerData, getSellerById } from "@/data/sellers";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MessageSquare, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ContactSellerButton from "./ContactSellerButton";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Get the seller for this product
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const loadSeller = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Create a default seller with the ID to ensure we always have something to work with
        const defaultSeller: SellerData = {
          id: product.sellerId,
          name: "Seller",
          shopDescription: "Seller information unavailable",
          role: "seller",
          stats: {
            rating: 0,
            reviews: 0,
            products: 1,
            itemsSold: 0
          }
        };
        
        // First try to fetch from Supabase directly
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, shop_description, role, created_at')
          .eq('id', product.sellerId)
          .maybeSingle();
          
        if (error) {
          console.error("Supabase profiles fetch error:", error);
          // Don't throw - continue with fallback
        }
        
        if (data) {
          // Format data to match SellerData structure
          setSeller({
            id: data.id,
            name: data.name || 'Unknown Seller',
            shopDescription: data.shop_description || 'No description available',
            role: data.role || 'seller',
            stats: {
              rating: 4.5,
              reviews: 12,
              products: 8,
              itemsSold: 120
            }
          });
        } else {
          // Fallback to mock data service
          try {
            const sellerData = await getSellerById(product.sellerId);
            if (sellerData) {
              setSeller(sellerData);
            } else {
              // If both methods fail, use the default seller
              console.log("Using default seller for ID:", product.sellerId);
              setSeller(defaultSeller);
            }
          } catch (fallbackError) {
            console.error("Error in fallback seller fetch:", fallbackError);
            // Use the default seller if everything fails
            setSeller(defaultSeller);
          }
        }
      } catch (error) {
        console.error("Error loading seller:", error);
        setError("Could not load seller information.");
        
        // Even with an error, set a default seller to ensure the UI works
        setSeller({
          id: product.sellerId,
          name: "Unknown Seller",
          shopDescription: "Seller information unavailable",
          role: "seller",
          stats: {
            rating: 0,
            reviews: 0,
            products: 1,
            itemsSold: 0
          }
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSeller();
  }, [product.sellerId]);
  
  const handleMessageClick = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to contact sellers",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    if (seller) {
      navigate(`/chat/${seller.id}/${product.id}`, {
        state: {
          productName: product.name,
          productPrice: product.price,
          sellerName: seller.name
        }
      });
    } else {
      toast({
        title: "Cannot contact seller",
        description: "Seller information is currently unavailable. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {product.stock <= 3 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {product.stock === 1 ? "Only 1 left!" : `Only ${product.stock} left!`}
          </span>
        )}
      </div>
      
      <CardContent className="pt-4 flex-grow">
        <h3 className="text-lg font-medium line-clamp-1">{product.name}</h3>
        <p className="text-lg font-bold text-messaging-primary mt-1">${product.price.toFixed(2)}</p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description}</p>
        {error && (
          <div className="mt-2 text-sm text-red-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 flex flex-col space-y-2">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button className="bg-messaging-primary hover:bg-messaging-accent">
            <ShoppingCart className="h-4 w-4 mr-2" /> Add
          </Button>
          
          {seller ? (
            <ContactSellerButton 
              product={product}
              seller={seller}
              variant="button"
            />
          ) : (
            <Button 
              variant="outline" 
              className="border-messaging-primary text-messaging-primary hover:bg-messaging-primary/10"
              onClick={handleMessageClick}
              disabled={isLoading}
            >
              <MessageSquare className="h-4 w-4 mr-2" /> Contact
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
