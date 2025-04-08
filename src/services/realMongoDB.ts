
import { Collection, ObjectId, Filter } from 'mongodb';
import { mongoDBConnection } from '../utils/mongodbConnection';
import { toast } from 'sonner';

// MongoDB collection wrapper for type-safe operations
export class MongoDBCollection<T extends { id?: string }> {
  private collection: Collection<Omit<T, 'id'> & { _id?: ObjectId }>;
  private collectionName: string;
  
  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.collection = mongoDBConnection.getCollection(collectionName);
  }
  
  // Convert MongoDB _id to string id
  private toAppDocument(doc: any): T {
    if (!doc) return doc;
    
    const { _id, ...rest } = doc;
    return {
      id: _id.toString(),
      ...rest
    } as T;
  }
  
  // Convert app document to MongoDB document
  private toMongoDocument(doc: Partial<T>): any {
    if (!doc) return doc;
    
    const { id, ...rest } = doc;
    const result: any = { ...rest };
    
    if (id) {
      try {
        result._id = new ObjectId(id);
      } catch (err) {
        // If id is not a valid ObjectId, use it as-is
        result._id = id;
      }
    }
    
    return result;
  }
  
  // Find all documents
  async find(query: Partial<T> = {}): Promise<T[]> {
    console.log(`MongoDB: Finding documents in ${this.collectionName} with query:`, query);
    
    try {
      const mongoQuery = this.toMongoDocument(query);
      delete mongoQuery._id; // Remove _id from query if it exists
      
      // Add _id query if id exists in original query
      if (query.id) {
        try {
          mongoQuery._id = new ObjectId(query.id);
        } catch (err) {
          // If id is not a valid ObjectId, use it as-is
          mongoQuery._id = query.id;
        }
      }
      
      const docs = await this.collection.find(mongoQuery).toArray();
      return docs.map(doc => this.toAppDocument(doc));
    } catch (err: any) {
      console.error(`Error finding documents in ${this.collectionName}:`, err);
      return [];
    }
  }
  
  // Find one document
  async findOne(query: Partial<T>): Promise<T | null> {
    console.log(`MongoDB: Finding one document in ${this.collectionName} with query:`, query);
    
    try {
      const mongoQuery = this.toMongoDocument(query);
      delete mongoQuery._id; // Remove _id from query if it exists
      
      // Add _id query if id exists in original query
      if (query.id) {
        try {
          mongoQuery._id = new ObjectId(query.id);
        } catch (err) {
          // If id is not a valid ObjectId, use it as-is
          mongoQuery._id = query.id;
        }
      }
      
      const doc = await this.collection.findOne(mongoQuery as Filter<Omit<T, 'id'> & { _id?: ObjectId }>);
      return doc ? this.toAppDocument(doc) : null;
    } catch (err: any) {
      console.error(`Error finding document in ${this.collectionName}:`, err);
      return null;
    }
  }
  
  // Find by ID
  async findById(id: string): Promise<T | null> {
    console.log(`MongoDB: Finding document by ID ${id} in ${this.collectionName}`);
    
    try {
      let objectId;
      try {
        objectId = new ObjectId(id);
      } catch (err) {
        // If id is not a valid ObjectId, use it as-is
        objectId = id;
      }
      
      const doc = await this.collection.findOne({ _id: objectId } as Filter<Omit<T, 'id'> & { _id?: ObjectId }>);
      return doc ? this.toAppDocument(doc) : null;
    } catch (err: any) {
      console.error(`Error finding document by ID in ${this.collectionName}:`, err);
      return null;
    }
  }
  
  // Insert one document
  async insertOne(document: Omit<T, 'id'>): Promise<T> {
    console.log(`MongoDB: Inserting document into ${this.collectionName}:`, document);
    
    try {
      const mongoDoc = this.toMongoDocument(document as Partial<T>);
      delete mongoDoc._id; // Remove _id if it exists, let MongoDB generate it
      
      const result = await this.collection.insertOne(mongoDoc);
      
      if (!result.acknowledged) {
        throw new Error('Insert operation not acknowledged');
      }
      
      const newDoc = await this.collection.findOne({ _id: result.insertedId } as Filter<Omit<T, 'id'> & { _id?: ObjectId }>);
      
      if (!newDoc) {
        throw new Error('Could not find newly inserted document');
      }
      
      return this.toAppDocument(newDoc);
    } catch (err: any) {
      console.error(`Error inserting document into ${this.collectionName}:`, err);
      throw err;
    }
  }
  
  // Update one document
  async updateOne(filter: { id: string }, update: Partial<T>): Promise<T | null> {
    console.log(`MongoDB: Updating document in ${this.collectionName} with filter:`, filter);
    
    try {
      let objectId;
      try {
        objectId = new ObjectId(filter.id);
      } catch (err) {
        // If id is not a valid ObjectId, use it as-is
        objectId = filter.id;
      }
      
      const mongoUpdate = this.toMongoDocument(update);
      delete mongoUpdate._id; // Remove _id from update if it exists
      
      const result = await this.collection.updateOne(
        { _id: objectId } as Filter<Omit<T, 'id'> & { _id?: ObjectId }>,
        { $set: mongoUpdate }
      );
      
      if (!result.acknowledged) {
        throw new Error('Update operation not acknowledged');
      }
      
      const updatedDoc = await this.collection.findOne({ _id: objectId } as Filter<Omit<T, 'id'> & { _id?: ObjectId }>);
      return updatedDoc ? this.toAppDocument(updatedDoc) : null;
    } catch (err: any) {
      console.error(`Error updating document in ${this.collectionName}:`, err);
      throw err;
    }
  }
  
  // Delete one document
  async deleteOne(filter: { id: string }): Promise<T | null> {
    console.log(`MongoDB: Deleting document from ${this.collectionName} with filter:`, filter);
    
    try {
      let objectId;
      try {
        objectId = new ObjectId(filter.id);
      } catch (err) {
        // If id is not a valid ObjectId, use it as-is
        objectId = filter.id;
      }
      
      // First, find the document to return it after deletion
      const docToDelete = await this.collection.findOne({ _id: objectId } as Filter<Omit<T, 'id'> & { _id?: ObjectId }>);
      
      if (!docToDelete) {
        return null;
      }
      
      const result = await this.collection.deleteOne({ _id: objectId } as Filter<Omit<T, 'id'> & { _id?: ObjectId }>);
      
      if (!result.acknowledged) {
        throw new Error('Delete operation not acknowledged');
      }
      
      return this.toAppDocument(docToDelete);
    } catch (err: any) {
      console.error(`Error deleting document from ${this.collectionName}:`, err);
      throw err;
    }
  }
  
  // Count documents
  async count(query: Partial<T> = {}): Promise<number> {
    console.log(`MongoDB: Count of documents in ${this.collectionName} with query:`, query);
    
    try {
      const mongoQuery = this.toMongoDocument(query);
      delete mongoQuery._id; // Remove _id from query if it exists
      
      // Add _id query if id exists in original query
      if (query.id) {
        try {
          mongoQuery._id = new ObjectId(query.id);
        } catch (err) {
          // If id is not a valid ObjectId, use it as-is
          mongoQuery._id = query.id;
        }
      }
      
      return await this.collection.countDocuments(mongoQuery as Filter<Omit<T, 'id'> & { _id?: ObjectId }>);
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
