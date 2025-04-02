
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Trash2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  Calendar,
  CreditCard,
  Package,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
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
import { Order } from '../models/types';
import { getOrders, deleteOrder, formatCurrency } from '../services/mockData';
import { toast } from 'sonner';
import { format } from 'date-fns';

const OrderStatusBadge = ({ status }: { status: string }) => {
  let variant: 
    'default' | 
    'secondary' | 
    'destructive' | 
    'outline' = 'default';
  
  let icon = null;
  
  switch (status) {
    case 'pending':
      variant = 'outline';
      icon = <Clock className="h-3 w-3 mr-1" />;
      break;
    case 'processing':
      variant = 'secondary';
      icon = <Package className="h-3 w-3 mr-1" />;
      break;
    case 'shipped':
      variant = 'default';
      icon = <Package className="h-3 w-3 mr-1" />;
      break;
    case 'delivered':
      variant = 'default';
      icon = <Package className="h-3 w-3 mr-1" />;
      break;
    case 'cancelled':
      variant = 'destructive';
      icon = <Clock className="h-3 w-3 mr-1" />;
      break;
    default:
      variant = 'outline';
  }
  
  return (
    <Badge variant={variant} className="capitalize flex items-center">
      {icon}
      {status}
    </Badge>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        toast.error('Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    
    try {
      await deleteOrder(orderToDelete.id);
      setOrders(orders.filter(o => o.id !== orderToDelete.id));
      toast.success(`Order ${orderToDelete.id} deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete order');
    }
    
    setOrderToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return 'Invalid date';
    }
  };

  const filteredOrders = orders.filter(order => {
    return (
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track customer orders
          </p>
        </div>
        <Button asChild>
          <Link to="/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
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

      {isLoading ? (
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} className="h-[160px] w-full rounded-xl" />
            ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-lg">No orders found</p>
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
          {filteredOrders.map((order) => (
            <Card key={order.id} className="card-transition">
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Order {order.id}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {formatCurrency(order.total_amount)}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-1 pb-2 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Customer: <span className="font-medium">{order.customer_name}</span></span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Order Date: <span className="font-medium">{formatDate(order.order_date)}</span></span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-4 py-3 border-t flex justify-between">
                <Button variant="outline" asChild>
                  <Link to={`/orders/${order.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteClick(order)}
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
              This will permanently delete the order "{orderToDelete?.id}" and all its associated data.
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

export default Orders;
