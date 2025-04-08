
import { toast } from 'sonner';

// Interface for MongoDB documents
export interface MongoDocument {
  id?: string;
  _id?: string;
  [key: string]: any;
}

// Mock MongoDB Collection for browser environments
export class BrowserMongoCollection<T extends MongoDocument> {
  private collectionName: string;
  private storage: T[] = [];
  
  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.loadFromLocalStorage();
  }
  
  // Convert data for storage
  private toStorageDocument(doc: Partial<T>): T {
    if (!doc) return doc as T;
    
    const { id, ...rest } = doc as any;
    const result: any = { ...rest };
    
    if (id) {
      result._id = id;
    } else if (!result._id) {
      result._id = this.generateId();
    }
    
    return result as T;
  }
  
  // Convert data for application
  private toAppDocument(doc: T): T {
    if (!doc) return doc;
    
    const { _id, ...rest } = doc as any;
    return {
      id: _id?.toString(),
      ...rest
    } as T;
  }
  
  // Generate a simple ID
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
  }
  
  // Save data to localStorage
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(
        `browserMongo_${this.collectionName}`,
        JSON.stringify(this.storage)
      );
    } catch (err) {
      console.error(`Error saving ${this.collectionName} to localStorage:`, err);
    }
  }
  
  // Load data from localStorage
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem(`browserMongo_${this.collectionName}`);
      if (data) {
        this.storage = JSON.parse(data);
      }
    } catch (err) {
      console.error(`Error loading ${this.collectionName} from localStorage:`, err);
      this.storage = [];
    }
  }
  
  // Find documents
  async find(query: Partial<T> = {}): Promise<T[]> {
    console.log(`BrowserMongo: Finding documents in ${this.collectionName} with query:`, query);
    
    try {
      // Simple filtering logic
      const results = this.storage.filter(item => {
        for (const key in query) {
          if (query[key] !== undefined) {
            if (key === 'id') {
              if (item._id?.toString() !== query[key]) return false;
            } else if (item[key] !== query[key]) {
              return false;
            }
          }
        }
        return true;
      });
      
      return results.map(doc => this.toAppDocument(doc));
    } catch (err) {
      console.error(`Error finding documents in ${this.collectionName}:`, err);
      return [];
    }
  }
  
  // Find one document
  async findOne(query: Partial<T>): Promise<T | null> {
    console.log(`BrowserMongo: Finding one document in ${this.collectionName} with query:`, query);
    
    try {
      const results = await this.find(query);
      return results.length > 0 ? results[0] : null;
    } catch (err) {
      console.error(`Error finding document in ${this.collectionName}:`, err);
      return null;
    }
  }
  
  // Find by ID
  async findById(id: string): Promise<T | null> {
    console.log(`BrowserMongo: Finding document by ID ${id} in ${this.collectionName}`);
    
    try {
      const doc = this.storage.find(item => item._id === id);
      return doc ? this.toAppDocument(doc) : null;
    } catch (err) {
      console.error(`Error finding document by ID in ${this.collectionName}:`, err);
      return null;
    }
  }
  
  // Insert one document
  async insertOne(document: Omit<T, 'id'>): Promise<T> {
    console.log(`BrowserMongo: Inserting document into ${this.collectionName}:`, document);
    
    try {
      const newDoc = this.toStorageDocument(document as Partial<T>);
      this.storage.push(newDoc);
      this.saveToLocalStorage();
      
      return this.toAppDocument(newDoc);
    } catch (err) {
      console.error(`Error inserting document into ${this.collectionName}:`, err);
      throw err;
    }
  }
  
  // Update one document
  async updateOne(filter: { id: string }, update: Partial<T>): Promise<T | null> {
    console.log(`BrowserMongo: Updating document in ${this.collectionName} with filter:`, filter);
    
    try {
      const index = this.storage.findIndex(item => item._id === filter.id);
      
      if (index === -1) return null;
      
      // Update fields
      for (const key in update) {
        if (key !== 'id' && key !== '_id') {
          this.storage[index][key] = update[key];
        }
      }
      
      this.saveToLocalStorage();
      return this.toAppDocument(this.storage[index]);
    } catch (err) {
      console.error(`Error updating document in ${this.collectionName}:`, err);
      throw err;
    }
  }
  
  // Delete one document
  async deleteOne(filter: { id: string }): Promise<T | null> {
    console.log(`BrowserMongo: Deleting document from ${this.collectionName} with filter:`, filter);
    
    try {
      const index = this.storage.findIndex(item => item._id === filter.id);
      
      if (index === -1) return null;
      
      const deletedDoc = this.storage[index];
      this.storage.splice(index, 1);
      this.saveToLocalStorage();
      
      return this.toAppDocument(deletedDoc);
    } catch (err) {
      console.error(`Error deleting document from ${this.collectionName}:`, err);
      throw err;
    }
  }
  
  // Count documents
  async count(query: Partial<T> = {}): Promise<number> {
    console.log(`BrowserMongo: Count of documents in ${this.collectionName} with query:`, query);
    
    try {
      const results = await this.find(query);
      return results.length;
    } catch (err) {
      console.error(`Error counting documents in ${this.collectionName}:`, err);
      return 0;
    }
  }
}

// Create MongoDB collections registry for browser
export const browserMongoDB = {
  products: new BrowserMongoCollection<any>('products'),
  customers: new BrowserMongoCollection<any>('customers'),
  orders: new BrowserMongoCollection<any>('orders'),
  orderItems: new BrowserMongoCollection<any>('orderItems'),
  payments: new BrowserMongoCollection<any>('payments'),
  warehouses: new BrowserMongoCollection<any>('warehouses'),
  expenses: new BrowserMongoCollection<any>('expenses'),
  
  // Complex operation that spans multiple collections
  async getOrderWithDetails(orderId: string) {
    try {
      const order = await this.orders.findById(orderId);
      if (!order) return null;
      
      const [items, payment, customer] = await Promise.all([
        this.orderItems.find({ order_id: orderId }),
        this.payments.findOne({ order_id: orderId }),
        this.customers.findById(order.customer_id)
      ]);
      
      return {
        ...order,
        items,
        payment,
        customer
      };
    } catch (err) {
      console.error('Error getting order with details:', err);
      return null;
    }
  }
};
