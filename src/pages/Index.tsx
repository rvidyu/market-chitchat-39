
import Messaging from "@/components/messaging/Messaging";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto p-4">
        <Messaging />
      </main>
    </div>
  );
};

export default Index;
