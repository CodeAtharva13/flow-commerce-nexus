
import { 
  products, 
  customers, 
  orders, 
  orderItems,
  payments,
  warehouses,
  expenses,
  simulateApiCall
} from './mockData';
import { Product, Customer, Order, OrderItem, Payment, Warehouse, Expense } from '../models/types';

// MongoDB-like collections
interface Collections {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  orderItems: OrderItem[];
  payments: Payment[];
  warehouses: Warehouse[];
  expenses: Expense[];
}

// Our mock database
const mockDB: Collections = {
  products,
  customers,
  orders,
  orderItems,
  payments,
  warehouses,
  expenses
};

// MongoDB-like operations
class MongoDBCollection<T extends { id: string }> {
  private collection: T[];
  private collectionName: string;
  
  constructor(collection: T[], collectionName: string) {
    this.collection = collection;
    this.collectionName = collectionName;
  }
  
  // Find all documents in collection
  async find(query: Partial<T> = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`MongoDB: Finding documents in ${this.collectionName} with query:`, query);
    
    if (Object.keys(query).length === 0) {
      console.log(`MongoDB: Returning all ${this.collection.length} documents from ${this.collectionName}`);
      return [...this.collection];
    }
    
    const results = this.collection.filter(item => {
      return Object.keys(query).every(key => {
        // @ts-ignore - Dynamic key access
        return item[key] === query[key];
      });
    });
    
    console.log(`MongoDB: Found ${results.length} documents in ${this.collectionName}`);
    return [...results];
  }
  
  // Find one document by query
  async findOne(query: Partial<T>) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log(`MongoDB: Finding one document in ${this.collectionName} with query:`, query);
    
    const result = this.collection.find(item => {
      return Object.keys(query).every(key => {
        // @ts-ignore - Dynamic key access
        return item[key] === query[key];
      });
    });
    
    console.log(`MongoDB: ${result ? 'Found' : 'Did not find'} document in ${this.collectionName}`);
    return result ? { ...result } : null;
  }
  
  // Find by ID
  async findById(id: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`MongoDB: Finding document by ID ${id} in ${this.collectionName}`);
    const result = this.collection.find(item => item.id === id);
    
    console.log(`MongoDB: ${result ? 'Found' : 'Did not find'} document with ID ${id} in ${this.collectionName}`);
    return result ? { ...result } : null;
  }
  
  // Insert one document
  async insertOne(document: Omit<T, 'id'> & { id?: string }) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log(`MongoDB: Inserting document into ${this.collectionName}:`, document);
    
    // Generate ID if not provided
    const newDoc = { 
      ...document,
      id: document.id || `${this.collectionName.slice(0, 3)}_${Math.random().toString(36).substring(2, 10)}`
    } as T;
    
    this.collection.push(newDoc);
    console.log(`MongoDB: Document inserted into ${this.collectionName} with ID ${newDoc.id}`);
    
    return { ...newDoc };
  }
  
  // Update one document
  async updateOne(filter: Partial<T>, update: Partial<T>) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log(`MongoDB: Updating document in ${this.collectionName} with filter:`, filter);
    
    const index = this.collection.findIndex(item => {
      return Object.keys(filter).every(key => {
        // @ts-ignore - Dynamic key access
        return item[key] === filter[key];
      });
    });
    
    if (index !== -1) {
      this.collection[index] = { ...this.collection[index], ...update };
      console.log(`MongoDB: Document updated in ${this.collectionName}:`, this.collection[index]);
      return { ...this.collection[index] };
    }
    
    console.log(`MongoDB: No document found to update in ${this.collectionName}`);
    return null;
  }
  
  // Delete one document
  async deleteOne(filter: Partial<T>) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`MongoDB: Deleting document from ${this.collectionName} with filter:`, filter);
    
    const index = this.collection.findIndex(item => {
      return Object.keys(filter).every(key => {
        // @ts-ignore - Dynamic key access
        return item[key] === filter[key];
      });
    });
    
    if (index !== -1) {
      const deleted = this.collection.splice(index, 1)[0];
      console.log(`MongoDB: Document deleted from ${this.collectionName} with ID ${deleted.id}`);
      return { ...deleted };
    }
    
    console.log(`MongoDB: No document found to delete in ${this.collectionName}`);
    return null;
  }
  
  // Count documents
  async count(query: Partial<T> = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (Object.keys(query).length === 0) {
      console.log(`MongoDB: Count of all documents in ${this.collectionName}: ${this.collection.length}`);
      return this.collection.length;
    }
    
    const count = this.collection.filter(item => {
      return Object.keys(query).every(key => {
        // @ts-ignore - Dynamic key access
        return item[key] === query[key];
      });
    }).length;
    
    console.log(`MongoDB: Count of filtered documents in ${this.collectionName}: ${count}`);
    return count;
  }
  
  // Aggregate operations (very simplified)
  async aggregate(pipeline: any[]) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`MongoDB: Aggregate operation on ${this.collectionName} with pipeline:`, pipeline);
    
    // This is a very simplified implementation
    // In a real MongoDB, pipeline would be much more powerful
    let result = [...this.collection];
    
    for (const stage of pipeline) {
      // Handle $match stage (simplified)
      if (stage.$match) {
        result = result.filter(item => {
          return Object.keys(stage.$match).every(key => {
            // @ts-ignore - Dynamic key access
            return item[key] === stage.$match[key];
          });
        });
      }
      
      // Handle $group stage (very simplified)
      if (stage.$group) {
        // Only implementing a simple count grouping for demonstration
        if (stage.$group._id === null && stage.$group.count && stage.$group.count.$sum === 1) {
          return [{ count: result.length }];
        }
      }
    }
    
    console.log(`MongoDB: Aggregate result:`, result);
    return result;
  }
}

