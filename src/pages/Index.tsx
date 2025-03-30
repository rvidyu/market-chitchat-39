
import Messaging from "@/components/messaging/Messaging";
import Header from "@/components/Header";
import FeaturedShops from "@/components/shop/FeaturedShops";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto p-4">
        <div className="mb-10">
          <FeaturedShops />
        </div>
        <Messaging />
      </main>
    </div>
  );
};

export default Index;
