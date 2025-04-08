import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Edit,
  Trash2,
  Plus,
  Search,
  MoreHorizontal,
  Filter,
  Warehouse,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Warehouse as WarehouseType } from '../models/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useRealMongoCollection } from '../hooks/useRealMongoCollection';

const Warehouses = () => {
  const { findAll, remove, isLoading } = useRealMongoCollection<WarehouseType>('warehouses');
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<WarehouseType | null>(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const data = await findAll();
        setWarehouses(data);
      } catch (error) {
        toast.error('Failed to fetch warehouses');
      }
    };

    fetchWarehouses();
  }, [findAll]);

  const handleDeleteClick = (warehouse: WarehouseType) => {
    setWarehouseToDelete(warehouse);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!warehouseToDelete) return;
    
    try {
      await remove(warehouseToDelete.id);
      setWarehouses(warehouses.filter(w => w.id !== warehouseToDelete.id));
      toast.success(`Warehouse ${warehouseToDelete.name} deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete warehouse');
    }
    
    setWarehouseToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const filteredWarehouses = warehouses.filter(warehouse => {
    return (
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      warehouse.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
          <p className="text-muted-foreground mt-1">
            Manage your warehouse locations
          </p>
        </div>
        <Button asChild>
          <Link to="/warehouses/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search warehouses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="sm:w-auto w-full">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} className="h-[200px] rounded-xl" />
            ))}
        </div>
      ) : filteredWarehouses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-lg">No warehouses found</p>
          {searchQuery && (
            <Button
              variant="link"
              onClick={() => setSearchQuery('')}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWarehouses.map((warehouse) => (
            <Card key={warehouse.id} className="overflow-hidden card-transition">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Warehouse className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <CardTitle>{warehouse.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Since {formatDate(warehouse.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/warehouses/edit/${warehouse.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(warehouse)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{warehouse.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Created on {formatDate(warehouse.created_at)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link to={`/warehouses/${warehouse.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the warehouse "{warehouseToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Warehouses;
