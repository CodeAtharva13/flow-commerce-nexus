
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { ChevronLeft, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
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
import { Expense, Warehouse } from '../models/types';
import { getExpense, createExpense, updateExpense, getWarehouses } from '../services/mockData';

const expenseSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  amount: z.number().min(0.01, { message: 'Amount must be greater than 0' }),
  category: z.string().min(1, { message: 'Category is required' }),
  warehouse_id: z.string().min(1, { message: 'Warehouse is required' }),
  expense_date: z.string().min(1, { message: 'Date is required' }),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const ExpenseForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const isEditMode = id !== 'new';

  // Available expense categories
  const categories = [
    'Rent',
    'Utilities',
    'Maintenance',
    'Security',
    'Insurance',
    'Payroll',
    'Supplies',
    'Transportation',
    'Equipment',
    'Miscellaneous',
  ];

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: '',
      amount: 0,
      category: '',
      warehouse_id: '',
      expense_date: new Date().toISOString().slice(0, 10), // Today's date in YYYY-MM-DD format
    },
  });

  useEffect(() => {
    // Fetch warehouses
    const fetchWarehouses = async () => {
      try {
        const data = await getWarehouses();
        setWarehouses(data);
      } catch (error) {
        toast.error('Failed to load warehouses');
      }
    };
    
    fetchWarehouses();
    
    // Fetch expense data if editing
    if (isEditMode) {
      const fetchExpense = async () => {
        setIsLoading(true);
        try {
          const data = await getExpense(id as string);
          if (data) {
            // Format the date to YYYY-MM-DD for the date input
            const formattedDate = new Date(data.expense_date).toISOString().slice(0, 10);
            
            form.reset({
              title: data.title,
              amount: data.amount,
              category: data.category,
              warehouse_id: data.warehouse_id,
              expense_date: formattedDate,
            });
          } else {
            toast.error('Expense not found');
            navigate('/expenses');
          }
        } catch (error) {
          toast.error('Failed to fetch expense details');
          navigate('/expenses');
        } finally {
          setIsLoading(false);
        }
      };

      fetchExpense();
    }
  }, [id, isEditMode, navigate, form]);

  const onSubmit = async (values: ExpenseFormValues) => {
    setIsSaving(true);
    
    try {
      // Find warehouse for the name
      const selectedWarehouse = warehouses.find(w => w.id === values.warehouse_id);
      
      if (!selectedWarehouse) {
        toast.error('Selected warehouse not found');
        setIsSaving(false);
        return;
      }
      
      const expenseData = {
        ...values,
        warehouse_name: selectedWarehouse.name,
      };
      
      if (isEditMode) {
        await updateExpense(id as string, expenseData);
        toast.success('Expense updated successfully');
      } else {
        await createExpense(expenseData);
        toast.success('Expense created successfully');
      }
      navigate('/expenses');
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update expense' : 'Failed to create expense');
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
          onClick={() => navigate('/expenses')}
          className="mb-2"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Expenses
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Edit Expense' : 'Add New Expense'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditMode
            ? 'Update expense information'
            : 'Record a new expense'}
        </p>
      </div>

      <div className="form-container max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Expense Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expense Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                        <Input 
                          type="number"
                          step="0.01" 
                          className="pl-8"
                          {...field}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expense Date */}
              <FormField
                control={form.control}
                name="expense_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Warehouse */}
            <FormField
              control={form.control}
              name="warehouse_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
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
                onClick={() => navigate('/expenses')}
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
                  'Update Expense'
                ) : (
                  'Create Expense'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ExpenseForm;
