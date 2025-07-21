import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DeliveryNote } from '@/modules/sales/types/salesTypes';
import { useBusinessDocumentForm } from '@/hooks/useBusinessDocumentForm';
import SmartLineItemComponent from '@/components/common/SmartLineItemComponent';
import TaxSettingsSection from '@/components/purchase-order/TaxSettingsSection';
import { Save, Truck, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/useCustomers';

interface EnhancedDeliveryNoteFormProps {
  deliveryNote?: DeliveryNote | null;
  onSave: (deliveryNote: DeliveryNote) => void;
  onCancel: () => void;
}

const EnhancedDeliveryNoteForm: React.FC<EnhancedDeliveryNoteFormProps> = ({
  deliveryNote,
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
    documentType: 'delivery-note',
    document: deliveryNote,
    userSettings
  });

  const [currentStatus, setCurrentStatus] = useState<'pending' | 'packed' | 'shipped' | 'delivered'>(
    (formData as DeliveryNote).status || 'pending'
  );

  const handleStatusChange = (newStatus: 'pending' | 'packed' | 'shipped' | 'delivered') => {
    setCurrentStatus(newStatus);
    setFormData(prev => ({
      ...prev,
      status: newStatus
    } as DeliveryNote));
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
          description: "Delivery Note number is required",
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
      
      const updatedDeliveryNote = {
        ...formData as DeliveryNote,
        status: currentStatus,
        deliveryDate: (formData as DeliveryNote).deliveryDate || formData.date,
        expectedDelivery: (formData as DeliveryNote).expectedDelivery || formData.date
      };
      
      console.log('Processed delivery note data before submission:', updatedDeliveryNote);
      
      onSave(updatedDeliveryNote);
      
      console.log('Delivery note saved successfully');
      
      toast({
        title: "Success",
        description: `Delivery Note ${currentStatus === 'pending' ? 'saved as draft' : 'updated successfully'}`,
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to save delivery note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'packed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'packed': return <Package className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
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
              {deliveryNote ? 'Edit' : 'Create'} Delivery Note
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
              <CardTitle>Delivery Note Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>DN Number</Label>
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
                    value={(formData as DeliveryNote).expectedDelivery}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedDelivery: e.target.value } as DeliveryNote))}
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
                      <SelectItem value="packed">Packed</SelectItem>
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
                    value={(formData as DeliveryNote).customer.name} 
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
                        } as DeliveryNote));
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

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Delivery Method</Label>
                  <Select 
                    value={(formData as DeliveryNote).deliveryMethod || ''} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, deliveryMethod: value } as DeliveryNote))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pickup">Customer Pickup</SelectItem>
                      <SelectItem value="delivery">Home Delivery</SelectItem>
                      <SelectItem value="courier">Courier Service</SelectItem>
                      <SelectItem value="mail">Mail Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tracking Number</Label>
                  <Input
                    value={(formData as DeliveryNote).trackingNumber || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value } as DeliveryNote))}
                    placeholder="Enter tracking number"
                  />
                </div>
                <div>
                  <Label>Carrier</Label>
                  <Input
                    value={(formData as DeliveryNote).carrier || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, carrier: e.target.value } as DeliveryNote))}
                    placeholder="Enter carrier name"
                  />
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
            documentType="delivery-note"
            showStock={true}
            enableBulkImport={true}
            enableBarcodeScanning={true}
          />

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Delivery Address</Label>
                  <Textarea
                    value={(formData as DeliveryNote).deliveryAddress || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryAddress: e.target.value } as DeliveryNote))}
                    placeholder="Enter full delivery address"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Special Instructions</Label>
                  <Textarea
                    value={(formData as DeliveryNote).specialInstructions || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value } as DeliveryNote))}
                    placeholder="Any special delivery instructions"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
                  placeholder="Delivery terms and conditions"
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

export default EnhancedDeliveryNoteForm;
