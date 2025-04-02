
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Dollar,
  Calendar,
  Tag,
  Warehouse,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Expense } from '../models/types';
import { getExpenses, deleteExpense, formatCurrency } from '../services/mockData';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ExpenseCategoryBadge = ({ category }: { category: string }) => {
  // Map categories to colors
  const categoryColorMap: Record<string, string> = {
    Rent: 'bg-blue-100 text-blue-800',
    Utilities: 'bg-green-100 text-green-800',
    Maintenance: 'bg-yellow-100 text-yellow-800',
    Security: 'bg-purple-100 text-purple-800',
    Payroll: 'bg-pink-100 text-pink-800',
    Insurance: 'bg-teal-100 text-teal-800',
    Supplies: 'bg-orange-100 text-orange-800',
    Equipment: 'bg-indigo-100 text-indigo-800',
    Shipping: 'bg-emerald-100 text-emerald-800',
    Other: 'bg-gray-100 text-gray-800'
  };
  
  const colorClass = categoryColorMap[category] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colorClass}`}>
      {category}
    </span>
  );
};

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getExpenses();
        setExpenses(data);
      } catch (error) {
        toast.error('Failed to fetch expenses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    
    try {
      await deleteExpense(expenseToDelete.id);
      setExpenses(expenses.filter(e => e.id !== expenseToDelete.id));
      toast.success(`Expense "${expenseToDelete.title}" deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete expense');
    }
    
    setExpenseToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return 'Invalid date';
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    return (
      expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.warehouse_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage warehouse expenses
          </p>
        </div>
        <Button asChild>
          <Link to="/expenses/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="sm:w-auto w-full">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" className="sm:w-auto w-full">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sort
        </Button>
      </div>

      {/* Total expenses summary card */}
      <Card className="mb-6 bg-primary text-primary-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(totalExpenses)}</div>
          <p className="text-sm opacity-90 mt-1">
            Based on {filteredExpenses.length} expense records
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} className="h-[120px] w-full rounded-xl" />
            ))}
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-lg">No expenses found</p>
          {searchQuery && (
            <Button
              variant="link"
              onClick={() => setSearchQuery('')}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id} className="card-transition">
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{expense.title}</CardTitle>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {formatCurrency(expense.amount)}
                  </div>
                  <ExpenseCategoryBadge category={expense.category} />
                </div>
              </CardHeader>
              <CardContent className="pt-1 pb-2 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Date: <span className="font-medium">{formatDate(expense.expense_date)}</span></span>
                  </div>
                  <div className="flex items-center">
                    <Warehouse className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Warehouse: <span className="font-medium">{expense.warehouse_name}</span></span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-4 py-3 border-t flex justify-end gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link to={`/expenses/edit/${expense.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteClick(expense)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the expense "{expenseToDelete?.title}" of {expenseToDelete ? formatCurrency(expenseToDelete.amount) : ''}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Expenses;
