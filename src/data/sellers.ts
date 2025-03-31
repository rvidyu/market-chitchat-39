
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

// Define the shape of the Supabase profile data
interface SupabaseProfile {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  created_at?: string; 
  updated_at?: string;
  shop_description: string;
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
    
    // If no sellers found in database, return empty array
    if (!data || data.length === 0) {
      console.log("No sellers found in database");
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
    // Query Supabase
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
