
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
import { Card, CardContent } from '../components/ui/card';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Order } from '../models/types';
import { getOrders, getOrder, createPayment, formatCurrency } from '../services/mockData';

// Define validation schema
const paymentSchema = z.object({
  order_id: z.string().min(1, { message: 'Order is required' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  method: z.enum(['credit_card', 'paypal', 'bank_transfer', 'cash'], { message: 'Payment method is required' }),
  status: z.enum(['pending', 'completed', 'failed', 'refunded'], { message: 'Status is required' }),
  transaction_id: z.string().optional(),
  // Card details are optional
  card_last4: z.string().optional(),
  card_expiry: z.string().optional(),
  card_brand: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const PaymentForm = () => {
  const { id, orderId } = useParams<{ id: string; orderId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      order_id: orderId || '',
      amount: 0,
      method: 'credit_card',
      status: 'pending',
      transaction_id: '',
      card_last4: '',
      card_expiry: '',
      card_brand: '',
    },
  });

  const showCardFields = form.watch('method') === 'credit_card';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const ordersData = await getOrders();
        setOrders(ordersData);

        if (orderId) {
          const orderData = await getOrder(orderId);
          if (orderData) {
            setSelectedOrder(orderData);
            form.setValue('order_id', orderData.id);
            form.setValue('amount', orderData.total_amount);
          }
        }
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [orderId, form]);

  const handleOrderChange = async (orderId: string) => {
    try {
      const orderData = await getOrder(orderId);
      if (orderData) {
        setSelectedOrder(orderData);
        form.setValue('amount', orderData.total_amount);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const onSubmit = async (values: PaymentFormValues) => {
    setIsSaving(true);
    
    try {
      // Prepare card details if payment method is credit card
      const cardDetails = showCardFields
        ? {
            last4: values.card_last4 || '',
            expiry: values.card_expiry || '',
            brand: values.card_brand || '',
          }
        : undefined;

      // Create payment with all required fields
      await createPayment({
        order_id: values.order_id,
        amount: values.amount,
        payment_date: new Date().toISOString(),
        method: values.method,
        transaction_id: values.transaction_id || `txn_${Math.random().toString(36).substring(2, 12)}`,
        status: values.status,
        card_details: cardDetails
      });
      
      toast.success('Payment recorded successfully');
      navigate('/payments');
    } catch (error) {
      toast.error('Failed to record payment');
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
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/payments')}
          className="mb-2"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Record New Payment
        </h1>
        <p className="text-muted-foreground mt-1">
          Process a payment for an order
        </p>
      </div>

      <div className="form-container max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Order selection */}
            <FormField
              control={form.control}
              name="order_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleOrderChange(value);
                    }}
                    value={field.value}
                    disabled={!!orderId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an order" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orders.map(order => (
                        <SelectItem key={order.id} value={order.id}>
                          Order {order.id} - {order.customer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedOrder && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6 pb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Customer:</span>
                      <span className="font-medium">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Order Status:</span>
                      <span className="font-medium capitalize">{selectedOrder.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment method */}
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Transaction ID */}
            <FormField
              control={form.control}
              name="transaction_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Will be auto-generated if left empty" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Card details section (conditional) */}
            {showCardFields && (
              <div className="space-y-6 border rounded-lg p-4 bg-muted/30">
                <h3 className="font-medium">Card Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="card_last4"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last 4 Digits</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={4} placeholder="1234" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="card_brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Brand</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Visa">Visa</SelectItem>
                            <SelectItem value="Mastercard">Mastercard</SelectItem>
                            <SelectItem value="Amex">American Express</SelectItem>
                            <SelectItem value="Discover">Discover</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="card_expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="MM/YY" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/payments')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  'Process Payment'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PaymentForm;
