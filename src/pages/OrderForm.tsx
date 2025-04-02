
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { ChevronLeft, Loader2, Plus, Trash2 } from 'lucide-react';
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
import { Customer, Product, Warehouse } from '../models/types';
import { getCustomers, getProducts, getWarehouses, createOrder, updateOrder } from '../services/mockData';

const orderItemSchema = z.object({
  product_id: z.string().min(1, { message: 'Product is required' }),
  product_name: z.string().optional(),
  quantity: z.number().min(1, { message: 'Quantity must be at least 1' }),
  price: z.number().optional(),
  subtotal: z.number().optional(),
  warehouse_id: z.string().min(1, { message: 'Warehouse is required' }),
});

const orderSchema = z.object({
  customer_id: z.string().min(1, { message: 'Customer is required' }),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  items: z.array(orderItemSchema).min(1, { message: 'At least one item is required' })
});

type OrderFormValues = z.infer<typeof orderSchema>;
type OrderItemFormValues = z.infer<typeof orderItemSchema>;

const OrderForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');

  const isEditMode = id !== 'new';

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_id: '',
      status: 'pending',
      items: [
        {
          product_id: '',
          quantity: 1,
          warehouse_id: '',
        },
      ],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [customersData, productsData, warehousesData] = await Promise.all([
          getCustomers(),
          getProducts(),
          getWarehouses()
        ]);
        
        setCustomers(customersData);
        setProducts(productsData);
        setWarehouses(warehousesData);
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle product selection
  const handleProductChange = (value: string, index: number) => {
    const selectedProduct = products.find(product => product.id === value);
    if (selectedProduct) {
      const currentItems = form.getValues().items;
      currentItems[index].product_id = selectedProduct.id;
      currentItems[index].product_name = selectedProduct.name;
      currentItems[index].price = selectedProduct.price;
      
      const quantity = currentItems[index].quantity || 1;
      currentItems[index].subtotal = selectedProduct.price * quantity;
      
      form.setValue('items', [...currentItems]);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (value: number, index: number) => {
    const currentItems = form.getValues().items;
    currentItems[index].quantity = value;
    
    if (currentItems[index].price) {
      currentItems[index].subtotal = value * currentItems[index].price;
    }
    
    form.setValue('items', [...currentItems]);
  };

  // Handle customer change
  const handleCustomerChange = (value: string) => {
    const customer = customers.find(c => c.id === value);
    if (customer) {
      setSelectedCustomerName(customer.name);
    }
  };

  // Add a new item to the order
  const addItem = () => {
    const currentItems = form.getValues().items;
    form.setValue('items', [
      ...currentItems,
      {
        product_id: '',
        quantity: 1,
        warehouse_id: '',
      },
    ]);
  };

  // Remove an item from the order
  const removeItem = (index: number) => {
    const currentItems = form.getValues().items;
    if (currentItems.length === 1) {
      toast.error('An order must have at least one item');
      return;
    }
    currentItems.splice(index, 1);
    form.setValue('items', [...currentItems]);
  };

  // Calculate the total amount
  const calculateTotal = () => {
    const items = form.getValues().items;
    return items.reduce((total, item) => {
      return total + (item.subtotal || 0);
    }, 0);
  };

  const onSubmit = async (values: OrderFormValues) => {
    setIsSaving(true);
    
    try {
      const customer = customers.find(c => c.id === values.customer_id);
      
      if (!customer) {
        toast.error('Customer not found');
        setIsSaving(false);
        return;
      }
      
      const orderData = {
        customer_id: values.customer_id,
        customer_name: customer.name,
        user_id: '1', // Assuming current user
        status: values.status,
        total_amount: calculateTotal()
      };
      
      if (isEditMode) {
        // Handle updating existing order (not implemented yet)
        toast.error('Editing existing orders is not implemented yet');
      } else {
        // Create new order
        await createOrder(orderData, values.items);
        toast.success('Order created successfully');
        navigate('/orders');
      }
    } catch (error) {
      toast.error('Failed to save order');
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
          onClick={() => navigate('/orders')}
          className="mb-2"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Edit Order' : 'Create New Order'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditMode
            ? 'Update order details'
            : 'Create a new customer order'}
        </p>
      </div>

      <div className="form-container">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer selection */}
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleCustomerChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Order status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Order items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Order Items</h2>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {form.watch('items').map((item, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Item {index + 1}</CardTitle>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeItem(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product selection */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.product_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleProductChange(value, index);
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products.map(product => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} - ${product.price.toFixed(2)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Warehouse selection */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.warehouse_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warehouse</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a warehouse" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {warehouses.map(warehouse => (
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

                      {/* Quantity input */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                {...field} 
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  field.onChange(value);
                                  handleQuantityChange(value, index);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Subtotal (read-only) */}
                      <div>
                        <Label>Subtotal</Label>
                        <Input 
                          readOnly
                          value={`$${(form.watch(`items.${index}.subtotal`) || 0).toFixed(2)}`}
                          className="bg-muted"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-lg font-bold">${calculateTotal().toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/orders')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Create Order'}
                  </>
                ) : isEditMode ? (
                  'Update Order'
                ) : (
                  'Create Order'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default OrderForm;
