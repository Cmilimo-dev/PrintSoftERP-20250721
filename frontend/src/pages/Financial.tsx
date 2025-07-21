
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MobileDashboardLayout,
  DashboardHeader
} from '@/components/ui/mobile-dashboard-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useChartOfAccounts, 
  useFinancialTransactions, 
  useAccountsReceivableAging,
  useCurrencyRates 
} from '@/hooks/useFinancial';
import { useInvoices } from '@/hooks/useSales';
import { BaseDocument } from '@/types/businessDocuments';
import { DocumentStorageService } from '@/services/documentStorageService';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, FileText, CreditCard, Banknote, DollarSign, Receipt, Plus, Percent, Zap } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load heavy components
const FinancialDashboard = lazy(() => import('@/components/financial/FinancialDashboard'));
const FinancialDialogs = lazy(() => import('@/components/financial/FinancialDialogs'));
const ChartOfAccountsList = lazy(() => import('@/components/financial/ChartOfAccountsList'));
const GeneralLedger = lazy(() => import('@/components/financial/GeneralLedger'));
const AgingReports = lazy(() => import('@/components/financial/AgingReports'));
const BankReconciliation = lazy(() => import('@/components/financial/BankReconciliation'));
const CurrencyManager = lazy(() => import('@/components/financial/CurrencyManager'));
const BalanceSheetReport = lazy(() => import('@/components/financial/BalanceSheetReport'));
const ProfitLossReport = lazy(() => import('@/components/financial/ProfitLossReport'));
const BusinessDocumentForm = lazy(() => import('@/components/BusinessDocumentForm'));
const EnhancedCRUDTable = lazy(() => import('@/components/shared/EnhancedCRUDTable'));
const Reports = lazy(() => import('@/pages/Reports'));
const ExpensesManagement = lazy(() => import('@/components/financial/ExpensesManagement'));
const EnhancedCommissionManagement = lazy(() => import('@/components/financial/EnhancedCommissionManagement'));
const FinancialAutomationDashboard = lazy(() => import('@/components/financial/automation/FinancialAutomationDashboard'));

