
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SalesStorageService } from '@/modules/sales/services/salesStorageService';
import { Invoice } from '@/modules/sales/types/salesTypes';
import InvoicePaymentForm from '@/components/business-flow/InvoicePaymentForm';
import BusinessDocumentPrint from '@/components/BusinessDocumentPrint';
import { CreditCard, Calendar, DollarSign, Eye, Download, Printer } from 'lucide-react';

const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInvoices = () => {
      try {
        const storedInvoices = SalesStorageService.getDocuments('invoice') as Invoice[];
        setInvoices(storedInvoices);
      } catch (error) {
        console.error('Error loading invoices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
  }, []);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<any>(null);

  console.log('InvoiceList - invoices:', invoices);

  if (isLoading) {
    return <div>Loading invoices...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'sent': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'overdue': return 'bg-red-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCustomerName = (customer: any) => {
    if (!customer) return 'Unknown Customer';
    
    if (customer.customer_type === 'company') {
      return customer.company_name || 'Company';
    }
    
    const firstName = customer.first_name || '';
    const lastName = customer.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Individual Customer';
  };

  const transformItemsForPrint = (invoiceItems: any[]) => {
    return invoiceItems?.map(item => ({
      itemCode: item.products?.sku || '',
      description: item.products?.name || item.description || '',
      quantity: item.quantity || 0,
      unitPrice: item.unit_price || 0,
      total: item.total_price || 0,
      taxRate: 0
    })) || [];
  };

  const handleRecordPayment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentDialogOpen(true);
  };

  const handlePaymentComplete = () => {
    setPaymentDialogOpen(false);
    setSelectedInvoice(null);
  };

  const handlePrint = (invoice: any) => {
    console.log('Print invoice:', invoice.id);
    const documentData = {
      documentNumber: invoice.invoice_number,
      date: invoice.invoice_date,
      total: invoice.total_amount,
      currency: 'KES',
      customer: invoice.customers ? {
        name: getCustomerName(invoice.customers),
        address: invoice.customers.address || '',
        city: invoice.customers.city || '',
        state: invoice.customers.state || '',
        zip: invoice.customers.postal_code || '',
        phone: invoice.customers.phone || '',
        email: invoice.customers.email || '',
      } : null,
      company: {
        name: 'Priority Solutions Inc.',
        address: '123 Business Park Drive',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'USA',
        phone: '+1 (555) 123-4567',
        email: 'info@prioritysolutions.com',
        website: 'www.prioritysolutions.com',
        taxId: 'TAX123456789',
      },
      items: transformItemsForPrint(invoice.invoice_items),
      subtotal: invoice.subtotal,
      taxAmount: invoice.tax_amount,
      notes: invoice.notes,
      taxSettings: {
        type: 'total',
        defaultRate: 16
      }
    };
    setPrintInvoice(documentData);
    setShowPrintView(true);
  };

  const handleDownload = (invoice: any) => {
    console.log('Download invoice:', invoice.id);
    handlePrint(invoice);
  };

  const handleView = (invoice: any) => {
    console.log('View invoice:', invoice.id);
    handlePrint(invoice);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Invoices
            <Badge variant="outline" className="ml-auto">
              {invoices?.length || 0} records
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices?.map((invoice) => (
              <div key={invoice.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold">{invoice.invoice_number}</div>
                    <div className="text-sm text-muted-foreground">
                      Customer: {getCustomerName(invoice.customers)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </div>
                    {/* Removed the problematic sales_orders reference */}
                    <div className="text-sm text-muted-foreground">
                      Invoice #{invoice.invoice_number}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                    <div className="flex items-center gap-2 text-lg font-bold mt-2">
                      <DollarSign className="h-4 w-4" />
                      KES {invoice.total_amount?.toLocaleString() || '0'}
                    </div>
                    {invoice.paid_amount > 0 && (
                      <div className="text-sm text-green-600">
                        Paid: KES {invoice.paid_amount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t flex gap-2 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(invoice)}
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePrint(invoice)}
                    title="Print"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(invoice)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {/* Payment Actions */}
                  {invoice.status !== 'completed' && invoice.status !== 'cancelled' && (
                    <Button
                      onClick={() => handleRecordPayment(invoice)}
                      size="sm"
                      variant="outline"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Record Payment
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {(!invoices || invoices.length === 0) && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-muted-foreground">No invoices found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <InvoicePaymentForm 
              invoiceId={selectedInvoice.id}
              invoiceTotal={selectedInvoice.total_amount}
              onPaymentComplete={handlePaymentComplete}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <Dialog open={showPrintView} onOpenChange={setShowPrintView}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
          {printInvoice && (
            <BusinessDocumentPrint
              document={printInvoice}
              documentType="invoice"
              onClose={() => setShowPrintView(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoiceList;
