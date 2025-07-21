
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useProducts, useCreateProduct } from '@/hooks/useInventory';
import { LineItem } from '@/types/businessDocuments';
import { Product } from '@/types/inventory';
import { Search, Package, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InventorySelectorProps {
  item: LineItem;
  onUpdate: (updates: Partial<LineItem>) => void;
  showStock?: boolean;
  allowNewItems?: boolean;
}

const InventorySelector: React.FC<InventorySelectorProps> = ({ 
  item, 
  onUpdate, 
  showStock = true,
  allowNewItems = false 
}) => {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    sku: '',
    name: '',
    description: '',
    unit_price: 0,
    cost_price: 0,
    unit_of_measure: 'pcs',
    category_id: '',
    minimum_stock: 0,
    reorder_point: 0
  });

  const filteredProducts = products?.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleProductSelect = (productId: string) => {
    const selectedProduct = products?.find(p => p.id === productId);
    if (selectedProduct) {
      onUpdate({
        productId: selectedProduct.id,
        itemCode: selectedProduct.sku || '',
        description: selectedProduct.name || '',
        unitPrice: Number(selectedProduct.unit_price) || 0,
        total: (item.quantity || 1) * (Number(selectedProduct.unit_price) || 0)
      });
    }
  };

  const handleCreateNewItem = async () => {
    try {
      const productData = {
        sku: newItem.sku,
        name: newItem.name,
        description: newItem.description,
        unit_price: newItem.unit_price,
        cost_price: newItem.cost_price,
        unit_of_measure: newItem.unit_of_measure,
        category_id: newItem.category_id || null,
        minimum_stock: newItem.minimum_stock,
        reorder_point: newItem.reorder_point,
        current_stock: 0,
        maximum_stock: null,
        lead_time_days: 1,
        is_serialized: false,
        is_active: true,
        tax_rate: 16,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await createProduct.mutateAsync(productData);
      
      // Update the line item with the new product data
      onUpdate({
        itemCode: newItem.sku,
        description: newItem.name,
        unitPrice: newItem.unit_price,
        total: (item.quantity || 1) * newItem.unit_price
      });

      setShowNewItemDialog(false);
      setNewItem({
        sku: '',
        name: '',
        description: '',
        unit_price: 0,
        cost_price: 0,
        unit_of_measure: 'pcs',
        category_id: '',
        minimum_stock: 0,
        reorder_point: 0
      });

      toast({
        title: "Success",
        description: "New inventory item created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new inventory item",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading inventory...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">Search Inventory</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div>
          <Label className="text-sm">Select Product</Label>
          <div className="flex gap-2">
            <Select onValueChange={handleProductSelect}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose from inventory" />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>SKU: {product.sku}</span>
                          {showStock && (
                            <span>Stock: {product.current_stock || 0}</span>
                          )}
                          <span>KES {Number(product.unit_price).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {allowNewItems && (
              <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Inventory Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>SKU</Label>
                        <Input
                          value={newItem.sku}
                          onChange={(e) => setNewItem(prev => ({ ...prev, sku: e.target.value }))}
                          placeholder="e.g., ITEM-001"
                        />
                      </div>
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={newItem.name}
                          onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Product name"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={newItem.description}
                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Product description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newItem.unit_price}
                          onChange={(e) => setNewItem(prev => ({ ...prev, unit_price: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label>Cost Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newItem.cost_price}
                          onChange={(e) => setNewItem(prev => ({ ...prev, cost_price: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Minimum Stock</Label>
                        <Input
                          type="number"
                          value={newItem.minimum_stock}
                          onChange={(e) => setNewItem(prev => ({ ...prev, minimum_stock: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label>Reorder Point</Label>
                        <Input
                          type="number"
                          value={newItem.reorder_point}
                          onChange={(e) => setNewItem(prev => ({ ...prev, reorder_point: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewItemDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateNewItem} disabled={!newItem.sku || !newItem.name}>
                        Create Item
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">Item Code</Label>
          <Input
            value={item.itemCode}
            onChange={(e) => onUpdate({ itemCode: e.target.value })}
            placeholder="Product SKU/Code"
          />
        </div>
        <div>
          <Label className="text-sm">Unit Price</Label>
          <Input
            type="number"
            step="0.01"
            value={item.unitPrice}
            onChange={(e) => onUpdate({ unitPrice: Number(e.target.value) })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm">Description</Label>
        <Input
          value={item.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Product description"
        />
      </div>
    </div>
  );
};

export default InventorySelector;
