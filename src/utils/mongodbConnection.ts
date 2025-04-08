
import { toast } from 'sonner';

// Connection status types
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// MongoDB configuration
export interface MongoDBConfig {
  uri: string;
  dbName: string;
  options?: any;
}

// Check if running in browser environment
const isBrowser = typeof window !== 'undefined';

// Singleton to track database connection state
class MongoDBConnection {
  private static instance: MongoDBConnection;
  private _status: ConnectionStatus = 'disconnected';
  private _config: MongoDBConfig | null = null;
  private _error: Error | null = null;
  private _client: any = null;
  private _db: any = null;
  
  private constructor() {}
  
  static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }
  
  // Get current status
  get status(): ConnectionStatus {
    return this._status;
  }
  
  // Get error if any
  get error(): Error | null {
    return this._error;
  }
  
  // Get connection config
  get config(): MongoDBConfig | null {
    return this._config;
  }
  
  // Get MongoDB client
  get client(): any {
    return this._client;
  }
  
  // Get MongoDB database
  get db(): any {
    if (!this._db) {
      throw new Error('MongoDB database not connected. Call connect first.');
    }
    return this._db;
  }
  
  // Connect to database
  async connect(config: MongoDBConfig): Promise<boolean> {
    this._status = 'connecting';
    this._config = config;
    
    console.log(`Attempting to connect to MongoDB at ${config.uri} (database: ${config.dbName})`);
    
    try {
      if (isBrowser) {
        // In browser environment, simulate connection
        console.log('Browser environment detected, using browser MongoDB simulation');
        this._client = { isConnected: true };
        this._db = { name: config.dbName };
        this._status = 'connected';
        this._error = null;
        console.log('Connected successfully to simulated MongoDB');
        return true;
      } else {
        // In Node.js environment, use real MongoDB driver
        // This code won't run in the browser
        const { MongoClient } = require('mongodb');
        this._client = new MongoClient(config.uri, config.options || {});
        await this._client.connect();
        this._db = this._client.db(config.dbName);
        this._status = 'connected';
        this._error = null;
        console.log('Connected successfully to MongoDB');
        return true;
      }
    } catch (err: any) {
      this._status = 'error';
      this._error = err;
      console.error('Failed to connect to MongoDB:', err);
      toast.error(`Failed to connect to MongoDB: ${err.message}`);
      return false;
    }
  }
  
  // Disconnect from database
  async disconnect(): Promise<boolean> {
    if (this._status !== 'connected' || !this._client) {
      return true;
    }
    
    console.log('Disconnecting from MongoDB');
    
    try {
      if (!isBrowser && this._client.close) {
        await this._client.close();
      }
      this._status = 'disconnected';
      this._client = null;
      this._db = null;
      console.log('Disconnected from MongoDB');
      return true;
    } catch (err: any) {
      this._error = err;
      console.error('Error disconnecting from MongoDB:', err);
      return false;
    }
  }
  
  // Reset connection status
  reset(): void {
    this.disconnect();
    this._status = 'disconnected';
    this._config = null;
    this._error = null;
  }
  
  // Get a collection
  getCollection<T>(name: string): any {
    if (!this._db) {
      throw new Error('MongoDB not connected. Call connect first.');
    }
    
    if (isBrowser) {
      // In browser, we'll return a reference to our browserMongoDB collection
      // This will be filled in by the realMongoDB service
      return { collectionName: name };
    } else {
      // In Node.js, return actual MongoDB collection
      return this._db.collection<T>(name);
    }
  }
}

// Export the database connection instance
export const mongoDBConnection = MongoDBConnection.getInstance();

// Helper function to init database connection
export const initializeMongoDB = async (config: MongoDBConfig): Promise<boolean> => {
  return await mongoDBConnection.connect(config);
};

// Example usage function
export const connectToMongoDB = async () => {
  const config: MongoDBConfig = {
    uri: 'mongodb://localhost:27017',
    dbName: 'inventory_management',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  };
  
  const connected = await initializeMongoDB(config);
  
  if (connected) {
    console.log('Successfully connected to MongoDB');
    return true;
  } else {
    console.error('Failed to connect to MongoDB:', mongoDBConnection.error);
    return false;
  }
};
