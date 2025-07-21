
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, Search, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineItem, TaxSettings } from '@/types/businessDocuments';
import { useProducts } from '@/hooks/useInventory';

// Simple currency symbol function
const getCurrencySymbol = (currency: string) => {
  const symbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'KES': 'KSh',
    'CAD': 'C$',
    'AUD': 'A$'
  };
  return symbols[currency] || currency;
};

// Product interface
interface Product {
  id: string;
  name: string;
  part_number: string;
  unit_price?: number;
  cost_price?: number;
  description?: string;
  unit_of_measure?: string;
}

// New product creation dialog
interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onCreateProduct: (product: Omit<Product, 'id'>) => void;
}

const CreateProductDialog: React.FC<CreateProductDialogProps> = ({
  open,
  onOpenChange,
  itemName,
  onCreateProduct
}) => {
  const [formData, setFormData] = useState({
    name: itemName,
    part_number: '',
    unit_price: 0,
    cost_price: 0,
    description: '',
    unit_of_measure: 'each'
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, name: itemName }));
  }, [itemName]);

  const handleSubmit = () => {
    if (formData.name && formData.part_number) {
      onCreateProduct(formData);
      onOpenChange(false);
      setFormData({
        name: '',
        part_number: '',
        unit_price: 0,
        cost_price: 0,
        description: '',
        unit_of_measure: 'each'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Product Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter product name"
            />
          </div>
          <div>
            <Label>Part Number</Label>
            <Input
              value={formData.part_number}
              onChange={(e) => setFormData(prev => ({ ...prev, part_number: e.target.value }))}
              placeholder="Enter part number"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Unit Price</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label>Cost Price</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description"
            />
          </div>
          <div>
            <Label>Unit of Measure</Label>
            <Input
              value={formData.unit_of_measure}
              onChange={(e) => setFormData(prev => ({ ...prev, unit_of_measure: e.target.value }))}
              placeholder="e.g., each, kg, liter"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name || !formData.part_number}>
            Create Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Product search combobox
interface ProductSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  onProductSelect: (product: Product) => void;
  onCreateNew: (name: string) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  value,
  onValueChange,
  onProductSelect,
  onCreateNew
}) => {
  const [open, setOpen] = useState(false);
  const { data: products = [], isLoading } = useProducts();
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(value.toLowerCase()) ||
    product.part_number.toLowerCase().includes(value.toLowerCase())
  );

  const handleSelect = (product: Product) => {
    onValueChange(product.name);
    onProductSelect(product);
    setOpen(false);
  };

  const handleCreateNew = () => {
    onCreateNew(value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || "Search or add product..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search products..."
            value={value}
            onValueChange={onValueChange}
          />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>Loading products...</CommandEmpty>
            ) : filteredProducts.length === 0 ? (
              <CommandGroup>
                <CommandItem onSelect={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create "{value}" as new product
                </CommandItem>
              </CommandGroup>
            ) : (
              <CommandGroup>
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    onSelect={() => handleSelect(product)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === product.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{product.name}</span>
                      <span className="text-sm text-muted-foreground">{product.part_number}</span>
                    </div>
                  </CommandItem>
                ))}
                {value && !filteredProducts.some(p => p.name.toLowerCase() === value.toLowerCase()) && (
                  <CommandItem onSelect={handleCreateNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{value}" as new product
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

interface LineItemsSectionProps {
  items: LineItem[];
  taxSettings: TaxSettings;
  currency: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  onUpdateItem: (index: number, field: keyof LineItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  hidePricing?: boolean;
}

const LineItemsSection: React.FC<LineItemsSectionProps> = ({
  items,
  taxSettings,
  currency,
  subtotal,
  taxAmount,
  total,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  hidePricing = false
}) => {
  const currencySymbol = getCurrencySymbol(currency);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);

  const handleProductSelect = (index: number, product: Product) => {
    onUpdateItem(index, 'itemCode', product.part_number);
    onUpdateItem(index, 'description', product.name);
    if (product.unit_price) {
      onUpdateItem(index, 'unitPrice', product.unit_price);
    }
  };

  const handleCreateNew = (index: number, name: string) => {
    setCurrentItemIndex(index);
    setNewProductName(name);
    setCreateDialogOpen(true);
  };

  const handleCreateProduct = (product: Omit<Product, 'id'>) => {
    if (currentItemIndex !== null) {
      onUpdateItem(currentItemIndex, 'itemCode', product.part_number);
      onUpdateItem(currentItemIndex, 'description', product.name);
      if (product.unit_price) {
        onUpdateItem(currentItemIndex, 'unitPrice', product.unit_price);
      }
    }
    setCurrentItemIndex(null);
    setNewProductName('');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Line Items</CardTitle>
            <Button type="button" onClick={onAddItem} size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Search & Select Product</Label>
                    <ProductSearch
                      value={item.description}
                      onValueChange={(value) => onUpdateItem(index, 'description', value)}
                      onProductSelect={(product) => handleProductSelect(index, product)}
                      onCreateNew={(name) => handleCreateNew(index, name)}
                    />
                  </div>
                  <div>
                    <Label>Item Code</Label>
                    <Input
                      value={item.itemCode}
                      onChange={(e) => onUpdateItem(index, 'itemCode', e.target.value)}
                      placeholder="Product code/SKU"
                    />
                  </div>
                </div>
                
                <div className={`grid gap-4 ${hidePricing ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      placeholder="1"
                    />
                  </div>
                  
                  {!hidePricing && (
                    <>
                      <div>
                        <Label>Unit Price ({currencySymbol})</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => onUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div className="flex items-end justify-between">
                        <div className="flex-1">
                          <Label>Line Total</Label>
                          <p className="text-lg font-semibold text-green-600">
                            {currencySymbol} {item.total.toFixed(2)}
                          </p>
                        </div>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => onRemoveItem(index)}
                            className="ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                  
                  {hidePricing && items.length > 1 && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {taxSettings.type === 'per_item' && !hidePricing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Tax Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.taxRate || taxSettings.defaultRate}
                        onChange={(e) => onUpdateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                        placeholder={taxSettings.defaultRate.toString()}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {!hidePricing && (
            <div className="mt-6 border-t pt-4">
              <div className="text-right space-y-2">
                <div className="flex justify-between text-lg">
                  <span>Subtotal:</span>
                  <span>{currencySymbol} {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Tax ({taxSettings.defaultRate}%):</span>
                  <span>{currencySymbol} {taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">{currencySymbol} {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateProductDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        itemName={newProductName}
        onCreateProduct={handleCreateProduct}
      />
    </>
  );
};

export default LineItemsSection;
