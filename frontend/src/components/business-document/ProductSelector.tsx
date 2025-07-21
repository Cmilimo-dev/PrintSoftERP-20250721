
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/useInventory';
import { LineItem } from '@/types/businessDocuments';
import { Search, Package } from 'lucide-react';

interface ProductSelectorProps {
  item: LineItem;
  onUpdate: (updates: Partial<LineItem>) => void;
  showStock?: boolean;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ item, onUpdate, showStock = true }) => {
  const { data: products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products?.filter(p => {
    const name = p.name?.toLowerCase() || '';
    const sku = (p.sku || p.part_number)?.toLowerCase() || '';
    const description = p.description?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return name.includes(searchLower) || 
           sku.includes(searchLower) || 
           description.includes(searchLower);
  }) || [];

  const handleProductSelect = (productId: string) => {
    const selectedProduct = products?.find(p => p.id === productId);
    if (selectedProduct) {
      // Handle both transformed and raw product data
      const sku = selectedProduct.sku || selectedProduct.part_number || '';
      const name = selectedProduct.name || '';
      const unitPrice = Number(selectedProduct.unit_price) || 0;
      
      onUpdate({
        productId: selectedProduct.id,
        itemCode: sku,
        description: name,
        unitPrice: unitPrice,
        total: (item.quantity || 1) * unitPrice
      });
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading products...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">Product Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div>
          <Label className="text-sm">Select Product</Label>
          <Select onValueChange={handleProductSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose product" />
            </SelectTrigger>
            <SelectContent>
              {filteredProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>SKU: {product.sku || product.part_number}</span>
                        {showStock && (
                          <span>Stock: {product.current_stock || product.stock_quantity || 0}</span>
                        )}
                        <span>KES {Number(product.unit_price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

export default ProductSelector;
