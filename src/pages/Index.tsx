
import Messaging from "@/components/messaging/Messaging";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-messaging-primary">Handmade & Vintage Marketplace</h1>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        <Messaging />
      </main>
    </div>
  );
};

export default Index;
