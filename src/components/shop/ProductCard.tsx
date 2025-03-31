
import { useState, useEffect } from "react";
import { Product } from "@/data/products";
import { SellerData, getSellerById } from "@/data/sellers";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Get the seller for this product
  const [seller, setSeller] = useState<SellerData | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadSeller = async () => {
      const sellerData = await getSellerById(product.sellerId);
      setSeller(sellerData);
    };
    
    loadSeller();
  }, [product.sellerId]);
  
  const handleMessageClick = () => {
    if (seller) {
      navigate(`/chat/${seller.id}/${product.id}`, {
        state: {
          productName: product.name,
          productPrice: product.price,
          sellerName: seller.name
        }
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
            Only {product.stock} left!
          </span>
        )}
      </div>
      
      <CardContent className="pt-4 flex-grow">
        <h3 className="text-lg font-medium line-clamp-1">{product.name}</h3>
        <p className="text-lg font-bold text-messaging-primary mt-1">${product.price.toFixed(2)}</p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description}</p>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 flex flex-col space-y-2">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button className="bg-messaging-primary hover:bg-messaging-accent">
            <ShoppingCart className="h-4 w-4 mr-2" /> Add
          </Button>
          
          {seller && (
            <Button 
              variant="outline" 
              className="border-messaging-primary text-messaging-primary hover:bg-messaging-primary/10"
              onClick={handleMessageClick}
            >
              <MessageSquare className="h-4 w-4 mr-2" /> Message
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
