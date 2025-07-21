import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import { Building, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import WarehouseForm from './WarehouseForm';
import { useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse } from '@/hooks/useBackendData';
import { getLocalWarehouses, setLocalWarehouses } from '@/hooks/useInventory';

const WarehouseManager: React.FC = () => {
  const isMobile = useIsMobile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  
  // Backend hooks
  const { data: backendWarehouses, isLoading, error } = useWarehouses();
  const createWarehouseMutation = useCreateWarehouse();
  const updateWarehouseMutation = useUpdateWarehouse();
  const deleteWarehouseMutation = useDeleteWarehouse();
  
  // Fallback to localStorage if backend fails
  const [localWarehouses, setLocalWarehouses] = useState(getLocalWarehouses());
  
  // Use backend data if available, otherwise use localStorage
  const warehouses = backendWarehouses || localWarehouses;
  const isBackendAvailable = !error && backendWarehouses;

  const handleAddWarehouse = () => {
    setEditingWarehouse(null);
    setIsFormOpen(true);
  };

  const handleEditWarehouse = (warehouse) => {
    setEditingWarehouse(warehouse);
    setIsFormOpen(true);
  };

  const handleDeleteWarehouse = async (warehouseId) => {
    if (isBackendAvailable) {
      try {
        await deleteWarehouseMutation.mutateAsync(warehouseId);
        toast.success('Warehouse deleted successfully');
      } catch (error) {
        toast.error('Failed to delete warehouse');
        console.error('Error deleting warehouse:', error);
      }
    } else {
      // Fallback to localStorage
      const updatedWarehouses = localWarehouses.filter(wh => wh.id !== warehouseId);
      setLocalWarehouses(updatedWarehouses);
      setLocalWarehouses(updatedWarehouses);
      toast.success('Warehouse deleted successfully (local storage)');
    }
  };

  const handleFormSubmit = async (newWarehouse) => {
    if (isBackendAvailable) {
      try {
        if (editingWarehouse) {
          await updateWarehouseMutation.mutateAsync({
            id: editingWarehouse.id,
            data: newWarehouse
          });
          toast.success('Warehouse updated successfully');
        } else {
          await createWarehouseMutation.mutateAsync(newWarehouse);
          toast.success('Warehouse created successfully');
        }
        setIsFormOpen(false);
      } catch (error) {
        toast.error(`Failed to ${editingWarehouse ? 'update' : 'create'} warehouse`);
        console.error('Error saving warehouse:', error);
      }
    } else {
      // Fallback to localStorage
      const updatedWarehouses = editingWarehouse 
        ? localWarehouses.map(wh => wh.id === editingWarehouse.id ? { ...wh, ...newWarehouse } : wh)
        : [...localWarehouses, { id: Date.now().toString(), ...newWarehouse }];
      setLocalWarehouses(updatedWarehouses);
      setLocalWarehouses(updatedWarehouses);
      setIsFormOpen(false);
      toast.success(`Warehouse ${editingWarehouse ? 'updated' : 'created'} successfully (local storage)`);
    }
  };

  return (
    <div className={cn(
      "space-y-4",
      isMobile ? "p-2" : ""
    )}>
      <Card>
        <CardHeader>
          <CardTitle className={cn(
            "flex items-center justify-between",
            isMobile ? "text-lg" : ""
          )}>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Warehouses
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={handleAddWarehouse}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Warehouse
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}</DialogTitle>
                </DialogHeader>
                <WarehouseForm 
                  onSubmit={handleFormSubmit} 
                  onCancel={() => setIsFormOpen(false)}
                  initialData={editingWarehouse} 
                />
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading warehouses...</span>
            </div>
          ) : (
            <>
              {!isBackendAvailable && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Backend unavailable. Using local storage. Changes will sync when backend is available.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                {warehouses.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No warehouses available. Click "Add Warehouse" to get started.
                  </p>
                ) : (
                  warehouses.map(warehouse => (
                    <div key={warehouse.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50">
                      <div>
                        <p className="font-medium">{warehouse.name}</p>
                        {warehouse.code && (
                          <p className="text-sm text-muted-foreground">Code: {warehouse.code}</p>
                        )}
                        {warehouse.address && (
                          <p className="text-sm text-muted-foreground">{warehouse.address}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditWarehouse(warehouse)}
                          disabled={updateWarehouseMutation.isPending}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteWarehouse(warehouse.id)}
                          disabled={deleteWarehouseMutation.isPending}
                        >
                          {deleteWarehouseMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseManager;

