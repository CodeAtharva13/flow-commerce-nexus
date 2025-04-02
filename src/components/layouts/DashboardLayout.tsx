
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  Warehouse,
  Receipt,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { toast } from 'sonner';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive, onClick }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground font-medium'
          : 'hover:bg-accent hover:text-accent-foreground'
      }`}
      onClick={onClick}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      to: '/products',
      label: 'Products',
      icon: <Package className="h-5 w-5" />,
    },
    {
      to: '/customers',
      label: 'Customers',
      icon: <Users className="h-5 w-5" />,
    },
    {
      to: '/orders',
      label: 'Orders',
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      to: '/payments',
      label: 'Payments',
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      to: '/warehouses',
      label: 'Warehouses',
      icon: <Warehouse className="h-5 w-5" />,
    },
    {
      to: '/expenses',
      label: 'Expenses',
      icon: <Receipt className="h-5 w-5" />,
    },
  ];

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40">
        <div className="flex flex-col flex-grow bg-sidebar border-r border-sidebar-border overflow-y-auto">
          <div className="flex items-center h-16 px-6">
            <Link to="/dashboard" className="flex items-center text-2xl font-semibold text-primary">
              <span className="ml-2">Flow Commerce</span>
            </Link>
          </div>
          <div className="flex-1 px-3 py-2 space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.to}
              />
            ))}
          </div>
          <div className="p-4">
            <div className="border-t border-sidebar-border pt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    <span>{user?.name}</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-foreground/80" onClick={closeSidebar}></div>
          <div className="fixed inset-y-0 left-0 z-40 w-64 bg-background overflow-y-auto">
            <div className="flex items-center h-16 px-6">
              <Link to="/dashboard" className="flex items-center text-2xl font-semibold text-primary">
                <span className="ml-2">Flow Commerce</span>
              </Link>
            </div>
            <Separator />
            <div className="p-3 space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  isActive={location.pathname === item.to}
                  onClick={closeSidebar}
                />
              ))}
            </div>
            <Separator />
            <div className="p-4">
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 mr-2" />
                <span className="font-medium">{user?.name}</span>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="py-6">
          <main className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
