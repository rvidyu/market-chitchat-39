
import React from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { cn } from "@/lib/utils";

interface ProductFormFieldsProps {
  control: Control<any>;
}

export const ProductBasicFields = ({ control }: ProductFormFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="Handcrafted Ceramic Mug" 
                className={cn(fieldState.error && "border-red-500 focus-visible:ring-red-500")}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe your product in detail. Include materials, size, and other relevant information."
                className={cn("min-h-[100px]", fieldState.error && "border-red-500 focus-visible:ring-red-500")}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export const ProductPricingFields = ({ control }: ProductFormFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="price"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Price ($)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                min="0" 
                className={cn(fieldState.error && "border-red-500 focus-visible:ring-red-500")}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="stock"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Stock Quantity</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0" 
                className={cn(fieldState.error && "border-red-500 focus-visible:ring-red-500")}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export const ProductCategoryField = ({ control }: ProductFormFieldsProps) => {
  return (
    <FormField
      control={control}
      name="category"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <FormControl>
            <Input 
              placeholder="Jewelry, Home Decor, Clothing, etc." 
              className={cn(fieldState.error && "border-red-500 focus-visible:ring-red-500")}
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const ProductImageField = ({ control }: ProductFormFieldsProps) => {
  return (
    <FormField
      control={control}
      name="imageUrl"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Image URL</FormLabel>
          <FormControl>
            <Input 
              placeholder="https://example.com/image.jpg" 
              className={cn(fieldState.error && "border-red-500 focus-visible:ring-red-500")}
              {...field} 
            />
          </FormControl>
          <FormDescription>
            Enter a URL for your product image. You can use image hosting services like Imgur or Unsplash.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
