
import { useState, useEffect } from "react";
import { Store } from "lucide-react";
import { SellerData } from "@/data/sellers";
import ContactForm from "./ContactForm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ShopProfileProps {
  shopData: SellerData;
  isOwnShop: boolean;
  onUpdateDescription?: (newDescription: string) => void;
}

const ShopProfile = ({ shopData, isOwnShop, onUpdateDescription }: ShopProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(shopData.shopDescription);
  const { toast } = useToast();

  // Update local description when shopData changes
  useEffect(() => {
    setDescription(shopData.shopDescription);
  }, [shopData.shopDescription]);

  const handleSave = () => {
    if (onUpdateDescription) {
      onUpdateDescription(description);
      toast({
        title: "Shop Updated",
        description: "Your shop description has been updated successfully.",
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDescription(shopData.shopDescription);
    setIsEditing(false);
  };

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
        
        {isEditing ? (
          <div className="mb-4">
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] mb-3"
              placeholder="Describe your shop..."
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} variant="default">Save</Button>
              <Button onClick={handleCancel} variant="outline">Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <p>{shopData.shopDescription}</p>
            {isOwnShop && (
              <Button 
                onClick={() => setIsEditing(true)} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Edit Description
              </Button>
            )}
          </div>
        )}
        
        {!isOwnShop && <ContactForm seller={shopData} />}
      </div>
    </div>
  );
};

export default ShopProfile;
