
import { useState } from 'react';
import { mockMongoDB } from '../services/mockMongoDB';

// This hook provides a convenient way to work with our mock MongoDB collections
export function useMongoCollection<T extends { id: string }>(collectionName: keyof typeof mockMongoDB) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Type assertion to get the correct collection
  const collection = mockMongoDB[collectionName] as any;
  
  const findAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await collection.find();
      return data as T[];
    } catch (err: any) {
      setError(err);
      return [] as T[];
    } finally {
      setIsLoading(false);
    }
  };
  
  const findById = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await collection.findById(id);
      return data as T | null;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const findOne = async (query: Partial<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await collection.findOne(query);
      return data as T | null;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const find = async (query: Partial<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await collection.find(query);
      return data as T[];
    } catch (err: any) {
      setError(err);
      return [] as T[];
    } finally {
      setIsLoading(false);
    }
  };
  
  const create = async (data: Omit<T, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newDoc = await collection.insertOne(data);
      return newDoc as T;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const update = async (id: string, data: Partial<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await collection.updateOne({ id } as Partial<T>, data);
      return updated as T;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const remove = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const deleted = await collection.deleteOne({ id } as Partial<T>);
      return deleted as T;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const count = async (query: Partial<T> = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const count = await collection.count(query);
      return count;
    } catch (err: any) {
      setError(err);
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
