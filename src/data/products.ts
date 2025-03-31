
// Products data service
// This file provides utilities for accessing product information

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

// Empty array to store products - no mock data
const products: Product[] = [];

export const fetchProductsBySellerId = async (sellerId: string): Promise<Product[]> => {
  // In a real application, fetch from database
  return new Promise((resolve) => {
    setTimeout(() => {
      const sellerProducts = products.filter(product => product.sellerId === sellerId);
      resolve(sellerProducts);
    }, 500);
  });
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  // In a real application, fetch from database
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = products.find(p => p.id === productId) || null;
      resolve(product);
    }, 300);
  });
};

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
  // In a real application, add to database
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProduct: Product = {
        id: `product-${Date.now()}`,
        ...product,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      // In a real app, we would add this to the database
      resolve(newProduct);
    }, 500);
  });
};
