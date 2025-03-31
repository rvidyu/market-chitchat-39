
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
    const { data, error } = await supabase
      .from('sellers')
      .select('*');
    
    if (error) {
      console.error("Error fetching sellers:", error);
      return [];
    }
    
    // Transform the data to match our SellerData interface
    return data.map((seller: any) => ({
      id: seller.id,
      name: seller.name,
      role: "seller",
      email: seller.email || "",
      shopDescription: seller.description || "Welcome to my handmade and vintage shop!",
      stats: {
        itemsSold: seller.items_sold || 0,
        rating: seller.rating || 4.5,
        reviews: seller.reviews || 0,
        products: seller.products || 0
      }
    }));
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return [];
  }
};

// Fallback mock sellers to use if the API call fails
export const MOCK_SELLERS: Record<string, SellerData> = {
  "seller-1": {
    id: "seller-1",
    name: "Crafty Creations",
    role: "seller",
    email: "crafty@example.com",
    shopDescription: "Handmade pottery, ceramics, and home decor items crafted with love and attention to detail. Each piece is unique and tells a story.",
    stats: {
      itemsSold: 128,
      rating: 4.8,
      reviews: 52,
      products: 24
    }
  },
  "seller-2": {
    id: "seller-2",
    name: "Vintage Treasures",
    role: "seller",
    email: "vintage@example.com",
    shopDescription: "Curated vintage items from the 1950s through the 1990s. From clothing to home goods, each item has been carefully selected for its quality and unique character.",
    stats: {
      itemsSold: 87,
      rating: 4.7,
      reviews: 34,
      products: 18
    }
  }
};

// Get a seller by ID
export const getSellerById = (id: string): SellerData | undefined => {
  return MOCK_SELLERS[id];
};
