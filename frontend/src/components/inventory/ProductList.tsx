
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveTable, StatusBadge } from '@/components/ui/responsive-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useInventory';
import { AlertTriangle, Package, Plus, Edit, Trash2 } from 'lucide-react';
import ProductForm from './ProductForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ProductList: React.FC = () => {
  const { data: products, isLoading, refetch } = useProducts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      // Get current products from localStorage
      const storedProducts = localStorage.getItem('erp_products');
      if (storedProducts) {
        const products = JSON.parse(storedProducts);
        const updatedProducts = products.filter((p: any) => p.id !== productId);
        localStorage.setItem('erp_products', JSON.stringify(updatedProducts));
        refetch(); // Refresh the product list
      }
    }
  };

  const handleFormSubmit = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    refetch(); // Refresh the product list
  };

  const getStockStatus = (product: any) => {
    if (product.current_stock <= 0) {
      return { status: 'Out of Stock', variant: 'destructive' as const, icon: AlertTriangle };
    } else if (product.current_stock <= product.reorder_point) {
      return { status: 'Low Stock', variant: 'secondary' as const, icon: AlertTriangle };
    } else {
      return { status: 'In Stock', variant: 'default' as const, icon: Package };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products Inventory
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <ProductForm onSubmit={handleFormSubmit} />
            </DialogContent>
            </Dialog>
            
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                <ProductForm 
                  onSubmit={handleFormSubmit}
                  initialData={editingProduct} 
                />
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
      <CardContent>
        <ResponsiveTable
          data={products || []}
          loading={isLoading}
          columns={[
            {
              key: 'sku',
              header: 'SKU',
              className: 'font-medium',
            },
            {
              key: 'name',
              header: 'Product Name',
            },
            {
              key: 'current_stock',
              header: 'Stock',
              render: (value, row) => `${value} ${row.unit_of_measure}`,
            },
            {
              key: 'unit_price',
              header: 'Price',
              mobileHide: true,
              render: (price) => {
                const numericPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
                return `KES ${numericPrice.toFixed(2)}`;
              },
            },
            {
              key: 'reorder_point',
              header: 'Reorder Point',
              mobileHide: true,
            },
            {
              key: 'status',
              header: 'Stock Status',
              render: (value, row) => {
                const stockInfo = getStockStatus(row);
                const StockIcon = stockInfo.icon;
                return (
                  <Badge variant={stockInfo.variant} className="flex items-center gap-1 w-fit">
                    <StockIcon className="h-3 w-3" />
                    {stockInfo.status}
                  </Badge>
                );
              },
            },
            {
              key: 'is_active',
              header: 'Active',
              mobileHide: true,
              render: (isActive) => (
                <StatusBadge status={isActive ? 'Active' : 'Inactive'} />
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (value, row) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditProduct(row)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteProduct(row.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default ProductList;
