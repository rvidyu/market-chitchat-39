
import { Product } from "@/data/types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductMessageCardProps {
  product: Product;
  className?: string;
}

const ProductMessageCard = ({ product, className }: ProductMessageCardProps) => {
  if (!product) return null;

  return (
    <Card className={cn("mb-2 max-w-[240px] border-messaging-muted/30", className)}>
      <CardContent className="p-3 flex flex-col">
        {product.image && (
          <div className="rounded-md overflow-hidden mb-2">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-auto object-cover" 
            />
          </div>
        )}
        <h4 className="font-medium text-sm">{product.name}</h4>
        {product.price && (
          <div className="text-messaging-primary font-medium mt-1">
            {product.price}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductMessageCard;
