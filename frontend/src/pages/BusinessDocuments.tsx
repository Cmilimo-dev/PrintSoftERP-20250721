
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, FileText, Receipt, Quote, ShoppingCart, Printer, Download, Truck, BarChart3, CreditCard, RefreshCw, DollarSign } from 'lucide-react';
import BusinessDocumentForm from '@/components/BusinessDocumentForm';
import BusinessDocumentPrint from '@/components/BusinessDocumentPrint';
import { BaseDocument, DocumentType } from '@/types/businessDocuments';
import { 
  MobileDashboardLayout,
  DashboardHeader,
  DashboardStatsGrid
} from '@/components/ui/mobile-dashboard-layout';

const BusinessDocuments = () => {
  const [documents, setDocuments] = useState<BaseDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<BaseDocument | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType>('purchase-order');
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [printDoc, setPrintDoc] = useState<{ document: BaseDocument; type: DocumentType } | null>(null);

  const documentTypes = [
    { type: 'purchase-order' as DocumentType, label: 'Purchase Order', icon: ShoppingCart },
    { type: 'invoice' as DocumentType, label: 'Invoice', icon: Receipt },
    { type: 'quote' as DocumentType, label: 'Quote', icon: Quote },
    { type: 'sales-order' as DocumentType, label: 'Sales Order', icon: FileText },
    { type: 'payment-receipt' as DocumentType, label: 'Payment Receipt', icon: CreditCard },
    { type: 'delivery-note' as DocumentType, label: 'Delivery Note', icon: Truck },
    { type: 'credit-note' as DocumentType, label: 'Credit Note', icon: RefreshCw },
    { type: 'payment' as DocumentType, label: 'Payment', icon: DollarSign },
    { type: 'financial-report' as DocumentType, label: 'Financial Report', icon: BarChart3 },
  ];

  const handleCreate = (type: DocumentType) => {
    setSelectedDoc(null);
    setSelectedType(type);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (doc: BaseDocument, type: DocumentType) => {
    setSelectedDoc(doc);
    setSelectedType(type);
    setIsEditing(true);
    setShowForm(true);
  };

  const handlePrint = (doc: BaseDocument, type: DocumentType) => {
    setPrintDoc({ document: doc, type });
    setShowPrint(true);
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleSave = (doc: BaseDocument) => {
    if (isEditing) {
      setDocuments(prev => prev.map(d => d.id === doc.id ? doc : d));
    } else {
      setDocuments(prev => [...prev, { ...doc, id: `DOC-${Date.now()}` }]);
    }
    setShowForm(false);
  };

  const getDocumentTypeFromNumber = (docNumber: string): DocumentType => {
    if (docNumber.startsWith('PO-')) return 'purchase-order';
    if (docNumber.startsWith('INV-')) return 'invoice';
    if (docNumber.startsWith('QT-')) return 'quote';
    if (docNumber.startsWith('SO-')) return 'sales-order';
    if (docNumber.startsWith('REC-')) return 'payment-receipt';
    if (docNumber.startsWith('DN-')) return 'delivery-note';
    if (docNumber.startsWith('CN-')) return 'credit-note';
    if (docNumber.startsWith('PAY-')) return 'payment';
    if (docNumber.startsWith('RPT-')) return 'financial-report';
    return 'purchase-order';
  };

  const getDocumentIcon = (docNumber: string) => {
    const type = getDocumentTypeFromNumber(docNumber);
    const docType = documentTypes.find(dt => dt.type === type);
    return docType ? docType.icon : FileText;
  };

  const getDocumentLabel = (docNumber: string) => {
    const type = getDocumentTypeFromNumber(docNumber);
    const docType = documentTypes.find(dt => dt.type === type);
    return docType ? docType.label : 'Document';
  };

  if (showPrint && printDoc) {
    return (
      <BusinessDocumentPrint
        document={printDoc.document}
        documentType={printDoc.type}
        onClose={() => {
          setShowPrint(false);
          setPrintDoc(null);
        }}
      />
    );
  }

  if (showForm) {
    return (
      <BusinessDocumentForm
        documentType={selectedType}
        document={selectedDoc}
        onSave={handleSave}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <MobileDashboardLayout>
      <DashboardHeader title="Business Documents" icon={<FileText className="h-8 w-8" />} />

      {/* Document Type Cards */}
      <DashboardStatsGrid className="mb-8">
          {documentTypes.map((docType) => {
            const Icon = docType.icon;
            return (
              <Card key={docType.type} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-sm">{docType.label}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    onClick={() => handleCreate(docType.type)} 
                    className="w-full flex items-center gap-1 text-xs"
                    size="sm"
                  >
                    <Plus className="w-3 h-3" />
                    Create
                  </Button>
                </CardContent>
              </Card>
            );
          })}
      </DashboardStatsGrid>

        {/* Documents List */}
        <div className="grid gap-4">
          {documents.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No documents created yet. Choose a document type above to get started.</p>
              </CardContent>
            </Card>
          ) : (
            documents.map((doc) => {
              const Icon = getDocumentIcon(doc.documentNumber);
              const docType = getDocumentTypeFromNumber(doc.documentNumber);
              
              return (
                <Card key={doc.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Icon className="w-6 h-6 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{doc.documentNumber}</CardTitle>
                          <p className="text-sm text-muted-foreground">Type: {getDocumentLabel(doc.documentNumber)}</p>
                          <p className="text-sm text-muted-foreground">Date: {doc.date}</p>
                          <p className="text-sm text-muted-foreground">
                            {docType === 'purchase-order' 
                              ? `Vendor: ${(doc as any).vendor?.name || 'N/A'}`
                              : docType === 'payment-receipt'
                              ? `${(doc as any).receiptType === 'customer' ? 'Customer' : 'Vendor'}: ${((doc as any).customer?.name || (doc as any).vendor?.name) || 'N/A'}`
                              : docType === 'credit-note'
                              ? `Customer: ${(doc as any).customer?.name || 'N/A'} | Original: ${(doc as any).originalInvoice || 'N/A'}`
                              : docType === 'payment'
                              ? `${(doc as any).paymentType === 'customer-payment' ? 'Customer' : 'Vendor'}: ${((doc as any).customer?.name || (doc as any).vendor?.name) || 'N/A'}`
                              : docType === 'financial-report'
                              ? `Period: ${(doc as any).periodStart} to ${(doc as any).periodEnd}`
                              : `Customer: ${(doc as any).customer?.name || 'N/A'}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePrint(doc, docType)}>
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(doc, docType)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(doc.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {docType === 'financial-report' 
                          ? `Net Profit: ${doc.currency} ${(doc as any).netProfit?.toFixed(2) || '0.00'}`
                          : docType === 'payment-receipt'
                          ? `Amount Paid: ${doc.currency} ${(doc as any).amountPaid?.toFixed(2) || '0.00'}`
                          : docType === 'payment'
                          ? `Amount: ${doc.currency} ${(doc as any).amountPaid?.toFixed(2) || '0.00'}`
                          : `Total: ${doc.currency} ${doc.total.toFixed(2)}`
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
    </MobileDashboardLayout>
  );
};

export default BusinessDocuments;
