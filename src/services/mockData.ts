
import { 
  Product, 
  Customer, 
  Order, 
  OrderItem, 
  Payment, 
  Warehouse, 
  Expense
} from "../models/types";

// Helper function to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 12);

// Helper function to generate a random date within a range
const generateDate = (start: Date, end: Date) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
};

// Helper function to format currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Products
export const products: Product[] = [
  {
    id: "prod_001",
    name: "Wireless Bluetooth Headphones",
    description: "Noise-cancelling over-ear headphones with 30-hour battery life.",
    price: 199.99,
    category: "Electronics",
    stock: 45
  },
  {
    id: "prod_002",
    name: "Ultra HD Smart TV",
    description: "65-inch 4K UHD Smart TV with built-in streaming apps.",
    price: 799.99,
    category: "Electronics",
    stock: 15
  },
  {
    id: "prod_003",
    name: "Professional DSLR Camera",
    description: "24.1MP digital camera with 18-55mm lens kit.",
    price: 649.99,
    category: "Photography",
    stock: 20
  },
  {
    id: "prod_004",
    name: "Ergonomic Office Chair",
    description: "Adjustable office chair with lumbar support and mesh back.",
    price: 249.99,
    category: "Furniture",
    stock: 35
  },
  {
    id: "prod_005",
    name: "Stainless Steel Water Bottle",
    description: "Vacuum insulated bottle that keeps drinks hot or cold for 24 hours.",
    price: 29.99,
    category: "Home & Kitchen",
    stock: 100
  },
  {
    id: "prod_006",
    name: "Smartphone Stand and Wireless Charger",
    description: "Adjustable stand with integrated 15W fast wireless charging.",
    price: 49.99,
    category: "Electronics",
    stock: 60
  },
  {
    id: "prod_007",
    name: "Portable Bluetooth Speaker",
    description: "Waterproof speaker with 360° sound and 12-hour playtime.",
    price: 79.99,
    category: "Electronics",
    stock: 40
  }
];

// Customers
export const customers: Customer[] = [
  {
    id: "cust_001",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "555-123-4567",
    address: "123 Main St, Anytown, CA 12345",
    created_at: "2023-01-15T10:30:00Z"
  },
  {
    id: "cust_002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "555-234-5678",
    address: "456 Elm St, Somewhere, NY 67890",
    created_at: "2023-02-22T14:45:00Z"
  },
  {
    id: "cust_003",
    name: "Michael Brown",
    email: "m.brown@example.com",
    phone: "555-345-6789",
    address: "789 Oak St, Nowhere, TX 13579",
    created_at: "2023-03-10T09:15:00Z"
  },
  {
    id: "cust_004",
    name: "Emily Davis",
    email: "emily.d@example.com",
    phone: "555-456-7890",
    address: "101 Pine St, Everywhere, FL 24680",
    created_at: "2023-04-05T16:20:00Z"
  }
];

// Warehouses
export const warehouses: Warehouse[] = [
  {
    id: "wh_001",
    name: "Main Distribution Center",
    location: "1000 Warehouse Blvd, Portland, OR 97205",
    created_at: "2022-01-01T00:00:00Z"
  },
  {
    id: "wh_002",
    name: "East Coast Facility",
    location: "500 Storage Lane, Newark, NJ 07101",
    created_at: "2022-04-15T00:00:00Z"
  },
  {
    id: "wh_003",
    name: "West Coast Hub",
    location: "750 Logistics Ave, San Diego, CA 92101",
    created_at: "2022-07-20T00:00:00Z"
  }
];

// Orders
export const orders: Order[] = [
  {
    id: "ord_001",
    customer_id: "cust_001",
    customer_name: "John Smith",
    user_id: "1",
    order_date: "2023-06-01T10:30:00Z",
    status: "delivered",
    total_amount: 249.98
  },
  {
    id: "ord_002",
    customer_id: "cust_002",
    customer_name: "Sarah Johnson",
    user_id: "1",
    order_date: "2023-06-15T14:45:00Z",
    status: "shipped",
    total_amount: 799.99
  },
  {
    id: "ord_003",
    customer_id: "cust_003",
    customer_name: "Michael Brown",
    user_id: "1",
    order_date: "2023-06-28T09:15:00Z",
    status: "processing",
    total_amount: 679.98
  },
  {
    id: "ord_004",
    customer_id: "cust_004",
    customer_name: "Emily Davis",
    user_id: "1",
    order_date: "2023-07-10T16:20:00Z",
    status: "pending",
    total_amount: 299.97
  },
  {
    id: "ord_005",
    customer_id: "cust_001",
    customer_name: "John Smith",
    user_id: "1",
    order_date: "2023-07-15T11:40:00Z",
    status: "processing",
    total_amount: 129.98
  }
];

