import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PurchaseOrder, LineItem } from '@/modules/purchasing/types/purchasingTypes';
import { useBusinessDocumentForm } from '@/hooks/useBusinessDocumentForm';
import SmartLineItemComponent from '@/components/common/SmartLineItemComponent';
import VendorInfoSection from './VendorInfoSection';
import TaxSettingsSection from './TaxSettingsSection';
import { Save, FileText, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MobileFormLayout, 
  MobileFormHeader, 
  MobileFormCard, 
  MobileFormGrid, 
  MobileFormActions 
} from '@/components/ui/mobile-form-layout';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface EnhancedPurchaseOrderFormProps {
  purchaseOrder?: PurchaseOrder | null;
  onSave: (po: PurchaseOrder) => void;
  onCancel: () => void;
}

const EnhancedPurchaseOrderForm: React.FC<EnhancedPurchaseOrderFormProps> = ({
  purchaseOrder,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
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
    handleItemsChange,
    setFormData
  } = useBusinessDocumentForm({
    documentType: 'purchase-order',
    document: purchaseOrder,
    userSettings
  });

  const [currentStatus, setCurrentStatus] = useState<'draft' | 'approved' | 'authorized' | 'pending'>(
    (formData as PurchaseOrder).status || 'draft'
  );
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [vendors] = useState([
    {
      id: '1',
      name: 'ABC Suppliers Ltd',
      address: '123 Industrial Street',
      city: 'Nairobi',
      state: 'Nairobi',
      zip: '00100',
      phone: '+254-123-456789',
      email: 'info@abcsuppliers.co.ke',
      capabilities: ['Electronics', 'Office Supplies'],
      preferredCurrency: 'KES',
      paymentTerms: 'Net 30',
      leadTime: 7
    },
    {
      id: '2',
      name: 'Global Tech Solutions',
      address: '456 Technology Avenue',
      city: 'Mombasa',
      state: 'Mombasa',
      zip: '80100',
      phone: '+254-987-654321',
      email: 'sales@globaltech.co.ke',
      capabilities: ['IT Equipment', 'Software'],
      preferredCurrency: 'USD',
      paymentTerms: 'Net 45',
      leadTime: 14
    },
    {
      id: '3',
      name: 'Office Depot Kenya',
      address: '789 Business Park',
      city: 'Kisumu',
      state: 'Kisumu',
      zip: '40100',
      phone: '+254-555-123456',
      email: 'orders@officedepot.co.ke',
      capabilities: ['Office Furniture', 'Stationery'],
      preferredCurrency: 'KES',
      paymentTerms: 'Net 15',
      leadTime: 5
    }
  ]);

  const handleQueryVendors = () => {
    setShowVendorDialog(true);
  };

  const selectVendor = (vendor: any) => {
    setFormData(prev => ({
      ...prev,
      vendor: {
        name: vendor.name,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        zip: vendor.zip,
        phone: vendor.phone,
        email: vendor.email,
        capabilities: vendor.capabilities,
        preferredCurrency: vendor.preferredCurrency,
        paymentTerms: vendor.paymentTerms,
        leadTime: vendor.leadTime,
        expectedDelivery: new Date(Date.now() + vendor.leadTime * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    }));
    setShowVendorDialog(false);
    toast({
      title: "Vendor Selected",
      description: `${vendor.name} has been selected as the vendor.`,
    });
  };

  const handleStatusChange = (newStatus: 'draft' | 'approved' | 'authorized' | 'pending') => {
    setCurrentStatus(newStatus);
    // Update the form data directly instead of trying to merge with BaseDocument
    setFormData(prev => ({
      ...prev,
      status: newStatus
    } as PurchaseOrder));
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
          description: "Purchase Order number is required",
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
      
      const updatedPO = {
        ...formData as PurchaseOrder,
        status: currentStatus,
        approvalStatus: (currentStatus === 'approved' ? 'approved' : 'pending') as 'approved' | 'pending' | 'rejected'
      };
      
      console.log('Processed purchase order data before submission:', updatedPO);
      
      onSave(updatedPO);
      
      console.log('Purchase order saved successfully');
      
      toast({
        title: "Success",
        description: `Purchase Order ${currentStatus === 'draft' ? 'saved as draft' : 'submitted for approval'}`,
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to save purchase order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAsMHT = () => {
    const mhtContent = generateMHTContent(formData as PurchaseOrder);
    const blob = new Blob([mhtContent], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PO-${formData.documentNumber}.mht`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Purchase Order saved as MHT file",
    });
  };

  const generateMHTContent = (po: PurchaseOrder): string => {
    const boundary = `----=_NextPart_${Date.now()}`;
    return `MIME-Version: 1.0
Content-Type: multipart/related; boundary="${boundary}"

--${boundary}
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: quoted-printable

<!DOCTYPE html>
<html>
<head>
    <title>Purchase Order ${po.documentNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .details { margin-bottom: 20px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items-table th { background-color: #f2f2f2; }
        .totals { text-align: right; margin-top: 20px; }
        .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status-draft { background-color: #fbbf24; color: #92400e; }
        .status-approved { background-color: #10b981; color: #065f46; }
        .status-authorized { background-color: #3b82f6; color: #1e3a8a; }
    </style>
</head>
<body>
    <div class="header">
        <h1>PURCHASE ORDER</h1>
        <h2>${po.documentNumber}</h2>
        <span class="status-badge status-${po.status}">${po.status?.toUpperCase()}</span>
    </div>
    
    <div class="details">
        <h3>Company Information</h3>
        <p><strong>${po.company.name}</strong></p>
        <p>${po.company.address}</p>
        <p>${po.company.city}, ${po.company.state} ${po.company.zip}</p>
        <p>Phone: ${po.company.phone}</p>
        <p>Email: ${po.company.email}</p>
    </div>
    
    <div class="details">
        <h3>Vendor Information</h3>
        <p><strong>${po.vendor.name}</strong></p>
        <p>${po.vendor.address}</p>
        <p>${po.vendor.city}, ${po.vendor.state} ${po.vendor.zip}</p>
        ${po.vendor.phone ? `<p>Phone: ${po.vendor.phone}</p>` : ''}
        ${po.vendor.email ? `<p>Email: ${po.vendor.email}</p>` : ''}
    </div>
    
    <table class="items-table">
        <thead>
            <tr>
                <th>Item Code</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${po.items.map(item => `
            <tr>
                <td>${item.itemCode}</td>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${po.currency} ${item.unitPrice.toFixed(2)}</td>
                <td>${po.currency} ${item.total.toFixed(2)}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="totals">
        <p><strong>Subtotal: ${po.currency} ${po.subtotal.toFixed(2)}</strong></p>
        <p><strong>Tax: ${po.currency} ${po.taxAmount.toFixed(2)}</strong></p>
        <p><strong>Total: ${po.currency} ${po.total.toFixed(2)}</strong></p>
    </div>
    
    ${po.notes ? `<div class="details"><h3>Notes</h3><p>${po.notes}</p></div>` : ''}
    ${po.terms ? `<div class="details"><h3>Terms & Conditions</h3><p>${po.terms}</p></div>` : ''}
</body>
</html>

--${boundary}--`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'authorized': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'authorized': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const isMobile = useIsMobile();

  return (
    <MobileFormLayout>
      <MobileFormHeader
        title={`${purchaseOrder ? 'Edit' : 'Create'} Purchase Order`}
        badge={
          <Badge className={`${getStatusColor(currentStatus)} flex items-center gap-1`}>
            {getStatusIcon(currentStatus)}
            {currentStatus.toUpperCase()}
          </Badge>
        }
        actions={
          <>
            <Button variant="outline" onClick={onCancel} size={isMobile ? "default" : "default"}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleSaveAsMHT} size={isMobile ? "default" : "default"}>
              Save as MHT
            </Button>
            <Button onClick={handleSubmit} className="flex items-center gap-2" size={isMobile ? "default" : "default"}>
              <Save className="w-4 h-4" />
              Save
            </Button>
          </>
        }
        onBack={onCancel}
      />

        <form onSubmit={handleSubmit} className={isMobile ? "space-y-4" : "space-y-6"}>
          {/* Document Header */}
          <MobileFormCard 
            title="Document Information" 
            icon={<FileText className="h-5 w-5" />}
          >
            <MobileFormGrid columns={4}>
              <div>
                <Label>PO Number</Label>
                <Input
                  value={formData.documentNumber || ''}
                  onChange={(e) => handleFormDataUpdate({ documentNumber: e.target.value })}
                  required
                  className={isMobile ? "h-12" : ""}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => handleFormDataUpdate({ date: e.target.value })}
                  required
                  className={isMobile ? "h-12" : ""}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleFormDataUpdate({ currency: value })}>
                  <SelectTrigger className={isMobile ? "h-12" : ""}>
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
              <div>
                <Label>Status</Label>
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className={isMobile ? "h-12" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="authorized">Authorized</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </MobileFormGrid>
          </MobileFormCard>

          <VendorInfoSection 
            vendor={(formData as PurchaseOrder).vendor}
            onUpdate={(updates) => setFormData(prev => ({ 
              ...prev, 
              vendor: { ...((prev as PurchaseOrder).vendor || {}), ...updates }
            }))}
            onQueryVendors={handleQueryVendors}
          />

          <TaxSettingsSection 
            taxSettings={formData.taxSettings}
            onUpdate={(updates) => setFormData(prev => ({
              ...prev,
              taxSettings: { ...prev.taxSettings, ...updates }
            }))}
          />

          {/* Smart Line Items Component */}
          <SmartLineItemComponent
            items={formData.items}
            onItemsChange={handleItemsChange}
            currency={formData.currency}
            taxSettings={formData.taxSettings}
            documentType="purchase-order"
            showStock={true}
            enableBulkImport={true}
            enableBarcodeScanning={true}
          />

          {/* Notes and Terms */}
          <MobileFormCard 
            title="Additional Information" 
            icon={<FileText className="h-5 w-5" />}
            collapsible={isMobile}
            defaultCollapsed={isMobile}
          >
            <div className={isMobile ? "space-y-3" : "space-y-4"}>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleFormDataUpdate({ notes: e.target.value })}
                  placeholder="Internal notes and comments"
                  rows={isMobile ? 2 : 3}
                  className={isMobile ? "min-h-[80px]" : ""}
                />
              </div>
              <div>
                <Label>Terms & Conditions</Label>
                <Textarea
                  value={formData.terms || ''}
                  onChange={(e) => handleFormDataUpdate({ terms: e.target.value })}
                  placeholder="Payment terms, delivery conditions, etc."
                  rows={isMobile ? 3 : 4}
                  className={isMobile ? "min-h-[100px]" : ""}
                />
              </div>
            </div>
          </MobileFormCard>
        </form>

      {/* Vendor Selection Dialog */}
      <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
        <DialogContent className={cn(
          isMobile ? "max-w-[95vw] max-h-[90vh]" : "max-w-4xl",
          "overflow-y-auto"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Select Vendor
            </DialogTitle>
          </DialogHeader>
          <div className={isMobile ? "space-y-3" : "space-y-4"}>
            <div className="grid gap-3">
              {vendors.map((vendor) => (
                <Card 
                  key={vendor.id} 
                  className="cursor-pointer hover:bg-gray-50 transition-colors" 
                  onClick={() => selectVendor(vendor)}
                >
                  <CardContent className={isMobile ? "p-3" : "p-4"}>
                    <div className={cn(
                      "flex items-start",
                      isMobile ? "flex-col gap-3" : "justify-between"
                    )}>
                      <div className={isMobile ? "w-full" : "space-y-2"}>
                        <h3 className={cn(
                          "font-semibold",
                          isMobile ? "text-base" : "text-lg"
                        )}>
                          {vendor.name}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{vendor.address}</p>
                          <p>{vendor.city}, {vendor.state} {vendor.zip}</p>
                          <p>Phone: {vendor.phone}</p>
                          <p>Email: {vendor.email}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {vendor.capabilities.map((cap, index) => (
                            <Badge key={index} variant="secondary" className={isMobile ? "text-xs" : "text-xs"}>
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className={cn(
                        "text-sm",
                        isMobile ? "w-full border-t pt-3 mt-3" : "text-right"
                      )}>
                        <p><strong>Currency:</strong> {vendor.preferredCurrency}</p>
                        <p><strong>Payment Terms:</strong> {vendor.paymentTerms}</p>
                        <p><strong>Lead Time:</strong> {vendor.leadTime} days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MobileFormLayout>
  );
};

export default EnhancedPurchaseOrderForm;
