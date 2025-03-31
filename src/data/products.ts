
// Simple data store for products
// In a real application, this would be fetched from a database

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

const products: Product[] = [
  {
    id: "product-1",
    sellerId: "seller-1",
    name: "Vintage Ceramic Vase",
    description: "Handcrafted ceramic vase with a beautiful blue glaze. Perfect for displaying fresh or dried flowers.",
    price: 45.99,
    imageUrl: "https://images.unsplash.com/photo-1612196808214-b7e239e5d5e5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    category: "Home Decor",
    stock: 5,
    createdAt: "2023-04-12"
  },
  {
    id: "product-2",
    sellerId: "seller-1",
    name: "Handmade Wooden Bowl",
    description: "This wooden bowl is hand-carved from sustainable oak. Each piece is unique with beautiful natural grain patterns.",
    price: 35.50,
    imageUrl: "https://images.unsplash.com/photo-1605883705077-8d3d3cebe78c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    category: "Kitchen",
    stock: 3,
    createdAt: "2023-04-15"
  },
  {
    id: "product-3",
    sellerId: "seller-1",
    name: "Vintage Record Player",
    description: "Fully restored 1970s record player in excellent working condition. Perfect for vinyl enthusiasts.",
    price: 199.99,
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    stock: 1,
    createdAt: "2023-03-28"
  },
  {
    id: "product-4",
    sellerId: "seller-2",
    name: "Handcrafted Ceramic Mug Set",
    description: "Set of 4 handcrafted ceramic mugs in earthy tones. Each mug has a unique shape and texture.",
    price: 64.99,
    imageUrl: "https://images.unsplash.com/photo-1614702815213-f98303f37fb0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    category: "Kitchen",
    stock: 2,
    createdAt: "2023-05-02"
  },
  {
    id: "product-5",
    sellerId: "seller-2",
    name: "Pottery Planter",
    description: "Handmade ceramic planter with drainage hole. Perfect for small to medium plants.",
    price: 32.50,
    imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    category: "Garden",
    stock: 7,
    createdAt: "2023-04-20"
  },
  {
    id: "product-6",
    sellerId: "seller-3",
    name: "Silver Leaf Earrings",
    description: "Handcrafted sterling silver earrings with a delicate leaf design. Lightweight and perfect for everyday wear.",
    price: 48.00,
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    category: "Jewelry",
    stock: 8,
    createdAt: "2023-05-05"
  }
];

export const fetchProductsBySellerId = async (sellerId: string): Promise<Product[]> => {
  // Simulate an API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const sellerProducts = products.filter(product => product.sellerId === sellerId);
      resolve(sellerProducts);
    }, 500);
  });
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  // Simulate an API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = products.find(p => p.id === productId) || null;
      resolve(product);
    }, 300);
  });
};

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
  // Simulate an API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProduct: Product = {
        id: `product-${Date.now()}`,
        ...product,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      // In a real app, we would add this to the database
      // For this demo, we'll just return the new product
      resolve(newProduct);
    }, 500);
  });
};
