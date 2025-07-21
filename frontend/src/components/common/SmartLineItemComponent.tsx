import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, useFieldArray, Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  Trash2, 
  Package, 
  Calculator, 
  Scan,
  Upload,
  Edit2,
  Check,
  X,
  ChevronDown,
  AlertCircle,
  Barcode
} from 'lucide-react';
import { LineItem } from '@/types/businessDocuments';
import { useProducts, useCreateProduct } from '@/hooks/useInventory';
import { useIsMobile } from '@/hooks/useIsMobile';
import { MobileFormLayout } from '@/components/ui/mobile-form-layout';

interface Product {
  id: string;
  itemCode: string;
  description: string;
  unitPrice: number;
  stockQuantity?: number;
  category?: string;
  barcode?: string;
  taxRate?: number;
  unit?: string;
}

interface SmartLineItemProps {
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
  currency?: string;
  taxSettings?: {
    type: 'inclusive' | 'exclusive' | 'per_item' | 'overall';
    defaultRate: number;
    customRates?: { [key: string]: number };
  };
  documentType: 'purchase-order' | 'sales-order' | 'quote' | 'invoice' | 'delivery-note' | 'goods-receiving-voucher' | 'inventory-adjustment';
  readOnly?: boolean;
  showStock?: boolean;
  enableBulkImport?: boolean;
  enableBarcodeScanning?: boolean;
  onProductCreate?: (product: Omit<Product, 'id'>) => Promise<Product>;
}

interface EditingState {
  rowIndex: number;
  field: string;
  value: string | number;
}

