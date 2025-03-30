
import { SellerStats } from "@/data/sellers";

interface ShopStatsProps {
  stats: SellerStats;
}

const ShopStats = ({ stats }: ShopStatsProps) => {
  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-4">Shop Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-2xl font-bold text-messaging-primary">{stats.itemsSold}</p>
          <p className="text-sm text-gray-600">Items Sold</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-2xl font-bold text-messaging-primary">{stats.rating}</p>
          <p className="text-sm text-gray-600">Rating</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-2xl font-bold text-messaging-primary">{stats.products}</p>
          <p className="text-sm text-gray-600">Products</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-2xl font-bold text-messaging-primary">{stats.reviews}</p>
          <p className="text-sm text-gray-600">Reviews</p>
        </div>
      </div>
    </div>
  );
};

export default ShopStats;
