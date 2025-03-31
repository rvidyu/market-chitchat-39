
// Sellers data service
// This file provides utilities for accessing seller information
import { supabase } from "@/integrations/supabase/client";

export interface SellerStats {
  rating: number;
  reviews: number;
  products: number;
  itemsSold: number;
}

export interface SellerData {
  id: string;
  name: string;
  shopName?: string;
  shopDescription: string;
  location?: string;
  joinedDate?: string;
  stats: SellerStats;
  role?: string;
}

// Empty array to store sellers - no mock data
const sellers: SellerData[] = [];

export const fetchSellers = async (): Promise<SellerData[]> => {
  try {
    // Fetch profiles with role = 'seller' from Supabase
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, name, shop_description, role, created_at')
      .eq('role', 'seller');
    
    if (error) {
      console.error("Error fetching sellers:", error);
      return [];
    }

    // For each seller, also fetch their product count
    const sellersWithStats = await Promise.all(profiles.map(async (profile) => {
      // Fetch product count for this seller
      const { count: productCount, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', profile.id);
      
      if (countError) {
        console.error(`Error fetching products for seller ${profile.id}:`, countError);
      }

      // Create a seller object with default stats
      const seller: SellerData = {
        id: profile.id,
        name: profile.name || 'Anonymous Seller',
        shopDescription: profile.shop_description || 'Welcome to my handmade and vintage shop!',
        joinedDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : undefined,
        role: profile.role,
        stats: {
          rating: 4.5, // Default rating since we don't have ratings yet
          reviews: 0,   // Default reviews count
          products: productCount || 0,
          itemsSold: 0  // Default items sold count
        }
      };

      return seller;
    }));

    return sellersWithStats;
  } catch (err) {
    console.error("Error in fetchSellers:", err);
    return [];
  }
};

export const getSellerById = async (id: string): Promise<SellerData | null> => {
  try {
    // Fetch the seller profile from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, name, shop_description, role, created_at')
      .eq('id', id)
      .single();
    
    if (error || !profile) {
      console.error(`Error fetching seller with ID ${id}:`, error);
      return null;
    }

    // Fetch product count for this seller
    const { count: productCount, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', id);
    
    if (countError) {
      console.error(`Error fetching products for seller ${id}:`, countError);
    }

    // Create and return the seller object
    return {
      id: profile.id,
      name: profile.name || 'Anonymous Seller',
      shopDescription: profile.shop_description || 'Welcome to my handmade and vintage shop!',
      joinedDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : undefined,
      role: profile.role,
      stats: {
        rating: 4.5, // Default rating
        reviews: 0,   // Default reviews
        products: productCount || 0,
        itemsSold: 0  // Default items sold
      }
    };
  } catch (err) {
    console.error(`Error in getSellerById for ID ${id}:`, err);
    return null;
  }
};
