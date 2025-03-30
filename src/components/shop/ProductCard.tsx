
import { Product } from "@/data/products";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
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
      
      <CardFooter className="pt-0 pb-4">
        <Button className="w-full bg-messaging-primary hover:bg-messaging-accent">
          <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
