
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Skeleton } from '../components/ui/skeleton';
import { Customer } from '../models/types';
import { createCustomer, getCustomer, updateCustomer } from '../services/mockData';
import { toast } from 'sonner';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';

// Define validation schema
const customerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(5, { message: 'Phone number is required' }),
  address: z.string().min(5, { message: 'Address is required' })
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const CustomerForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = id !== undefined && id !== 'new';

  // Set up form with react-hook-form and zod validation
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchCustomer = async () => {
        setIsLoading(true);
        try {
          const data = await getCustomer(id as string);
          if (data) {
            // Update form values
            form.reset({
              name: data.name,
              email: data.email,
              phone: data.phone,
              address: data.address,
            });
          } else {
            toast.error('Customer not found');
            navigate('/customers');
          }
        } catch (error) {
          toast.error('Failed to fetch customer details');
          navigate('/customers');
        } finally {
          setIsLoading(false);
        }
      };

      fetchCustomer();
    }
  }, [id, isEditMode, navigate, form]);

  const onSubmit = async (values: CustomerFormValues) => {
    setIsSaving(true);

    try {
      if (isEditMode) {
        await updateCustomer(id as string, values);
        toast.success('Customer updated successfully');
      } else {
        // Pass all required fields directly
        await createCustomer({
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address
        });
        toast.success('Customer created successfully');
      }
      navigate('/customers');
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update customer' : 'Failed to create customer');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="space-y-6">
          {Array(4).fill(0).map((_, i) => (
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
          onClick={() => navigate('/customers')}
          className="mb-2"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Edit Customer' : 'Add New Customer'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditMode
            ? 'Update customer information'
            : 'Create a new customer record'}
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
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
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
                onClick={() => navigate('/customers')}
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
                  'Update Customer'
                ) : (
                  'Create Customer'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CustomerForm;
