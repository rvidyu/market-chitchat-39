
import { Product } from "@/data/products";
import ProductCard from "./ProductCard";

interface ProductsGridProps {
  products: Product[];
  isLoading?: boolean;
}

const ProductsGrid = ({ products, isLoading = false }: ProductsGridProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p>Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-medium text-gray-600">No Products Found</h3>
        <p className="text-gray-500 mt-2">This shop doesn't have any products yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductsGrid;
