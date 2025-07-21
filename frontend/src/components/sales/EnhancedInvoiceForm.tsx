import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Invoice } from '@/modules/sales/types/salesTypes';
import { useBusinessDocumentForm } from '@/hooks/useBusinessDocumentForm';
import SmartLineItemComponent from '@/components/common/SmartLineItemComponent';
import TaxSettingsSection from '@/components/purchase-order/TaxSettingsSection';
import { Save, FileText, CheckCircle, AlertCircle, Clock, CreditCard, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/useCustomers';
import { PaymentIntegrationService } from '@/services/paymentIntegrationService';
import StatusChangeButton from '@/components/business-flow/StatusChangeButton';
import { SystemSettingsService } from '@/modules/system-settings/services/systemSettingsService';

interface EnhancedInvoiceFormProps {
  invoice?: Invoice | null;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

const EnhancedInvoiceForm: React.FC<EnhancedInvoiceFormProps> = ({
  invoice,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const { data: customers } = useCustomers();
  const systemSettings = SystemSettingsService.getSettings();
  const [userSettings] = useState({
    company: systemSettings.companyInfo || {
      name: 'Priority Solutions Inc.',
      address: '123 Business Park Drive',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA',
      phone: '+1 (555) 123-4567',
      email: 'info@prioritysolutions.com',
      taxId: 'TAX123456789',
      website: 'www.prioritysolutions.com',
      logo: ''
    },
    currency: systemSettings.currency || 'KES'
  });

  const {
    formData,
    handleFormDataUpdate,
    setFormData
  } = useBusinessDocumentForm({
    documentType: 'invoice',
    document: invoice,
    userSettings
  });

  const [currentStatus, setCurrentStatus] = useState<'draft' | 'sent' | 'paid' | 'overdue'>(
    (formData as Invoice).status || 'draft'
  );

  const handleStatusChange = (newStatus: 'draft' | 'sent' | 'paid' | 'overdue') => {
    setCurrentStatus(newStatus);
    setFormData(prev => ({
      ...prev,
      status: newStatus
    } as Invoice));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Form submitted with data:', formData);
      console.log('Current status:', currentStatus);
      
      // Validation
      if (!formData.documentNumber) {
        toast({
          title: "Error",
          description: "Invoice number is required",
          variant: "destructive",
        });
        return;
      }
      
      if (!formData.date) {
        toast({
          title: "Error",
          description: "Date is required",
          variant: "destructive",
        });
        return;
      }
      
      if (!formData.items || formData.items.length === 0) {
        toast({
          title: "Error",
          description: "At least one line item is required",
          variant: "destructive",
        });
        return;
      }
      
      const updatedInvoice = {
        ...formData as Invoice,
        status: currentStatus,
        invoiceDate: formData.date,
        dueDate: (formData as Invoice).dueDate || calculateDueDate(formData.date, 30)
      };
      
      console.log('Processed invoice data before submission:', updatedInvoice);
      
      onSave(updatedInvoice);
      
      console.log('Invoice saved successfully');
      
      toast({
        title: "Success",
        description: `Invoice ${currentStatus === 'draft' ? 'saved as draft' : 'updated successfully'}`,
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateDueDate = (invoiceDate: string, paymentTerms: number = 30): string => {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + paymentTerms);
    return date.toISOString().split('T')[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'sent': return <FileText className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getCustomerDisplayName = (customer: any) => {
    if (customer.customer_type === 'company') {
      return customer.company_name || 'Company';
    }
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Individual';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground">
              {invoice ? 'Edit' : 'Create'} Invoice
            </h1>
            <Badge className={`${getStatusColor(currentStatus)} flex items-center gap-1`}>
              {getStatusIcon(currentStatus)}
              {currentStatus.toUpperCase()}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleSubmit} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Header */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <Input
                    value={formData.documentNumber}
                    onChange={(e) => handleFormDataUpdate({ documentNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Invoice Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormDataUpdate({ date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={(formData as Invoice).dueDate || calculateDueDate(formData.date, 30)}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value } as Invoice))}
                    required
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={currentStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <Select 
                    value={(formData as Invoice).customer.name} 
                    onValueChange={(value) => {
                      const selectedCustomer = customers?.find(c => getCustomerDisplayName(c) === value);
                      if (selectedCustomer) {
                        setFormData(prev => ({
                          ...prev,
                          customer: {
                            name: getCustomerDisplayName(selectedCustomer),
                            address: selectedCustomer.address || '',
                            city: selectedCustomer.city || '',
                            state: selectedCustomer.state || '',
                            zip: selectedCustomer.postal_code || '',
                            phone: selectedCustomer.phone || '',
                            email: selectedCustomer.email || '',
                            taxId: selectedCustomer.tax_number || '',
                            paymentTerms: '30'
                          }
                        } as Invoice));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={getCustomerDisplayName(customer)}>
                          {getCustomerDisplayName(customer)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleFormDataUpdate({ currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Payment Terms</Label>
                  <Select 
                    value={(formData as Invoice).paymentTerms || '30'} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentTerms: value } as Invoice))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Due Immediately</SelectItem>
                      <SelectItem value="7">Net 7 days</SelectItem>
                      <SelectItem value="15">Net 15 days</SelectItem>
                      <SelectItem value="30">Net 30 days</SelectItem>
                      <SelectItem value="60">Net 60 days</SelectItem>
                      <SelectItem value="90">Net 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Preferred Payment Method</Label>
                  <Select 
                    value={(formData as Invoice).paymentMethod || ''} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value } as Invoice))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile-money">Mobile Money</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VAT Settings */}
          <TaxSettingsSection
            taxSettings={formData.taxSettings}
            onUpdate={(updates) => {
              setFormData(prev => ({
                ...prev,
                taxSettings: { ...prev.taxSettings, ...updates }
              }));
            }}
          />

          {/* Smart Line Items Component */}
          <SmartLineItemComponent
            items={formData.items}
            onItemsChange={(items) => {
              const updatedFormData = { ...formData, items };
              // Recalculate totals
              const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
              const taxAmount = formData.taxSettings.type === 'overall' 
                ? (subtotal * formData.taxSettings.defaultRate) / 100
                : items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
              const total = subtotal + taxAmount;
              
              setFormData({
                ...updatedFormData,
                subtotal,
                taxAmount,
                total
              });
            }}
            currency={formData.currency}
            taxSettings={formData.taxSettings}
            documentType="invoice"
            showStock={true}
            enableBulkImport={true}
            enableBarcodeScanning={true}
          />

          {/* Notes and Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleFormDataUpdate({ notes: e.target.value })}
                  placeholder="Invoice notes and comments"
                  rows={3}
                />
              </div>
              <div>
                <Label>Terms & Conditions</Label>
                <Textarea
                  value={formData.terms || ''}
                  onChange={(e) => handleFormDataUpdate({ terms: e.target.value })}
                  placeholder="Payment terms, late fees, etc."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default EnhancedInvoiceForm;
