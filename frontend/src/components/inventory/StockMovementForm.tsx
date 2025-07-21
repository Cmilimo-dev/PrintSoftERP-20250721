
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useProducts, useWarehouses, useCreateStockMovement } from '@/hooks/useInventory';
import { StockMovement } from '@/types/inventory';

interface StockMovementFormProps {
  onSubmit?: () => void;
}

const StockMovementForm: React.FC<StockMovementFormProps> = ({ onSubmit }) => {
  const { data: products } = useProducts();
  const { data: warehouses } = useWarehouses();
  const createStockMovement = useCreateStockMovement();
  
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<Omit<StockMovement, 'id' | 'created_at'>>({
    defaultValues: {
      movement_type: 'in',
      reference_type: 'adjustment'
    }
  });

  const onFormSubmit = async (data: Omit<StockMovement, 'id' | 'created_at'>) => {
    try {
      console.log('Form submitted with data:', data);
      
      // Set default values for required fields
      const movementData = {
        ...data,
        movement_type: data.movement_type || 'in' as const,
        reference_type: data.reference_type || 'adjustment'
      };
      
      console.log('Processed stock movement data before submission:', movementData);
      
      await createStockMovement.mutateAsync(movementData);
      console.log('Stock movement created successfully, resetting form');
      reset();
      onSubmit?.();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Stock Movement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product_id">Product *</Label>
              <Select onValueChange={(value) => setValue('product_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.sku} - {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="warehouse_id">Warehouse *</Label>
              <Select onValueChange={(value) => setValue('warehouse_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses?.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.code} - {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="movement_type">Movement Type *</Label>
              <Select onValueChange={(value) => setValue('movement_type', value as 'in' | 'out' | 'transfer' | 'adjustment')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Stock In</SelectItem>
                  <SelectItem value="out">Stock Out</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                {...register('quantity', { required: 'Quantity is required', valueAsNumber: true })}
                placeholder="Enter quantity"
              />
              {errors.quantity && <span className="text-destructive text-sm">{errors.quantity.message}</span>}
            </div>
            <div>
              <Label htmlFor="reference_type">Reference Type</Label>
              <Select onValueChange={(value) => setValue('reference_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase_order">Purchase Order</SelectItem>
                  <SelectItem value="sales_order">Sales Order</SelectItem>
                  <SelectItem value="adjustment">Manual Adjustment</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="reference_id">Reference ID</Label>
            <Input
              id="reference_id"
              {...register('reference_id')}
              placeholder="Enter reference document ID"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Enter additional notes"
            />
          </div>

          <Button type="submit" disabled={createStockMovement.isPending}>
            {createStockMovement.isPending ? 'Recording...' : 'Record Movement'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StockMovementForm;
