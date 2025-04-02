
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
import { Warehouse } from '../models/types';
import { getExpense, createExpense, updateExpense, getWarehouses } from '../services/mockData';

// Define validation schema
const expenseSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  category: z.string().min(2, { message: 'Category is required' }),
  warehouse_id: z.string().min(1, { message: 'Warehouse is required' }),
  expense_date: z.string(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const ExpenseForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  
  const isEditMode = id !== undefined && id !== 'new';

  // Set up form with react-hook-form and zod validation
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: '',
      amount: 0,
      category: '',
      warehouse_id: '',
      expense_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch warehouses
        const warehouseData = await getWarehouses();
        setWarehouses(warehouseData);
        
        // If editing, fetch expense details
        if (isEditMode) {
          const expenseData = await getExpense(id as string);
          if (expenseData) {
            form.reset({
              title: expenseData.title,
              amount: expenseData.amount,
              category: expenseData.category,
              warehouse_id: expenseData.warehouse_id,
              expense_date: new Date(expenseData.expense_date).toISOString().split('T')[0],
            });
          } else {
            toast.error('Expense not found');
            navigate('/expenses');
          }
        }
      } catch (error) {
        toast.error('Failed to fetch data');
        if (isEditMode) {
          navigate('/expenses');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, navigate, form]);

  const onSubmit = async (values: ExpenseFormValues) => {
    setIsSaving(true);
    
    try {
      const selectedWarehouse = warehouses.find(w => w.id === values.warehouse_id);
      
      if (!selectedWarehouse) {
        toast.error('Selected warehouse not found');
        setIsSaving(false);
        return;
      }
      
      if (isEditMode) {
        await updateExpense(id as string, {
          title: values.title,
          amount: values.amount,
          category: values.category,
          warehouse_id: values.warehouse_id,
          warehouse_name: selectedWarehouse.name,
          expense_date: new Date(values.expense_date).toISOString(),
        });
        toast.success('Expense updated successfully');
      } else {
        // Create expense with all required fields
        await createExpense({
          title: values.title,
          amount: values.amount,
          category: values.category,
          warehouse_id: values.warehouse_id,
          warehouse_name: selectedWarehouse.name,
          expense_date: new Date(values.expense_date).toISOString(),
        });
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
            ? 'Update expense details'
            : 'Record a new expense'}
        </p>
      </div>

      <div className="form-container max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="Rent">Rent</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Payroll">Payroll</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="Supplies">Supplies</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a warehouse" />
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
