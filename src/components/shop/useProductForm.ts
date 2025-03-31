
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
      // Check if the sellerId is a proper UUID
      if (!isValidUUID(sellerId)) {
        // If it's not a valid UUID, we need to fetch the actual UUID from the profiles table
        // This assumes that auth provider has already set up the user in profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', sellerId)
          .maybeSingle();

        if (profileError || !profileData) {
          console.error("Error fetching seller profile:", profileError);
          throw new Error("Could not verify seller identity");
        }

        sellerId = profileData.id;
      }

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

  // Helper function to validate if a string is a valid UUID
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  return {
    form,
    isSubmitting,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
