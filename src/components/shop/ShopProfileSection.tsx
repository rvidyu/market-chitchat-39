
import React from "react";
import { Store } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import ShopProfile from "@/components/shop/ShopProfile";
import ShopStats from "@/components/shop/ShopStats";
import { SellerData } from "@/data/sellers";

interface ShopProfileSectionProps {
  shopData: SellerData;
  isOwnShop: boolean;
  onUpdateDescription: (newDescription: string) => void;
}

const ShopProfileSection = ({ shopData, isOwnShop, onUpdateDescription }: ShopProfileSectionProps) => {
  return (
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
          onUpdateDescription={isOwnShop ? onUpdateDescription : undefined}
        />
      </CardContent>
      <CardFooter className="border-t pt-4">
        <ShopStats stats={shopData.stats} />
      </CardFooter>
    </Card>
  );
};

export default ShopProfileSection;
