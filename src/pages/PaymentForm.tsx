
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
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { createPayment, getOrder, getOrderItems } from '../services/mockData';
import { toast } from 'sonner';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Order, OrderItem } from '../models/types';

const PaymentForm = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal' | 'bank_transfer' | 'cash'>('credit_card');

  // Credit card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      try {
        const orderData = await getOrder(orderId);
        const itemsData = await getOrderItems(orderId);
        
        if (orderData) {
          setOrder(orderData);
          setOrderItems(itemsData);
        } else {
          toast.error('Order not found');
          navigate('/orders');
        }
      } catch (error) {
        toast.error('Failed to fetch order details');
        navigate('/orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    return formatted.substring(0, 19); // 16 digits + 3 spaces
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardExpiry(formatExpiry(e.target.value));
  };

  const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCardCVC(value.substring(0, 3));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      if (!order) throw new Error('Order information missing');
      
      const payment = {
        order_id: order.id,
        amount: order.total_amount,
        payment_date: new Date().toISOString(),
        method: paymentMethod,
        transaction_id: `txn_${Math.random().toString(36).substring(2, 15)}`,
        // Ensure status is one of the allowed types
        status: 'completed' as 'pending' | 'completed' | 'failed' | 'refunded',
      };

      // Add card details for credit card payments
      if (paymentMethod === 'credit_card') {
        Object.assign(payment, {
          card_details: {
            last4: cardNumber.slice(-4).replace(/\s/g, ''),
            expiry: cardExpiry,
            brand: getCardBrand(cardNumber),
          }
        });
      }

      await createPayment(payment);
      toast.success('Payment processed successfully');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardBrand = (number: string) => {
    const firstDigit = number.charAt(0);
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'Amex';
    if (firstDigit === '6') return 'Discover';
    return 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="space-y-6">
          {Array(6).fill(0).map((_, i) => (
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
    <div className="page-container max-w-3xl mx-auto">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/orders')}
          className="mb-2"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Process Payment
        </h1>
        <p className="text-muted-foreground mt-1">
          Complete payment for order #{order?.id}
        </p>
      </div>

      <div className="mb-8 bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Customer:</span>
            <span className="font-medium">{order?.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span>Order Date:</span>
            <span className="font-medium">
              {order ? new Date(order.order_date).toLocaleDateString() : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-medium capitalize">{order?.status}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-lg">
              <span>Total Amount:</span>
              <span className="font-bold">
                ${order?.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as any)}
              className="mt-3 space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="credit_card" id="credit_card" />
                <Label htmlFor="credit_card">Credit Card</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal">PayPal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <Label htmlFor="bank_transfer">Bank Transfer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Cash</Label>
              </div>
            </RadioGroup>
          </div>

          {paymentMethod === 'credit_card' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="card_name">Name on Card</Label>
                <Input
                  id="card_name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div>
                <Label htmlFor="card_number">Card Number</Label>
                <Input
                  id="card_number"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiration Date</Label>
                  <Input
                    id="expiry"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    value={cardCVC}
                    onChange={handleCVCChange}
                    placeholder="123"
                    maxLength={3}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/orders')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${order?.total_amount.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
