
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { connectToMongoDB } from '../utils/mongodbConnection';
import { toast } from 'sonner';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize MongoDB connection when the app loads
    const initConnection = async () => {
      try {
        await connectToMongoDB();
        console.log('MongoDB connection initialized successfully');
      } catch (error) {
        console.error('Failed to initialize MongoDB connection:', error);
        toast.error('Failed to initialize database connection');
      }
    };
    
    initConnection();
    
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default Index;