// Order Items
export const orderItems: OrderItem[] = [
  {
    id: "item_001",
    order_id: "ord_001",
    product_id: "prod_001",
    product_name: "Wireless Bluetooth Headphones",
    quantity: 1,
    price: 199.99,
    subtotal: 199.99,
    warehouse_id: "wh_001"
  },
  {
    id: "item_002",
    order_id: "ord_001",
    product_id: "prod_005",
    product_name: "Stainless Steel Water Bottle",
    quantity: 1,
    price: 29.99,
    subtotal: 29.99,
    warehouse_id: "wh_001"
  },
  {
    id: "item_003",
    order_id: "ord_002",
    product_id: "prod_002",
    product_name: "Ultra HD Smart TV",
    quantity: 1,
    price: 799.99,
    subtotal: 799.99,
    warehouse_id: "wh_002"
  },
  {
    id: "item_004",
    order_id: "ord_003",
    product_id: "prod_003",
    product_name: "Professional DSLR Camera",
    quantity: 1,
    price: 649.99,
    subtotal: 649.99,
    warehouse_id: "wh_003"
  },
  {
    id: "item_005",
    order_id: "ord_003",
    product_id: "prod_006",
    product_name: "Smartphone Stand and Wireless Charger",
    quantity: 1,
    price: 29.99,
    subtotal: 29.99,
    warehouse_id: "wh_001"
  }
];

// Payments
export const payments: Payment[] = [
  {
    id: "pay_001",
    order_id: "ord_001",
    amount: 249.98,
    payment_date: "2023-06-01T10:35:00Z",
    method: "credit_card",
    transaction_id: "txn_abc123",
    status: "completed",
    card_details: {
      last4: "4242",
      expiry: "04/25",
      brand: "Visa"
    }
  },
  {
    id: "pay_002",
    order_id: "ord_002",
    amount: 799.99,
    payment_date: "2023-06-15T14:50:00Z",
    method: "paypal",
    transaction_id: "txn_def456",
    status: "completed"
  },
  {
    id: "pay_003",
    order_id: "ord_003",
    amount: 679.98,
    payment_date: "2023-06-28T09:20:00Z",
    method: "credit_card",
    transaction_id: "txn_ghi789",
    status: "completed",
    card_details: {
      last4: "1234",
      expiry: "08/24",
      brand: "Mastercard"
    }
  },
  {
    id: "pay_004",
    order_id: "ord_004",
    amount: 299.97,
    payment_date: "2023-07-10T16:25:00Z",
    method: "bank_transfer",
    transaction_id: "txn_jkl012",
    status: "pending"
  }
];

// Expenses
export const expenses: Expense[] = [
  {
    id: "exp_001",
    title: "Rent Payment",
    amount: 5000.00,
    category: "Rent",
    warehouse_id: "wh_001",
    warehouse_name: "Main Distribution Center",
    expense_date: "2023-06-01T00:00:00Z"
  },
  {
    id: "exp_002",
    title: "Utility Bills",
    amount: 1200.00,
    category: "Utilities",
    warehouse_id: "wh_001",
    warehouse_name: "Main Distribution Center",
    expense_date: "2023-06-05T00:00:00Z"
  },
  {
    id: "exp_003",
    title: "Equipment Maintenance",
    amount: 850.00,
    category: "Maintenance",
    warehouse_id: "wh_002",
    warehouse_name: "East Coast Facility",
    expense_date: "2023-06-12T00:00:00Z"
  },
  {
    id: "exp_004",
    title: "Security System Upgrade",
    amount: 3500.00,
    category: "Security",
    warehouse_id: "wh_003",
    warehouse_name: "West Coast Hub",
    expense_date: "2023-06-20T00:00:00Z"
  },
  {
    id: "exp_005",
    title: "Staff Salaries",
    amount: 12500.00,
    category: "Payroll",
    warehouse_id: "wh_001",
    warehouse_name: "Main Distribution Center",
    expense_date: "2023-06-30T00:00:00Z"
  },
  {
    id: "exp_006",
    title: "Insurance Premium",
    amount: 2000.00,
    category: "Insurance",
    warehouse_id: "wh_002",
    warehouse_name: "East Coast Facility",
    expense_date: "2023-07-01T00:00:00Z"
  }
];

// Functions to simulate API calls
export const simulateApiCall = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

const findItemById = <T extends { id: string }>(items: T[], id: string): T | undefined => {
  return items.find(item => item.id === id);
};

// Create records
export const createCustomer = (customer: Omit<Customer, 'id' | 'created_at'>) => {
  const newCustomer: Customer = {
    ...customer,
    id: `cust_${generateId()}`,
    created_at: new Date().toISOString()
  };
  customers.push(newCustomer);
  return simulateApiCall(newCustomer);
};

export const createProduct = (product: Omit<Product, 'id'>) => {
  const newProduct: Product = {
    ...product,
    id: `prod_${generateId()}`
  };
  products.push(newProduct);
  return simulateApiCall(newProduct);
};

export const createWarehouse = (warehouse: Omit<Warehouse, 'id' | 'created_at'>) => {
  const newWarehouse: Warehouse = {
    ...warehouse,
    id: `wh_${generateId()}`,
    created_at: new Date().toISOString()
  };
  warehouses.push(newWarehouse);
  return simulateApiCall(newWarehouse);
};

