
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DeliveryNote, LineItem } from '@/types/businessDocuments';
import SmartLineItemComponent from '@/components/common/SmartLineItemComponent';
import { Package, Truck } from 'lucide-react';

interface DeliveryNoteFieldsProps {
  formData: DeliveryNote;
  onUpdate: (updates: Partial<DeliveryNote>) => void;
}

const DeliveryNoteFields: React.FC<DeliveryNoteFieldsProps> = ({ formData, onUpdate }) => {
  const handleLineItemsChange = (items: LineItem[]) => {
    // Update items property as per DeliveryNote type definition
    onUpdate({ 
      items: items
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="deliveryDate">Delivery Date</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => onUpdate({ deliveryDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="carrier">Carrier</Label>
            <Input
              id="carrier"
              value={formData.carrier || ''}
              onChange={(e) => onUpdate({ carrier: e.target.value })}
              placeholder="e.g., Express Delivery Co."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="trackingNumber">Tracking Number</Label>
            <Input
              id="trackingNumber"
              value={formData.trackingNumber || ''}
              onChange={(e) => onUpdate({ trackingNumber: e.target.value })}
              placeholder="e.g., TRK123456789"
            />
          </div>
          <div>
            <Label htmlFor="relatedOrder">Related Order</Label>
            <Input
              id="relatedOrder"
              value={formData.relatedOrder || ''}
              onChange={(e) => onUpdate({ relatedOrder: e.target.value })}
              placeholder="e.g., SO-2024-001"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="deliveryAddress">Delivery Address</Label>
          <Textarea
            id="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={(e) => onUpdate({ deliveryAddress: e.target.value })}
            placeholder="Enter complete delivery address"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="deliveredBy">Delivered By</Label>
            <Input
              id="deliveredBy"
              value={formData.deliveredBy || ''}
              onChange={(e) => onUpdate({ deliveredBy: e.target.value })}
              placeholder="Driver/Delivery person name"
            />
          </div>
          <div>
            <Label htmlFor="receivedBy">Received By</Label>
            <Input
              id="receivedBy"
              value={formData.receivedBy || ''}
              onChange={(e) => onUpdate({ receivedBy: e.target.value })}
              placeholder="Recipient name"
            />
          </div>
        </div>
        </CardContent>
      </Card>

      {/* Delivery Items Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Items for Delivery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SmartLineItemComponent
            items={formData.items || []}
            onItemsChange={handleLineItemsChange}
            documentType="delivery-note"
            currency={formData.currency || 'KES'}
            readOnly={false}
            showStock={true}
            enableBulkImport={true}
            enableBarcodeScanning={true}
            taxSettings={{ type: 'exclusive', defaultRate: 0 }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryNoteFields;
