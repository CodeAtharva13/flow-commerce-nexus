
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { createExpense, getExpense, updateExpense, getWarehouses } from '../services/mockData';
import { toast } from 'sonner';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Expense, Warehouse } from '../models/types';

const ExpenseForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [expense, setExpense] = useState<Expense>({
    id: '',
    title: '',
    amount: 0,
    category: '',
    warehouse_id: '',
    warehouse_name: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const isEditMode = id !== 'new';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const warehousesData = await getWarehouses();
        setWarehouses(warehousesData);

        if (isEditMode) {
          const expenseData = await getExpense(id as string);
          if (expenseData) {
            setExpense({
              ...expenseData,
              expense_date: new Date(expenseData.expense_date).toISOString().split('T')[0]
            });
          } else {
            toast.error('Expense not found');
            navigate('/expenses');
          }
        } else if (warehousesData.length > 0) {
          // Set default warehouse for new expense
          setExpense(prev => ({
            ...prev,
            warehouse_id: warehousesData[0].id,
            warehouse_name: warehousesData[0].name
          }));
        }
      } catch (error) {
        toast.error('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExpense(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleWarehouseChange = (warehouseId: string) => {
    const selected = warehouses.find(w => w.id === warehouseId);
    if (selected) {
      setExpense(prev => ({
        ...prev,
        warehouse_id: selected.id,
        warehouse_name: selected.name
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isEditMode) {
        await updateExpense(id as string, expense);
        toast.success('Expense updated successfully');
      } else {
        // Explicitly prepare the expense with required fields to match the type
        const newExpense = {
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          warehouse_id: expense.warehouse_id,
          warehouse_name: expense.warehouse_name,
          expense_date: expense.expense_date
        };
        await createExpense(newExpense);
        toast.success('Expense created successfully');
      }
      navigate('/expenses');
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update expense' : 'Failed to create expense');
    } finally {
      setIsSaving(false);
    }
  };

  const categories = [
    'Rent',
    'Utilities',
    'Salaries',
    'Equipment',
    'Maintenance',
    'Insurance',
    'Marketing',
    'Office Supplies',
    'Transportation',
    'Other'
  ];

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
          {isEditMode ? 'Update expense details' : 'Record a new expense'}
        </p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="title">Expense Title</Label>
              <Input
                id="title"
                name="title"
                value={expense.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-muted-foreground">$</span>
                </div>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={expense.amount}
                  onChange={handleChange}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="category">Category</Label>
              <Select
                value={expense.category}
                onValueChange={(value) => setExpense(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="warehouse_id">Warehouse</Label>
              <Select
                value={expense.warehouse_id}
                onValueChange={handleWarehouseChange}
              >
                <SelectTrigger id="warehouse_id">
                  <SelectValue placeholder="Select a warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(warehouse => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="expense_date">Date</Label>
              <Input
                id="expense_date"
                name="expense_date"
                type="date"
                value={expense.expense_date}
                onChange={handleChange}
                required
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
