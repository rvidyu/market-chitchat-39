
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Star, Package, MessageSquare } from "lucide-react";
import { SellerData } from "@/data/sellers";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ShopOverviewProps {
  seller: SellerData;
}

const ShopOverview = ({ seller }: ShopOverviewProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const visitShop = () => {
    navigate(`/shop/${seller.id}`);
  };

  return (
    <Card 
      className="h-full transition-all duration-200 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center mb-4">
          <Avatar className="h-20 w-20 mb-3 border-2 border-messaging-primary">
            <AvatarImage 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&background=random&size=200`} 
              alt={seller.name} 
            />
            <AvatarFallback>{seller.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold">{seller.name}</h3>
          <div className="flex items-center mt-1 text-yellow-500">
            <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
            <span className="ml-1 text-sm">{seller.stats.rating}</span>
            <span className="mx-1 text-gray-400">•</span>
            <span className="text-sm text-gray-500">{seller.stats.reviews} reviews</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-3 text-center mb-4">
          {seller.shopDescription}
        </p>
        
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-gray-100 p-2 rounded">
            <Package className="h-4 w-4 mx-auto mb-1 text-messaging-primary" />
            <p className="text-xs text-gray-600">Products</p>
            <p className="font-semibold">{seller.stats.products}</p>
          </div>
          <div className="bg-gray-100 p-2 rounded">
            <Store className="h-4 w-4 mx-auto mb-1 text-messaging-primary" />
            <p className="text-xs text-gray-600">Sold</p>
            <p className="font-semibold">{seller.stats.itemsSold}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center pb-6">
        <Button 
          onClick={visitShop}
          className={`w-full transition-all ${isHovered ? 'bg-messaging-accent' : 'bg-messaging-primary'}`}
        >
          <Store className="mr-2 h-4 w-4" /> 
          Visit Shop
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShopOverview;
