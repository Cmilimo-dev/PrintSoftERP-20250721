import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useBusinessDocumentForm } from '@/hooks/useBusinessDocumentForm';
import SmartLineItemComponent from '@/components/common/SmartLineItemComponent';
import VendorSelector from '@/components/business-document/VendorSelector';
import { Save, RotateCcw, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface GoodsReturnItem {
  id: string;
  description: string;
  itemCode?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  returnReason?: string;
  condition?: 'defective' | 'damaged' | 'wrong_item' | 'excess' | 'expired';
}

export interface GoodsReturn {
  id?: string;
  documentNumber: string;
  returnDate: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  reason: string;
  vendor: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    email?: string;
  };
  items: GoodsReturnItem[];
  total: number;
  subtotal: number;
  taxAmount?: number;
  currency: string;
  taxSettings?: {
    type: string;
    defaultRate: number;
  };
  date: string;
  notes?: string;
  returnedBy?: string;
  authorizedBy?: string;
  refundMethod?: 'credit_note' | 'cash_refund' | 'replacement' | 'account_credit';
  originalPurchaseOrder?: string;
  originalInvoice?: string;
}

interface GoodsReturnFormProps {
  goodsReturn?: GoodsReturn | null;
  onSave: (goodsReturn: GoodsReturn) => void;
  onCancel: () => void;
}

