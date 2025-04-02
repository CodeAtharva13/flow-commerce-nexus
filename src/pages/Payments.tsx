
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Search,
  Filter,
  ArrowUpDown,
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { Payment } from '../models/types';
import { getPayments, formatCurrency } from '../services/mockData';
import { toast } from 'sonner';

const PaymentMethodIcon = ({ method }: { method: string }) => {
  switch (method) {
    case 'credit_card':
      return <CreditCard className="h-4 w-4" />;
    case 'paypal':
      return <div className="h-4 w-4 text-blue-600">P</div>;
    case 'bank_transfer':
      return <div className="h-4 w-4">B</div>;
    case 'cash':
      return <div className="h-4 w-4">$</div>;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  let variant: 
    'default' | 
    'secondary' | 
    'destructive' | 
    'outline' = 'default';
  
  let icon = null;
  
  switch (status) {
    case 'completed':
      variant = 'default';
      icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
      break;
    case 'pending':
      variant = 'secondary';
      icon = <Clock className="h-3 w-3 mr-1" />;
      break;
    case 'failed':
      variant = 'destructive';
      icon = <XCircle className="h-3 w-3 mr-1" />;
      break;
    case 'refunded':
      variant = 'outline';
      icon = <XCircle className="h-3 w-3 mr-1" />;
      break;
    default:
      variant = 'secondary';
  }
  
  return (
    <Badge variant={variant} className="capitalize flex items-center">
      {icon}
      {status}
    </Badge>
  );
};

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getPayments();
        setPayments(data);
      } catch (error) {
        toast.error('Failed to fetch payments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return 'Invalid date';
    }
  };

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'paypal':
        return 'PayPal';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash';
      default:
        return method;
    }
  };

  const filteredPayments = payments.filter(payment => {
    return (
      payment.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transaction_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground mt-1">
          Track all payment transactions
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
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
        <div className="w-full overflow-hidden rounded-lg border">
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-lg">No payments found</p>
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
        <div className="w-full overflow-hidden rounded-lg border">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/50">
                    <td>{payment.id}</td>
                    <td>
                      <Link to={`/orders/${payment.order_id}`} className="text-primary hover:underline">
                        {payment.order_id}
                      </Link>
                    </td>
                    <td>{formatDate(payment.payment_date)}</td>
                    <td>
                      <div className="flex items-center">
                        <span className="mr-2">
                          <PaymentMethodIcon method={payment.method} />
                        </span>
                        {getPaymentMethodDisplay(payment.method)}
                        {payment.method === 'credit_card' && payment.card_details && (
                          <span className="ml-1 text-muted-foreground">
                            (ending in {payment.card_details.last4})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="font-medium">{formatCurrency(payment.amount)}</td>
                    <td>
                      <PaymentStatusBadge status={payment.status} />
                    </td>
                    <td>
                      <span className="text-xs font-mono">{payment.transaction_id}</span>
                    </td>
                    <td>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/payments/${payment.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
