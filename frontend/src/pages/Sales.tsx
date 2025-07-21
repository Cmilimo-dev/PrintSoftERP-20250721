
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MobileDashboardLayout,
  DashboardStatsGrid,
  DashboardHeader
} from '@/components/ui/mobile-dashboard-layout';
import { useSalesOrders, useQuotations, useInvoices } from '@/hooks/useSales';
import EnhancedCRUDTable from '@/components/shared/EnhancedCRUDTable';
import BusinessDocumentForm from '@/components/BusinessDocumentForm';
import { Plus, FileText, Receipt, Truck, RotateCcw } from 'lucide-react';
import { BaseDocument } from '@/types/businessDocuments';
import { useToast } from '@/hooks/use-toast';
import { DocumentStorageService } from '@/services/documentStorageService';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

const Sales: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('orders');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [createDocumentType, setCreateDocumentType] = useState<'sales-order' | 'quote' | 'delivery-note' | 'customer-return'>('sales-order');
  const [editingDocument, setEditingDocument] = useState<BaseDocument | null>(null);
  
  // State for persistent documents
  const [salesOrders, setSalesOrders] = useState<BaseDocument[]>(() => {
    const existingDocs = DocumentStorageService.getDocuments('sales-order');
    // Add test documents if none exist
    if (existingDocs.length === 0) {
      const testDoc: BaseDocument = {
        id: 'SO-TEST-001',
        documentNumber: 'SO-2024-001',
        date: new Date().toISOString().split('T')[0],
        total: 1500.00,
        currency: 'KES',
        status: 'draft', // Editable status
        customer: { name: 'Test Customer', email: 'test@example.com' },
        items: [{
          itemCode: 'TEST-001',
          description: 'Test Product',
          quantity: 1,
          unitPrice: 1500.00,
          total: 1500.00,
          taxRate: 16,
          taxAmount: 240.00
        }],
        subtotal: 1290.52,
        taxAmount: 240.00,
        company: {
          name: 'Priority Solutions Inc.',
          address: '123 Business Park Drive',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'USA',
          phone: '+1 (555) 123-4567',
          email: 'info@prioritysolutions.com',
          taxId: 'TAX123456789'
        },
        taxSettings: { type: 'exclusive' as const, defaultRate: 16 }
      };
      DocumentStorageService.saveDocument('sales-order', testDoc);
      return [testDoc];
    }
    return existingDocs;
  });
  const [quotations, setQuotations] = useState<BaseDocument[]>(DocumentStorageService.getDocuments('quote'));
  const [deliveryNotes, setDeliveryNotes] = useState<BaseDocument[]>(DocumentStorageService.getDocuments('delivery-note'));
  const [customerReturns, setCustomerReturns] = useState<BaseDocument[]>(DocumentStorageService.getDocuments('customer-return'));
  
  // Legacy data from hooks (for fallback)
  const { data: legacySalesOrders } = useSalesOrders();
  const { data: legacyQuotations } = useQuotations();

  const stats = [
    {
      title: 'Total Sales Orders',
      value: salesOrders?.length || 0,
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      title: 'Active Quotations',
      value: quotations?.filter(q => !['pending', 'rejected', 'expired'].includes((q as any).status)).length || 0,
      icon: Receipt,
      color: 'text-green-600',
    },
    {
      title: 'Total Delivery Notes',
      value: deliveryNotes?.length || 0,
      icon: Truck,
      color: 'text-orange-600',
    },
    {
      title: 'Customer Returns',
      value: customerReturns?.length || 0,
      icon: RotateCcw,
      color: 'text-red-600',
    },
  ];

  // Transform database records to BaseDocument format
  const transformSalesOrders = (orders: any[]): BaseDocument[] => {
    return orders?.map(order => ({
      id: order.id,
      documentNumber: order.order_number,
      date: order.order_date,
      total: order.total_amount,
      currency: 'KES',
      status: order.status,
      customer: order.customers,
      items: order.sales_order_items || [],
      subtotal: order.subtotal || 0,
      taxAmount: order.tax_amount || 0,
      company: {
        name: 'Priority Solutions Inc.',
        address: '123 Business Park Drive',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'USA',
        phone: '+1 (555) 123-4567',
        email: 'info@prioritysolutions.com',
        taxId: 'TAX123456789'
      },
      taxSettings: { type: 'exclusive' as const, defaultRate: 16 }
    })) || [];
  };

  const transformQuotations = (quotes: any[]): BaseDocument[] => {
    return quotes?.map(quote => ({
      id: quote.id,
      documentNumber: quote.quote_number,
      date: quote.quote_date,
      total: quote.total_amount,
      currency: 'KES',
      status: quote.status,
      customer: quote.customers,
      items: quote.quote_items || [],
      subtotal: quote.subtotal || 0,
      taxAmount: quote.tax_amount || 0,
      company: {
        name: 'Priority Solutions Inc.',
        address: '123 Business Park Drive',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'USA',
        phone: '+1 (555) 123-4567',
        email: 'info@prioritysolutions.com',
        taxId: 'TAX123456789'
      },
      taxSettings: { type: 'exclusive' as const, defaultRate: 16 }
    })) || [];
  };

  const transformInvoices = (invoiceList: any[]): BaseDocument[] => {
    return invoiceList?.map(invoice => ({
      id: invoice.id,
      documentNumber: invoice.invoice_number,
      date: invoice.invoice_date,
      total: invoice.total_amount,
      currency: 'KES',
      status: invoice.status,
      customer: invoice.customers,
      items: invoice.invoice_items || [],
      subtotal: invoice.subtotal || 0,
      taxAmount: invoice.tax_amount || 0,
      company: {
        name: 'Priority Solutions Inc.',
        address: '123 Business Park Drive',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'USA',
        phone: '+1 (555) 123-4567',
        email: 'info@prioritysolutions.com',
        taxId: 'TAX123456789'
      },
      taxSettings: { type: 'exclusive' as const, defaultRate: 16 }
    })) || [];
  };

  const handleCreateNew = (docType: 'sales-order' | 'quote' | 'delivery-note' | 'customer-return') => {
    setCreateDocumentType(docType);
    setShowCreateDialog(true);
  };

  const handleEdit = (document: BaseDocument) => {
    // Only allow editing for draft or pending documents
    const editableStatuses = ['draft', 'pending'];
    if (!editableStatuses.includes((document as any).status)) {
      toast({
        title: "Cannot Edit Document",
        description: `Only documents with draft or pending status can be edited. Current status: ${(document as any).status}`,
        variant: "destructive"
      });
      return;
    }
    
    setEditingDocument(document);
    setShowEditDialog(true);
  };

  const handleDelete = (id: string, documentType: string) => {
    const docTypeMap: { [key: string]: any } = {
      'sales-order': [salesOrders, setSalesOrders],
      'quote': [quotations, setQuotations],
      'delivery-note': [deliveryNotes, setDeliveryNotes],
      'customer-return': [customerReturns, setCustomerReturns]
    };
    
    const [currentDocs, setDocs] = docTypeMap[documentType];
    if (DocumentStorageService.deleteDocument(documentType as any, id)) {
      setDocs(currentDocs.filter((doc: BaseDocument) => doc.id !== id));
      toast({
        title: "Document Deleted",
        description: "Document has been deleted successfully.",
      });
    }
  };

  const handleFormSave = (document: BaseDocument) => {
    const docTypeMap: { [key: string]: any } = {
      'sales-order': [salesOrders, setSalesOrders],
      'quote': [quotations, setQuotations],
      'delivery-note': [deliveryNotes, setDeliveryNotes],
      'customer-return': [customerReturns, setCustomerReturns]
    };
    
    const [currentDocs, setDocs] = docTypeMap[createDocumentType];
    const newDoc = { 
      ...document, 
      id: document.id || `${createDocumentType.toUpperCase()}-${Date.now()}`,
      status: 'draft' // Ensure new documents have draft status for editing
    } as any;
    
    if (DocumentStorageService.saveDocument(createDocumentType as any, newDoc)) {
      setDocs([...currentDocs, newDoc]);
      setShowCreateDialog(false);
      toast({
        title: "Document Created",
        description: `${newDoc.documentNumber} has been created successfully.`,
      });
    }
  };

  const handleFormCancel = () => {
    setShowCreateDialog(false);
  };

  const handleEditFormSave = (document: BaseDocument) => {
    const docType = editingDocument?.documentNumber?.startsWith('SO') ? 'sales-order' :
                   editingDocument?.documentNumber?.startsWith('QT') ? 'quote' :
                   editingDocument?.documentNumber?.startsWith('CR') ? 'customer-return' : 'delivery-note';
    
    const docTypeMap: { [key: string]: any } = {
      'sales-order': [salesOrders, setSalesOrders],
      'quote': [quotations, setQuotations],
      'delivery-note': [deliveryNotes, setDeliveryNotes],
      'customer-return': [customerReturns, setCustomerReturns]
    };
    
    const [currentDocs, setDocs] = docTypeMap[docType];
    
    if (DocumentStorageService.saveDocument(docType as any, document)) {
      setDocs(currentDocs.map((doc: BaseDocument) => 
        doc.id === document.id ? document : doc
      ));
      setShowEditDialog(false);
      setEditingDocument(null);
      toast({
        title: "Document Updated",
        description: `${document.documentNumber} has been updated successfully.`,
      });
    }
  };

  const handleEditFormCancel = () => {
    setShowEditDialog(false);
    setEditingDocument(null);
  };

  const handleStatusChange = (docId: string, newStatus: string) => {
    // Update the document status in the appropriate state
    setSalesOrders(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, status: newStatus } : doc
    ));
    setQuotations(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, status: newStatus } : doc
    ));
    setDeliveryNotes(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, status: newStatus } : doc
    ));
    setCustomerReturns(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, status: newStatus } : doc
    ));
    
    // Also update in storage
    const docTypeMap = {
      'sales-order': salesOrders,
      'quote': quotations,
      'delivery-note': deliveryNotes,
      'customer-return': customerReturns
    };
    
    // Find which document type this ID belongs to
    for (const [docType, docs] of Object.entries(docTypeMap)) {
      const doc = docs.find(d => d.id === docId);
      if (doc) {
        DocumentStorageService.saveDocument(docType as any, { ...doc, status: newStatus });
        break;
      }
    }
  };

  return (
    <MobileDashboardLayout className={cn(
      "container mx-auto space-y-6",
      isMobile ? "p-4" : "p-6"
    )}>
      <DashboardHeader
        title="Sales Management"
        className={isMobile ? "text-center" : ""}
      >
        <div className={cn(
          "gap-2",
          isMobile ? "grid grid-cols-1 w-full space-y-2" : "flex"
        )}>
          <Button 
            onClick={() => handleCreateNew('sales-order')}
            className={isMobile ? "w-full justify-center" : ""}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? "Sales Order" : "New Sales Order"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleCreateNew('quote')}
            className={isMobile ? "w-full justify-center" : ""}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? "Quotation" : "New Quotation"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleCreateNew('delivery-note')}
            className={isMobile ? "w-full justify-center" : ""}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? "Delivery Note" : "New Delivery Note"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleCreateNew('customer-return')}
            className={isMobile ? "w-full justify-center" : ""}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? "Customer Return" : "New Customer Return"}
          </Button>
        </div>
      </DashboardHeader>

      {/* Stats Dashboard */}
      <DashboardStatsGrid columns={4}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </DashboardStatsGrid>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={cn(
          "w-full",
          isMobile ? "flex justify-start overflow-x-auto" : "grid grid-cols-4"
        )}>
          <TabsTrigger 
            value="orders" 
            className={cn(
              "flex items-center gap-2",
              isMobile ? "flex-shrink-0 px-3" : ""
            )}
          >
            <FileText className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={isMobile ? "text-sm" : ""}>Orders ({salesOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="quotations" 
            className={cn(
              "flex items-center gap-2",
              isMobile ? "flex-shrink-0 px-3" : ""
            )}
          >
            <Receipt className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={isMobile ? "text-sm" : ""}>Quotes ({quotations.length})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="delivery" 
            className={cn(
              "flex items-center gap-2",
              isMobile ? "flex-shrink-0 px-3" : ""
            )}
          >
            <Truck className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={isMobile ? "text-sm" : ""}>Delivery ({deliveryNotes.length})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="returns" 
            className={cn(
              "flex items-center gap-2",
              isMobile ? "flex-shrink-0 px-3" : ""
            )}
          >
            <RotateCcw className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={isMobile ? "text-sm" : ""}>Returns ({customerReturns.length})</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <EnhancedCRUDTable
            documents={salesOrders}
            documentType="sales-order"
            onCreateNew={() => handleCreateNew('sales-order')}
            onEdit={handleEdit}
            onDelete={(id) => handleDelete(id, 'sales-order')}
            title="Sales Orders"
            searchFields={['documentNumber']}
            statusOptions={['pending', 'confirmed', 'shipped', 'delivered']}
            columns={[
              {
                key: 'customer',
                label: 'Customer',
                render: (doc: any) => doc.customer?.name || 'N/A'
              }
            ]}
          />
        </TabsContent>
        
        <TabsContent value="quotations">
          <EnhancedCRUDTable
            documents={quotations}
            documentType="quote"
            onCreateNew={() => handleCreateNew('quote')}
            onEdit={handleEdit}
            onDelete={(id) => handleDelete(id, 'quote')}
            title="Quotations"
            searchFields={['documentNumber']}
            statusOptions={['draft', 'sent', 'accepted', 'rejected', 'expired']}
            columns={[
              {
                key: 'customer',
                label: 'Customer',
                render: (doc: any) => doc.customer?.name || 'N/A'
              }
            ]}
          />
        </TabsContent>

        
        <TabsContent value="delivery">
          <EnhancedCRUDTable
            documents={deliveryNotes}
            documentType="delivery-note"
            onCreateNew={() => handleCreateNew('delivery-note')}
            onEdit={handleEdit}
            onDelete={(id) => handleDelete(id, 'delivery-note')}
            title="Delivery Notes"
            searchFields={['documentNumber']}
            statusOptions={['pending', 'shipped', 'delivered']}
columns={[
              {
                key: 'description',
                label: 'Description',
                render: (doc: any) => doc.items?.map((item: any) => item.description).join(', ') || 'N/A'
              },
              {
                key: 'quantity',
                label: 'Quantity',
                render: (doc: any) => doc.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
              }
            ]}
          />
        </TabsContent>

        <TabsContent value="returns">
          <EnhancedCRUDTable
            documents={customerReturns}
            documentType="customer-return"
            onCreateNew={() => handleCreateNew('customer-return')}
            onEdit={handleEdit}
            onDelete={(id) => handleDelete(id, 'customer-return')}
            title="Customer Returns"
            searchFields={['documentNumber']}
            statusOptions={['pending', 'approved', 'processed', 'rejected']}
            columns={[
              {
                key: 'customer',
                label: 'Customer',
                render: (doc: any) => doc.customer?.name || 'N/A'
              },
              {
                key: 'reason',
                label: 'Return Reason',
                render: (doc: any) => doc.reason || 'N/A'
              },
              {
                key: 'returnDate',
                label: 'Return Date',
                render: (doc: any) => doc.returnDate ? new Date(doc.returnDate).toLocaleDateString() : 'N/A'
              }
            ]}
          />
        </TabsContent>
      </Tabs>

      {/* Create Document Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className={cn(
          "max-h-[90vh] overflow-y-auto",
          isMobile ? "w-[95vw] max-w-[95vw]" : "max-w-4xl"
        )} aria-describedby="create-document-description">
          <DialogHeader>
            <DialogTitle className={isMobile ? "text-lg" : ""}>
              Create New {createDocumentType === 'sales-order' ? 'Sales Order' : 
                           createDocumentType === 'quote' ? 'Quotation' : 
                           createDocumentType === 'customer-return' ? 'Customer Return' : 'Delivery Note'}
            </DialogTitle>
            <p id="create-document-description" className={cn(
              "text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>
              Complete the form below to create a new {createDocumentType === 'sales-order' ? 'sales order' : 
                           createDocumentType === 'quote' ? 'quotation' : 
                           createDocumentType === 'customer-return' ? 'customer return' : 'delivery note'}.
            </p>
          </DialogHeader>
          <div className="space-y-6">
            <BusinessDocumentForm
              documentType={createDocumentType}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
              hideSettings={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className={cn(
          "max-h-[90vh] overflow-y-auto",
          isMobile ? "w-[95vw] max-w-[95vw]" : "max-w-4xl"
        )} aria-describedby="edit-document-description">
          <DialogHeader>
            <DialogTitle className={isMobile ? "text-lg" : ""}>
              Edit {editingDocument?.documentNumber}
            </DialogTitle>
            <p id="edit-document-description" className={cn(
              "text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>
              Update the document details below. Only draft and pending documents can be edited.
            </p>
          </DialogHeader>
          <div className="space-y-6">
            {editingDocument ? (
              <BusinessDocumentForm
                documentType={editingDocument.documentNumber?.startsWith('QT') ? 'quote' : 
                             editingDocument.documentNumber?.startsWith('SO') ? 'sales-order' :
                             editingDocument.documentNumber?.startsWith('CR') ? 'customer-return' : 'delivery-note'}
                document={editingDocument}
                onSave={handleEditFormSave}
                onCancel={handleEditFormCancel}
                hideSettings={true}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No document selected for editing.
                </p>
                <Button onClick={handleEditFormCancel} className="mt-4">
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MobileDashboardLayout>
  );
};

export default Sales;