export const createOrder = (
  order: Omit<Order, 'id' | 'order_date'>, 
  items: Array<Omit<OrderItem, 'id' | 'order_id'>>
) => {
  const orderId = `ord_${generateId()}`;
  const newOrder: Order = {
    ...order,
    id: orderId,
    order_date: new Date().toISOString()
  };
  orders.push(newOrder);
  
  const newOrderItems = items.map(item => {
    const orderItem: OrderItem = {
      ...item,
      id: `item_${generateId()}`,
      order_id: orderId,
    };
    orderItems.push(orderItem);
    return orderItem;
  });
  
  return simulateApiCall({ order: newOrder, items: newOrderItems });
};

export const createPayment = (payment: Omit<Payment, 'id'>) => {
  const newPayment: Payment = {
    ...payment,
    id: `pay_${generateId()}`
  };
  payments.push(newPayment);
  return simulateApiCall(newPayment);
};

export const createExpense = (expense: Omit<Expense, 'id'>) => {
  const newExpense: Expense = {
    ...expense,
    id: `exp_${generateId()}`
  };
  expenses.push(newExpense);
  return simulateApiCall(newExpense);
};

// Read operations
export const getProducts = () => simulateApiCall(products);
export const getProduct = (id: string) => simulateApiCall(findItemById(products, id));

export const getCustomers = () => simulateApiCall(customers);
export const getCustomer = (id: string) => simulateApiCall(findItemById(customers, id));

export const getWarehouses = () => simulateApiCall(warehouses);
export const getWarehouse = (id: string) => simulateApiCall(findItemById(warehouses, id));

export const getOrders = () => simulateApiCall(orders);
export const getOrder = (id: string) => simulateApiCall(findItemById(orders, id));
export const getOrderItems = (orderId: string) => {
  const items = orderItems.filter(item => item.order_id === orderId);
  return simulateApiCall(items);
};

export const getPayments = () => simulateApiCall(payments);
export const getPayment = (id: string) => simulateApiCall(findItemById(payments, id));
export const getOrderPayment = (orderId: string) => {
  const payment = payments.find(p => p.order_id === orderId);
  return simulateApiCall(payment);
};

export const getExpenses = () => simulateApiCall(expenses);
export const getExpense = (id: string) => simulateApiCall(findItemById(expenses, id));

// Update operations
export const updateCustomer = (id: string, updates: Partial<Customer>) => {
  const index = customers.findIndex(c => c.id === id);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...updates };
    return simulateApiCall(customers[index]);
  }
  return Promise.reject(new Error("Customer not found"));
};

export const updateProduct = (id: string, updates: Partial<Product>) => {
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    return simulateApiCall(products[index]);
  }
  return Promise.reject(new Error("Product not found"));
};

export const updateWarehouse = (id: string, updates: Partial<Warehouse>) => {
  const index = warehouses.findIndex(w => w.id === id);
  if (index !== -1) {
    warehouses[index] = { ...warehouses[index], ...updates };
    return simulateApiCall(warehouses[index]);
  }
  return Promise.reject(new Error("Warehouse not found"));
};

export const updateOrder = (id: string, updates: Partial<Order>) => {
  const index = orders.findIndex(o => o.id === id);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates };
    return simulateApiCall(orders[index]);
  }
  return Promise.reject(new Error("Order not found"));
};

export const updateExpense = (id: string, updates: Partial<Expense>) => {
  const index = expenses.findIndex(e => e.id === id);
  if (index !== -1) {
    expenses[index] = { ...expenses[index], ...updates };
    return simulateApiCall(expenses[index]);
  }
  return Promise.reject(new Error("Expense not found"));
};

// Delete operations
export const deleteCustomer = (id: string) => {
  const index = customers.findIndex(c => c.id === id);
  if (index !== -1) {
    const deleted = customers.splice(index, 1)[0];
    return simulateApiCall(deleted);
  }
  return Promise.reject(new Error("Customer not found"));
};

export const deleteProduct = (id: string) => {
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    const deleted = products.splice(index, 1)[0];
    return simulateApiCall(deleted);
  }
  return Promise.reject(new Error("Product not found"));
};

export const deleteWarehouse = (id: string) => {
  const index = warehouses.findIndex(w => w.id === id);
  if (index !== -1) {
    const deleted = warehouses.splice(index, 1)[0];
    return simulateApiCall(deleted);
  }
  return Promise.reject(new Error("Warehouse not found"));
};

export const deleteOrder = (id: string) => {
  const index = orders.findIndex(o => o.id === id);
  if (index !== -1) {
    const deleted = orders.splice(index, 1)[0];
    // Also delete related order items
    const itemsToRemove = orderItems.filter(item => item.order_id === id);
    itemsToRemove.forEach(item => {
      const itemIndex = orderItems.findIndex(i => i.id === item.id);
      if (itemIndex !== -1) {
        orderItems.splice(itemIndex, 1);
      }
    });
    return simulateApiCall(deleted);
  }
  return Promise.reject(new Error("Order not found"));
};

export const deleteExpense = (id: string) => {
  const index = expenses.findIndex(e => e.id === id);
  if (index !== -1) {
    const deleted = expenses.splice(index, 1)[0];
    return simulateApiCall(deleted);
  }
  return Promise.reject(new Error("Expense not found"));
};
