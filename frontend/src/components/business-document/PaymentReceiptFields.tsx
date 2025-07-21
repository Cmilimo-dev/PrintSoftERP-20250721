
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentReceipt } from '@/types/businessDocuments';
import { SalesStorageService } from '@/modules/sales/services/salesStorageService';
import { useCustomers } from '@/hooks/useCustomers';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/config/api';

interface PaymentReceiptFieldsProps {
  formData: PaymentReceipt;
  onUpdate: (updates: Partial<PaymentReceipt>) => void;
}

const PaymentReceiptFields: React.FC<PaymentReceiptFieldsProps> = ({ formData, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const { data: customers = [] } = useCustomers();

  // Fetch available invoices from backend
  const { data: availableInvoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/sales/invoices');
        return response.data || [];
      } catch (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }
    }
  });

  // Handle invoice selection and auto-fill invoice total
  const handleInvoiceSelection = (invoiceNumber: string) => {
    if (invoiceNumber === 'none') {
      // Clear the invoice selection
      onUpdate({ 
        relatedInvoice: undefined,
        invoiceTotal: undefined
      });
      return;
    }
    
    // Find the selected invoice and auto-fill the total
    const selectedInvoice = availableInvoices.find(inv => 
      inv.document_number === invoiceNumber || 
      inv.documentNumber === invoiceNumber ||
      inv.invoice_number === invoiceNumber
    );
    if (selectedInvoice) {
      // Find customer details
      const customer = customers.find(c => c.id === selectedInvoice.customer_id);
      
      onUpdate({ 
        relatedInvoice: invoiceNumber,
        invoiceTotal: selectedInvoice.total_amount || selectedInvoice.total || 0,
        customer: customer ? {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        } : undefined
      });
      setSelectedInvoice(selectedInvoice);
    } else {
      // Just update the invoice number if no matching invoice found
      onUpdate({ relatedInvoice: invoiceNumber });
      setSelectedInvoice(null);
    }
  };

  // Handle search term change for invoice filtering
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value) {
      handleInvoiceSelection(value);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Receipt Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="receiptType">Receipt Type</Label>
            <Select value={formData.receiptType || 'customer'} onValueChange={(value) => onUpdate({ receiptType: value as 'customer' | 'vendor' })}>
              <SelectTrigger>
                <SelectValue placeholder="Select receipt type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer Payment</SelectItem>
                <SelectItem value="vendor">Vendor Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={formData.paymentMethod || ''} onValueChange={(value) => onUpdate({ paymentMethod: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Check">Check</SelectItem>
                <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                <SelectItem value="Airtel Money">Airtel Money</SelectItem>
                <SelectItem value="Pesalink">Pesalink</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status || 'draft'} onValueChange={(value) => onUpdate({ status: value as 'draft' | 'confirmed' | 'processed' })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reference">Reference Number</Label>
            <Input
              id="reference"
              value={formData.reference || ''}
              onChange={(e) => onUpdate({ reference: e.target.value })}
              placeholder="e.g., TXN123456789"
            />
          </div>
          <div>
            <Label htmlFor="relatedInvoice">Related Invoice (Optional)</Label>
            <div className="space-y-2">
              <Input
                id="invoiceSearch"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by invoice number or customer name"
                disabled={invoicesLoading}
              />
              {invoicesLoading && (
                <div className="text-sm text-muted-foreground">Loading invoices...</div>
              )}
              {searchTerm && availableInvoices.length > 0 && (
                <div className="max-h-32 overflow-y-auto border rounded-md">
                  {availableInvoices
                    .filter(invoice => {
                      const invoiceNumber = invoice.document_number || invoice.documentNumber || invoice.invoice_number || '';
                      const customerName = invoice.customer?.name || '';
                      const searchLower = searchTerm.toLowerCase();
                      return invoiceNumber.toLowerCase().includes(searchLower) || 
                             customerName.toLowerCase().includes(searchLower);
                    })
                    .slice(0, 5)
                    .map((invoice) => {
                      const invoiceNumber = invoice.document_number || invoice.documentNumber || invoice.invoice_number;
                      const customerName = invoice.customer?.name || customers.find(c => c.id === invoice.customer_id)?.name || 'Unknown Customer';
                      const total = invoice.total_amount || invoice.total || 0;
                      return (
                        <div 
                          key={invoice.id} 
                          className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => handleInvoiceSelection(invoiceNumber)}
                        >
                          <div className="font-medium">{invoiceNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {customerName} - KSh {total.toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoiceTotal">Invoice Total (KSh)</Label>
            <Input
              id="invoiceTotal"
              type="number"
              step="0.01"
              value={formData.invoiceTotal || ''}
              onChange={(e) => onUpdate({ invoiceTotal: parseFloat(e.target.value) || undefined })}
              placeholder="Auto-filled when invoice selected"
              readOnly={!!formData.relatedInvoice}
              className={formData.relatedInvoice ? 'bg-gray-50' : ''}
            />
            {selectedInvoice && (
              <div className="text-sm text-muted-foreground mt-1">
                Selected: {selectedInvoice.document_number || selectedInvoice.documentNumber}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="amountPaid">Amount Paid (KSh)</Label>
            <Input
              id="amountPaid"
              type="number"
              step="0.01"
              value={formData.amountPaid || ''}
              onChange={(e) => onUpdate({ amountPaid: parseFloat(e.target.value) || 0 })}
              placeholder="Enter amount paid"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentReceiptFields;
