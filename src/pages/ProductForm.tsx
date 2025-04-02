
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { ChevronLeft, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Product } from '../models/types';
import { getProduct, createProduct, updateProduct } from '../services/mockData';

// Define validation schema
const productSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  description: z.string().min(5, { message: 'Description is required' }),
  price: z.coerce.number().positive({ message: 'Price must be positive' }),
  category: z.string().min(2, { message: 'Category is required' }),
  stock: z.coerce.number().int().nonnegative({ message: 'Stock must be 0 or more' }),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = id !== undefined && id !== 'new';

  // Set up form with react-hook-form and zod validation
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
    },
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const data = await getProduct(id as string);
          if (data) {
            // Update form values
            form.reset({
              name: data.name,
              description: data.description,
              price: data.price,
              category: data.category,
              stock: data.stock,
            });
          } else {
            toast.error('Product not found');
            navigate('/products');
          }
        } catch (error) {
          toast.error('Failed to fetch product details');
          navigate('/products');
        } finally {
          setIsLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, isEditMode, navigate, form]);

  const onSubmit = async (values: ProductFormValues) => {
    setIsSaving(true);
    
    try {
      if (isEditMode) {
        await updateProduct(id as string, values);
        toast.success('Product updated successfully');
      } else {
        // Create a new product with all required fields
        await createProduct({
          name: values.name,
          description: values.description,
          price: values.price,
          category: values.category,
          stock: values.stock
        });
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="space-y-6">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="flex justify-end space-x-2 pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          className="mb-2"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditMode
            ? 'Update product information'
            : 'Create a new product in the inventory'}
        </p>
      </div>

      <div className="form-container max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <Input type="number" min="0" step="1" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Home & Kitchen">Home & Kitchen</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/products')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : isEditMode ? (
                  'Update Product'
                ) : (
                  'Create Product'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ProductForm;
