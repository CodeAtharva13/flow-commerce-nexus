
// User model
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

// Customer model
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

// Product model
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

// Warehouse model
export interface Warehouse {
  id: string;
  name: string;
  location: string;
  created_at: string;
}

// Order model
export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  user_id: string;
  order_date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
}

// Order item model
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  warehouse_id: string;
}

// Payment model
export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_date: string;
  method: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash';
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  card_details?: {
    last4: string;
    expiry: string;
    brand: string;
  };
}

// Expense model
export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  warehouse_id: string;
  warehouse_name: string;
  expense_date: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  activeOrders: number;
  monthlyRevenue: number;
  productsChange: number;
  customersChange: number;
  ordersChange: number;
  revenueChange: number;
}
