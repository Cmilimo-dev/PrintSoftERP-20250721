
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import InventoryDashboard from '@/components/inventory/InventoryDashboard';
import ProductForm from '@/components/inventory/ProductForm';
import ProductList from '@/components/inventory/ProductList';
import StockMovementForm from '@/components/inventory/StockMovementForm';
import ProductCategoryManager from '@/components/inventory/ProductCategoryManager';
import StockMovementTracker from '@/components/inventory/StockMovementTracker';
import EnhancedInventoryDashboard from '@/components/inventory/EnhancedInventoryDashboard';
import { useStockMovements } from '@/hooks/useInventory';
import { Plus, Package, TrendingUp, ArrowUpDown, Tags, ArrowRightLeft, Warehouse, BarChart3 } from 'lucide-react';

const Inventory: React.FC = () => {
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const { data: stockMovements } = useStockMovements();

  return (
    <div className="container mx-auto p-6 space-y-6">
    )}>
      <DashboardHeader
        title="Inventory Management"
      >
        <div className={cn(
          "flex gap-2",
          isMobile ? "flex-col w-full" : "flex-row"
        )}>
          <Button 
            onClick={() => setIsProductDialogOpen(true)}
            className={isMobile ? "w-full justify-center" : ""}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? "Add Product" : "Add Product"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setIsMovementDialogOpen(true)}
            className={isMobile ? "w-full justify-center" : ""}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {isMobile ? "Stock Movement" : "Stock Movement"}
          </Button>
        </div>
      </DashboardHeader>

      <InventoryDashboard />

      <Tabs defaultValue="products" className="w-full">
        <div className={cn(
          "w-full",
          isMobile ? "overflow-x-auto pb-2" : ""
        )}>
          <TabsList className={cn(
            "h-12",
            isMobile 
              ? "flex w-max min-w-full px-1" 
              : "grid w-full grid-cols-5"
          )}>
            <TabsTrigger 
              value="products" 
              className={cn(
                "flex items-center gap-2",
                isMobile ? "whitespace-nowrap px-4 h-10" : ""
              )}
            >
              <Package className="h-4 w-4" />
              {isMobile ? "Products" : "Products"}
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className={cn(
                "flex items-center gap-2",
                isMobile ? "whitespace-nowrap px-4 h-10" : ""
              )}
            >
              <Tags className="h-4 w-4" />
              {isMobile ? "Categories" : "Categories"}
            </TabsTrigger>
            <TabsTrigger 
              value="movements" 
              className={cn(
                "flex items-center gap-2",
                isMobile ? "whitespace-nowrap px-4 h-10" : ""
              )}
            >
              <ArrowRightLeft className="h-4 w-4" />
              {isMobile ? "Movements" : "Stock Movements"}
            </TabsTrigger>
            <TabsTrigger 
              value="warehouses" 
              className={cn(
                "flex items-center gap-2",
                isMobile ? "whitespace-nowrap px-4 h-10" : ""
              )}
            >
              <Warehouse className="h-4 w-4" />
              {isMobile ? "Warehouses" : "Warehouses"}
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard" 
              className={cn(
                "flex items-center gap-2",
                isMobile ? "whitespace-nowrap px-4 h-10" : ""
              )}
            >
              <BarChart3 className="h-4 w-4" />
              {isMobile ? "Analytics" : "Analytics"}
            </TabsTrigger>
          </TabsList>
        </div>
        
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
          <EnhancedInventoryDashboard />
        </TabsContent>
        
        <TabsContent value="dashboard">
          <InventoryDashboard />
        </TabsContent>
      </Tabs>
      
      {/* Add Product Dialog */}
      <MobileDialog 
        open={isProductDialogOpen} 
        onOpenChange={setIsProductDialogOpen}
        title="Add New Product"
      >
        <ProductForm onSubmit={() => setIsProductDialogOpen(false)} />
      </MobileDialog>
      
      {/* Add Stock Movement Dialog */}
      <MobileDialog 
        open={isMovementDialogOpen} 
        onOpenChange={setIsMovementDialogOpen}
        title="Record Stock Movement"
      >
        <StockMovementForm onSubmit={() => setIsMovementDialogOpen(false)} />
      </MobileDialog>
    </MobileDashboardLayout>
  );
};

export default Inventory;
