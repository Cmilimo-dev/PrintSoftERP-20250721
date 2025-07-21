
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Quote } from '@/modules/sales/types/salesTypes';
import StatusChangeButton from '@/components/business-flow/StatusChangeButton';
import BusinessDocumentPrint from '@/components/BusinessDocumentPrint';
import { useConvertQuotationToSalesOrder } from '@/hooks/business-flow/useQuotationFlow';
import { Receipt, Calendar, DollarSign, Eye, Download, Printer, MoreHorizontal } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const QuotationList: React.FC = () => {
  const [quotations, setQuotations] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [showPrintView, setShowPrintView] = useState(false);
  
  const convertToSalesOrder = useConvertQuotationToSalesOrder();

  const handleConvertToSalesOrder = (quotationId: string) => {
    convertToSalesOrder.mutate(quotationId);
  };

  useEffect(() => {
    const loadQuotations = () => {
      try {
        const storedQuotations = SalesStorageService.getDocuments('quote') as Quote[];
        setQuotations(storedQuotations);
      } catch (error) {
        console.error('Error loading quotations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuotations();
  }, []);

  console.log('QuotationList - quotations:', quotations);

  if (isLoading) {
    return <div>Loading quotations...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'sent': return 'bg-blue-500';
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'expired': return 'bg-orange-500';
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

  const transformItemsForPrint = (quotationItems: any[]) => {
    return quotationItems?.map(item => ({
      itemCode: item.products?.sku || '',
      description: item.products?.name || item.description || '',
      quantity: item.quantity || 0,
      unitPrice: item.unit_price || 0,
      total: item.total_price || 0,
      taxRate: 0
    })) || [];
  };

  const handlePrint = (quotation: any) => {
    console.log('Print quotation:', quotation.id);
    const documentData = {
      documentNumber: quotation.quote_number, // Use quote_number instead of quotation_number
      date: quotation.quote_date, // Use quote_date instead of quotation_date
      total: quotation.total_amount,
      currency: 'KES',
      customer: quotation.customers ? {
        name: getCustomerName(quotation.customers),
        address: quotation.customers.address || '',
        city: quotation.customers.city || '',
        state: quotation.customers.state || '',
        zip: quotation.customers.postal_code || '',
        phone: quotation.customers.phone || '',
        email: quotation.customers.email || '',
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
      items: transformItemsForPrint(quotation.quotation_items),
      subtotal: quotation.subtotal,
      taxAmount: quotation.tax_amount,
      notes: quotation.notes,
      validUntil: quotation.valid_until,
      taxSettings: {
        type: 'total',
        defaultRate: 16
      }
    };
    setSelectedQuotation(documentData);
    setShowPrintView(true);
  };

  const handleDownload = (quotation: any) => {
    console.log('Download quotation:', quotation.id);
    handlePrint(quotation);
  };

  const handleView = (quotation: any) => {
    console.log('View quotation:', quotation.id);
    handlePrint(quotation);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Quotations
            <Badge variant="outline" className="ml-auto">
              {quotations?.length || 0} records
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quotations?.map((quotation) => (
              <div key={quotation.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{quotation.quote_number}</div>
                      <Badge className={getStatusColor(quotation.status)}>
                        {quotation.status}
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
                            {quotation.status === "accepted" && (
                              <DropdownMenuItem onClick={() => handleConvertToSalesOrder(quotation.id)}>
                                Make Sale Order
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TooltipProvider>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Customer: {getCustomerName(quotation.customers)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(quotation.quote_date).toLocaleDateString()}
                      {quotation.valid_until && (
                        <span className="ml-2">Valid until: {new Date(quotation.valid_until).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-lg font-bold">
                      <DollarSign className="h-4 w-4" />
                      KES {quotation.total_amount?.toLocaleString() || '0'}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t flex gap-2 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(quotation)}
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePrint(quotation)}
                    title="Print"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(quotation)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                </div>
              </div>
            ))}
            {(!quotations || quotations.length === 0) && (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-muted-foreground">No quotations found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Print Dialog */}
      <Dialog open={showPrintView} onOpenChange={setShowPrintView}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
          <VisuallyHidden>
            <DialogTitle>Print Quotation</DialogTitle>
          </VisuallyHidden>
          {selectedQuotation && (
            <BusinessDocumentPrint
              document={selectedQuotation}
              documentType="quote"
              onClose={() => setShowPrintView(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuotationList;
