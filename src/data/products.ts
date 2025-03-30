
// Mock data for seller products
export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: string;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "product-1",
    sellerId: "user-2",
    name: "Handcrafted Ceramic Mug",
    description: "Beautiful handmade ceramic mug, perfect for your morning coffee or tea.",
    price: 24.99,
    imageUrl: "https://images.unsplash.com/photo-1591224876006-5a5ee5afc270?q=80&w=400",
    category: "Home",
    stock: 10,
    createdAt: "2023-01-15"
  },
  {
    id: "product-2",
    sellerId: "user-2",
    name: "Knitted Wool Scarf",
    description: "Warm and cozy handknitted wool scarf in a variety of colors.",
    price: 34.99,
    imageUrl: "https://images.unsplash.com/photo-1601379329542-31c20891b4b8?q=80&w=400",
    category: "Accessories",
    stock: 5,
    createdAt: "2023-02-10"
  },
  {
    id: "product-3",
    sellerId: "seller-1",
    name: "Beaded Necklace",
    description: "Elegant handmade beaded necklace with natural stones and sterling silver clasp.",
    price: 45.99,
    imageUrl: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400",
    category: "Jewelry",
    stock: 8,
    createdAt: "2023-03-05"
  },
  {
    id: "product-4",
    sellerId: "seller-1",
    name: "Wooden Earrings",
    description: "Lightweight wooden earrings with intricate designs, perfect for everyday wear.",
    price: 18.99,
    imageUrl: "https://images.unsplash.com/photo-1590548784585-643d2b9f2925?q=80&w=400",
    category: "Jewelry",
    stock: 15,
    createdAt: "2023-01-30"
  },
  {
    id: "product-5",
    sellerId: "seller-2",
    name: "Vintage Record Player",
    description: "Fully restored 1970s record player in excellent working condition.",
    price: 189.99,
    imageUrl: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?q=80&w=400",
    category: "Electronics",
    stock: 2,
    createdAt: "2023-02-20"
  },
  {
    id: "product-6",
    sellerId: "seller-2",
    name: "Retro Clock Radio",
    description: "Vintage clock radio from the 1960s, refurbished and in working condition.",
    price: 75.99,
    imageUrl: "https://images.unsplash.com/photo-1495704907664-81f74a7efd7b?q=80&w=400",
    category: "Home",
    stock: 3,
    createdAt: "2023-03-15"
  }
];

// Helper function to get products by seller ID
export const getProductsBySellerId = (sellerId: string): Product[] => {
  return MOCK_PRODUCTS.filter(product => product.sellerId === sellerId);
};
