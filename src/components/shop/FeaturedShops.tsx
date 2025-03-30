
import { MOCK_SELLERS } from "@/data/sellers";
import ShopOverview from "./ShopOverview";

const FeaturedShops = () => {
  // Convert object to array and filter out any non-seller users
  const sellers = Object.values(MOCK_SELLERS).filter(seller => seller.role === "seller");
  
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-messaging-primary">Featured Sellers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((seller) => (
          <ShopOverview key={seller.id} seller={seller} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedShops;
