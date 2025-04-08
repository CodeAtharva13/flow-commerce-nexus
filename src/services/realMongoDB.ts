
import { mongoDBConnection } from '../utils/mongodbConnection';
import { browserMongoDB } from './browserMongoDB';
import { toast } from 'sonner';

// Check if running in browser environment
const isBrowser = typeof window !== 'undefined';

// MongoDB collection wrapper for type-safe operations
export class MongoDBCollection<T extends { id?: string }> {
  private collectionName: string;
  private browserCollection: any;
  
  constructor(collectionName: string) {
    this.collectionName = collectionName;
    
    if (isBrowser) {
      // In browser environment, use the browser implementation
      this.browserCollection = (browserMongoDB as any)[collectionName];
      
      if (!this.browserCollection) {
        console.error(`Browser MongoDB collection ${collectionName} not found`);
        throw new Error(`Browser MongoDB collection ${collectionName} not found`);
      }
    }
  }
  
  // Convert MongoDB _id to string id (for Node.js environment)
  private toAppDocument(doc: any): T {
    if (!doc) return doc;
    
    if (isBrowser) {
      return doc; // Browser implementation already handles this
    }
    
    const { _id, ...rest } = doc;
    return {
      id: _id.toString(),
      ...rest
    } as T;
  }
  
  // Find all documents
  async find(query: Partial<T> = {}): Promise<T[]> {
    console.log(`MongoDB: Finding documents in ${this.collectionName} with query:`, query);
    
    try {
      if (isBrowser) {
        return await this.browserCollection.find(query);
      } else {
        // This code won't run in browser
        const collection = mongoDBConnection.getCollection(this.collectionName);
        const mongoQuery = this.prepareMongoQuery(query);
        const docs = await collection.find(mongoQuery).toArray();
        return docs.map((doc: any) => this.toAppDocument(doc));
      }
    } catch (err: any) {
      console.error(`Error finding documents in ${this.collectionName}:`, err);
      return [];
    }
  }
  
  // Find one document
  async findOne(query: Partial<T>): Promise<T | null> {
    console.log(`MongoDB: Finding one document in ${this.collectionName} with query:`, query);
    
    try {
      if (isBrowser) {
        return await this.browserCollection.findOne(query);
      } else {
        // This code won't run in browser
        const collection = mongoDBConnection.getCollection(this.collectionName);
        const mongoQuery = this.prepareMongoQuery(query);
        const doc = await collection.findOne(mongoQuery);
        return doc ? this.toAppDocument(doc) : null;
      }
    } catch (err: any) {
      console.error(`Error finding document in ${this.collectionName}:`, err);
      return null;
    }
  }
  
  // Helper to prepare MongoDB queries
  private prepareMongoQuery(query: Partial<T>): any {
    // This is only used in Node.js environment
    if (isBrowser) return query;
    
    const result: any = { ...query };
    delete result.id;
    
    if (query.id) {
      // In Node.js we would use ObjectId here
      result._id = query.id;
    }
    
    return result;
  }
  
  // Find by ID
  async findById(id: string): Promise<T | null> {
    console.log(`MongoDB: Finding document by ID ${id} in ${this.collectionName}`);
    
    try {
      if (isBrowser) {
        return await this.browserCollection.findById(id);
      } else {
        // This code won't run in browser
        const collection = mongoDBConnection.getCollection(this.collectionName);
        const doc = await collection.findOne({ _id: id });
        return doc ? this.toAppDocument(doc) : null;
      }
    } catch (err: any) {
      console.error(`Error finding document by ID in ${this.collectionName}:`, err);
      return null;
    }
  }
  
  // Insert one document
  async insertOne(document: Omit<T, 'id'>): Promise<T> {
    console.log(`MongoDB: Inserting document into ${this.collectionName}:`, document);
    
    try {
      if (isBrowser) {
        return await this.browserCollection.insertOne(document);
      } else {
        // This code won't run in browser
        const collection = mongoDBConnection.getCollection(this.collectionName);
        const result = await collection.insertOne(document);
        const newDoc = await collection.findOne({ _id: result.insertedId });
        
        if (!newDoc) {
          throw new Error('Could not find newly inserted document');
        }
        
        return this.toAppDocument(newDoc);
      }
    } catch (err: any) {
      console.error(`Error inserting document into ${this.collectionName}:`, err);
      throw err;
    }
  }
  
  // Update one document
  async updateOne(filter: { id: string }, update: Partial<T>): Promise<T | null> {
    console.log(`MongoDB: Updating document in ${this.collectionName} with filter:`, filter);
    
    try {
      if (isBrowser) {
        return await this.browserCollection.updateOne(filter, update);
      } else {
        // This code won't run in browser
        const collection = mongoDBConnection.getCollection(this.collectionName);
        const result = await collection.updateOne(
          { _id: filter.id },
          { $set: update }
        );
        
        if (!result.acknowledged) {
          throw new Error('Update operation not acknowledged');
        }
        
        const updatedDoc = await collection.findOne({ _id: filter.id });
        return updatedDoc ? this.toAppDocument(updatedDoc) : null;
      }
    } catch (err: any) {
      console.error(`Error updating document in ${this.collectionName}:`, err);
      throw err;
    }
  }
  
  // Delete one document
  async deleteOne(filter: { id: string }): Promise<T | null> {
    console.log(`MongoDB: Deleting document from ${this.collectionName} with filter:`, filter);
    
    try {
      if (isBrowser) {
        return await this.browserCollection.deleteOne(filter);
      } else {
        // This code won't run in browser
        const collection = mongoDBConnection.getCollection(this.collectionName);
        const docToDelete = await collection.findOne({ _id: filter.id });
        
        if (!docToDelete) {
          return null;
        }
        
        const result = await collection.deleteOne({ _id: filter.id });
        
        if (!result.acknowledged) {
          throw new Error('Delete operation not acknowledged');
        }
        
        return this.toAppDocument(docToDelete);
      }
    } catch (err: any) {
      console.error(`Error deleting document from ${this.collectionName}:`, err);
      throw err;
    }
  }
  
  // Count documents
  async count(query: Partial<T> = {}): Promise<number> {
    console.log(`MongoDB: Count of documents in ${this.collectionName} with query:`, query);
    
    try {
      if (isBrowser) {
        return await this.browserCollection.count(query);
      } else {
        // This code won't run in browser
        const collection = mongoDBConnection.getCollection(this.collectionName);
        const mongoQuery = this.prepareMongoQuery(query);
        return await collection.countDocuments(mongoQuery);
      }
    } catch (err: any) {
      console.error(`Error counting documents in ${this.collectionName}:`, err);
      return 0;
    }
  }
}

// Create MongoDB collections registry
export const realMongoDB = {
  products: new MongoDBCollection<any>('products'),
  customers: new MongoDBCollection<any>('customers'),
  orders: new MongoDBCollection<any>('orders'),
  orderItems: new MongoDBCollection<any>('orderItems'),
  payments: new MongoDBCollection<any>('payments'),
  warehouses: new MongoDBCollection<any>('warehouses'),
  expenses: new MongoDBCollection<any>('expenses'),
  
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
