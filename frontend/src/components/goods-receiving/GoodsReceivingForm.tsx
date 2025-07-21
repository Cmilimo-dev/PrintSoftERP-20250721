
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { GoodsReceivingVoucher, LineItem } from '@/types/businessDocuments';
import { useBusinessDocumentForm } from '@/hooks/useBusinessDocumentForm';
import SmartLineItemComponent from '@/components/common/SmartLineItemComponent';
import VendorInfoSection from '@/components/purchase-order/VendorInfoSection';
import { Save, Package, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast } from '@/components/ui/use-toast';
import { 
  MobileFormLayout, 
  MobileFormHeader, 
  MobileFormCard, 
  MobileFormGrid 
} from '@/components/ui/mobile-form-layout';
import { useIsMobile } from '@/hooks/use-mobile';

interface GoodsReceivingFormProps {
  grv?: GoodsReceivingVoucher | null;
  onSave: (grv: GoodsReceivingVoucher) => void;
  onCancel: () => void;
}

const GoodsReceivingForm: React.FC<GoodsReceivingFormProps> = ({
  grv,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
    documentType: 'goods-receiving-voucher',
    document: grv,
    userSettings
  });

  const [grvData, setGrvData] = useState<Partial<GoodsReceivingVoucher>>({
    grvNumber: grv?.grvNumber || `GRV-${Date.now()}`,
    receivedDate: grv?.receivedDate || new Date().toISOString().split('T')[0],
    status: grv?.status || 'pending',
    receivedBy: grv?.receivedBy || '',
    qualityCheck: grv?.qualityCheck || 'pending',
    storageLocation: grv?.storageLocation || '',
    purchaseOrderId: grv?.purchaseOrderId || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Form submitted with data:', { formData, grvData });
      
      // Validation
      if (!grvData.grvNumber) {
        toast({
          title: "Error",
          description: "GRV number is required",
          variant: "destructive",
        });
        return;
      }
      
      if (!grvData.receivedDate) {
        toast({
          title: "Error",
          description: "Received date is required",
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
      
      const updatedGRV: GoodsReceivingVoucher = {
        ...formData,
        ...grvData,
        vendor: (formData as any).vendor || { name: '', address: '', city: '', state: '', zip: '', expectedDelivery: '' }
      } as GoodsReceivingVoucher;
      
      console.log('Processed GRV data before submission:', updatedGRV);
      
      onSave(updatedGRV);
      
      console.log('GRV saved successfully');
      
      toast({
        title: "Success",
        description: "Goods Receiving Voucher saved successfully",
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to save GRV. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <MobileFormLayout>
      <MobileFormHeader
        title={`${grv ? 'Edit' : 'Create'} Goods Receiving Voucher`}
        badge={
          <Badge className={`${getStatusColor(grvData.status || 'pending')} flex items-center gap-1`}>
            {getStatusIcon(grvData.status || 'pending')}
            {(grvData.status || 'pending').toUpperCase()}
          </Badge>
        }
        actions={
          <>
            <Button variant="outline" onClick={onCancel} size={isMobile ? "default" : "default"}>
              Cancel
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
            title="GRV Information"
            icon={<Package className="h-5 w-5" />}
          >
            <MobileFormGrid columns={4}>
              <div>
                <Label>GRV Number</Label>
                <Input
                  value={grvData.grvNumber || ''}
                  onChange={(e) => setGrvData(prev => ({ ...prev, grvNumber: e.target.value }))}
                  required
                  className={isMobile ? "h-12" : ""}
                />
              </div>
              <div>
                <Label>Received Date</Label>
                <Input
                  type="date"
                  value={grvData.receivedDate || ''}
                  onChange={(e) => setGrvData(prev => ({ ...prev, receivedDate: e.target.value }))}
                  required
                  className={isMobile ? "h-12" : ""}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={grvData.status || 'pending'} onValueChange={(value: 'pending' | 'approved' | 'completed') => setGrvData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className={isMobile ? "h-12" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Purchase Order ID</Label>
                <Input
                  value={grvData.purchaseOrderId || ''}
                  onChange={(e) => setGrvData(prev => ({ ...prev, purchaseOrderId: e.target.value }))}
                  placeholder="Related PO number"
                  className={isMobile ? "h-12" : ""}
                />
              </div>
            </MobileFormGrid>
          </MobileFormCard>

          {/* Receiving Details */}
          <MobileFormCard
            title="Receiving Details"
            icon={<CheckCircle className="h-5 w-5" />}
          >
            <MobileFormGrid columns={3}>
              <div>
                <Label>Received By</Label>
                <Input
                  value={grvData.receivedBy || ''}
                  onChange={(e) => setGrvData(prev => ({ ...prev, receivedBy: e.target.value }))}
                  placeholder="Employee name"
                  className={isMobile ? "h-12" : ""}
                />
              </div>
              <div>
                <Label>Quality Check Status</Label>
                <Select value={grvData.qualityCheck || 'pending'} onValueChange={(value: 'passed' | 'failed' | 'pending') => setGrvData(prev => ({ ...prev, qualityCheck: value }))}>
                  <SelectTrigger className={isMobile ? "h-12" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Storage Location</Label>
                <Input
                  value={grvData.storageLocation || ''}
                  onChange={(e) => setGrvData(prev => ({ ...prev, storageLocation: e.target.value }))}
                  placeholder="Warehouse/Location"
                  className={isMobile ? "h-12" : ""}
                />
              </div>
            </MobileFormGrid>
          </MobileFormCard>

          <VendorInfoSection 
            vendor={(formData as any).vendor || { name: '', address: '', city: '', state: '', zip: '', expectedDelivery: '' }}
            onUpdate={(updates) => setFormData(prev => ({ 
              ...prev, 
              vendor: { ...((prev as any).vendor || {}), ...updates }
            }))}
            onQueryVendors={() => {}}
          />

          {/* Smart Line Items Component for Received Items */}
          <SmartLineItemComponent
            items={formData.items}
            onItemsChange={(items) => {
              const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
              const taxAmount = (subtotal * formData.taxSettings.defaultRate) / 100;
              const total = subtotal + taxAmount;
              
              setFormData({
                ...formData,
                items,
                subtotal,
                taxAmount,
                total
              });
            }}
            currency={formData.currency}
            taxSettings={formData.taxSettings}
            documentType="goods-receiving-voucher"
            showStock={true}
            enableBulkImport={true}
            enableBarcodeScanning={true}
          />

          {/* Notes */}
          <MobileFormCard
            title="Additional Information"
            icon={<AlertCircle className="h-5 w-5" />}
            collapsible={isMobile}
            defaultCollapsed={isMobile}
          >
            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => handleFormDataUpdate({ notes: e.target.value })}
                placeholder="Delivery notes, condition remarks, etc."
                rows={isMobile ? 3 : 4}
                className={isMobile ? "min-h-[100px]" : ""}
              />
            </div>
          </MobileFormCard>
        </form>
    </MobileFormLayout>
  );
};

export default GoodsReceivingForm;
