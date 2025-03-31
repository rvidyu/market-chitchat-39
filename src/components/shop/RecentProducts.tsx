
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/products";
import ProductsGrid from "./ProductsGrid";
import { ShoppingBag, TrendingUp } from "lucide-react";

const RecentProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the most recent products from Supabase
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Convert the Supabase format to our Product format
          const formattedProducts: Product[] = data.map(item => ({
            id: item.id,
            sellerId: item.seller_id,
            name: item.name,
            description: item.description,
            price: item.price,
            imageUrl: item.image_url,
            category: item.category,
            stock: item.stock,
            createdAt: item.created_at
          }));
          
          setProducts(formattedProducts);
        }
      } catch (err) {
        console.error("Error fetching recent products:", err);
        setError("Failed to load recent products");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentProducts();
  }, []);
  
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-messaging-primary" />
            <h2 className="text-2xl font-bold text-messaging-primary">New Arrivals</h2>
            <span className="text-sm bg-messaging-accent/10 text-messaging-accent px-2 py-0.5 rounded-full flex items-center ml-2">
              <TrendingUp className="h-3.5 w-3.5 mr-1" /> Hot Items
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="h-6 w-6 text-messaging-primary" />
          <h2 className="text-2xl font-bold text-messaging-primary">New Arrivals</h2>
        </div>
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-lg font-medium text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-messaging-primary text-white rounded-md hover:bg-messaging-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="h-6 w-6 text-messaging-primary" />
          <h2 className="text-2xl font-bold text-messaging-primary">New Arrivals</h2>
        </div>
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <ShoppingBag className="h-10 w-10 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-600 mb-2">No products found</p>
          <p className="text-gray-500">Check back soon for new items from our sellers.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-messaging-primary" />
          <h2 className="text-2xl font-bold text-messaging-primary">New Arrivals</h2>
          <span className="text-sm bg-messaging-accent/10 text-messaging-accent px-2 py-0.5 rounded-full flex items-center ml-2">
            <TrendingUp className="h-3.5 w-3.5 mr-1" /> Hot Items
          </span>
        </div>
      </div>
      <ProductsGrid products={products} />
    </div>
  );
};

export default RecentProducts;