const Financial: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('accounts');
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isPaymentReceiptDialogOpen, setIsPaymentReceiptDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDocument, setEditingDocument] = useState<BaseDocument | null>(null);
  const [createDocumentType, setCreateDocumentType] = useState<'invoice' | 'payment-receipt'>('invoice');
  
  // State for persistent documents
  const [invoices, setInvoices] = useState<BaseDocument[]>(DocumentStorageService.getDocuments('invoice'));
  const [paymentReceipts, setPaymentReceipts] = useState<BaseDocument[]>(() => {
    const receipts = DocumentStorageService.getDocuments('payment-receipt');
    console.log('📄 Loaded payment receipts:', receipts);
    receipts.forEach(receipt => {
      console.log('Receipt details:', {
        id: receipt.id,
        documentNumber: receipt.documentNumber,
        status: (receipt as any).status,
        paymentMethod: (receipt as any).paymentMethod
      });
    });
    return receipts;
  });
  
  const { data: chartOfAccounts } = useChartOfAccounts();
  const { data: transactions } = useFinancialTransactions();
  const { data: agingReport } = useAccountsReceivableAging();
  const { data: legacyInvoices } = useInvoices();
  const { data: currencyRates } = useCurrencyRates();

  const totalReceivables = agingReport?.reduce((sum, item) => sum + item.total_outstanding, 0) || 0;
  const totalRevenue = invoices?.filter(i => (i as any).status === 'paid').reduce((sum, i) => sum + i.total, 0) || 0;

  // Transform invoices for the CRUD table
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

  const handleCreateNew = (docType: 'invoice' | 'payment-receipt') => {
    setCreateDocumentType(docType);
    if (docType === 'invoice') {
      setIsInvoiceDialogOpen(true);
    } else {
      setIsPaymentReceiptDialogOpen(true);
    }
  };

  const handleEdit = (document: BaseDocument) => {
    // Handle edit functionality for financial documents
    setEditingDocument(document);
    setIsEditMode(true);
    
    // Determine which dialog to open based on document type
    if (document.documentNumber?.startsWith('INV')) {
      setCreateDocumentType('invoice');
      setIsInvoiceDialogOpen(true);
    } else if (document.documentNumber?.startsWith('REC') || (document as any).paymentMethod) {
      setCreateDocumentType('payment-receipt');
      setIsPaymentReceiptDialogOpen(true);
    } else {
      // Default fallback based on context
      setCreateDocumentType('payment-receipt');
      setIsPaymentReceiptDialogOpen(true);
    }
  };

  const handleDelete = (id: string, documentType: string) => {
    const docTypeMap: { [key: string]: any } = {
      'invoice': [invoices, setInvoices],
      'payment-receipt': [paymentReceipts, setPaymentReceipts]
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
    console.log('📄 Saving document:', {
      documentType: createDocumentType,
      documentNumber: document.documentNumber,
      status: (document as any).status,
      isEditMode: isEditMode,
      fullDocument: document
    });
    
    const docTypeMap: { [key: string]: any } = {
      'invoice': [invoices, setInvoices],
      'payment-receipt': [paymentReceipts, setPaymentReceipts]
    };
    
    const [currentDocs, setDocs] = docTypeMap[createDocumentType];
    
    if (isEditMode && editingDocument) {
      // Update existing document
      const updatedDoc = { ...document, id: editingDocument.id };
      if (DocumentStorageService.saveDocument(createDocumentType as any, updatedDoc)) {
        const updatedDocs = currentDocs.map((doc: BaseDocument) => 
          doc.id === editingDocument.id ? updatedDoc : doc
        );
        setDocs(updatedDocs);
        handleDialogClose();
        toast({
          title: "Document Updated",
          description: `${updatedDoc.documentNumber} has been updated successfully.`,
        });
      }
    } else {
      // Create new document
      const newDoc = { ...document, id: document.id || `${createDocumentType.toUpperCase()}-${Date.now()}` };
      if (DocumentStorageService.saveDocument(createDocumentType as any, newDoc)) {
        setDocs([...currentDocs, newDoc]);
        handleDialogClose();
        toast({
          title: "Document Created",
          description: `${newDoc.documentNumber} has been created successfully.`,
        });
      }
    }
  };

  const handleFormCancel = () => {
    handleDialogClose();
  };

  const handleDialogClose = () => {
    setIsInvoiceDialogOpen(false);
    setIsPaymentReceiptDialogOpen(false);
    setIsEditMode(false);
    setEditingDocument(null);
  };

  return (
    <MobileDashboardLayout className={cn(
      "container mx-auto space-y-6",
      isMobile ? "p-4" : "p-6"
    )}>
      <DashboardHeader
        title="Financial Management"
        className={isMobile ? "text-center" : ""}
      >
        <div className={cn(
          "gap-2",
          isMobile ? "grid grid-cols-1 w-full space-y-2" : "flex"
        )}>
          <Button 
            onClick={() => handleCreateNew('invoice')}
            className={isMobile ? "w-full justify-center" : ""}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? "Invoice" : "New Invoice"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleCreateNew('payment-receipt')}
            className={isMobile ? "w-full justify-center" : ""}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? "Payment Receipt" : "New Payment Receipt"}
          </Button>
        </div>
      </DashboardHeader>

      {/* Financial Dashboard */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      }>
        <FinancialDashboard
          totalRevenue={totalRevenue}
          totalReceivables={totalReceivables}
          chartOfAccountsCount={chartOfAccounts?.length || 0}
          transactionsCount={transactions?.length || 0}
        />
      </Suspense>

      <Tabs defaultValue="chart-of-accounts" className="w-full">
        <TabsList className={cn(
          "w-full",
          isMobile ? "flex justify-start overflow-x-auto gap-1 p-1" : "grid grid-cols-7"
        )}>
          <TabsTrigger 
            value="chart-of-accounts" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : ""
            )}
          >
            <BookOpen className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={cn(
              isMobile ? "text-xs whitespace-nowrap" : ""
            )}>{isMobile ? "COA" : "Chart of Accounts"}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="accounts-receivable" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : ""
            )}
          >
            <Receipt className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={cn(
              isMobile ? "text-xs whitespace-nowrap" : ""
            )}>{isMobile ? "A/R" : "Accounts Receivable"}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="accounts-payable" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : ""
            )}
          >
            <CreditCard className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={cn(
              isMobile ? "text-xs whitespace-nowrap" : ""
            )}>{isMobile ? "A/P" : "Accounts Payable"}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="general-ledger" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : ""
            )}
          >
            <FileText className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={cn(
              isMobile ? "text-xs whitespace-nowrap" : ""
            )}>{isMobile ? "Ledger" : "General Ledger"}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="banking" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : ""
            )}
          >
            <Banknote className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={cn(
              isMobile ? "text-xs whitespace-nowrap" : ""
            )}>{isMobile ? "Banking" : "Banking"}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="reports-analytics" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : ""
            )}
          >
            <DollarSign className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={cn(
              isMobile ? "text-xs whitespace-nowrap" : ""
            )}>{isMobile ? "Reports" : "Reports & Analytics"}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="automation" 
            className={cn(
              "flex items-center gap-1",
              isMobile ? "flex-shrink-0 px-2 py-1 text-xs min-w-0" : ""
            )}
          >
            <Zap className={cn("h-4 w-4", isMobile ? "hidden" : "")} />
            <span className={cn(
              isMobile ? "text-xs whitespace-nowrap" : ""
            )}>{isMobile ? "Auto" : "Automation"}</span>
          </TabsTrigger>
        </TabsList>
        
        {/* 1. Chart of Accounts */}
        <TabsContent value="chart-of-accounts">
          <ErrorBoundary>
            <Suspense fallback={<Skeleton className="h-64" />}>
              <ChartOfAccountsList />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
        
        {/* 2. Accounts Receivable (A/R) */}
        <TabsContent value="accounts-receivable">
          <Tabs defaultValue="ar-invoices" className="w-full">
            <TabsList className={cn(
              "w-full",
              isMobile ? "flex justify-start overflow-x-auto gap-1 p-1" : "grid grid-cols-3"
            )}>
              <TabsTrigger 
                value="ar-invoices"
                className={cn(
                  isMobile ? "flex-shrink-0 px-2 py-1 text-xs whitespace-nowrap min-w-0" : ""
                )}
              >
                {isMobile ? `Invoices (${invoices.length})` : `Customer Invoices (${invoices.length})`}
              </TabsTrigger>
              <TabsTrigger 
                value="ar-payments"
                className={cn(
                  isMobile ? "flex-shrink-0 px-2 py-1 text-xs whitespace-nowrap min-w-0" : ""
                )}
              >
                {isMobile ? `Payments (${paymentReceipts.length})` : `Customer Payments (${paymentReceipts.length})`}
              </TabsTrigger>
              <TabsTrigger 
                value="ar-aging"
                className={cn(
                  isMobile ? "flex-shrink-0 px-2 py-1 text-xs whitespace-nowrap min-w-0" : ""
                )}
              >
                {isMobile ? "Aging" : "Aging Report"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ar-invoices">
              <Suspense fallback={<Skeleton className="h-64" />}>
                <EnhancedCRUDTable
                  documents={invoices}
                  documentType="invoice"
                  onCreateNew={() => handleCreateNew('invoice')}
                  onEdit={handleEdit}
                  onDelete={(id) => handleDelete(id, 'invoice')}
                  title="Customer Invoices"
                  searchFields={['documentNumber']}
                  statusOptions={['draft', 'sent', 'paid', 'overdue']}
                  columns={[
                    {
                      key: 'customer',
                      label: 'Customer',
                      render: (doc: any) => doc.customer?.name || 'N/A'
                    },
                    {
                      key: 'dueDate',
                      label: 'Due Date',
                      render: (doc: any) => doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : 'N/A'
                    }
                  ]}
                />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="ar-payments">
              <Suspense fallback={<Skeleton className="h-64" />}>
                <EnhancedCRUDTable
                  documents={paymentReceipts}
                  documentType="payment-receipt"
                  onCreateNew={() => handleCreateNew('payment-receipt')}
                  onEdit={handleEdit}
                  onDelete={(id) => handleDelete(id, 'payment-receipt')}
                  title="Customer Payments"
                  searchFields={['documentNumber']}
                  statusOptions={['draft', 'confirmed', 'processed']}
                  columns={[
                    {
                      key: 'paymentMethod',
                      label: 'Payment Method',
                      render: (doc: any) => doc.paymentMethod || 'N/A'
                    },
                    {
                      key: 'amountPaid',
                      label: 'Amount Paid',
                      render: (doc: any) => `${doc.currency || 'KES'} ${(doc.amountPaid || 0).toLocaleString()}`
                    }
                  ]}
                />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="ar-aging">
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <AgingReports />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* 3. Accounts Payable (A/P) */}
        <TabsContent value="accounts-payable">
          <Tabs defaultValue="ap-expenses" className="w-full">
            <TabsList className={cn(
              "w-full",
              isMobile ? "flex justify-start overflow-x-auto gap-1 p-1" : "grid grid-cols-3"
            )}>
              <TabsTrigger 
                value="ap-expenses"
                className={cn(
                  isMobile ? "flex-shrink-0 px-2 py-1 text-xs whitespace-nowrap min-w-0" : ""
                )}
              >
                {isMobile ? "Expenses" : "Vendor Expenses"}
              </TabsTrigger>
              <TabsTrigger 
                value="ap-payments"
                className={cn(
                  isMobile ? "flex-shrink-0 px-2 py-1 text-xs whitespace-nowrap min-w-0" : ""
                )}
              >
                {isMobile ? "Payments" : "Vendor Payments"}
              </TabsTrigger>
              <TabsTrigger 
                value="ap-commission"
                className={cn(
                  isMobile ? "flex-shrink-0 px-2 py-1 text-xs whitespace-nowrap min-w-0" : ""
                )}
              >
                {isMobile ? "Commission" : "Commission Management"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ap-expenses">
              <Suspense fallback={<Skeleton className="h-64" />}>
                <ExpensesManagement />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="ap-payments">
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Vendor Payment Management</h3>
                    <p className="text-muted-foreground">Track and manage payments to vendors and suppliers.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="ap-commission">
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-64" />}>
<EnhancedCommissionManagement />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* 4. General Ledger */}
        <TabsContent value="general-ledger">
          <ErrorBoundary>
            <Suspense fallback={<Skeleton className="h-64" />}>
              <GeneralLedger />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
        
        {/* 5. Banking & Reconciliation */}
        <TabsContent value="banking">
          <Tabs defaultValue="bank-reconciliation" className="w-full">
            <TabsList className={cn(
              "w-full",
              isMobile ? "flex justify-start overflow-x-auto gap-1 p-1" : "grid grid-cols-2"
            )}>
              <TabsTrigger 
                value="bank-reconciliation"
                className={cn(
                  isMobile ? "flex-shrink-0 px-2 py-1 text-xs whitespace-nowrap min-w-0" : ""
                )}
              >
                {isMobile ? "Reconciliation" : "Bank Reconciliation"}
              </TabsTrigger>
              <TabsTrigger 
                value="multi-currency"
                className={cn(
                  isMobile ? "flex-shrink-0 px-2 py-1 text-xs whitespace-nowrap min-w-0" : ""
                )}
              >
                {isMobile ? "Currency" : "Multi-Currency"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="bank-reconciliation">
              <Suspense fallback={<Skeleton className="h-64" />}>
                <BankReconciliation />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="multi-currency">
              <Suspense fallback={<Skeleton className="h-64" />}>
                <CurrencyManager />
              </Suspense>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* 6. Reports & Analytics */}
        <TabsContent value="reports-analytics">
          <Tabs defaultValue="financial-reports" className="w-full">
            <TabsList className={cn(
              "w-full",
              isMobile ? "flex justify-start overflow-x-auto gap-1 p-1" : "grid grid-cols-4"
            )}>
              <TabsTrigger 
                value="financial-reports"
                className={cn(
                  isMobile ? "flex-shrink-0 px-2 py-1 text-xs whitespace-nowrap min-w-0" : ""
                )}
              >
                {isMobile ? "Reports" : "Financial Reports"}
              </TabsTrigger>
              <TabsTrigger 
                value="balance-sheet"
                className={cn(
                  isMobile ? "flex-shrink-0 px-2 py-1 text-xs whitespace-nowrap min-w-0" : ""
                )}
              >
                {isMobile ? "Balance" : "Balance Sheet"}
              </TabsTrigger>
              <TabsTrigger 
                value="profit-loss"
                className={cn(
                  isMobile ? "flex-shrink-0 px-2 py-1 text-xs whitespace-nowrap min-w-0" : ""
                )}
              >
                {isMobile ? "P&L" : "P&L Statement"}
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className={cn(
                  isMobile ? "flex-shrink-0 px-2 py-1 text-xs whitespace-nowrap min-w-0" : ""
                )}
              >
                {isMobile ? "Analytics" : "Business Analytics"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="financial-reports">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Reports Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Financial Reports Dashboard</h3>
                    <p className="text-muted-foreground">Generate and view comprehensive financial reports.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="balance-sheet">
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <BalanceSheetReport />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>
            
            <TabsContent value="profit-loss">
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <ProfitLossReport />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>
            
            <TabsContent value="analytics">
              <Suspense fallback={<Skeleton className="h-64" />}>
                <Reports />
              </Suspense>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="automation">
          <ErrorBoundary>
            <Suspense fallback={<Skeleton className="h-64" />}>
              <FinancialAutomationDashboard />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
      
      {/* Create Invoice Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className={cn(
          "max-h-[90vh] overflow-y-auto",
          isMobile ? "w-[95vw] max-w-[95vw]" : "max-w-4xl"
        )} aria-describedby="create-invoice-description">
          <DialogHeader>
            <DialogTitle className={isMobile ? "text-lg" : ""}>
              {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
            </DialogTitle>
            <p id="create-invoice-description" className={cn(
              "text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {isEditMode ? 'Update the invoice details below.' : 'Fill out the form below to create a new invoice for your customer.'}
            </p>
          </DialogHeader>
          <div className="space-y-6">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <BusinessDocumentForm 
                documentType="invoice" 
                onSave={handleFormSave}
                onCancel={handleFormCancel}
                hideSettings={true}
                document={isEditMode ? editingDocument : undefined}
              />
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Create Payment Receipt Dialog */}
      <Dialog open={isPaymentReceiptDialogOpen} onOpenChange={setIsPaymentReceiptDialogOpen}>
        <DialogContent className={cn(
          "max-h-[90vh] overflow-y-auto",
          isMobile ? "w-[95vw] max-w-[95vw]" : "max-w-4xl"
        )} aria-describedby="create-receipt-description">
          <DialogHeader>
            <DialogTitle className={isMobile ? "text-lg" : ""}>
              {isEditMode ? 'Edit Payment Receipt' : 'Create New Payment Receipt'}
            </DialogTitle>
            <p id="create-receipt-description" className={cn(
              "text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {isEditMode ? 'Update the payment receipt details below.' : 'Record a payment receipt for tracking customer payments.'}
            </p>
          </DialogHeader>
          <div className="space-y-6">
            <BusinessDocumentForm 
              documentType="payment-receipt" 
              onSave={handleFormSave}
              onCancel={handleFormCancel}
              hideSettings={true}
              document={isEditMode ? editingDocument : undefined}
            />
          </div>
        </DialogContent>
      </Dialog>
    </MobileDashboardLayout>
  );
};

export default Financial;
