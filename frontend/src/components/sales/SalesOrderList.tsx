
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobilePageHeader } from '@/components/ui/mobile-page-header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SalesStorageService } from '@/modules/sales/services/salesStorageService';
import { SalesOrder } from '@/modules/sales/types/salesTypes';
import BusinessDocumentPrint from '@/components/BusinessDocumentPrint';
import StatusChangeButton from '@/components/business-flow/StatusChangeButton';
import { useConvertSalesOrderToInvoice, useCreateDeliveryNoteFromSalesOrder } from '@/hooks/business-flow/useSalesOrderFlow';
import { FileText, Calendar, DollarSign, Eye, Download, Printer, MoreHorizontal } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SalesOrderList: React.FC = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showPrintView, setShowPrintView] = useState(false);
  
  const convertToInvoice = useConvertSalesOrderToInvoice();
  const createDeliveryNote = useCreateDeliveryNoteFromSalesOrder();

  const handleConvertToInvoice = (salesOrderId: string) => {
    convertToInvoice.mutate(salesOrderId);
  };

  const handleCreateDeliveryNote = (salesOrderId: string) => {
    createDeliveryNote.mutate(salesOrderId);
  };

  useEffect(() => {
    const loadSalesOrders = () => {
      try {
        const storedOrders = SalesStorageService.getDocuments('sales-order') as SalesOrder[];
        setSalesOrders(storedOrders);
      } catch (error) {
        console.error('Error loading sales orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSalesOrders();
  }, []);

  console.log('SalesOrderList - salesOrders:', salesOrders);

  if (isLoading) {
    return <div>Loading sales orders...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'confirmed': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCustomerName = (customer: any) => {
    if (!customer) return 'Unknown Customer';
    
    if (customer.customer_type === 'company') {
      return customer.company_name || 'Company';
    }
    
    const firstName = customer.first_name || '';
    const lastName = customer.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Individual Customer';
  };

  const transformItemsForPrint = (orderItems: any[]) => {
    return orderItems?.map(item => ({
      itemCode: item.products?.sku || '',
      description: item.products?.name || item.products?.description || '',
      quantity: item.quantity || 0,
      unitPrice: item.unit_price || 0,
      total: item.total_price || 0,
      taxRate: 0
    })) || [];
  };

  const handlePrint = (order: any) => {
    console.log('Print sales order:', order.id);
    const documentData = {
      documentNumber: order.order_number,
      date: order.order_date,
      total: order.total_amount,
      currency: 'KES',
      customer: order.customers ? {
        name: getCustomerName(order.customers),
        address: order.customers.address || '',
        city: order.customers.city || '',
        state: order.customers.state || '',
        zip: order.customers.postal_code || '',
        phone: order.customers.phone || '',
        email: order.customers.email || '',
      } : null,
      company: {
        name: 'Priority Solutions Inc.',
        address: '123 Business Park Drive',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'USA',
        phone: '+1 (555) 123-4567',
        email: 'info@prioritysolutions.com',
        website: 'www.prioritysolutions.com',
        taxId: 'TAX123456789',
      },
      items: transformItemsForPrint(order.sales_order_items),
      subtotal: order.subtotal,
      taxAmount: order.tax_amount,
      notes: order.notes,
      taxSettings: {
        type: 'total',
        defaultRate: 16
      }
    };
    setSelectedOrder(documentData);
    setShowPrintView(true);
  };

  const handleDownload = (order: any) => {
    console.log('Download sales order:', order.id);
    handlePrint(order);
  };

  const handleView = (order: any) => {
    console.log('View sales order:', order.id);
    handlePrint(order);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sales Orders
            <Badge variant="outline" className="ml-auto">
              {salesOrders?.length || 0} records
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesOrders?.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{order.order_number}</div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <TooltipProvider>
                        <DropdownMenu>
                          <Tooltip>
                            <DropdownMenuTrigger asChild>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-5 w-5 text-blue-600 font-bold" strokeWidth={3} />
                                </Button>
                              </TooltipTrigger>
                            </DropdownMenuTrigger>
                            <TooltipContent>
                              <p>Document Actions</p>
                            </TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="end">
                            {order.status === "confirmed" && (
                              <>
                                <DropdownMenuItem onClick={() => handleConvertToInvoice(order.id)}>
                                  Make Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCreateDeliveryNote(order.id)}>
                                  Create DNote
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TooltipProvider>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Customer: {getCustomerName(order.customers)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.order_date).toLocaleDateString()}
                      {order.expected_delivery_date && (
                        <span className="ml-2">Expected: {new Date(order.expected_delivery_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-lg font-bold">
                      <DollarSign className="h-4 w-4" />
                      KES {order.total_amount?.toLocaleString() || '0'}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t flex gap-2 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(order)}
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePrint(order)}
                    title="Print"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(order)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {(!salesOrders || salesOrders.length === 0) && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-muted-foreground">No sales orders found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Print Dialog */}
      <Dialog open={showPrintView} onOpenChange={setShowPrintView}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
          <VisuallyHidden>
            <DialogTitle>Print Sales Order</DialogTitle>
          </VisuallyHidden>
          {selectedOrder && (
            <BusinessDocumentPrint
              document={selectedOrder}
              documentType="sales-order"
              onClose={() => setShowPrintView(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SalesOrderList;
