
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Product } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const productSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL" }),
  category: z.string().min(1, { message: "Category is required" }),
  stock: z.coerce.number().int().nonnegative({ message: "Stock must be 0 or more" }),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductFormProps {
  sellerId: string;
  onSuccess: (product: Product) => void;
  onCancel: () => void;
}

const AddProductForm = ({ sellerId, onSuccess, onCancel }: AddProductFormProps) => {
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
      console.error("Seller ID is missing");
      return;
    }

    setIsSubmitting(true);

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
        return;
      }

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

      onSuccess(newProduct);
      form.reset();
    } catch (error) {
      console.error("Error in product creation:", error);
      form.setError("root", { 
        message: "An unexpected error occurred. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Handcrafted Ceramic Mug" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your product in detail. Include materials, size, and other relevant information."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="Jewelry, Home Decor, Clothing, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                Enter a URL for your product image. You can use image hosting services like Imgur or Unsplash.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
        )}

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddProductForm;
