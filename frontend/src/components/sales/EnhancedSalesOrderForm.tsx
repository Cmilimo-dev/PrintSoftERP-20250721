import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SalesOrder, LineItem } from '@/modules/sales/types/salesTypes';
import { useBusinessDocumentForm } from '@/hooks/useBusinessDocumentForm';
import SmartLineItemComponent from '@/components/common/SmartLineItemComponent';
import TaxSettingsSection from '@/components/purchase-order/TaxSettingsSection';
import { Save, FileText, CheckCircle, AlertCircle, Clock, CreditCard, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/useCustomers';
import { PaymentIntegrationService } from '@/services/paymentIntegrationService';

interface EnhancedSalesOrderFormProps {
  salesOrder?: SalesOrder | null;
  onSave: (so: SalesOrder) => void;
  onCancel: () => void;
}

const EnhancedSalesOrderForm: React.FC<EnhancedSalesOrderFormProps> = ({
  salesOrder,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const { data: customers } = useCustomers();
  const [userSettings] = useState({
    company: {
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
    currency: 'KES'
  });

  const {
    formData,
    handleFormDataUpdate,
    setFormData
  } = useBusinessDocumentForm({
    documentType: 'sales-order',
    document: salesOrder,
    userSettings
  });

  const [currentStatus, setCurrentStatus] = useState<'pending' | 'confirmed' | 'shipped' | 'delivered'>(
    (formData as SalesOrder).status || 'pending'
  );

  const handleStatusChange = (newStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered') => {
    setCurrentStatus(newStatus);
    setFormData(prev => ({
      ...prev,
      status: newStatus
    } as SalesOrder));
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
          description: "Sales Order number is required",
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
      
      const updatedSO = {
        ...formData as SalesOrder,
        status: currentStatus
      };
      
      console.log('Processed sales order data before submission:', updatedSO);
      
      onSave(updatedSO);
      
      console.log('Sales order saved successfully');
      
      toast({
        title: "Success",
        description: `Sales Order ${currentStatus === 'pending' ? 'saved as draft' : 'updated successfully'}`,
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to save sales order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCustomerDisplayName = (customer: any) => {
    if (customer.customer_type === 'company') {
      return customer.company_name || 'Company';
    }
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Individual';
  };

  return (
    <div className="w-full">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground">
              {salesOrder ? 'Edit' : 'Create'} Sales Order
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
          {/* Company Branding Header */}
          <Card>
            <CardContent className="pt-6">
              {(() => {
                const companyHeader = PaymentIntegrationService.formatCompanyHeader();
                return (
                  <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <div className="flex items-center gap-4">
                      {companyHeader.showLogo && companyHeader.logoUrl && (
                        <img 
                          src={companyHeader.logoUrl} 
                          alt="Company Logo" 
                          className="h-16 w-auto object-contain"
                        />
                      )}
                      {companyHeader.showCompanyName && (
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">
                            {companyHeader.companyName}
                          </h2>
                          <p className="text-sm text-muted-foreground">SALES ORDER</p>
                        </div>
                      )}
                      {!companyHeader.showLogo && !companyHeader.showCompanyName && (
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">SALES ORDER</h2>
                          <p className="text-sm text-muted-foreground">Configure company branding in System Settings</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Document #</div>
                      <div className="font-mono text-lg font-semibold">
                        {formData.documentNumber || 'SO-XXXX'}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Document Header */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>SO Number</Label>
                  <Input
                    value={formData.documentNumber}
                    onChange={(e) => handleFormDataUpdate({ documentNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormDataUpdate({ date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Expected Delivery</Label>
                  <Input
                    type="date"
                    value={(formData as SalesOrder).expectedDelivery}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedDelivery: e.target.value } as SalesOrder))}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={currentStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
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
                    value={(formData as SalesOrder).customer?.name || ''} 
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
                        } as SalesOrder));
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
            documentType="sales-order"
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
                  placeholder="Internal notes and comments"
                  rows={3}
                />
              </div>
              <div>
                <Label>Terms & Conditions</Label>
                <Textarea
                  value={formData.terms || ''}
                  onChange={(e) => handleFormDataUpdate({ terms: e.target.value })}
                  placeholder="Delivery terms, payment conditions, etc."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Payment Terms</Label>
                  <Select 
                    value={formData.paymentTerms || '30'} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentTerms: value } as SalesOrder))}
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
                  <Label>Payment Status</Label>
                  <Select 
                    value={formData.paymentStatus || 'pending'} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentStatus: value } as SalesOrder))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select 
                    value={formData.paymentMethod || 'bank_transfer'} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value } as SalesOrder))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Notice about payment info */}
                <div className="text-xs text-muted-foreground col-span-full mt-2 bg-muted/30 p-3 rounded">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Payment Information</p>
                      <p className="text-[11px]">Bank details, M-Pesa and other payment information will be
                      automatically included in the exported document based on your System Settings configuration.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default EnhancedSalesOrderForm;
