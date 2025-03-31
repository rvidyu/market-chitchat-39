
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/products";
import { productSchema, ProductFormValues } from "@/schemas/productSchema";
import { toast } from "@/hooks/use-toast";

interface UseProductFormProps {
  sellerId: string;
  onSuccess: (product: Product) => void;
  onError?: (error: string) => void;
}

export const useProductForm = ({ sellerId, onSuccess, onError }: UseProductFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      category: "",
      stock: 1,
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    if (!sellerId) {
      const errorMessage = "Seller ID is missing";
      console.error(errorMessage);
      form.setError("root", { message: errorMessage });
      if (onError) onError(errorMessage);
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting product with values:", values);

    try {
      // Insert product into Supabase
      const { data, error } = await supabase
        .from('products')
        .insert({
          seller_id: sellerId,
          name: values.name,
          description: values.description,
          price: values.price,
          image_url: values.imageUrl,
          category: values.category,
          stock: values.stock,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating product:", error);
        form.setError("root", { 
          message: `Failed to create product: ${error.message}` 
        });
        if (onError) onError(error.message);
        toast({
          title: "Product Creation Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log("Product created successfully:", data);

      // Map the Supabase product to our Product interface
      const newProduct: Product = {
        id: data.id,
        sellerId: data.seller_id,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.image_url,
        category: data.category,
        stock: data.stock,
        createdAt: data.created_at
      };

      toast({
        title: "Product Created",
        description: `${values.name} has been added to your shop.`,
      });

      onSuccess(newProduct);
      form.reset();
    } catch (error: any) {
      console.error("Error in product creation:", error);
      form.setError("root", { 
        message: "An unexpected error occurred. Please try again." 
      });
      if (onError) onError(error.message || "Unknown error");
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
