
import { initializePostgres, closePostgres, PostgresConfig } from '../services/postgresDB';

// Connection status types
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Singleton to track database connection state
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private _status: ConnectionStatus = 'disconnected';
  private _config: PostgresConfig | null = null;
  private _error: Error | null = null;
  
  private constructor() {}
  
  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
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
  get config(): PostgresConfig | null {
    return this._config;
  }
  
  // Connect to database
  async connect(config: PostgresConfig): Promise<boolean> {
    this._status = 'connecting';
    this._config = config;
    
    console.log(`Attempting to connect to PostgreSQL at ${config.host} (database: ${config.database})`);
    
    try {
      initializePostgres(config);
      this._status = 'connected';
      this._error = null;
      
      console.log('Connected successfully to PostgreSQL');
      return true;
    } catch (err: any) {
      this._status = 'error';
      this._error = err;
      console.error('Failed to connect to PostgreSQL:', err);
      return false;
    }
  }
  
  // Disconnect from database
  async disconnect(): Promise<boolean> {
    if (this._status !== 'connected') {
      return true;
    }
    
    console.log('Disconnecting from PostgreSQL');
    
    try {
      await closePostgres();
      this._status = 'disconnected';
      console.log('Disconnected from PostgreSQL');
      return true;
    } catch (err: any) {
      this._error = err;
      console.error('Error disconnecting from PostgreSQL:', err);
      return false;
    }
  }
  
  // Reset connection status
  reset(): void {
    this._status = 'disconnected';
    this._config = null;
    this._error = null;
  }
}

// Export the database connection instance
export const dbConnection = DatabaseConnection.getInstance();

// Helper function to init database connection
export const initializeDatabase = async (config: PostgresConfig): Promise<boolean> => {
  return await dbConnection.connect(config);
};

// Example usage function
export const connectToPostgreSQL = async () => {
  const config: PostgresConfig = {
    host: 'localhost',
    port: 5432,
    database: 'inventory_management',
    user: 'postgres',
    password: 'postgres',
    ssl: false
  };
  
  const connected = await initializeDatabase(config);
  
  if (connected) {
    console.log('Successfully connected to PostgreSQL');
    return true;
  } else {
    console.error('Failed to connect to PostgreSQL:', dbConnection.error);
    return false;
  }
};
