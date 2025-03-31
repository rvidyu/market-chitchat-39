
// Simple data store for sellers
// In a real application, this would be fetched from a database

export interface SellerStats {
  rating: number;
  reviews: number;
  products: number;
  itemsSold: number;
}

export interface SellerData {
  id: string;
  name: string;
  shopName: string;
  shopDescription: string;
  location: string;
  joinedDate: string;
  stats: SellerStats;
}

const sellers: SellerData[] = [
  {
    id: "seller-1",
    name: "Demo Seller",
    shopName: "Vintage Treasures",
    shopDescription: "Curated vintage items with a story to tell. Each piece is hand-selected for its unique character and quality craftsmanship.",
    location: "Portland, OR",
    joinedDate: "2022-03-15",
    stats: {
      rating: 4.8,
      reviews: 153,
      products: 42,
      itemsSold: 247
    }
  },
  {
    id: "seller-2",
    name: "Creative Crafts",
    shopName: "Creative Crafts",
    shopDescription: "Handmade pottery, ceramics, and home decor items made with love and attention to detail.",
    location: "Austin, TX",
    joinedDate: "2021-08-20",
    stats: {
      rating: 4.9,
      reviews: 89,
      products: 31,
      itemsSold: 124
    }
  },
  {
    id: "seller-3",
    name: "Artisan Jewelry",
    shopName: "Artisan Jewelry",
    shopDescription: "Unique, handcrafted jewelry designs inspired by nature and made with sustainable materials.",
    location: "Seattle, WA",
    joinedDate: "2023-01-10",
    stats: {
      rating: 4.7,
      reviews: 67,
      products: 28,
      itemsSold: 93
    }
  }
];

export const fetchSellers = async (): Promise<SellerData[]> => {
  // Simulate an API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sellers);
    }, 500);
  });
};

export const getSellerById = async (id: string): Promise<SellerData | null> => {
  // Simulate an API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const seller = sellers.find(s => s.id === id) || null;
      resolve(seller);
    }, 300);
  });
};
