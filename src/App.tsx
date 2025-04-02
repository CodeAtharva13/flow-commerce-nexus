
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layouts/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Customers from "./pages/Customers";
import CustomerForm from "./pages/CustomerForm";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import PaymentForm from "./pages/PaymentForm";
import Warehouses from "./pages/Warehouses";
import Expenses from "./pages/Expenses";
import ExpenseForm from "./pages/ExpenseForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            {/* Dashboard */}
            <Route path="/" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
            
            {/* Products */}
            <Route path="/products" element={<ProtectedRoute><DashboardLayout><Products /></DashboardLayout></ProtectedRoute>} />
            <Route path="/products/new" element={<ProtectedRoute><DashboardLayout><ProductForm /></DashboardLayout></ProtectedRoute>} />
            <Route path="/products/edit/:id" element={<ProtectedRoute><DashboardLayout><ProductForm /></DashboardLayout></ProtectedRoute>} />
            
            {/* Customers */}
            <Route path="/customers" element={<ProtectedRoute><DashboardLayout><Customers /></DashboardLayout></ProtectedRoute>} />
            <Route path="/customers/new" element={<ProtectedRoute><DashboardLayout><CustomerForm /></DashboardLayout></ProtectedRoute>} />
            <Route path="/customers/edit/:id" element={<ProtectedRoute><DashboardLayout><CustomerForm /></DashboardLayout></ProtectedRoute>} />
            
            {/* Orders */}
            <Route path="/orders" element={<ProtectedRoute><DashboardLayout><Orders /></DashboardLayout></ProtectedRoute>} />
            
            {/* Payments */}
            <Route path="/payments" element={<ProtectedRoute><DashboardLayout><Payments /></DashboardLayout></ProtectedRoute>} />
            <Route path="/payments/process/:orderId" element={<ProtectedRoute><DashboardLayout><PaymentForm /></DashboardLayout></ProtectedRoute>} />
            
            {/* Warehouses */}
            <Route path="/warehouses" element={<ProtectedRoute><DashboardLayout><Warehouses /></DashboardLayout></ProtectedRoute>} />
            
            {/* Expenses */}
            <Route path="/expenses" element={<ProtectedRoute><DashboardLayout><Expenses /></DashboardLayout></ProtectedRoute>} />
            <Route path="/expenses/new" element={<ProtectedRoute><DashboardLayout><ExpenseForm /></DashboardLayout></ProtectedRoute>} />
            <Route path="/expenses/edit/:id" element={<ProtectedRoute><DashboardLayout><ExpenseForm /></DashboardLayout></ProtectedRoute>} />
            
            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
