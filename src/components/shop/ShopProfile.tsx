
import { Store } from "lucide-react";
import { SellerData } from "@/data/sellers";
import ContactForm from "./ContactForm";

interface ShopProfileProps {
  shopData: SellerData;
  isOwnShop: boolean;
}

const ShopProfile = ({ shopData, isOwnShop }: ShopProfileProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Shop Avatar */}
      <div className="w-full md:w-1/3 flex justify-center">
        <div className="w-48 h-48 rounded-full bg-messaging-secondary flex items-center justify-center overflow-hidden border-4 border-messaging-primary">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(shopData.name)}&background=random&size=200`} 
            alt={shopData.name} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      {/* Shop Details */}
      <div className="w-full md:w-2/3">
        <h2 className="text-3xl font-bold text-messaging-primary mb-2">{shopData.name}'s Shop</h2>
        <div className="mb-4 text-messaging-muted">
          <p>Seller since {new Date().toLocaleDateString()}</p>
          {isOwnShop && <p>Contact: {shopData.email}</p>}
        </div>
        
        <h3 className="text-xl font-semibold mb-2">About the Shop</h3>
        <p className="mb-4">
          {shopData.shopDescription}
        </p>
        
        {!isOwnShop && <ContactForm seller={shopData} />}
      </div>
    </div>
  );
};

export default ShopProfile;
