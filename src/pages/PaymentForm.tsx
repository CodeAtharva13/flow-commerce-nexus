
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle,
  CreditCard,
  Calendar,
  User,
  Lock,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { formatCurrency, createPayment, getOrder, getOrderPayment } from '../services/mockData';
import { toast } from 'sonner';

const PaymentForm = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [orderAmount, setOrderAmount] = useState(0);
  const [orderData, setOrderData] = useState<any>(null);

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [cardholderName, setCardholderName] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) return;
      setIsLoading(true);
      
      try {
        // First, get order details
        const orderData = await getOrder(orderId);
        if (!orderData) {
          toast.error('Order not found');
          navigate('/orders');
          return;
        }
        
        setOrderData(orderData);
        setOrderAmount(orderData.total_amount);
        
        // Check if payment already exists for this order
        const existingPayment = await getOrderPayment(orderId);
        if (existingPayment) {
          setAlreadyPaid(true);
          toast.info('This order has already been paid');
        }
        
      } catch (error) {
        toast.error('Failed to fetch order details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderData();
  }, [orderId, navigate]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (alreadyPaid) {
        toast.error('This order has already been paid');
        return;
      }
      
      if (paymentMethod === 'credit_card' && (!cardholderName || !cardNumber || !expiryDate || !cvv)) {
        toast.error('Please fill in all credit card details');
        return;
      }
      
      // Create new payment
      const paymentData = {
        order_id: orderId as string,
        amount: orderAmount,
        payment_date: new Date().toISOString(),
        method: paymentMethod as 'credit_card' | 'paypal' | 'bank_transfer' | 'cash',
        transaction_id: `txn_${Math.random().toString(36).substring(2, 10)}`,
        status: 'completed',
        ...(paymentMethod === 'credit_card' && {
          card_details: {
            last4: cardNumber.slice(-4),
            expiry: expiryDate,
            brand: getCardBrand(cardNumber)
          }
        })
      };
      
      await createPayment(paymentData);
      
      toast.success('Payment processed successfully');
      navigate('/payments');
    } catch (error) {
      toast.error('Payment processing failed');
    } finally {
      setIsSubmitting(false);
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
  
  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    // Limit to 16 digits
    const trimmed = cleaned.substring(0, 16);
    // Format with spaces every 4 digits
    let formatted = '';
    for (let i = 0; i < trimmed.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += trimmed[i];
    }
    return formatted;
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };
  
  const formatExpiryDate = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    // Limit to 4 digits
    const trimmed = cleaned.substring(0, 4);
    // Format as MM/YY
    if (trimmed.length > 2) {
      return `${trimmed.substring(0, 2)}/${trimmed.substring(2)}`;
    }
    return trimmed;
  };
  
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container">
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
          Complete payment for order {orderId}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="form-container">
            <form onSubmit={handlePaymentSubmit}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Payment Method</h2>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    disabled={alreadyPaid}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === 'credit_card' && (
                  <div className="space-y-4">
                    <Separator />
                    <h3 className="font-medium">Card Details</h3>

                    <div className="grid gap-3">
                      <Label htmlFor="cardholderName">Cardholder Name</Label>
                      <Input
                        id="cardholderName"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="John Doe"
                        disabled={alreadyPaid}
                        autoComplete="cc-name"
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative">
                        <Input
                          id="cardNumber"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          disabled={alreadyPaid}
                          autoComplete="cc-number"
                        />
                        <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          value={expiryDate}
                          onChange={handleExpiryDateChange}
                          placeholder="MM/YY"
                          disabled={alreadyPaid}
                          autoComplete="cc-exp"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="cvv">CVV</Label>
                        <div className="relative">
                          <Input
                            id="cvv"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                            placeholder="123"
                            disabled={alreadyPaid}
                            autoComplete="cc-csc"
                          />
                          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="bg-muted p-4 rounded-md text-center">
                    <p>You will be redirected to PayPal to complete your payment.</p>
                  </div>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium mb-2">Bank Transfer Details</h3>
                    <p className="text-sm mb-1">Bank: National Bank</p>
                    <p className="text-sm mb-1">Account Number: 1234567890</p>
                    <p className="text-sm mb-1">Routing Number: 987654321</p>
                    <p className="text-sm mb-1">Reference: {orderId}</p>
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div className="bg-muted p-4 rounded-md text-center">
                    <p>Payment will be marked as cash payment.</p>
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || alreadyPaid}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : alreadyPaid ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Already Paid
                      </>
                    ) : (
                      `Pay ${formatCurrency(orderAmount)}`
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="form-container">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            {orderData && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-medium">{orderData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">{orderData.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">{orderData.status}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold">{formatCurrency(orderData.total_amount)}</span>
                </div>
                {alreadyPaid && (
                  <div className="mt-4 bg-green-50 text-green-700 p-3 rounded-md flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>This order has been paid</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
