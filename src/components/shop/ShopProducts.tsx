
import React, { useState } from "react";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import ProductsGrid from "./ProductsGrid";
import { Product } from "@/data/products";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import AddProductForm from "./AddProductForm";

interface ShopProductsProps {
  products: Product[];
  isLoading: boolean;
  isOwnShop: boolean;
  sellerId: string;
  sellerName: string;
  userRole?: string;
  onProductAdded: (newProduct: Product) => void;
}

const ShopProducts = ({ 
  products, 
  isLoading, 
  isOwnShop, 
  sellerId, 
  sellerName,
  userRole, 
  onProductAdded 
}: ShopProductsProps) => {
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);

  return (
    <Card className="mb-8">
      <CardHeader className="bg-messaging-primary text-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center">
            <Package className="mr-2 h-6 w-6" /> 
            {isOwnShop ? "Your Products" : `${sellerName}'s Products`}
          </h2>
          {isOwnShop && userRole === "seller" && (
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
                  sellerId={sellerId} 
                  onSuccess={onProductAdded} 
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
  );
};

export default ShopProducts;