const GoodsReturnForm: React.FC<GoodsReturnFormProps> = ({
  goodsReturn,
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
    currency: 'USD'
  });

  const {
    formData,
    handleFormDataUpdate,
    setFormData
  } = useBusinessDocumentForm({
    documentType: 'goods-return',
    document: goodsReturn,
    userSettings
  });

  const [returnData, setReturnData] = useState<Partial<GoodsReturn>>({
    documentNumber: goodsReturn?.documentNumber || `GR-${Date.now()}`,
    returnDate: goodsReturn?.returnDate || new Date().toISOString().split('T')[0],
    status: goodsReturn?.status || 'pending',
    reason: goodsReturn?.reason || '',
    returnedBy: goodsReturn?.returnedBy || '',
    authorizedBy: goodsReturn?.authorizedBy || '',
    refundMethod: goodsReturn?.refundMethod || 'credit_note',
    originalPurchaseOrder: goodsReturn?.originalPurchaseOrder || '',
    originalInvoice: goodsReturn?.originalInvoice || '',
    notes: goodsReturn?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Form submitted with data:', { formData, returnData });
      
      // Validation
      if (!returnData.documentNumber) {
        toast({
          title: "Error",
          description: "Return number is required",
          variant: "destructive",
        });
        return;
      }
      
      if (!returnData.returnDate) {
        toast({
          title: "Error",
          description: "Return date is required",
          variant: "destructive",
        });
        return;
      }

      if (!returnData.reason) {
        toast({
          title: "Error",
          description: "Return reason is required",
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

      if (!formData.vendor?.name) {
        toast({
          title: "Error",
          description: "Vendor information is required",
          variant: "destructive",
        });
        return;
      }
      
      const updatedGoodsReturn: GoodsReturn = {
        ...formData,
        ...returnData,
        id: goodsReturn?.id || `gr-${Date.now()}`,
        vendor: (formData as any).vendor || { name: '' },
        taxSettings: {
          type: 'none',
          defaultRate: 0
        },
        date: returnData.returnDate || new Date().toISOString().split('T')[0]
      } as GoodsReturn;
      
      console.log('Processed Goods Return data before submission:', updatedGoodsReturn);
      
      onSave(updatedGoodsReturn);
      
      console.log('Goods Return saved successfully');
      
      toast({
        title: "Success",
        description: "Goods Return saved successfully",
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to save Goods Return. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const returnReasons = [
    'Defective/Quality Issue',
    'Damaged in Transit',
    'Wrong Item Shipped',
    'Excess Inventory',
    'Expired Product',
    'Customer Return',
    'Specification Change',
    'Other'
  ];

  const refundMethods = [
    { value: 'credit_note', label: 'Credit Note' },
    { value: 'cash_refund', label: 'Cash Refund' },
    { value: 'replacement', label: 'Replacement' },
    { value: 'account_credit', label: 'Account Credit' }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <RotateCcw className="w-8 h-8" />
              {goodsReturn ? 'Edit' : 'Create'} Goods Return
            </h1>
            <Badge className={`${getStatusColor(returnData.status || 'pending')} flex items-center gap-1`}>
              {getStatusIcon(returnData.status || 'pending')}
              {(returnData.status || 'pending').toUpperCase()}
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
              <CardTitle>Return Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Return Number</Label>
                  <Input
                    value={returnData.documentNumber || ''}
                    onChange={(e) => setReturnData(prev => ({ ...prev, documentNumber: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Return Date</Label>
                  <Input
                    type="date"
                    value={returnData.returnDate || ''}
                    onChange={(e) => setReturnData(prev => ({ ...prev, returnDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={returnData.status || 'pending'} 
                    onValueChange={(value: 'pending' | 'approved' | 'completed' | 'rejected') => setReturnData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Refund Method</Label>
                  <Select 
                    value={returnData.refundMethod || 'credit_note'} 
                    onValueChange={(value: 'credit_note' | 'cash_refund' | 'replacement' | 'account_credit') => setReturnData(prev => ({ ...prev, refundMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {refundMethods.map(method => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>Return Reason</Label>
                  <Select 
                    value={returnData.reason || ''} 
                    onValueChange={(value) => setReturnData(prev => ({ ...prev, reason: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select return reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {returnReasons.map(reason => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Returned By</Label>
                  <Input
                    value={returnData.returnedBy || ''}
                    onChange={(e) => setReturnData(prev => ({ ...prev, returnedBy: e.target.value }))}
                    placeholder="Name of person processing return"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>Original Purchase Order (Optional)</Label>
                  <Input
                    value={returnData.originalPurchaseOrder || ''}
                    onChange={(e) => setReturnData(prev => ({ ...prev, originalPurchaseOrder: e.target.value }))}
                    placeholder="PO-XXXX"
                  />
                </div>
                <div>
                  <Label>Original Invoice (Optional)</Label>
                  <Input
                    value={returnData.originalInvoice || ''}
                    onChange={(e) => setReturnData(prev => ({ ...prev, originalInvoice: e.target.value }))}
                    placeholder="INV-XXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
            </CardHeader>
            <CardContent>
              <VendorSelector
                vendor={(formData as any).vendor || { name: '', address: '', city: '', state: '', zip: '', phone: '', email: '' }}
                onUpdate={(vendorUpdates) => {
                  const currentVendor = (formData as any).vendor || {};
                  const updatedVendor = { ...currentVendor, ...vendorUpdates };
                  handleFormDataUpdate({ vendor: updatedVendor });
                }}
                onAddNew={() => {
                  // TODO: Implement add new vendor functionality
                  toast({
                    title: "Feature Coming Soon",
                    description: "Add new vendor functionality will be implemented soon.",
                  });
                }}
              />
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items to Return</CardTitle>
            </CardHeader>
            <CardContent>
              <SmartLineItemComponent
                items={formData.items || []}
                onItemsChange={(items) => handleFormDataUpdate({ items })}
                showTax={false}
                documentType="goods-return"
                additionalColumns={[
                  {
                    key: 'returnReason',
                    label: 'Return Reason',
                    render: (item, index) => (
                      <Select
                        value={(item as any).returnReason || ''}
                        onValueChange={(value) => {
                          const updatedItems = [...(formData.items || [])];
                          updatedItems[index] = { ...updatedItems[index], returnReason: value };
                          handleFormDataUpdate({ items: updatedItems });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="defective">Defective</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                          <SelectItem value="wrong_item">Wrong Item</SelectItem>
                          <SelectItem value="excess">Excess</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    )
                  }
                ]}
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={returnData.notes || ''}
                onChange={(e) => setReturnData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter any additional notes about this return..."
                rows={4}
              />
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default GoodsReturnForm;
