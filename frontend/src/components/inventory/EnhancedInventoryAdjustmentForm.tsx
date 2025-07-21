import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LineItem } from '@/types/businessDocuments';
import SmartLineItemComponent from '@/components/common/SmartLineItemComponent';
import { Save, FileText, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InventoryAdjustment {
  id: string;
  adjustmentNumber: string;
  date: string;
  type: 'increase' | 'decrease' | 'write-off' | 'recount';
  reason: string;
  status: 'draft' | 'approved' | 'applied';
  adjustedBy: string;
  approvedBy?: string;
  items: LineItem[];
  notes?: string;
  location: string;
  totalValue: number;
}

interface EnhancedInventoryAdjustmentFormProps {
  adjustment?: InventoryAdjustment | null;
  onSave: (adjustment: InventoryAdjustment) => void;
  onCancel: () => void;
}

const EnhancedInventoryAdjustmentForm: React.FC<EnhancedInventoryAdjustmentFormProps> = ({
  adjustment,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<InventoryAdjustment>(() => ({
    id: adjustment?.id || Date.now().toString(),
    adjustmentNumber: adjustment?.adjustmentNumber || `ADJ-${Date.now()}`,
    date: adjustment?.date || new Date().toISOString().split('T')[0],
    type: adjustment?.type || 'recount',
    reason: adjustment?.reason || '',
    status: adjustment?.status || 'draft',
    adjustedBy: adjustment?.adjustedBy || 'Current User',
    items: adjustment?.items || [],
    notes: adjustment?.notes || '',
    location: adjustment?.location || 'Main Warehouse',
    totalValue: adjustment?.totalValue || 0
  }));

  const [currentStatus, setCurrentStatus] = useState<'draft' | 'approved' | 'applied'>(
    formData.status
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Form submitted with data:', formData);
      console.log('Current status:', currentStatus);
      
      // Validation
      if (!formData.documentNumber) {
        toast({
          title: "Error",
          description: "Adjustment number is required",
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
          description: "At least one adjustment item is required",
          variant: "destructive",
        });
        return;
      }
      
      const updatedAdjustment = {
        ...formData as InventoryAdjustment,
        status: currentStatus
      };
      
      console.log('Processed inventory adjustment data before submission:', updatedAdjustment);
      
      onSave(updatedAdjustment);
      
      console.log('Inventory adjustment saved successfully');
      
      toast({
        title: "Success",
        description: `Inventory Adjustment ${currentStatus === 'draft' ? 'saved as draft' : 'processed successfully'}`,
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to save inventory adjustment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'applied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'applied': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'increase': return 'bg-green-100 text-green-800';
      case 'decrease': return 'bg-red-100 text-red-800';
      case 'write-off': return 'bg-orange-100 text-orange-800';
      case 'recount': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground">
              {adjustment ? 'Edit' : 'Create'} Inventory Adjustment
            </h1>
            <div className="flex gap-2">
              <Badge className={`${getStatusColor(currentStatus)} flex items-center gap-1`}>
                {getStatusIcon(currentStatus)}
                {currentStatus.toUpperCase()}
              </Badge>
              <Badge className={`${getTypeColor(formData.type)} flex items-center gap-1`}>
                {formData.type.toUpperCase()}
              </Badge>
            </div>
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
              <CardTitle>Adjustment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Adjustment Number</Label>
                  <Input
                    value={formData.adjustmentNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, adjustmentNumber: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: 'increase' | 'decrease' | 'write-off' | 'recount') => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">Stock Increase</SelectItem>
                      <SelectItem value="decrease">Stock Decrease</SelectItem>
                      <SelectItem value="write-off">Write-off</SelectItem>
                      <SelectItem value="recount">Recount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={currentStatus} 
                    onValueChange={(value: 'draft' | 'approved' | 'applied') => setCurrentStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Adjustment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Adjustment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <Select 
                    value={formData.location} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main Warehouse">Main Warehouse</SelectItem>
                      <SelectItem value="Storage Room A">Storage Room A</SelectItem>
                      <SelectItem value="Storage Room B">Storage Room B</SelectItem>
                      <SelectItem value="Retail Floor">Retail Floor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Adjusted By</Label>
                  <Input
                    value={formData.adjustedBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, adjustedBy: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label>Reason for Adjustment</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Explain the reason for this inventory adjustment"
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Smart Line Items Component for Inventory Adjustments */}
          <SmartLineItemComponent
            items={formData.items}
            onItemsChange={(items) => {
              setFormData(prev => ({
                ...prev,
                items,
                totalValue: items.reduce((sum, item) => sum + item.total, 0)
              }));
            }}
            currency="KES"
            taxSettings={{ type: 'overall', defaultRate: 0 }}
            documentType="inventory-adjustment"
            showStock={true}
            enableBulkImport={true}
            enableBarcodeScanning={true}
          />

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this adjustment"
                  rows={4}
                />
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Adjustment Value:</span>
                  <span className="text-lg font-bold">
                    KES {formData.items.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {formData.items.length} item(s) affected
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default EnhancedInventoryAdjustmentForm;
