
import React from "react";
import Header from "@/components/Header";

const ShopLoading = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[300px]">
        <p>Loading shop data...</p>
      </div>
    </div>
  );
};

export default ShopLoading;