const SmartLineItemComponent: React.FC<SmartLineItemProps> = ({
  items,
  onItemsChange,
  currency = 'KES',
  taxSettings = { type: 'exclusive', defaultRate: 0 },
  documentType,
  readOnly = false,
  showStock = false,
  enableBulkImport = false,
  enableBarcodeScanning = false,
  onProductCreate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [bulkImportDialog, setBulkImportDialog] = useState(false);
  const [barcodeScanning, setBarcodeScanning] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Use real inventory data
  const { data: products = [], isLoading: productsLoading, error: productsError } = useProducts();
  const createProductMutation = useCreateProduct();

  // Transform real product data to match component interface
  const transformedProducts: Product[] = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    
    return products.map((product: any) => ({
      id: product.id,
      itemCode: product.part_number || product.sku || '',
      description: product.name || product.description || '',
      unitPrice: product.selling_price || product.unit_price || 0,
      stockQuantity: product.current_stock || product.stock_quantity || 0,
      category: product.category_name || 'General',
      taxRate: product.tax_rate || 16,
      unit: product.unit_of_measure || 'pcs',
      barcode: product.barcode
    }));
  }, [products]);

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setFilteredProducts([]);
      return;
    }
    
    const filtered = transformedProducts.filter(product =>
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProducts(filtered.slice(0, 10)); // Limit to 10 results for performance
  }, [searchTerm, transformedProducts]);

  // Calculate totals for a line item
  const calculateLineItemTotal = useCallback((item: LineItem): LineItem => {
    const subtotal = item.quantity * item.unitPrice;
    const taxRate = item.taxRate || taxSettings.defaultRate;
    let taxAmount = 0;
    let total = subtotal;

    if (taxSettings.type === 'exclusive') {
      taxAmount = (subtotal * taxRate) / 100;
      total = subtotal + taxAmount;
    } else if (taxSettings.type === 'inclusive') {
      taxAmount = (subtotal * taxRate) / (100 + taxRate);
      total = subtotal;
    }

    return {
      ...item,
      total,
      taxAmount
    };
  }, [taxSettings]);

  // Calculate document totals
  const calculateTotals = useCallback((items: LineItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalTax = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    const total = items.reduce((sum, item) => sum + item.total, 0);

    return { subtotal, totalTax, total };
  }, []);

  // Add new line item
  const addLineItem = (product?: Product) => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      productId: product?.id,
      itemCode: product?.itemCode || (product as any)?.sku || (product as any)?.part_number || '',
      description: product?.description || (product as any)?.name || '',
      quantity: 1,
      unitPrice: product?.unitPrice || (product as any)?.unit_price || (product as any)?.price || 0,
      total: 0,
      taxRate: product?.taxRate || (product as any)?.tax_rate || taxSettings.defaultRate,
      taxAmount: 0,
      unit: product?.unit || (product as any)?.unit_of_measure || 'pcs'
    };

    const calculatedItem = calculateLineItemTotal(newItem);
    const updatedItems = [...items, calculatedItem];
    onItemsChange(updatedItems);
    setSearchTerm('');
    setSelectedProduct(null);
  };

  // Update line item
  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate totals if quantity or unit price changed
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index] = calculateLineItemTotal(updatedItems[index]);
    }
    
    onItemsChange(updatedItems);
  };

  // Remove line item
  const removeLineItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
  };

  // Handle inline editing
  const startEditing = (rowIndex: number, field: string, currentValue: string | number) => {
    setEditingState({ rowIndex, field, value: currentValue });
  };

  const saveEdit = () => {
    if (!editingState) return;
    
    const { rowIndex, field, value } = editingState;
    updateLineItem(rowIndex, field as keyof LineItem, value);
    setEditingState(null);
  };

  const cancelEdit = () => {
    setEditingState(null);
  };

  // Handle product selection from search
  const selectProduct = (product: Product) => {
    addLineItem(product);
    setSearchTerm('');
    setFilteredProducts([]);
  };

  // Create new product dialog form
  const { register: registerProduct, handleSubmit: handleProductSubmit, reset: resetProduct } = useForm<Omit<Product, 'id'>>();

  const createNewProduct = async (data: Omit<Product, 'id'>) => {
    try {
      let newProduct: Product;
      
      if (onProductCreate) {
        newProduct = await onProductCreate(data);
      } else {
        // Use the createProduct mutation from useInventory
        const productData = {
          name: data.description,
          sku: data.itemCode,
          description: data.description,
          unit_price: data.unitPrice,
          cost_price: data.unitPrice * 0.7, // Default cost as 70% of selling price
          unit_of_measure: data.unit || 'pcs',
          minimum_stock: 10,
          maximum_stock: 1000,
          current_stock: data.stockQuantity || 0,
          is_active: true,
          is_serialized: false,
          tax_rate: data.taxRate || 16,
          lead_time_days: 1,
          warranty_period: null
        };
        
        const createdProduct = await createProductMutation.mutateAsync(productData);
        newProduct = {
          id: createdProduct.id,
          itemCode: createdProduct.part_number || createdProduct.sku,
          description: createdProduct.name,
          unitPrice: createdProduct.selling_price || createdProduct.unit_price,
          stockQuantity: createdProduct.current_stock || 0,
          category: 'General',
          taxRate: data.taxRate || 16,
          unit: createdProduct.unit_of_measure || 'pcs'
        };
      }
      
      addLineItem(newProduct);
      resetProduct();
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  // Bulk import handler
  const handleBulkImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const importedItems: LineItem[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 4) {
          const item: LineItem = {
            id: Date.now().toString() + i,
            itemCode: values[0]?.trim() || '',
            description: values[1]?.trim() || '',
            quantity: parseFloat(values[2]) || 1,
            unitPrice: parseFloat(values[3]) || 0,
            total: 0,
            taxRate: parseFloat(values[4]) || taxSettings.defaultRate,
            taxAmount: 0
          };
          importedItems.push(calculateLineItemTotal(item));
        }
      }
      
      onItemsChange([...items, ...importedItems]);
      setBulkImportDialog(false);
    };
    
    reader.readAsText(file);
  };

  // Memoize totals to prevent infinite re-renders
  const totals = React.useMemo(() => {
    if (!items || items.length === 0) {
      return { subtotal: 0, totalTax: 0, total: 0 };
    }
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalTax = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    const total = items.reduce((sum, item) => sum + item.total, 0);
    return { subtotal, totalTax, total };
  }, [items]);

