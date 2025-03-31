
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { addProduct, Product } from "@/data/products";

interface UseProductFormProps {
  sellerId: string;
  product?: Product;
  onSuccess: (product: Product) => void;
}

// Define the form schema
const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0.5, "Price must be at least 0.50"),
  stock: z.number().min(1, "Stock must be at least 1"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  imageUrl: z.string().url("Please enter a valid image URL"),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const useProductForm = ({ sellerId, product, onSuccess }: UseProductFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          imageUrl: product.imageUrl,
        }
      : {
          name: "",
          description: "",
          price: 0,
          stock: 1,
          category: "",
          imageUrl: "",
        },
  });

  // Handle form submission
  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);

    try {
      // Create or update the product
      const productData = {
        sellerId,
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        category: data.category,
        imageUrl: data.imageUrl,
      };

      // Add the product to the database
      const savedProduct = await addProduct(productData);

      toast({
        title: "Product saved",
        description: "Your product has been successfully saved.",
      });

      // Call the success callback
      onSuccess(savedProduct);
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error saving your product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    form,
    isSubmitting,
    onSubmit: handleSubmit,
  };
};
