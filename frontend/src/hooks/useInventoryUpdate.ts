import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Inventory, StockMovement } from '@/types/inventory';

interface UpdateInventoryParams {
  productId: string;
  quantity: number;
  movementType: 'in' | 'out';
  referenceType: string;
  referenceId: string;
}

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateInventoryParams) => {
      // Here, you would send an HTTP request to your API
      // to update the inventory. Since we're simulating,
      // we'll just resolve after a delay.
      return new Promise<Inventory>((resolve) => {
        setTimeout(() => {
          resolve({
            id: 'mock-id',
            product_id: params.productId,
            warehouse_id: 'default-warehouse',
            quantity: params.quantity,
            reserved_quantity: 0,
            available_quantity: params.quantity,
            minimum_stock: 10,
            maximum_stock: 100,
            reorder_point: 20,
            last_counted_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }, 1000);
      });
    },
    onSuccess: (data, variables) => {
      console.log('Inventory updated successfully:', data);

      queryClient.setQueryData<Inventory[]>(['productInventory', variables.productId], old => {
        if (!old) return [data];
        return old.map(inv =>
          inv.product_id === variables.productId ? data : inv
        );
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['productInventory', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['stockMovementLogs', variables.referenceId] });
    },
  });
};

export const recordStockMovement = (params: UpdateInventoryParams) => {
  console.log('Recording stock movement:', params);
  // Simulate stock movement logging
  return new Promise<StockMovement>((resolve) => {
    setTimeout(() => {
      resolve({
        id: `sm-${Date.now()}`,
        product_id: params.productId,
        movement_type: params.movementType,
        quantity: params.quantity,
        reference_type: params.referenceType,
        reference_id: params.referenceId,
        notes: 'Simulated stock movement',
        created_at: new Date().toISOString(),
        created_by: 'system',
      });
    }, 500);
  });
};