const isMobile = useIsMobile();

  return isMobile ? (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Line Items
          </span>
          {!readOnly && (
            <Button 
              type="button" 
              onClick={() => addLineItem()}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Search and Add Product */}
          {!readOnly && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder={productsLoading ? "Loading products..." : "Search products..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={productsLoading}
                />
              {/* Search Results Dropdown */}
              {searchTerm.length >= 2 && (
                <div className="absolute top-full left-0 right-0 z-10 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {productsLoading ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      Loading products...
                    </div>
                  ) : productsError ? (
                    <div className="p-4 text-center text-red-600">
                      <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                      Error loading products
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => selectProduct(product)}
                      >
                        <div className="font-medium">{product.description}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {product.itemCode} • {currency} {product.unitPrice.toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No products found for "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
              </div>
              
              {/* Create Product Button for Mobile */}
              <div className="flex gap-2">
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm mx-4">
                    <DialogHeader>
                      <DialogTitle>Create New Product</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleProductSubmit(createNewProduct)} className="space-y-4">
                      <div>
                        <Label htmlFor="itemCode">Item Code</Label>
                        <Input
                          id="itemCode"
                          {...registerProduct('itemCode', { required: true })}
                          placeholder="PROD001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          {...registerProduct('description', { required: true })}
                          placeholder="Product description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          {...registerProduct('category')}
                          placeholder="Electronics"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="unitPrice">Unit Price</Label>
                          <Input
                            id="unitPrice"
                            type="number"
                            step="0.01"
                            {...registerProduct('unitPrice', { required: true, valueAsNumber: true })}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="taxRate">Tax Rate (%)</Label>
                          <Input
                            id="taxRate"
                            type="number"
                            step="0.01"
                            {...registerProduct('taxRate', { valueAsNumber: true })}
                            placeholder={taxSettings.defaultRate.toString()}
                          />
                        </div>
                      </div>
                      {showStock && (
                        <div>
                          <Label htmlFor="stockQuantity">Stock Quantity</Label>
                          <Input
                            id="stockQuantity"
                            type="number"
                            {...registerProduct('stockQuantity', { valueAsNumber: true })}
                            placeholder="0"
                          />
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Create</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button 
                  type="button" 
                  onClick={() => addLineItem()}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Empty
                </Button>
              </div>
            </div>
          )}

          {/* Mobile Line Items */}
          {items.map((item, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  Item {index + 1}
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      className="text-destructive hover:text-destructive h-6 w-6 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Item Code */}
                <div>
                  <Label className="text-xs text-muted-foreground">Item Code</Label>
                  {editingState?.rowIndex === index && editingState?.field === 'itemCode' ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingState.value || ''}
                        onChange={(e) =>
                          setEditingState({ ...editingState, value: e.target.value })
                        }
                        className="h-8"
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={saveEdit}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={!readOnly ? "cursor-pointer hover:bg-gray-100 p-2 rounded border" : "p-2 border"}
                      onClick={() => !readOnly && startEditing(index, 'itemCode', item.itemCode)}
                    >
                      {item.itemCode || 'Tap to enter item code'}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  {editingState?.rowIndex === index && editingState?.field === 'description' ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingState.value || ''}
                        onChange={(e) =>
                          setEditingState({ ...editingState, value: e.target.value })
                        }
                        className="h-8"
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={saveEdit}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={!readOnly ? "cursor-pointer hover:bg-gray-100 p-2 rounded border" : "p-2 border"}
                      onClick={() => !readOnly && startEditing(index, 'description', item.description)}
                    >
                      {item.description || 'Tap to enter description'}
                    </div>
                  )}
                </div>

                {/* Quantity and Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Qty</Label>
                    {editingState?.rowIndex === index && editingState?.field === 'quantity' ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={editingState.value === 0 ? '' : editingState.value || ''}
                          onChange={(e) =>
                            setEditingState({ ...editingState, value: parseFloat(e.target.value) || 0 })
                          }
                          className="h-8"
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={saveEdit}>
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={!readOnly ? "cursor-pointer hover:bg-gray-100 p-2 rounded border" : "p-2 border"}
                        onClick={() => !readOnly && startEditing(index, 'quantity', item.quantity)}
                      >
                        {item.quantity ? item.quantity : 'Tap to enter qty'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Unit</Label>
                    {editingState?.rowIndex === index && editingState?.field === 'unit' ? (
                      <div className="flex items-center gap-1">
                        <Select
                          value={editingState.value as string || 'pcs'}
                          onValueChange={(value) =>
                            setEditingState({ ...editingState, value })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pcs">pcs</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="m">m</SelectItem>
                            <SelectItem value="l">l</SelectItem>
                            <SelectItem value="hr">hr</SelectItem>
                            <SelectItem value="box">box</SelectItem>
                            <SelectItem value="unit">unit</SelectItem>
                            <SelectItem value="set">set</SelectItem>
                            <SelectItem value="roll">roll</SelectItem>
                            <SelectItem value="sheet">sheet</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="ghost" onClick={saveEdit}>
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={!readOnly ? "cursor-pointer hover:bg-gray-100 p-2 rounded border" : "p-2 border"}
                        onClick={() => !readOnly && startEditing(index, 'unit', item.unit || 'pcs')}
                      >
                        {item.unit || 'pcs'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Unit Price */}
                <div>
                  <Label className="text-xs text-muted-foreground">Unit Price</Label>
                  {editingState?.rowIndex === index && editingState?.field === 'unitPrice' ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={editingState.value === 0 ? '' : editingState.value || ''}
                        onChange={(e) =>
                          setEditingState({ ...editingState, value: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8"
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={saveEdit}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={!readOnly ? "cursor-pointer hover:bg-gray-100 p-2 rounded border" : "p-2 border"}
                      onClick={() => !readOnly && startEditing(index, 'unitPrice', item.unitPrice)}
                    >
                      {item.unitPrice ? `${currency} ${item.unitPrice.toLocaleString()}` : 'Tap to enter price'}
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">{currency} {item.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty state */}
          {items.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No line items added yet.</p>
              {!readOnly && <p className="text-sm">Search for products above or add an empty line to get started.</p>}
            </div>
          )}

          {/* Totals Section */}
          {items.length > 0 && (
            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{currency} {totals.subtotal.toLocaleString()}</span>
                  </div>
                  {taxSettings.type !== 'overall' && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{currency} {totals.totalTax.toLocaleString()}</span>
                    </div>
                  )}
                  {taxSettings.type === 'overall' && (
                    <div className="flex justify-between">
                      <span>Tax ({taxSettings.defaultRate}%):</span>
                      <span>{currency} {((totals.subtotal * taxSettings.defaultRate) / 100).toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>
                      {currency} {
                        taxSettings.type === 'overall' 
                          ? (totals.subtotal + (totals.subtotal * taxSettings.defaultRate) / 100).toLocaleString()
                          : totals.total.toLocaleString()
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Line Items
          </span>
          <div className="flex items-center gap-2">
            {enableBarcodeScanning && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBarcodeScanning(!barcodeScanning)}
              >
                <Barcode className="h-4 w-4 mr-2" />
                Scan
              </Button>
            )}
            {enableBulkImport && (
              <Dialog open={bulkImportDialog} onOpenChange={setBulkImportDialog}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Import Line Items</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Upload a CSV file with columns: Item Code, Description, Quantity, Unit Price, Tax Rate (optional)
                    </p>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleBulkImport}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Add Product */}
          {!readOnly && (
            <div className="relative">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder={productsLoading ? "Loading products..." : "Search products or scan barcode..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    disabled={productsLoading}
                  />
                  {/* Search Results Dropdown */}
                  {searchTerm.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {productsLoading ? (
                        <div className="p-4 text-center text-muted-foreground">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                          Loading products...
                        </div>
                      ) : productsError ? (
                        <div className="p-4 text-center text-red-600">
                          <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                          Error loading products
                        </div>
                      ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => selectProduct(product)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{product.description}</div>
                                <div className="text-sm text-muted-foreground">
                                  Code: {product.itemCode}
                                  {showStock && product.stockQuantity !== undefined && (
                                    <span className="ml-2">Stock: {product.stockQuantity}</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{currency} {product.unitPrice.toLocaleString()}</div>
                                {product.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {product.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          No products found for "{searchTerm}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="flex-shrink-0">
                      <Plus className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Create Product</span>
                      <span className="sm:hidden">Create</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create New Product</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleProductSubmit(createNewProduct)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="itemCode">Item Code</Label>
                          <Input
                            id="itemCode"
                            {...registerProduct('itemCode', { required: true })}
                            placeholder="PROD001"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            {...registerProduct('category')}
                            placeholder="Electronics"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          {...registerProduct('description', { required: true })}
                          placeholder="Product description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="unitPrice">Unit Price</Label>
                          <Input
                            id="unitPrice"
                            type="number"
                            step="0.01"
                            {...registerProduct('unitPrice', { required: true, valueAsNumber: true })}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="taxRate">Tax Rate (%)</Label>
                          <Input
                            id="taxRate"
                            type="number"
                            step="0.01"
                            {...registerProduct('taxRate', { valueAsNumber: true })}
                            placeholder={taxSettings.defaultRate.toString()}
                          />
                        </div>
                      </div>
                      {showStock && (
                        <div>
                          <Label htmlFor="stockQuantity">Stock Quantity</Label>
                          <Input
                            id="stockQuantity"
                            type="number"
                            {...registerProduct('stockQuantity', { valueAsNumber: true })}
                            placeholder="0"
                          />
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Create Product</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    type="button" 
                    onClick={() => addLineItem()}
                    variant="outline"
                    className="flex-shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Add Empty Line</span>
                    <span className="sm:hidden">Add Line</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Line Items Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium">Item Code</th>
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-center p-3 font-medium">Qty</th>
                    <th className="text-right p-3 font-medium">Unit Price</th>
                    {taxSettings.type !== 'overall' && (
                      <th className="text-right p-3 font-medium">Tax %</th>
                    )}
                    <th className="text-right p-3 font-medium">Total</th>
                    {!readOnly && <th className="text-center p-3 font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id || index} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        {editingState?.rowIndex === index && editingState?.field === 'itemCode' ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editingState.value || ''}
                              onChange={(e) =>
                                setEditingState({ ...editingState, value: e.target.value })
                              }
                              className="h-8"
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={saveEdit}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            className={!readOnly ? "cursor-pointer hover:bg-gray-100 p-1 rounded" : ""}
                            onClick={() => !readOnly && startEditing(index, 'itemCode', item.itemCode)}
                          >
                            {item.itemCode || 'N/A'}
                            {!readOnly && <Edit2 className="inline h-3 w-3 ml-1 opacity-0 hover:opacity-100" />}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {editingState?.rowIndex === index && editingState?.field === 'description' ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editingState.value || ''}
                              onChange={(e) =>
                                setEditingState({ ...editingState, value: e.target.value })
                              }
                              className="h-8"
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={saveEdit}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            className={!readOnly ? "cursor-pointer hover:bg-gray-100 p-1 rounded" : ""}
                            onClick={() => !readOnly && startEditing(index, 'description', item.description)}
                          >
                            {item.description}
                            {!readOnly && <Edit2 className="inline h-3 w-3 ml-1 opacity-0 hover:opacity-100" />}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {editingState?.rowIndex === index && (editingState?.field === 'quantity' || editingState?.field === 'unit') ? (
                          <div className="flex items-center gap-1 justify-center">
                            {editingState?.field === 'quantity' ? (
                              <Input
                                type="number"
                                value={editingState.value || 0}
                                onChange={(e) =>
                                  setEditingState({ ...editingState, value: parseFloat(e.target.value) || 0 })
                                }
                                className="h-8 w-20"
                                autoFocus
                              />
                            ) : (
                              <Select
                                value={editingState.value as string || 'pcs'}
                                onValueChange={(value) =>
                                  setEditingState({ ...editingState, value })
                                }
                              >
                                <SelectTrigger className="h-8 w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pcs">pcs</SelectItem>
                                  <SelectItem value="kg">kg</SelectItem>
                                  <SelectItem value="m">m</SelectItem>
                                  <SelectItem value="l">l</SelectItem>
                                  <SelectItem value="hr">hr</SelectItem>
                                  <SelectItem value="box">box</SelectItem>
                                  <SelectItem value="unit">unit</SelectItem>
                                  <SelectItem value="set">set</SelectItem>
                                  <SelectItem value="roll">roll</SelectItem>
                                  <SelectItem value="sheet">sheet</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <Button size="sm" variant="ghost" onClick={saveEdit}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <div
                              className={!readOnly ? "cursor-pointer hover:bg-gray-100 p-1 rounded" : ""}
                              onClick={() => !readOnly && startEditing(index, 'quantity', item.quantity)}
                            >
                              {item.quantity}
                              {!readOnly && <Edit2 className="inline h-3 w-3 ml-1 opacity-0 hover:opacity-100" />}
                            </div>
                            <div
                              className={!readOnly ? "cursor-pointer hover:bg-gray-100 p-1 rounded text-xs" : "text-xs"}
                              onClick={() => !readOnly && startEditing(index, 'unit', item.unit || 'pcs')}
                            >
                              {item.unit || 'pcs'}
                              {!readOnly && <Edit2 className="inline h-3 w-3 ml-1 opacity-0 hover:opacity-100" />}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {editingState?.rowIndex === index && editingState?.field === 'unitPrice' ? (
                          <div className="flex items-center gap-1 justify-end">
                            <Input
                              type="number"
                              step="0.01"
                              value={editingState.value || 0}
                              onChange={(e) =>
                                setEditingState({ ...editingState, value: parseFloat(e.target.value) || 0 })
                              }
                              className="h-8 w-24"
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={saveEdit}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            className={!readOnly ? "cursor-pointer hover:bg-gray-100 p-1 rounded text-right" : "text-right"}
                            onClick={() => !readOnly && startEditing(index, 'unitPrice', item.unitPrice)}
                          >
                            {currency} {item.unitPrice.toLocaleString()}
                            {!readOnly && <Edit2 className="inline h-3 w-3 ml-1 opacity-0 hover:opacity-100" />}
                          </div>
                        )}
                      </td>
                      {taxSettings.type !== 'overall' && (
                        <td className="p-3 text-right">
                          {editingState?.rowIndex === index && editingState?.field === 'taxRate' ? (
                            <div className="flex items-center gap-1 justify-end">
                              <Input
                                type="number"
                                step="0.01"
                                value={editingState.value || 0}
                                onChange={(e) =>
                                  setEditingState({ ...editingState, value: parseFloat(e.target.value) || 0 })
                                }
                                className="h-8 w-20"
                                autoFocus
                              />
                              <Button size="sm" variant="ghost" onClick={saveEdit}>
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              className={!readOnly ? "cursor-pointer hover:bg-gray-100 p-1 rounded text-right" : "text-right"}
                              onClick={() => !readOnly && startEditing(index, 'taxRate', item.taxRate || 0)}
                            >
                              {(item.taxRate || 0).toFixed(1)}%
                              {!readOnly && <Edit2 className="inline h-3 w-3 ml-1 opacity-0 hover:opacity-100" />}
                            </div>
                          )}
                        </td>
                      )}
                      <td className="p-3 text-right font-medium">
                        {currency} {item.total.toLocaleString()}
                      </td>
                      {!readOnly && (
                        <td className="p-3 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={readOnly ? 5 : 6} className="p-8 text-center text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No line items added yet.</p>
                        {!readOnly && <p className="text-sm">Search for products above or add an empty line to get started.</p>}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <Separator />
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{currency} {totals.subtotal.toLocaleString()}</span>
              </div>
              {taxSettings.type !== 'overall' && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{currency} {totals.totalTax.toLocaleString()}</span>
                </div>
              )}
              {taxSettings.type === 'overall' && (
                <div className="flex justify-between">
                  <span>Tax ({taxSettings.defaultRate}%):</span>
                  <span>{currency} {((totals.subtotal * taxSettings.defaultRate) / 100).toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>
                  {currency} {
                    taxSettings.type === 'overall' 
                      ? (totals.subtotal + (totals.subtotal * taxSettings.defaultRate) / 100).toLocaleString()
                      : totals.total.toLocaleString()
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Warning for low stock */}
          {showStock && items.some(item => {
            const product = transformedProducts.find(p => p.id === item.productId);
            return product && product.stockQuantity !== undefined && product.stockQuantity < item.quantity;
          }) && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Some items have insufficient stock quantities.
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartLineItemComponent;
