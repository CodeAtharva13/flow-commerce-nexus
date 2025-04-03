
import { useState } from 'react';
import { postgresTables } from '../services/postgresDB';
import { toast } from 'sonner';

// This hook provides a convenient way to work with PostgreSQL tables
export function usePostgresCollection<T extends { id: string }>(tableName: keyof typeof postgresTables) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Type assertion to get the correct collection
  const table = postgresTables[tableName];
  
  const findAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await table.findAll();
      return data as T[];
    } catch (err: any) {
      setError(err);
      toast.error(`Error fetching data: ${err.message}`);
      return [] as T[];
    } finally {
      setIsLoading(false);
    }
  };
  
  const findById = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await table.findById(id);
      return data as T | null;
    } catch (err: any) {
      setError(err);
      toast.error(`Error fetching item: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const findOne = async (query: Partial<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await table.findOne(query);
      return data as T | null;
    } catch (err: any) {
      setError(err);
      toast.error(`Error fetching item: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const find = async (query: Partial<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await table.find(query);
      return data as T[];
    } catch (err: any) {
      setError(err);
      toast.error(`Error searching data: ${err.message}`);
      return [] as T[];
    } finally {
      setIsLoading(false);
    }
  };
  
  const create = async (data: Omit<T, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newDoc = await table.insertOne(data);
      toast.success('Item created successfully');
      return newDoc as T;
    } catch (err: any) {
      setError(err);
      toast.error(`Error creating item: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const update = async (id: string, data: Partial<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await table.updateOne({ id } as Partial<T>, data);
      toast.success('Item updated successfully');
      return updated as T;
    } catch (err: any) {
      setError(err);
      toast.error(`Error updating item: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const remove = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const deleted = await table.deleteOne({ id } as Partial<T>);
      toast.success('Item deleted successfully');
      return deleted as T;
    } catch (err: any) {
      setError(err);
      toast.error(`Error deleting item: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const count = async (query: Partial<T> = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const count = await table.count(query);
      return count;
    } catch (err: any) {
      setError(err);
      toast.error(`Error counting items: ${err.message}`);
      return 0;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    findAll,
    findById,
    findOne,
    find,
    create,
    update,
    remove,
    count,
  };
}
