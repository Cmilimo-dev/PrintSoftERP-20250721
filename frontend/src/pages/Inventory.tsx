import React, { useState, Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import InventoryDashboard from '@/components/inventory/InventoryDashboard';
import ProductForm from '@/components/inventory/ProductForm';
import ProductList from '@/components/inventory/ProductList';
import StockMovementForm from '@/components/inventory/StockMovementForm';
import ProductCategoryManager from '@/components/inventory/ProductCategoryManager';
import StockMovementTracker from '@/components/inventory/StockMovementTracker';
import EnhancedInventoryDashboard from '@/components/inventory/EnhancedInventoryDashboard';
import WarehouseManager from '@/components/inventory/WarehouseManager';
import { useStockMovements } from '@/hooks/useInventory';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Plus, Package, TrendingUp, ArrowUpDown, Tags, ArrowRightLeft, Warehouse, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Inventory: React.FC = () => {
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const { data: stockMovements } = useStockMovements();
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "container mx-auto space-y-6",
      isMobile ? "p-4" : "p-6"
    )}>
      <div className={cn(
        "flex items-center",
        isMobile ? "flex-col space-y-4" : "justify-between"
      )}>
        <div className={isMobile ? "text-center" : ""}>
          <h1 className={cn(
            "font-bold",
            isMobile ? "text-2xl" : "text-3xl"
          )}>Inventory Management</h1>
          <p className={cn(
            "text-gray-600",
            isMobile ? "text-sm" : ""
          )}>Manage your products, stock movements, and inventory levels</p>
        </div>
        <div className={cn(
          "flex gap-2",
          isMobile ? "w-full flex-col" : "flex-row"
        )}>
          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogTrigger asChild>
              <Button className={isMobile ? "w-full justify-center" : ""}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className={cn(
              "max-h-[90vh] overflow-y-auto",
              isMobile ? "w-[95vw] max-w-[95vw]" : "max-w-4xl"
            )}>
              <DialogHeader>
                <DialogTitle className={isMobile ? "text-lg" : ""}>Add New Product</DialogTitle>
              </DialogHeader>
              <ProductForm onSubmit={() => setIsProductDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className={isMobile ? "w-full justify-center" : ""}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Stock Movement
              </Button>
            </DialogTrigger>
            <DialogContent className={cn(
              isMobile ? "w-[95vw] max-w-[95vw]" : "max-w-2xl"
            )}>
              <DialogHeader>
                <DialogTitle className={isMobile ? "text-lg" : ""}>Record Stock Movement</DialogTitle>
              </DialogHeader>
              <StockMovementForm onSubmit={() => setIsMovementDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <InventoryDashboard />

      <Tabs defaultValue="products" className="w-full">
        <TabsList className={cn(
          "w-full",
          isMobile ? "flex justify-start overflow-x-auto gap-1 p-1" : "grid grid-cols-5"
        )}>
          <TabsTrigger 
            value="products" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : ""
            )}
          >
            <Package className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={cn(
              isMobile ? "text-xs whitespace-nowrap" : ""
            )}>Products</span>
          </TabsTrigger>
          <TabsTrigger 
            value="categories" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : ""
            )}
          >
            <Tags className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={cn(
              isMobile ? "text-xs whitespace-nowrap" : ""
            )}>Categories</span>
          </TabsTrigger>
          <TabsTrigger 
            value="movements" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : ""
            )}
          >
            <ArrowRightLeft className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={cn(
              isMobile ? "text-xs whitespace-nowrap" : ""
            )}>{isMobile ? "Movements" : "Stock Movements"}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="warehouses" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : ""
            )}
          >
            <Warehouse className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={cn(
              isMobile ? "text-xs whitespace-nowrap" : ""
            )}>Warehouses</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : ""
            )}
          >
            <BarChart3 className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={cn(
              isMobile ? "text-xs whitespace-nowrap" : ""
            )}>Analytics</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <ProductList />
        </TabsContent>
        
        <TabsContent value="categories">
          <ProductCategoryManager />
        </TabsContent>
        
        <TabsContent value="movements">
          <StockMovementTracker />
        </TabsContent>
        
        <TabsContent value="warehouses">
          <WarehouseManager />
        </TabsContent>
        
        <TabsContent value="analytics">
          <InventoryDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
