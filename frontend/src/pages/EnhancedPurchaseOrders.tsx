
import React, { useState, useEffect } from 'react';
import EnhancedPurchaseOrderList from '@/components/purchase-orders/EnhancedPurchaseOrderList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Package, Users, RotateCcw } from 'lucide-react';
import EnhancedPurchaseOrderForm from '@/components/purchase-order/EnhancedPurchaseOrderForm';
import GoodsReceivingForm from '@/components/goods-receiving/GoodsReceivingForm';
import EnhancedCRUDTable from '@/components/shared/EnhancedCRUDTable';
import { PurchaseOrder, GoodsReceivingVoucher } from '@/modules/purchasing/types/purchasingTypes';
import { useToast } from '@/hooks/use-toast';
import { PurchasingStorageService } from '@/modules/purchasing/services/purchasingStorageService';
import { useSuppliers, useDeleteSupplier, useUpdateSupplier } from '@/hooks/useCustomers';
import VendorForm from '@/components/customers/VendorForm';
import { DocumentStorageService } from '@/services/documentStorageService';
import GoodsReturnForm from '@/components/goods-returns/GoodsReturnForm';
import { 
  MobileDashboardLayout,
  DashboardHeader
} from '@/components/ui/mobile-dashboard-layout';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const EnhancedPurchaseOrders = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(PurchasingStorageService.getDocuments('purchase-order') as PurchaseOrder[]);
  const [grvs, setGrvs] = useState<GoodsReceivingVoucher[]>(PurchasingStorageService.getDocuments('goods-receiving-voucher') as GoodsReceivingVoucher[]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [selectedGRV, setSelectedGRV] = useState<GoodsReceivingVoucher | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'po-form' | 'grv-form' | 'vendor-form' | 'goods-return-form'>('list');
  const [activeTab, setActiveTab] = useState<'po' | 'grv' | 'vendors' | 'goods-returns'>('po');
  
  // Vendors state
  const { data: vendors, error: vendorsError, refetch: refetchVendors } = useSuppliers();
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const deleteSupplierMutation = useDeleteSupplier();
  const updateSupplierMutation = useUpdateSupplier();
  
  // Goods Returns state
  const [goodsReturns, setGoodsReturns] = useState<any[]>(() => {
    return DocumentStorageService.getDocuments('goods-return') || [];
  });
  const [selectedGoodsReturn, setSelectedGoodsReturn] = useState<any>(null);

  // Purchase Order handlers
  const handleCreatePO = () => {
    setSelectedPO(null);
    setCurrentView('po-form');
  };

  const handleEditPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setCurrentView('po-form');
  };

  const handleDeletePO = (id: string) => {
    setPurchaseOrders(prev => {
      PurchasingStorageService.deleteDocument('purchase-order', id);
      return prev.filter(po => po.id !== id);
    });
  };


  const handleSavePO = (po: PurchaseOrder) => {
    PurchasingStorageService.saveDocument('purchase-order', po);
    if (selectedPO) {
      setPurchaseOrders(prev => prev.map(p => p.id === po.id ? po : p));
      toast({
        title: "Purchase Order Updated",
        description: `${po.documentNumber} has been updated successfully.`,
      });
    } else {
      const newPO = { ...po, id: po.id || `PO-${Date.now()}` };
      setPurchaseOrders(prev => [...prev, newPO]);
      toast({
        title: "Purchase Order Created",
        description: `${po.documentNumber} has been created successfully.`,
      });
    }
    setCurrentView('list');
  };

  // GRV handlers
  const handleCreateGRV = () => {
    setSelectedGRV(null);
    setCurrentView('grv-form');
  };

  const handleEditGRV = (grv: GoodsReceivingVoucher) => {
    setSelectedGRV(grv);
    setCurrentView('grv-form');
  };

  const handleSaveGRV = (grv: GoodsReceivingVoucher) => {
    PurchasingStorageService.saveDocument('goods-receiving-voucher', grv);
    if (selectedGRV) {
      setGrvs(prev => prev.map(g => g.id === grv.id ? grv : g));
      toast({
        title: "GRV Updated",
        description: `${grv.grvNumber} has been updated successfully.`,
      });
    } else {
      const newGRV = { ...grv, id: grv.id || `GRV-${Date.now()}` };
      setGrvs(prev => [...prev, newGRV]);
      toast({
        title: "GRV Created",
        description: `${grv.grvNumber} has been created successfully.`,
      });
    }
    setCurrentView('list');
  };

  const handleDeleteGRV = (id: string) => {
    setGrvs(prev => {
      PurchasingStorageService.deleteDocument('goods-receiving-voucher', id);
      return prev.filter(grv => grv.id !== id);
    });
  };

  // Vendor handlers
  const handleCreateVendor = () => {
    setSelectedVendor(null);
    setCurrentView('vendor-form');
  };

  const handleEditVendor = (vendor: any) => {
    setSelectedVendor(vendor);
    setCurrentView('vendor-form');
  };

  const handleDeleteVendor = (id: string) => {
    deleteSupplierMutation.mutate(id);
  };

  const handleSaveVendor = (vendor: any) => {
    if (selectedVendor) {
      // Update existing vendor
      updateSupplierMutation.mutate({
        id: selectedVendor.id,
        supplier: vendor
      });
    }
    setCurrentView('list');
  };

  // Goods Return handlers
  const handleCreateGoodsReturn = () => {
    setSelectedGoodsReturn(null);
    setCurrentView('goods-return-form');
  };

  const handleEditGoodsReturn = (goodsReturn: any) => {
    setSelectedGoodsReturn(goodsReturn);
    setCurrentView('goods-return-form');
  };

  const handleSaveGoodsReturn = (goodsReturn: any) => {
    const newReturn = { 
      ...goodsReturn, 
      id: goodsReturn.id || `GR-${Date.now()}`,
      type: 'goods-return',
      returnDate: new Date().toISOString().split('T')[0]
    };
    
    DocumentStorageService.saveDocument('goods-return', newReturn);
    
    if (selectedGoodsReturn) {
      setGoodsReturns(prev => prev.map(gr => gr.id === newReturn.id ? newReturn : gr));
      toast({
        title: "Goods Return Updated",
        description: `${newReturn.documentNumber || newReturn.id} has been updated successfully.`,
      });
    } else {
      setGoodsReturns(prev => [...prev, newReturn]);
      toast({
        title: "Goods Return Created",
        description: `${newReturn.documentNumber || newReturn.id} has been created successfully.`,
      });
    }
    setCurrentView('list');
  };

  const handleDeleteGoodsReturn = (id: string) => {
    if (DocumentStorageService.deleteDocument('goods-return', id)) {
      setGoodsReturns(prev => prev.filter(gr => gr.id !== id));
      toast({
        title: "Goods Return Deleted",
        description: "Goods return has been deleted successfully.",
      });
    }
  };

  // Purchase Order columns for the CRUD table
  const poColumns = [
    {
      key: 'vendor.name',
      label: 'Vendor',
      render: (doc: PurchaseOrder) => doc.vendor?.name || 'N/A'
    },
    {
      key: 'items.length',
      label: 'Items',
      render: (doc: PurchaseOrder) => `${doc.items?.length || 0} item(s)`
    }
  ];

  // GRV columns for the CRUD table
  const grvColumns = [
    {
      key: 'vendor.name',
      label: 'Vendor',
      render: (doc: GoodsReceivingVoucher) => doc.vendor?.name || 'N/A'
    },
    {
      key: 'receivedDate',
      label: 'Received Date',
      render: (doc: GoodsReceivingVoucher) => new Date(doc.receivedDate).toLocaleDateString()
    },
    {
      key: 'qualityCheck',
      label: 'Quality Check',
      render: (doc: GoodsReceivingVoucher) => doc.qualityCheck || 'Pending'
    }
  ];

  // Vendor columns for the CRUD table
  const vendorColumns = [
    {
      key: 'vendor_number',
      label: 'Vendor Number',
      render: (vendor: any) => vendor.vendor_number || vendor.supplier_code || 'N/A'
    },
    {
      key: 'name',
      label: 'Contact Person',
      render: (vendor: any) => vendor.name || 'N/A'
    },
    {
      key: 'email',
      label: 'Email',
      render: (vendor: any) => vendor.email || 'N/A'
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (vendor: any) => vendor.phone || 'N/A'
    }
  ];

  // Goods Return columns for the CRUD table
  const goodsReturnColumns = [
    {
      key: 'vendor.name',
      label: 'Vendor',
      render: (doc: any) => doc.vendor?.name || 'N/A'
    },
    {
      key: 'returnDate',
      label: 'Return Date',
      render: (doc: any) => doc.returnDate ? new Date(doc.returnDate).toLocaleDateString() : 'N/A'
    },
    {
      key: 'reason',
      label: 'Return Reason',
      render: (doc: any) => doc.reason || 'N/A'
    },
    {
      key: 'items.length',
      label: 'Items',
      render: (doc: any) => `${doc.items?.length || 0} item(s)`
    }
  ];

  if (currentView === 'po-form') {
    return (
      <EnhancedPurchaseOrderForm
        purchaseOrder={selectedPO}
        onSave={handleSavePO}
        onCancel={() => setCurrentView('list')}
      />
    );
  }

  if (currentView === 'grv-form') {
    return (
      <GoodsReceivingForm
        grv={selectedGRV}
        onSave={handleSaveGRV}
        onCancel={() => setCurrentView('list')}
      />
    );
  }

  if (currentView === 'vendor-form') {
    return (
      <MobileDashboardLayout>
        <VendorForm
          vendor={selectedVendor}
          onClose={() => setCurrentView('list')}
          onSubmit={() => {
            refetchVendors(); // Refresh vendors list
            setCurrentView('list');
          }}
        />
      </MobileDashboardLayout>
    );
  }

  if (currentView === 'goods-return-form') {
    return (
      <GoodsReturnForm
        goodsReturn={selectedGoodsReturn}
        onSave={handleSaveGoodsReturn}
        onCancel={() => setCurrentView('list')}
      />
    );
  }

  return (
    <MobileDashboardLayout className={isMobile ? "p-2" : ""}>
      <DashboardHeader 
        title="Purchase Management" 
        icon={<Package className={isMobile ? "h-6 w-6" : "h-8 w-8"} />} 
        className={isMobile ? "mb-3" : "mb-6"}
      />

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'po' | 'grv' | 'vendors' | 'goods-returns')}>
          <TabsList className={cn(
            "w-full bg-slate-100 border border-slate-200",
            isMobile 
              ? "grid grid-cols-2 gap-1 h-auto p-1" 
              : "grid grid-cols-4"
          )}>
            <TabsTrigger 
              value="po" 
              className={cn(
                "flex items-center gap-1 text-xs transition-all duration-200",
                "data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md",
                "hover:bg-blue-100 hover:text-blue-700",
                isMobile ? "p-2 h-auto flex-col" : "flex-row gap-2"
              )}
            >
              <FileText className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
              <span className={isMobile ? "text-[10px] leading-none" : "text-xs"}>
                {isMobile ? "PO" : "Purchase Orders"} ({purchaseOrders.length})
              </span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="grv" 
              className={cn(
                "flex items-center gap-1 text-xs transition-all duration-200",
                "data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-md",
                "hover:bg-green-100 hover:text-green-700",
                isMobile ? "p-2 h-auto flex-col" : "flex-row gap-2"
              )}
            >
              <Package className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
              <span className={isMobile ? "text-[10px] leading-none" : "text-xs"}>
                {isMobile ? "GRV" : "Goods Receiving"} ({grvs.length})
              </span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="vendors" 
              className={cn(
                "flex items-center gap-1 text-xs transition-all duration-200",
                "data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md",
                "hover:bg-purple-100 hover:text-purple-700",
                isMobile ? "p-2 h-auto flex-col" : "flex-row gap-2"
              )}
            >
              <Users className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
              <span className={isMobile ? "text-[10px] leading-none" : "text-xs"}>
                {isMobile ? "Vendors" : "Vendors"} ({vendors?.length || 0})
              </span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="goods-returns" 
              className={cn(
                "flex items-center gap-1 text-xs transition-all duration-200",
                "data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md",
                "hover:bg-orange-100 hover:text-orange-700",
                isMobile ? "p-2 h-auto flex-col" : "flex-row gap-2"
              )}
            >
              <RotateCcw className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
              <span className={isMobile ? "text-[10px] leading-none" : "text-xs"}>
                {isMobile ? "Returns" : "Goods Returns"} ({goodsReturns.length})
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="po" className={cn(isMobile ? "mt-3 px-1" : "mt-6")}>
            <EnhancedPurchaseOrderList
              purchaseOrders={purchaseOrders}
              onCreateNew={handleCreatePO}
              onEdit={handleEditPO}
              onDelete={handleDeletePO}
            />
          </TabsContent>

          <TabsContent value="grv" className={cn(isMobile ? "mt-3 px-1" : "mt-6")}>
            <EnhancedCRUDTable
              documents={grvs}
              documentType="goods-receiving-voucher"
              onCreateNew={handleCreateGRV}
              onEdit={handleEditGRV}
              onDelete={handleDeleteGRV}
              title="Goods Receiving Vouchers"
              searchFields={['grvNumber', 'vendor.name']}
              statusOptions={['pending', 'approved', 'completed']}
              columns={grvColumns}
            />
          </TabsContent>

          <TabsContent value="vendors" className={cn(isMobile ? "mt-3 px-1" : "mt-6")}>
            <EnhancedCRUDTable
              documents={vendors || []}
              documentType="vendor"
              onCreateNew={handleCreateVendor}
              onEdit={handleEditVendor}
              onDelete={handleDeleteVendor}
              title="Vendors"
              searchFields={['name', 'email']}
              statusOptions={['active', 'inactive', 'suspended']}
              columns={vendorColumns}
              hideDocumentActions={true}
            />
          </TabsContent>

          <TabsContent value="goods-returns" className={cn(isMobile ? "mt-3 px-1" : "mt-6")}>
            <EnhancedCRUDTable
              documents={goodsReturns}
              documentType="goods-return"
              onCreateNew={handleCreateGoodsReturn}
              onEdit={handleEditGoodsReturn}
              onDelete={handleDeleteGoodsReturn}
              title="Goods Returns"
              searchFields={['documentNumber', 'vendor.name', 'reason']}
              statusOptions={['pending', 'approved', 'completed', 'rejected']}
              columns={goodsReturnColumns}
            />
          </TabsContent>
        </Tabs>
    </MobileDashboardLayout>
  );
};

export default EnhancedPurchaseOrders;
