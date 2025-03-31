
import React from "react";
import { useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import ShopLoading from "@/components/shop/ShopLoading";
import ShopNotFound from "@/components/shop/ShopNotFound";
import ShopProfileSection from "@/components/shop/ShopProfileSection";
import ShopProducts from "@/components/shop/ShopProducts";
import { useShopData } from "@/hooks/useShopData";
import { Product } from "@/data/products";

const SellerShop = () => {
  const { sellerId } = useParams();
  const { 
    shopData, 
    products, 
    isLoading, 
    isOwnShop, 
    handleUpdateDescription,
    handleProductAdded
  } = useShopData(sellerId);

  // Handler for successfully adding a product
  const onProductAdded = (newProduct: Product) => {
    handleProductAdded(newProduct);
    
    // Show success message
    toast({
      title: "Product Added",
      description: `${newProduct.name} has been added to your shop.`,
    });
  };

  // If still loading shop data
  if (isLoading) {
    return <ShopLoading />;
  }

  // If we have no shop data, something went wrong
  if (!shopData) {
    return <ShopNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto p-4">
        <ShopProfileSection 
          shopData={shopData}
          isOwnShop={isOwnShop}
          onUpdateDescription={handleUpdateDescription}
        />

        <ShopProducts
          products={products}
          isLoading={isLoading}
          isOwnShop={isOwnShop}
          sellerId={shopData.id}
          sellerName={shopData.name}
          userRole={isOwnShop ? "seller" : undefined}
          onProductAdded={onProductAdded}
        />
      </main>
    </div>
  );
};

export default SellerShop;
