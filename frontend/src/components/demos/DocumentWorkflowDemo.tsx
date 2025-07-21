import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StatusChangeButton from '@/components/business-flow/StatusChangeButton';
import { ArrowRight, FileText, Receipt, Truck, Info, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DocumentWorkflowDemo: React.FC = () => {
  const [quotationStatus, setQuotationStatus] = useState('draft');
  const [salesOrderStatus, setSalesOrderStatus] = useState('draft');
  const [invoiceStatus, setInvoiceStatus] = useState('pending');

  const mockDocumentId = 'demo-doc-id';

  const WorkflowStep = ({ 
    title, 
    icon: Icon, 
    status, 
    documentType, 
    onStatusChange, 
    actions,
    description 
  }: { 
    title: string; 
    icon: any; 
    status: string; 
    documentType: string; 
    onStatusChange: (newStatus: string) => void; 
    actions?: React.ReactNode;
    description: string;
  }) => (
    <Card className="relative">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <StatusChangeButton
              documentType={documentType}
              documentId={mockDocumentId}
              currentStatus={status}
              onStatusChange={onStatusChange}
            />
            {actions && actions}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Document Workflow System</h1>
        <p className="text-muted-foreground">
          Complete business flow from quotation to invoice and delivery
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How it works:</strong> Change document statuses to trigger workflow actions. 
          When a quotation is "accepted", you can convert it to a sales order. 
          When a sales order is "confirmed", you can create an invoice and delivery note.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quotation */}
        <WorkflowStep
          title="Quotation"
          icon={FileText}
          status={quotationStatus}
          documentType="quotation"
          onStatusChange={setQuotationStatus}
          description="Create and send quotes to customers. When accepted, convert to sales order."
          actions={
            <TooltipProvider>
              <DropdownMenu>
                <Tooltip>
                  <DropdownMenuTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                  </DropdownMenuTrigger>
                  <TooltipContent>
                    <p>Conversion Options</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  {quotationStatus === "accepted" && (
                    <DropdownMenuItem>
                      Make Sale Order
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          }
        />

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <ArrowRight className="w-8 h-8 text-muted-foreground" />
            <Badge variant="outline" className="text-xs">
              {quotationStatus === 'accepted' ? 'Convert to SO' : 'Accept first'}
            </Badge>
          </div>
        </div>

        {/* Sales Order */}
        <WorkflowStep
          title="Sales Order"
          icon={Receipt}
          status={salesOrderStatus}
          documentType="sales_order"
          onStatusChange={setSalesOrderStatus}
          description="Manage customer orders. When confirmed, create invoice and delivery note."
          actions={
            <TooltipProvider>
              <DropdownMenu>
                <Tooltip>
                  <DropdownMenuTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                  </DropdownMenuTrigger>
                  <TooltipContent>
                    <p>Conversion Options</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  {salesOrderStatus === "confirmed" && (
                    <>
                      <DropdownMenuItem>
                        Make Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Create DNote
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice */}
        <WorkflowStep
          title="Invoice"
          icon={Receipt}
          status={invoiceStatus}
          documentType="invoice"
          onStatusChange={setInvoiceStatus}
          description="Bill customers for confirmed orders. Track payment status."
        />

        {/* Delivery Note */}
        <WorkflowStep
          title="Delivery Note"
          icon={Truck}
          status="pending"
          documentType="delivery_note"
          onStatusChange={() => {}}
          description="Coordinate deliveries and track shipments to customers."
        />
      </div>

      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h3 className="font-semibold mb-4">Workflow Rules:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Quotation → Sales Order</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Quotation status must be "accepted"</li>
              <li>• Creates new sales order with same items</li>
              <li>• Links back to original quotation</li>
              <li>• Quotation status becomes "converted"</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Sales Order → Invoice/Delivery</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Sales order status must be "confirmed"</li>
              <li>• Can create both invoice and delivery note</li>
              <li>• Invoice tracks payment status</li>
              <li>• Delivery note tracks shipment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentWorkflowDemo;
