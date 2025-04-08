
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Warehouse } from '../models/types';
import { useRealMongoCollection } from '../hooks/useRealMongoCollection';

const warehouseSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  location: z.string().min(5, { message: 'Location is required' }),
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

const WarehouseForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = id !== undefined && id !== 'new';
  
  // Use the real MongoDB collection hook
  const { findById, create, update, isLoading } = useRealMongoCollection<Warehouse>('warehouses');

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: '',
      location: '',
    },
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchWarehouse = async () => {
        try {
          const data = await findById(id as string);
          if (data) {
            form.reset({
              name: data.name,
              location: data.location,
            });
          } else {
            toast.error('Warehouse not found');
            navigate('/warehouses');
          }
        } catch (error) {
          toast.error('Failed to fetch warehouse details');
          navigate('/warehouses');
        }
      };

      fetchWarehouse();
    }
  }, [id, isEditMode, navigate, form, findById]);

  const onSubmit = async (values: WarehouseFormValues) => {
    setIsSaving(true);
    
    try {
      if (isEditMode) {
        await update(id as string, values);
        toast.success('Warehouse updated successfully');
      } else {
        await create({
          name: values.name,
          location: values.location,
          created_at: new Date().toISOString()
        });
        toast.success('Warehouse created successfully');
      }
      navigate('/warehouses');
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update warehouse' : 'Failed to create warehouse');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="space-y-6">
          {Array(3).fill(0).map((_, i) => (
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
          onClick={() => navigate('/warehouses')}
          className="mb-2"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Warehouses
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Edit Warehouse' : 'Add New Warehouse'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditMode
            ? 'Update warehouse information'
            : 'Create a new warehouse location'}
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
                  <FormLabel>Warehouse Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Address</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/warehouses')}
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
                  'Update Warehouse'
                ) : (
                  'Create Warehouse'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default WarehouseForm;