// Create MongoDB-like interface
export const mockMongoDB = {
  products: new MongoDBCollection<Product>(mockDB.products, 'products'),
  customers: new MongoDBCollection<Customer>(mockDB.customers, 'customers'),
  orders: new MongoDBCollection<Order>(mockDB.orders, 'orders'),
  orderItems: new MongoDBCollection<OrderItem>(mockDB.orderItems, 'orderItems'),
  payments: new MongoDBCollection<Payment>(mockDB.payments, 'payments'),
  warehouses: new MongoDBCollection<Warehouse>(mockDB.warehouses, 'warehouses'),
  expenses: new MongoDBCollection<Expense>(mockDB.expenses, 'expenses'),
  
  // Example of a complex operation that spans multiple collections
  async getOrderWithDetails(orderId: string) {
    const order = await this.orders.findById(orderId);
    if (!order) return null;
    
    const items = await this.orderItems.find({ order_id: orderId });
    const payment = await this.payments.findOne({ order_id: orderId });
    const customer = await this.customers.findById(order.customer_id);
    
    return {
      ...order,
      items,
      payment,
      customer
    };
  },
  
  // Example of how to connect an external MongoDB in the future
  connectToExternalMongoDB(connectionString: string) {
    console.log(`Connecting to external MongoDB at: ${connectionString}`);
    console.log('This is a mock function - in a real application, this would establish a connection to MongoDB');
    return {
      connected: true,
      message: 'Successfully connected to mock MongoDB'
    };
  }
};

// Example usage
export const exampleMongoQueries = async () => {
  // Find all products
  const allProducts = await mockMongoDB.products.find();
  console.log('All products:', allProducts.length);
  
  // Find product by ID
  const product = await mockMongoDB.products.findById('prod_001');
  console.log('Product:', product?.name);
  
  // Insert new customer
  const newCustomer = await mockMongoDB.customers.insertOne({
    name: 'New Customer',
    email: 'new.customer@example.com',
    phone: '555-123-9876',
    address: '123 New St, Newtown',
    created_at: new Date().toISOString()
  });
  console.log('New customer:', newCustomer.id);
  
  // Update product
  const updatedProduct = await mockMongoDB.products.updateOne(
    { id: 'prod_001' },
    { price: 209.99 }
  );
  console.log('Updated product price:', updatedProduct?.price);
  
  // Count orders
  const orderCount = await mockMongoDB.orders.count();
  console.log('Order count:', orderCount);
  
  // Get order with details
  const orderWithDetails = await mockMongoDB.getOrderWithDetails('ord_001');
  console.log('Order with details:', orderWithDetails?.items.length);
};
