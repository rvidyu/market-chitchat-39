
// Mock data for demo seller profiles
export interface SellerStats {
  itemsSold: number;
  rating: number;
  products: number;
  reviews: number;
}

export interface SellerData {
  id: string;
  name: string;
  email: string;
  role: string;
  shopDescription: string;
  stats: SellerStats;
}

export const MOCK_SELLERS: Record<string, SellerData> = {
  "user-2": {
    id: "user-2",
    name: "Jane Smith",
    email: "seller@example.com",
    role: "seller",
    shopDescription: "Welcome to my handmade and vintage shop! I specialize in creating unique, one-of-a-kind items made with love and care.",
    stats: {
      itemsSold: 42,
      rating: 4.8,
      products: 18,
      reviews: 36
    }
  },
  "seller-1": {
    id: "seller-1",
    name: "Crafty Creations",
    email: "crafty@example.com",
    role: "seller",
    shopDescription: "Handmade jewelry and accessories created with sustainable materials. Each piece tells a story and is crafted with attention to detail.",
    stats: {
      itemsSold: 127,
      rating: 4.9,
      products: 45,
      reviews: 112
    }
  },
  "seller-2": {
    id: "seller-2",
    name: "Vintage Treasures",
    email: "vintage@example.com",
    role: "seller",
    shopDescription: "Curated collection of vintage items from the 50s to the 90s. Find unique home decor, clothing, and accessories with history.",
    stats: {
      itemsSold: 89,
      rating: 4.7,
      products: 62,
      reviews: 78
    }
  }
};

// Helper function to get a seller by ID
export const getSellerById = (id: string): SellerData | null => {
  return MOCK_SELLERS[id] || null;
};
