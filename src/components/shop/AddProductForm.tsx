
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Product } from "@/data/products";
import FormErrorDisplay from "./FormErrorDisplay";
import { ProductBasicFields, ProductCategoryField, ProductImageField, ProductPricingFields } from "./ProductFormFields";
import { useProductForm } from "./useProductForm";

interface AddProductFormProps {
  sellerId: string;
  onSuccess: (product: Product) => void;
  onCancel: () => void;
}

const AddProductForm = ({ sellerId, onSuccess, onCancel }: AddProductFormProps) => {
  const { form, isSubmitting, onSubmit } = useProductForm({
    sellerId,
    onSuccess
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <ProductBasicFields control={form.control} />
        <ProductPricingFields control={form.control} />
        <ProductCategoryField control={form.control} />
        <ProductImageField control={form.control} />

        <FormErrorDisplay errors={form.formState.errors} className="mt-4" />

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
