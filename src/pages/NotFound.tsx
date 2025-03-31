
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import Header from "@/components/Header";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="flex justify-center">
            <Button asChild className="bg-messaging-primary hover:bg-messaging-accent">
              <Link to="/" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
