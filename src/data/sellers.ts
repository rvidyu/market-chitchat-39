
import { supabase } from "@/integrations/supabase/client";

export interface SellerStats {
  itemsSold: number;
  rating: number;
  reviews: number;
  products: number;
}

export interface SellerData {
  id: string;
  name: string;
  role: "seller";
  email: string;
  shopDescription: string;
  stats: SellerStats;
}

// Mock seller data for fallback and testing
export const MOCK_SELLERS: Record<string, SellerData> = {
  "seller-1": {
    id: "seller-1",
    name: "Handcrafted Haven",
    role: "seller",
    email: "haven@example.com",
    shopDescription: "Beautiful handmade crafts and unique gifts for every occasion.",
    stats: {
      itemsSold: 124,
      rating: 4.8,
      reviews: 48,
      products: 25
    }
  },
  "seller-2": {
    id: "seller-2",
    name: "Vintage Vibes",
    role: "seller",
    email: "vintage@example.com",
    shopDescription: "Curated collection of authentic vintage items from the 50s through the 90s.",
    stats: {
      itemsSold: 89,
      rating: 4.6,
      reviews: 31,
      products: 18
    }
  }
};

// Define the shape of the Supabase profile data
interface SupabaseProfile {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  created_at?: string; 
  updated_at?: string;
  shop_description: string; // Updated to match the database column - making it required
}

// Function to fetch real sellers from Supabase
export const fetchSellers = async (): Promise<SellerData[]> => {
  try {
    // Query profiles with role=seller
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'seller');
    
    if (error) {
      console.error("Error fetching sellers:", error);
      return [];
    }
    
    // Transform the data to match our SellerData interface
    return data.map((seller: SupabaseProfile) => ({
      id: seller.id,
      name: seller.name || "Shop Owner",
      role: "seller",
      email: seller.email || "",
      shopDescription: seller.shop_description || "Welcome to my handmade and vintage shop!",
      stats: {
        itemsSold: Math.floor(Math.random() * 200),
        rating: parseFloat((4 + Math.random()).toFixed(1)),
        reviews: Math.floor(Math.random() * 100),
        products: Math.floor(Math.random() * 30) + 1
      }
    }));
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return [];
  }
};

// Get a seller by ID
export const getSellerById = async (id: string): Promise<SellerData | null> => {
  try {
    // Check if we have a mock seller first (for testing)
    if (MOCK_SELLERS[id]) {
      return MOCK_SELLERS[id];
    }
    
    // Otherwise query Supabase
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('role', 'seller')
      .maybeSingle();
    
    if (error || !data) {
      console.error("Error fetching seller:", error);
      return null;
    }
    
    const profile = data as SupabaseProfile;
    
    return {
      id: profile.id,
      name: profile.name || "Shop Owner",
      role: "seller",
      email: profile.email || "",
      shopDescription: profile.shop_description || "Welcome to my handmade and vintage shop!",
      stats: {
        itemsSold: Math.floor(Math.random() * 200),
        rating: parseFloat((4 + Math.random()).toFixed(1)),
        reviews: Math.floor(Math.random() * 100),
        products: Math.floor(Math.random() * 30) + 1
      }
    };
  } catch (error) {
    console.error("Error fetching seller by ID:", error);
    return null;
  }
};

// Update shop description
export const updateShopDescription = async (id: string, description: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ shop_description: description })
      .eq('id', id);
    
    if (error) {
      console.error("Error updating shop description:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating shop description:", error);
    return false;
  }
};
