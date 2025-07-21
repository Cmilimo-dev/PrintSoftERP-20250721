// Clean Sales Order List using current hooks and services
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { FileText, Calendar, DollarSign, Eye, Download, Printer, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSalesOrders } from '../../hooks/useSales';
import { UnifiedDocumentExportService } from '../../services/unifiedDocumentExportService';
import { useConvertSalesOrderToInvoice, useCreateDeliveryNoteFromSalesOrder } from '@/hooks/business-flow/useSalesOrderFlow';

const CleanSalesOrderList: React.FC = () => {
  const { data: salesOrders, isLoading: loading } = useSalesOrders();
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

  if (loading) {
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

  const handleView = (order: any) => {
    console.log('View sales order:', order.id);
    setSelectedOrder(order);
    setShowPrintView(true);
  };

  const handlePrint = (order: any) => {
    console.log('Print sales order:', order.id);
    setSelectedOrder(order);
    setShowPrintView(true);
  };

  const handleExport = async (order: any, format: 'pdf' | 'mht' | 'html' | 'print') => {
    try {
      // Convert sales order to document format for unified export
      const documentData = {
        documentNumber: order.order_number || order.documentNumber || order.id,
        date: order.order_date || order.date || order.created_at,
        customer: {
          name: order.customers?.company_name || order.customers?.first_name + ' ' + order.customers?.last_name || order.customer?.name || 'No customer',
          email: order.customers?.email || order.customer?.email || '',
          phone: order.customers?.phone || order.customer?.phone || '',
          address: order.customers?.address || order.customer?.address || ''
        },
        items: order.sales_order_items || order.items || [],
        total: order.total_amount || order.total || 0,
        currency: order.currency || 'USD',
        status: order.status || 'draft'
      };
      
      await UnifiedDocumentExportService.exportDocument(
        documentData,
        'sales-order',
        {
          format,
          filename: `sales_order_${documentData.documentNumber}_${new Date().toISOString().split('T')[0]}`
        }
      );
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleDelete = async (order: any) => {
    const orderNumber = order.order_number || order.documentNumber || order.id;
    if (confirm(`Are you sure you want to delete sales order ${orderNumber}?`)) {
      try {
        // Direct supabase call since we don't have a delete mutation readily available
        console.log('Deleting sales order:', order.id);
        // For now, just log the delete action - implement actual deletion when needed
        console.log('Sales order delete functionality needs to be implemented');
      } catch (error) {
        console.error('Error deleting sales order:', error);
      }
    }
  };

  const exportAllOrders = (format: 'csv' | 'excel' | 'pdf' | 'mht') => {
    if (!salesOrders || salesOrders.length === 0) {
      console.log('No sales orders to export');
      return;
    }

    // Use the erpExportService for list exports
    import('../../services/erpExportService').then(({ erpExportService }) => {
      const processedOrders = salesOrders.map(order => ({
        order_number: order.order_number || order.id,
        order_date: order.order_date || order.created_at,
        customer_name: order.customers?.company_name || 
                      (order.customers?.first_name + ' ' + order.customers?.last_name) || 
                      'No customer',
        total_amount: order.total_amount || 0,
        status: order.status || 'draft',
        currency: order.currency || 'USD'
      }));

      erpExportService.exportList(
        processedOrders,
        [
          { key: 'order_number', label: 'Order Number' },
          { key: 'order_date', label: 'Date', formatter: (val) => new Date(val).toLocaleDateString() },
          { key: 'customer_name', label: 'Customer' },
          { key: 'total_amount', label: 'Total', formatter: (val) => `$${Number(val || 0).toFixed(2)}` },
          { key: 'status', label: 'Status' }
        ],
        {
          format,
          title: 'Sales Orders Report',
          filename: `sales_orders_${new Date().toISOString().split('T')[0]}`
        }
      );
    });
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
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => exportAllOrders('csv')}>
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportAllOrders('excel')}>
              Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportAllOrders('pdf')}>
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesOrders?.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{order.order_number || order.id}</div>
                    <Badge className={getStatusColor(order.status || 'draft')}>
                      {order.status || 'draft'}
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
                    Customer: {order.customers?.company_name || 
                              (order.customers?.first_name + ' ' + order.customers?.last_name) || 
                              'No customer'}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.order_date || order.created_at).toLocaleDateString()}
                    {order.due_date && (
                      <span className="ml-2">Due: {new Date(order.due_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-lg font-bold">
                    <DollarSign className="h-4 w-4" />
                    {order.currency || 'USD'} {Number(order.total_amount || 0).toLocaleString()}
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
                    onClick={() => handleExport(order, 'pdf')}
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(order)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
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

      {/* Simple Print Dialog */}
      <Dialog open={showPrintView} onOpenChange={setShowPrintView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-6">
          <VisuallyHidden>
            <DialogTitle>Print Sales Order</DialogTitle>
          </VisuallyHidden>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Sales Order</h2>
                <p className="text-lg">{selectedOrder.documentNumber}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Customer Information</h3>
                  <p>{selectedOrder.customer?.name || 'No customer'}</p>
                  <p>{selectedOrder.customer?.email || ''}</p>
                  <p>{selectedOrder.customer?.phone || ''}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Order Details</h3>
                  <p>Date: {new Date(selectedOrder.date).toLocaleDateString()}</p>
                  <p>Status: {selectedOrder.status || 'draft'}</p>
                  <p>Total: {selectedOrder.currency} {selectedOrder.total?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Items</h3>
                  <table className="w-full border">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-2 text-left">Item</th>
                        <th className="border p-2 text-right">Quantity</th>
                        <th className="border p-2 text-right">Price</th>
                        <th className="border p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="border p-2">{item.description}</td>
                          <td className="border p-2 text-right">{item.quantity}</td>
                          <td className="border p-2 text-right">{item.unitPrice?.toFixed(2) || '0.00'}</td>
                          <td className="border p-2 text-right">{item.total?.toFixed(2) || '0.00'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={() => window.print()}>Print</Button>
                <Button variant="outline" onClick={() => setShowPrintView(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CleanSalesOrderList;
