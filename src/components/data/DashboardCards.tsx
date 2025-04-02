
import {
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  Warehouse,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, change, icon }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs mt-1">
          {change > 0 ? (
            <>
              <ArrowUpRight className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-500">{change}% increase</span>
            </>
          ) : (
            <>
              <ArrowDownRight className="text-red-500 h-4 w-4 mr-1" />
              <span className="text-red-500">{Math.abs(change)}% decrease</span>
            </>
          )}
          <span className="text-muted-foreground ml-2">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardCards = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Total Products"
        value="142"
        change={12}
        icon={<Package className="h-4 w-4" />}
      />
      <StatCard 
        title="Total Customers" 
        value="2,641" 
        change={8}
        icon={<Users className="h-4 w-4" />} 
      />
      <StatCard 
        title="Active Orders" 
        value="36" 
        change={-3}
        icon={<ShoppingCart className="h-4 w-4" />} 
      />
      <StatCard 
        title="Monthly Revenue" 
        value="$59,345" 
        change={24}
        icon={<CreditCard className="h-4 w-4" />} 
      />
    </div>
  );
};

export const RecentOrdersCard = () => {
  const orders = [
    { id: '#ORD-9041', customer: 'Lisa Smith', amount: '$249.99', status: 'Completed' },
    { id: '#ORD-9040', customer: 'John Doe', amount: '$129.50', status: 'Processing' },
    { id: '#ORD-9039', customer: 'Alex Johnson', amount: '$549.00', status: 'Shipped' },
    { id: '#ORD-9038', customer: 'Emily Chen', amount: '$74.25', status: 'Completed' },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50 cursor-pointer">
                  <td className="font-medium">{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.amount}</td>
                  <td>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export const TopSellingProductsCard = () => {
  const products = [
    { name: 'Bluetooth Headphones', units: 124, revenue: '$8,680' },
    { name: 'Smartphone Case', units: 98, revenue: '$3,920' },
    { name: 'Wireless Charger', units: 76, revenue: '$3,040' },
    { name: 'USB-C Cable', units: 65, revenue: '$1,300' },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index} className="hover:bg-muted/50 cursor-pointer">
                  <td className="font-medium">{product.name}</td>
                  <td>{product.units}</td>
                  <td>{product.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export const WarehouseStockCard = () => {
  const warehouses = [
    { name: 'Main Warehouse', products: 87, stock: 'High' },
    { name: 'East Branch', products: 45, stock: 'Medium' },
    { name: 'West Branch', products: 32, stock: 'Low' },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Warehouse Stock Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Warehouse</th>
                <th>Products</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((warehouse, index) => (
                <tr key={index} className="hover:bg-muted/50 cursor-pointer">
                  <td className="font-medium">{warehouse.name}</td>
                  <td>{warehouse.products}</td>
                  <td>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      warehouse.stock === 'High' ? 'bg-green-100 text-green-800' : 
                      warehouse.stock === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {warehouse.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
