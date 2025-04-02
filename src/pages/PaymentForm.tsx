
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { ChevronLeft, CreditCard, Loader2 } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Order } from '../models/types';
import { getOrders, createPayment } from '../services/mockData';

const paymentSchema = z.object({
  order_id: z.string().min(1, { message: 'Order is required' }),
  method: z.enum(['credit_card', 'paypal', 'bank_transfer', 'cash']),
  amount: z.number().min(0.01, { message: 'Amount must be greater than 0' }),
  transaction_id: z.string().min(3, { message: 'Transaction ID is required' }),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  card_details: z.object({
    last4: z.string().length(4, { message: 'Last 4 digits required' }).optional(),
    expiry: z.string().optional(),
    brand: z.string().optional()
  }).optional()
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const PaymentForm = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const ordersData = await getOrders();
        setOrders(ordersData);
        
        if (orderId) {
          const order = ordersData.find(o => o.id === orderId);
          if (order) {
            setSelectedOrder(order);
            form.setValue('order_id', order.id);
            form.setValue('amount', order.total_amount);
          }
        }
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      order_id: orderId || '',
      method: 'credit_card',
      amount: 0,
      transaction_id: `txn_${Math.random().toString(36).substring(2, 10)}`,
      status: 'pending',
      card_details: {
        last4: '',
        expiry: '',
        brand: ''
      }
    },
  });

  // Watch the payment method to conditionally show card details
  const paymentMethod = form.watch('method');

  // Handle order selection
  const handleOrderChange = (value: string) => {
    const order = orders.find(o => o.id === value);
    if (order) {
      setSelectedOrder(order);
      form.setValue('amount', order.total_amount);
    }
  };

  const onSubmit = async (values: PaymentFormValues) => {
    setIsSaving(true);
    
    try {
      // Clean up card details if not using credit card
      if (values.method !== 'credit_card') {
        delete values.card_details;
      }
      
      await createPayment({
        ...values,
        payment_date: new Date().toISOString()
      });
      
      toast.success('Payment processed successfully');
      navigate('/payments');
    } catch (error) {
      toast.error('Failed to process payment');
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
        <h1 className="text-3xl font-bold tracking-tight">Process Payment</h1>
        <p className="text-muted-foreground mt-1">
          Record a payment for a customer order
        </p>
      </div>

      <div className="form-container max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                              {order.id} - {order.customer_name} (${order.total_amount.toFixed(2)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedOrder && (
                  <div className="bg-muted/50 p-4 rounded-md">
                    <p><span className="font-medium">Customer:</span> {selectedOrder.customer_name}</p>
                    <p><span className="font-medium">Order Date:</span> {new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                    <p><span className="font-medium">Status:</span> {selectedOrder.status}</p>
                    <p className="font-semibold mt-2">Total Amount: ${selectedOrder.total_amount.toFixed(2)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment amount */}
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

                {/* Payment method */}
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment status" />
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

                {/* Transaction ID */}
                <FormField
                  control={form.control}
                  name="transaction_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Credit Card Details (conditional) */}
                {paymentMethod === 'credit_card' && (
                  <div className="bg-muted/50 p-4 rounded-md space-y-4">
                    <h3 className="font-medium flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Card Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Card brand */}
                      <FormField
                        control={form.control}
                        name="card_details.brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Card Brand</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Visa">Visa</SelectItem>
                                <SelectItem value="Mastercard">Mastercard</SelectItem>
                                <SelectItem value="American Express">American Express</SelectItem>
                                <SelectItem value="Discover">Discover</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Last 4 digits */}
                      <FormField
                        control={form.control}
                        name="card_details.last4"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last 4 Digits</FormLabel>
                            <FormControl>
                              <Input 
                                maxLength={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Expiry date */}
                      <FormField
                        control={form.control}
                        name="card_details.expiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiration Date</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="MM/YY"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

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
                    Processing...
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
