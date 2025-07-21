
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { SalesStorageService } from '@/modules/sales/services/salesStorageService';
import { DeliveryNote } from '@/modules/sales/types/salesTypes';
import BusinessDocumentPrint from '@/components/BusinessDocumentPrint';
import { Truck, Calendar, MapPin, Eye, Download, Printer } from 'lucide-react';

const DeliveryNoteList: React.FC = () => {
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<any>(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDeliveryNotes = () => {
      try {
        const storedNotes = SalesStorageService.getDocuments('delivery-note') as DeliveryNote[];
        setDeliveryNotes(storedNotes);
      } catch (error) {
        console.error('Error loading delivery notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeliveryNotes();
  }, []);

  if (isLoading) {
    return <div>Loading delivery notes...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_transit': return 'bg-blue-500';
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

  const transformItemsForPrint = (deliveryItems: any[], salesOrderItems: any[]) => {
    // Use delivery note items if available, otherwise fall back to sales order items
    const items = deliveryItems?.length > 0 ? deliveryItems : salesOrderItems;
    
    return items?.map(item => ({
      itemCode: item.products?.sku || '',
      description: item.products?.name || item.description || '',
      quantity: item.quantity_delivered || item.quantity || 0,
      unitPrice: 0, // Delivery notes typically don't show prices
      total: 0,
      taxRate: 0
    })) || [];
  };

  const handlePrint = (deliveryNote: any) => {
    console.log('Print delivery note:', deliveryNote.id);
    const documentData = {
      documentNumber: deliveryNote.delivery_number, // Use delivery_number instead of delivery_note_number
      date: deliveryNote.delivery_date,
      deliveryDate: deliveryNote.delivery_date,
      currency: 'KES',
      customer: deliveryNote.customers ? {
        name: getCustomerName(deliveryNote.customers),
        address: deliveryNote.customers.address || deliveryNote.delivery_address || '',
        city: deliveryNote.customers.city || '',
        state: deliveryNote.customers.state || '',
        zip: deliveryNote.customers.postal_code || '',
        phone: deliveryNote.customers.phone || '',
        email: deliveryNote.customers.email || '',
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
      items: transformItemsForPrint(deliveryNote.delivery_note_items, deliveryNote.sales_orders?.sales_order_items),
      notes: deliveryNote.notes,
      relatedOrder: deliveryNote.sales_orders?.order_number,
      carrier: deliveryNote.delivered_by,
      taxSettings: {
        type: 'total',
        defaultRate: 16
      }
    };
    setSelectedDeliveryNote(documentData);
    setShowPrintView(true);
  };

  const handleDownload = (deliveryNote: any) => {
    console.log('Download delivery note:', deliveryNote.id);
    handlePrint(deliveryNote);
  };

  const handleView = (deliveryNote: any) => {
    console.log('View delivery note:', deliveryNote.id);
    handlePrint(deliveryNote);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Notes
            <Badge variant="outline" className="ml-auto">
              {deliveryNotes?.length || 0} records
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveryNotes?.map((note) => (
              <div key={note.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold">{note.delivery_number}</div>
                    <div className="text-sm text-muted-foreground">
                      Customer: {getCustomerName(note.customers)}
                    </div>
                    {note.sales_orders && (
                      <div className="text-sm text-muted-foreground">
                        Order: {note.sales_orders.order_number}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      Delivery: {new Date(note.delivery_date).toLocaleDateString()}
                    </div>
                    {note.delivery_address && (
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {note.delivery_address}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(note.status)}>
                      {note.status}
                    </Badge>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(note)}
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePrint(note)}
                    title="Print"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(note)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {(!deliveryNotes || deliveryNotes.length === 0) && (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-muted-foreground">No delivery notes found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Print Dialog */}
      <Dialog open={showPrintView} onOpenChange={setShowPrintView}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
          <VisuallyHidden>
            <DialogTitle>Print Delivery Note</DialogTitle>
          </VisuallyHidden>
          {selectedDeliveryNote && (
            <BusinessDocumentPrint
              document={selectedDeliveryNote}
              documentType="delivery-note"
              onClose={() => setShowPrintView(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeliveryNoteList;
