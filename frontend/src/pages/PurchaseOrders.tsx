
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { 
  MobileDashboardLayout,
  DashboardHeader
} from '@/components/ui/mobile-dashboard-layout';
import { useIsMobile } from '@/hooks/use-mobile';
import EnhancedPurchaseOrderForm from '@/components/purchase-order/EnhancedPurchaseOrderForm';
import PurchaseOrderPrint from '@/components/PurchaseOrderPrint';
import { PurchaseOrder } from '@/types/businessDocuments';

const PurchaseOrders = () => {
  const isMobile = useIsMobile();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  const handleCreate = () => {
    setSelectedPO(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setPurchaseOrders(prev => prev.filter(po => po.id !== id));
  };

  const handleSave = (po: PurchaseOrder) => {
    if (isEditing) {
      setPurchaseOrders(prev => prev.map(p => p.id === po.id ? po : p));
    } else {
      setPurchaseOrders(prev => [...prev, { ...po, id: `PO-${Date.now()}` }]);
    }
    setShowForm(false);
  };

  const handlePrint = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setShowPrint(true);
  };

  if (showPrint && selectedPO) {
    return (
      <PurchaseOrderPrint 
        purchaseOrder={selectedPO}
        onClose={() => setShowPrint(false)}
      />
    );
  }

  if (showForm) {
    return (
      <EnhancedPurchaseOrderForm
        purchaseOrder={selectedPO}
        onSave={handleSave}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <MobileDashboardLayout>
      <DashboardHeader title="Purchase Orders">
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {isMobile ? "New PO" : "New Purchase Order"}
        </Button>
      </DashboardHeader>

        <div className="grid gap-4">
          {purchaseOrders.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  {isMobile 
                    ? "No purchase orders yet. Tap New PO to get started." 
                    : "No purchase orders created yet. Click \"New Purchase Order\" to get started."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            purchaseOrders.map((po) => (
              <Card key={po.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{po.documentNumber}</CardTitle>
                      <p className="text-sm text-muted-foreground">Date: {po.date}</p>
                      <p className="text-sm text-muted-foreground">Vendor: {po.vendor.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePrint(po)}>
                        Print
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(po)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(po.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-right">
                    <p className="text-lg font-semibold">Total: USD {po.total.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
    </MobileDashboardLayout>
  );
};

export default PurchaseOrders;
