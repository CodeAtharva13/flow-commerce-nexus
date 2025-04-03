
import { Pool, QueryResult } from 'pg';
import { toast } from 'sonner';

// PostgreSQL connection pool
let pool: Pool | null = null;

// Database configuration
export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

// Initialize the PostgreSQL connection
export const initializePostgres = (config: PostgresConfig): Pool => {
  try {
    pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
    });
    
    console.log(`Connected to PostgreSQL database: ${config.database} at ${config.host}`);
    return pool;
  } catch (error) {
    console.error('Failed to initialize PostgreSQL connection:', error);
    toast.error('Failed to connect to PostgreSQL database');
    throw error;
  }
};

// Get the database connection pool
export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('PostgreSQL connection not initialized. Call initializePostgres first.');
  }
  return pool;
};

// Close the database connection pool
export const closePostgres = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('PostgreSQL connection closed');
  }
};

// Generic function to execute a query
export const executeQuery = async <T>(
  query: string, 
  params: any[] = []
): Promise<T[]> => {
  try {
    console.log(`Executing query: ${query}`, params);
    const client = await getPool().connect();
    
    try {
      const result: QueryResult<T> = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

// Generic PostgreSQL table operations
export class PostgresTable<T extends { id: string }> {
  private tableName: string;
  
  constructor(tableName: string) {
    this.tableName = tableName;
  }
  
  // Find all records
  async findAll(): Promise<T[]> {
    const query = `SELECT * FROM ${this.tableName}`;
    return executeQuery<T>(query);
  }
  
  // Find by ID
  async findById(id: string): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await executeQuery<T>(query, [id]);
    return result.length > 0 ? result[0] : null;
  }
  
  // Find one by custom query
  async findOne(filters: Partial<T>): Promise<T | null> {
    const keys = Object.keys(filters);
    const params = Object.values(filters);
    
    if (keys.length === 0) {
      const result = await this.findAll();
      return result.length > 0 ? result[0] : null;
    }
    
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const query = `SELECT * FROM ${this.tableName} WHERE ${whereClause} LIMIT 1`;
    
    const result = await executeQuery<T>(query, params);
    return result.length > 0 ? result[0] : null;
  }
  
  // Find by custom query
  async find(filters: Partial<T>): Promise<T[]> {
    const keys = Object.keys(filters);
    const params = Object.values(filters);
    
    if (keys.length === 0) {
      return this.findAll();
    }
    
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const query = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
    
    return executeQuery<T>(query, params);
  }
  
  // Insert a new record
  async insertOne(data: Omit<T, 'id'> & { id?: string }): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const columns = keys.join(', ');
    
    const query = `INSERT INTO ${this.tableName} (${columns}) 
                  VALUES (${placeholders}) 
                  RETURNING *`;
                  
    const result = await executeQuery<T>(query, values);
    return result[0];
  }
  
  // Update a record
  async updateOne(filter: { id: string }, data: Partial<T>): Promise<T | null> {
    const id = filter.id;
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    if (keys.length === 0) {
      return this.findById(id);
    }
    
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const query = `UPDATE ${this.tableName} 
                  SET ${setClause} 
                  WHERE id = $${keys.length + 1} 
                  RETURNING *`;
                  
    const result = await executeQuery<T>(query, [...values, id]);
    return result.length > 0 ? result[0] : null;
  }
  
  // Delete a record
  async deleteOne(filter: { id: string }): Promise<T | null> {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`;
    const result = await executeQuery<T>(query, [filter.id]);
    return result.length > 0 ? result[0] : null;
  }
  
  // Count records
  async count(filters: Partial<T> = {}): Promise<number> {
    const keys = Object.keys(filters);
    const values = Object.values(filters);
    
    let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    
    if (keys.length > 0) {
      const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }
    
    const result = await executeQuery<{ count: string }>(query, values);
    return parseInt(result[0].count, 10);
  }
}

// Create a registry of tables
export const postgresTables = {
  products: new PostgresTable<any>('products'),
  customers: new PostgresTable<any>('customers'),
  orders: new PostgresTable<any>('orders'),
  orderItems: new PostgresTable<any>('order_items'),
  payments: new PostgresTable<any>('payments'),
  warehouses: new PostgresTable<any>('warehouses'),
  expenses: new PostgresTable<any>('expenses'),
};

// Example of a more complex operation that spans multiple tables
export const getOrderWithDetails = async (orderId: string) => {
  const query = `
    SELECT 
      o.*,
      json_agg(oi.*) as items,
      json_build_object(
        'id', p.id,
        'amount', p.amount,
        'payment_date', p.payment_date,
        'method', p.method,
        'transaction_id', p.transaction_id,
        'status', p.status
      ) as payment,
      json_build_object(
        'id', c.id,
        'name', c.name,
        'email', c.email,
        'phone', c.phone,
        'address', c.address
      ) as customer
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN payments p ON o.id = p.order_id
    LEFT JOIN customers c ON o.customer_id = c.id
    WHERE o.id = $1
    GROUP BY o.id, p.id, c.id
  `;
  
  const result = await executeQuery<any>(query, [orderId]);
  return result.length > 0 ? result[0] : null;
};
