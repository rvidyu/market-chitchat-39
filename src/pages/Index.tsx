
import { Link } from "react-router-dom";
import Messaging from "@/components/messaging/Messaging";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-messaging-primary">Handmade & Vintage Marketplace</h1>
          <div className="flex space-x-2">
            <Link to="/buyer-login">
              <Button variant="outline">Buyer Login</Button>
            </Link>
            <Link to="/seller-login">
              <Button>Seller Login</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        <Messaging />
      </main>
    </div>
  );
};

export default Index;
