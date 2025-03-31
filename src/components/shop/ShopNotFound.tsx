
import React from "react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const ShopNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
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
};

export default ShopNotFound;
