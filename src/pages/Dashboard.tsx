
import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  DashboardCards,
  RecentOrdersCard,
  TopSellingProductsCard,
  WarehouseStockCard,
} from '../components/data/DashboardCards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { formatCurrency } from '../services/mockData';
import { toast } from 'sonner';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchData = async () => {
      try {
        // Generate mock data for the chart
        const mockChartData = [
          { name: 'Jan', revenue: 10500 },
          { name: 'Feb', revenue: 12800 },
          { name: 'Mar', revenue: 9800 },
          { name: 'Apr', revenue: 15400 },
          { name: 'May', revenue: 18200 },
          { name: 'Jun', revenue: 22100 },
          { name: 'Jul', revenue: 24500 },
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        setChartData(mockChartData);
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your business performance and activities
        </p>
      </div>
      
      {isLoading ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          
          <div className="mb-6">
            <Skeleton className="h-[300px]" />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </>
      ) : (
        <>
          <DashboardCards />
          
          <div className="mt-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue for the current year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <RecentOrdersCard />
            <TopSellingProductsCard />
          </div>
          
          <div className="mt-6">
            <WarehouseStockCard />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
