
import * as z from "zod";

// Schema for product form validation
export const productSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL" }),
  category: z.string().min(1, { message: "Category is required" }),
  stock: z.coerce.number().int().nonnegative({ message: "Stock must be 0 or more" }),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// More specific schema variants can be added here
export const editProductSchema = productSchema.extend({
  id: z.string()
});

export type EditProductFormValues = z.infer<typeof editProductSchema>;
