
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
    return data.map((seller: any) => ({
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('role', 'seller')
      .single();
    
    if (error || !data) {
      console.error("Error fetching seller:", error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name || "Shop Owner",
      role: "seller",
      email: data.email || "",
      shopDescription: data.shop_description || "Welcome to my handmade and vintage shop!",
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
