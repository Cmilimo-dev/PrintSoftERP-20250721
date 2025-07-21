import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Edit,
  Download,
  Calendar,
  Building,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Printer
} from 'lucide-react';
import { PurchaseOrder, GoodsReceivingVoucher } from '@/types/businessDocuments';
import SmartLineItemComponent from '@/components/common/SmartLineItemComponent';
import ExportActions from '@/components/shared/ExportActions';

interface PurchaseOrderViewProps {
  purchaseOrder: PurchaseOrder;
  onEdit?: () => void;
  onStatusChange?: (status: PurchaseOrder['status']) => void;
}

interface GRVSummary {
  id: string;
  grvNumber: string;
  receivedDate: string;
  status: 'pending' | 'approved' | 'completed';
  receivedBy: string;
  totalReceived: number;
  itemsReceived: number;
  qualityCheck?: 'passed' | 'failed' | 'pending';
}

const PurchaseOrderView: React.FC<PurchaseOrderViewProps> = ({
  purchaseOrder,
  onEdit,
  onStatusChange
}) => {
  const [relatedGRVs, setRelatedGRVs] = useState<GRVSummary[]>([]);
  const [selectedGRV, setSelectedGRV] = useState<GoodsReceivingVoucher | null>(null);
  const [showGRVDialog, setShowGRVDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data for related GRVs - in real app, this would come from API
  useEffect(() => {
    const mockGRVs: GRVSummary[] = [
      {
        id: '1',
        grvNumber: 'GRV-2024-001',
        receivedDate: '2024-01-15',
        status: 'completed',
        receivedBy: 'John Doe',
        totalReceived: 45000,
        itemsReceived: 3,
        qualityCheck: 'passed'
      },
      {
        id: '2',
        grvNumber: 'GRV-2024-002',
        receivedDate: '2024-01-20',
        status: 'approved',
        receivedBy: 'Jane Smith',
        totalReceived: 8500,
        itemsReceived: 1,
        qualityCheck: 'pending'
      }
    ];
    setRelatedGRVs(mockGRVs);
  }, [purchaseOrder.id]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'draft':
        return <Edit className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleViewGRV = async (grv: GRVSummary) => {
    setLoading(true);
    try {
      // Mock API call to fetch full GRV details
      const fullGRV: GoodsReceivingVoucher = {
        id: grv.id,
        documentNumber: grv.grvNumber,
        date: grv.receivedDate,
        company: purchaseOrder.company,
        vendor: purchaseOrder.vendor,
        purchaseOrderId: purchaseOrder.id,
        receivedDate: grv.receivedDate,
        grvNumber: grv.grvNumber,
        status: grv.status,
        receivedBy: grv.receivedBy,
        qualityCheck: grv.qualityCheck,
        storageLocation: 'Main Warehouse',
        items: purchaseOrder.items.slice(0, grv.itemsReceived).map(item => ({
          ...item,
          quantity: Math.floor(item.quantity * 0.8) // Simulate partial delivery
        })),
        total: grv.totalReceived,
        currency: purchaseOrder.currency,
        taxSettings: purchaseOrder.taxSettings,
        subtotal: grv.totalReceived * 0.86,
        taxAmount: grv.totalReceived * 0.14,
        notes: `Goods received for PO ${purchaseOrder.documentNumber}`
      };
      
      setSelectedGRV(fullGRV);
      setShowGRVDialog(true);
    } catch (error) {
      console.error('Failed to fetch GRV details:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryProgress = () => {
    const totalOrderValue = purchaseOrder.total;
    const totalReceived = relatedGRVs.reduce((sum, grv) => sum + grv.totalReceived, 0);
    return totalOrderValue > 0 ? (totalReceived / totalOrderValue) * 100 : 0;
  };

  const getDeliveryStatus = () => {
    const progress = calculateDeliveryProgress();
    if (progress === 0) return { status: 'Not Started', color: 'text-gray-500' };
    if (progress < 100) return { status: 'Partial Delivery', color: 'text-yellow-600' };
    return { status: 'Fully Delivered', color: 'text-green-600' };
  };

  const deliveryStatus = getDeliveryStatus();
  const deliveryProgress = calculateDeliveryProgress();


  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Purchase Order {purchaseOrder.documentNumber}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={getStatusBadgeVariant(purchaseOrder.status || 'draft')} className="flex items-center gap-1">
                    {getStatusIcon(purchaseOrder.status || 'draft')}
                    {(purchaseOrder.status || 'draft').toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(purchaseOrder.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <ExportActions
                document={purchaseOrder}
                documentType="purchase-order"
                fileName={`PO_${purchaseOrder.documentNumber}`}
                variant="outline"
                size="default"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Delivery Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`font-medium ${deliveryStatus.color}`}>
                {deliveryStatus.status}
              </span>
              <span className="text-sm text-muted-foreground">
                {deliveryProgress.toFixed(1)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(deliveryProgress, 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Ordered:</span>
                <div className="font-medium">{purchaseOrder.currency} {purchaseOrder.total.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Received:</span>
                <div className="font-medium">
                  {purchaseOrder.currency} {relatedGRVs.reduce((sum, grv) => sum + grv.totalReceived, 0).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Pending:</span>
                <div className="font-medium">
                  {purchaseOrder.currency} {(purchaseOrder.total - relatedGRVs.reduce((sum, grv) => sum + grv.totalReceived, 0)).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Order Details</TabsTrigger>
          <TabsTrigger value="line-items">Line Items</TabsTrigger>
          <TabsTrigger value="grv">
            Goods Received
            {relatedGRVs.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {relatedGRVs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Order Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Vendor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">{purchaseOrder.vendor.name}</span>
                </div>
                <div className="text-sm text-muted-foreground flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <div>
                    {purchaseOrder.vendor.address}<br />
                    {purchaseOrder.vendor.city}, {purchaseOrder.vendor.state} {purchaseOrder.vendor.zip}
                  </div>
                </div>
                {purchaseOrder.vendor.phone && (
                  <div className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {purchaseOrder.vendor.phone}
                  </div>
                )}
                {purchaseOrder.vendor.email && (
                  <div className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {purchaseOrder.vendor.email}
                  </div>
                )}
                {purchaseOrder.vendor.expectedDelivery && (
                  <div className="text-sm flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Expected: {new Date(purchaseOrder.vendor.expectedDelivery).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{purchaseOrder.currency} {purchaseOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{purchaseOrder.currency} {purchaseOrder.taxAmount.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{purchaseOrder.currency} {purchaseOrder.total.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Items: {purchaseOrder.items.length}</div>
                  <div>Tax Type: {purchaseOrder.taxSettings.type}</div>
                  <div>Currency: {purchaseOrder.currency}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Details */}
          {(purchaseOrder.notes || purchaseOrder.terms) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {purchaseOrder.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{purchaseOrder.notes}</p>
                  </div>
                )}
                {purchaseOrder.terms && (
                  <div>
                    <h4 className="font-medium mb-2">Terms & Conditions</h4>
                    <p className="text-sm text-muted-foreground">{purchaseOrder.terms}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Line Items Tab */}
        <TabsContent value="line-items">
          <SmartLineItemComponent
            items={purchaseOrder.items}
            onItemsChange={() => {}} // Read-only for viewing
            currency={purchaseOrder.currency}
            taxSettings={purchaseOrder.taxSettings}
            documentType="purchase-order"
            readOnly={true}
            showStock={true}
          />
        </TabsContent>

        {/* Goods Received Tab */}
        <TabsContent value="grv">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Goods Receiving Vouchers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedGRVs.length > 0 ? (
                <div className="space-y-4">
                  {relatedGRVs.map((grv) => (
                    <div key={grv.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{grv.grvNumber}</span>
                            <Badge variant={getStatusBadgeVariant(grv.status)}>
                              {grv.status.toUpperCase()}
                            </Badge>
                            {grv.qualityCheck && (
                              <Badge 
                                variant={grv.qualityCheck === 'passed' ? 'default' : grv.qualityCheck === 'failed' ? 'destructive' : 'secondary'}
                              >
                                QC: {grv.qualityCheck}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(grv.receivedDate).toLocaleDateString()}
                              </span>
                              <span>Received by: {grv.receivedBy}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span>{grv.itemsReceived} items</span>
                              <span className="font-medium">
                                {purchaseOrder.currency} {grv.totalReceived.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewGRV(grv)}
                          disabled={loading}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground">No goods have been received yet for this purchase order.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Related Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Purchase Order PDF</div>
                      <div className="text-sm text-muted-foreground">Generated on {new Date(purchaseOrder.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                
                {relatedGRVs.map((grv) => (
                  <div key={grv.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">GRV {grv.grvNumber}</div>
                        <div className="text-sm text-muted-foreground">Generated on {new Date(grv.receivedDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* GRV Details Dialog */}
      <Dialog open={showGRVDialog} onOpenChange={setShowGRVDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Goods Receiving Voucher Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedGRV && (
            <div className="space-y-6">
              {/* GRV Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">GRV Information</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>GRV Number:</strong> {selectedGRV.grvNumber}</div>
                    <div><strong>Date Received:</strong> {new Date(selectedGRV.receivedDate).toLocaleDateString()}</div>
                    <div><strong>Received By:</strong> {selectedGRV.receivedBy}</div>
                    <div><strong>Storage Location:</strong> {selectedGRV.storageLocation}</div>
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong>
                      <Badge variant={getStatusBadgeVariant(selectedGRV.status)}>
                        {selectedGRV.status.toUpperCase()}
                      </Badge>
                    </div>
                    {selectedGRV.qualityCheck && (
                      <div className="flex items-center gap-2">
                        <strong>Quality Check:</strong>
                        <Badge 
                          variant={selectedGRV.qualityCheck === 'passed' ? 'default' : selectedGRV.qualityCheck === 'failed' ? 'destructive' : 'secondary'}
                        >
                          {selectedGRV.qualityCheck.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Related Purchase Order</h3>
                  <div className="space-y-1 text-sm">
                    <div><strong>PO Number:</strong> {purchaseOrder.documentNumber}</div>
                    <div><strong>PO Date:</strong> {new Date(purchaseOrder.date).toLocaleDateString()}</div>
                    <div><strong>Vendor:</strong> {purchaseOrder.vendor.name}</div>
                  </div>
                </div>
              </div>

              {/* Received Items */}
              <div>
                <h3 className="font-medium mb-4">Received Items</h3>
                <SmartLineItemComponent
                  items={selectedGRV.items}
                  onItemsChange={() => {}} // Read-only
                  currency={selectedGRV.currency}
                  taxSettings={selectedGRV.taxSettings}
                  documentType="goods-receiving-voucher"
                  readOnly={true}
                />
              </div>

              {/* Notes */}
              {selectedGRV.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedGRV.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrderView;
