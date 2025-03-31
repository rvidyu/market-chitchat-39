
// Sellers data service
// This file provides utilities for accessing seller information

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
  // In a real application, fetch from database
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sellers);
    }, 500);
  });
};

export const getSellerById = async (id: string): Promise<SellerData | null> => {
  // In a real application, fetch from database by id
  return new Promise((resolve) => {
    setTimeout(() => {
      const seller = sellers.find(s => s.id === id) || null;
      resolve(seller);
    }, 300);
  });
};
