
import Messaging from "@/components/messaging/Messaging";
import Header from "@/components/Header";
import FeaturedShops from "@/components/shop/FeaturedShops";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto p-4 py-8">
        <FeaturedShops />
        
        <div className="mt-12">
          <Messaging />
        </div>
      </main>
    </div>
  );
};

export default Index;
