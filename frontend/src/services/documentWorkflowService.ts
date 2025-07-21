import { supabase } from '@/integrations/supabase/client';

/**
 * Document Workflow Service
 * Manages the business flow between different document types based on status changes
 */
export class DocumentWorkflowService {

  /**
   * Convert quotation to sales order when status is "accepted"
   */
  static async convertQuotationToSalesOrder(quotationId: string): Promise<any> {
    try {
      // First try to get from local storage (for documents created in app)
      const { DocumentStorageService } = await import('@/services/documentStorageService');
      const localQuotations = DocumentStorageService.getDocuments('quote');
      const localQuotation = localQuotations.find(q => q.id === quotationId);
      
      let quotation;
      
      if (localQuotation) {
        // Use local quotation data
        quotation = {
          ...localQuotation,
          quotation_items: localQuotation.items?.map((item: any) => ({
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.total,
            description: item.description
          })) || []
        };
      } else {
        // Try Supabase for existing data
        const { data: quotationData, error: quotationError } = await supabase
          .from('quotations')
          .select(`
            *,
            quotation_items (*)
          `)
          .eq('id', quotationId)
          .single();

        if (quotationError) throw quotationError;
        quotation = quotationData;
      }

      // Debug logging to understand the quotation structure
      console.log('🔍 Quotation object for conversion:', quotation);
      console.log('🔍 Quotation status raw:', quotation.status);
      console.log('🔍 Quotation status type:', typeof quotation.status);
      console.log('🔍 All quotation keys:', Object.keys(quotation));
      
      // Get the actual status value - handle different possible status field names
      const actualStatus = quotation.status || quotation.quote_status || quotation.state;
      console.log('🔍 Actual status extracted:', actualStatus);
      console.log('🔍 Actual status type:', typeof actualStatus);
      
      // Trim whitespace and normalize the status
      const normalizedStatus = actualStatus ? actualStatus.toString().trim().toLowerCase() : '';
      console.log('🔍 Normalized status:', normalizedStatus);
      console.log('🔍 Comparison result:', normalizedStatus === 'accepted');
      
      // Check if quotation status is "accepted" or "converted" (allow re-conversion)
      if (!normalizedStatus || (normalizedStatus !== 'accepted' && normalizedStatus !== 'converted')) {
        console.error('❌ Status check failed:', {
          originalStatus: quotation.status,
          actualStatus,
          normalizedStatus,
          expectedStatus: 'accepted or converted',
          quotationId,
          comparison: normalizedStatus === 'accepted' || normalizedStatus === 'converted'
        });
        throw new Error(`Quotation must be accepted before converting to sales order. Current status: "${actualStatus}" (normalized: "${normalizedStatus}")`);
      }
      
      // Log if we're re-converting an already converted quotation
      if (normalizedStatus === 'converted') {
        console.warn('⚠️ Re-converting a quotation that was already converted');
      }
      
      console.log('✅ Status check passed - quotation is accepted');

      // Generate sales order number
      const orderNumber = `SO-${Date.now()}`;

      // Create sales order from quotation using local storage format
      const salesOrderData = {
        id: `SO-${Date.now()}`,
        documentNumber: orderNumber,
        date: new Date().toISOString().split('T')[0],
        total: quotation.total || quotation.total_amount,
        currency: quotation.currency || 'KES',
        status: 'draft',
        customer: quotation.customer,
        items: quotation.quotation_items?.map((item: any) => ({
          id: `item-${Date.now()}-${Math.random()}`,
          productId: item.product_id,
          itemCode: item.itemCode || '',
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          total: item.total_price,
          taxRate: 16,
          taxAmount: item.total_price * 0.16 / 1.16
        })) || [],
        subtotal: quotation.subtotal,
        taxAmount: quotation.tax_amount || quotation.taxAmount,
        company: quotation.company || {
          name: 'Priority Solutions Inc.',
          address: '123 Business Park Drive',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'USA',
          phone: '+1 (555) 123-4567',
          email: 'info@prioritysolutions.com',
          taxId: 'TAX123456789'
        },
        taxSettings: quotation.taxSettings || { type: 'exclusive', defaultRate: 16 },
        notes: `Generated from quotation ${quotation.documentNumber || quotation.quote_number}`
      };

      // Save to local storage using SalesStorageService for consistency with SalesOrderList
      const { SalesStorageService } = await import('@/modules/sales/services/salesStorageService');
      const saved = SalesStorageService.saveDocument('sales-order', salesOrderData);
      if (!saved) {
        throw new Error('Failed to save sales order');
      }

      // Update quotation status to converted
      if (localQuotation) {
        const updatedQuotation = { ...quotation, status: 'converted' };
        DocumentStorageService.saveDocument('quote', updatedQuotation);
      }

      return salesOrderData;

    } catch (error) {
      console.error('Error converting quotation to sales order:', error);
      throw error;
    }
  }

  /**
   * Convert sales order to invoice when status is "confirmed"
   */
  static async convertSalesOrderToInvoice(salesOrderId: string): Promise<any> {
    try {
      // First try to get from local storage (for documents created in app)
      const { DocumentStorageService } = await import('@/services/documentStorageService');
      const localSalesOrders = DocumentStorageService.getDocuments('sales-order');
      const localSalesOrder = localSalesOrders.find(so => so.id === salesOrderId);
      
      let salesOrder;
      
      if (localSalesOrder) {
        // Use local sales order data
        salesOrder = {
          ...localSalesOrder,
          sales_order_items: localSalesOrder.items?.map((item: any) => ({
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.total,
            description: item.description
          })) || []
        };
      } else {
        // Try Supabase for existing data
        const { data: salesOrder, error: salesOrderError } = await supabase
          .from('sales_orders')
          .select(`
            *,
            sales_order_items (*)
          `)
          .eq('id', salesOrderId)
          .single();

        if (salesOrderError) throw salesOrderError;
      }

      // Check if sales order status is "confirmed"
      if (salesOrder.status !== 'confirmed') {
        throw new Error('Sales order must be confirmed before converting to invoice');
      }

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      // Create invoice from sales order using local storage format
      const invoiceData = {
        id: `INV-${Date.now()}`,
        documentNumber: invoiceNumber,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        total: salesOrder.total || salesOrder.total_amount,
        currency: salesOrder.currency || 'KES',
        status: 'pending',
        customer: salesOrder.customer,
        items: salesOrder.sales_order_items?.map((item: any) => ({
          id: `item-${Date.now()}-${Math.random()}`,
          productId: item.product_id,
          itemCode: item.itemCode || '',
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          total: item.total_price,
          taxRate: 16,
          taxAmount: item.total_price * 0.16 / 1.16
        })) || [],
        subtotal: salesOrder.subtotal,
        taxAmount: salesOrder.tax_amount || salesOrder.taxAmount,
        paidAmount: 0,
        balanceAmount: salesOrder.total || salesOrder.total_amount,
        company: salesOrder.company || {
          name: 'Priority Solutions Inc.',
          address: '123 Business Park Drive',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'USA',
          phone: '+1 (555) 123-4567',
          email: 'info@prioritysolutions.com',
          taxId: 'TAX123456789'
        },
        taxSettings: salesOrder.taxSettings || { type: 'exclusive', defaultRate: 16 },
        notes: `Generated from sales order ${salesOrder.documentNumber || salesOrder.order_number}`
      };

      // Save to local storage
      const saved = DocumentStorageService.saveDocument('invoice', invoiceData);
      if (!saved) {
        throw new Error('Failed to save invoice');
      }

      // Update sales order status to invoiced if it's a local document
      if (localSalesOrder) {
        const updatedSalesOrder = { ...salesOrder, status: 'invoiced' };
        DocumentStorageService.saveDocument('sales-order', updatedSalesOrder);
      }

      return invoiceData;

    } catch (error) {
      console.error('Error converting sales order to invoice:', error);
      throw error;
    }
  }

  /**
   * Create delivery note from sales order when status is "confirmed"
   */
  static async createDeliveryNoteFromSalesOrder(salesOrderId: string): Promise<any> {
    try {
      // First try to get from local storage (for documents created in app)
      const { DocumentStorageService } = await import('@/services/documentStorageService');
      const localSalesOrders = DocumentStorageService.getDocuments('sales-order');
      const localSalesOrder = localSalesOrders.find(so => so.id === salesOrderId);
      
      let salesOrder;
      
      if (localSalesOrder) {
        // Use local sales order data
        salesOrder = {
          ...localSalesOrder,
          sales_order_items: localSalesOrder.items?.map((item: any) => ({
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.total,
            description: item.description
          })) || []
        };
      } else {
        // Try Supabase for existing data
        const { data: salesOrder, error: salesOrderError } = await supabase
          .from('sales_orders')
          .select(`
            *,
            sales_order_items (*)
          `)
          .eq('id', salesOrderId)
          .single();

        if (salesOrderError) throw salesOrderError;
      }

      // Check if sales order status is "confirmed"
      if (salesOrder.status !== 'confirmed') {
        throw new Error('Sales order must be confirmed before creating delivery note');
      }

      // Generate delivery note number
      const deliveryNoteNumber = `DN-${Date.now()}`;

      // Create delivery note from sales order using local storage format
      const deliveryNoteData = {
        id: `DN-${Date.now()}`,
        documentNumber: deliveryNoteNumber,
        date: new Date().toISOString().split('T')[0],
        total: salesOrder.total || salesOrder.total_amount || 0,
        currency: salesOrder.currency || 'KES',
        status: 'pending',
        customer: salesOrder.customer,
        items: salesOrder.sales_order_items?.map((item: any) => ({
          id: `item-${Date.now()}-${Math.random()}`,
          productId: item.product_id,
          itemCode: item.itemCode || '',
          description: item.description,
          quantity: item.quantity,
          unitPrice: 0, // Delivery notes don't usually have prices
          total: 0,
          taxRate: 0,
          taxAmount: 0
        })) || [],
        subtotal: 0,
        taxAmount: 0,
        company: salesOrder.company || {
          name: 'Priority Solutions Inc.',
          address: '123 Business Park Drive',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'USA',
          phone: '+1 (555) 123-4567',
          email: 'info@prioritysolutions.com',
          taxId: 'TAX123456789'
        },
        taxSettings: { type: 'exclusive', defaultRate: 0 },
        notes: `Generated from sales order ${salesOrder.documentNumber || salesOrder.order_number}`,
        deliveryAddress: salesOrder.deliveryAddress || ''
      };

      // Save to local storage
      const saved = DocumentStorageService.saveDocument('delivery-note', deliveryNoteData);
      if (!saved) {
        throw new Error('Failed to save delivery note');
      }

      return deliveryNoteData;

    } catch (error) {
      console.error('Error creating delivery note from sales order:', error);
      throw error;
    }
  }

  /**
   * Get available actions for a document based on its type and status
   */
  static getAvailableActions(documentType: string, status: string): Array<{action: string, label: string, shortLabel: string}> {
    const actions: Array<{action: string, label: string, shortLabel: string}> = [];

    switch (documentType) {
      case 'quotation':
        if (status === 'accepted') {
          actions.push({
            action: 'convert_to_sales_order',
            label: 'Convert to Sales Order',
            shortLabel: 'Make Sale Order'
          });
        }
        break;
      
      case 'sales_order':
        if (status === 'confirmed') {
          actions.push({
            action: 'convert_to_invoice',
            label: 'Convert to Invoice',
            shortLabel: 'Make Invoice'
          });
          actions.push({
            action: 'create_delivery_note',
            label: 'Create Delivery Note',
            shortLabel: 'Create DNote'
          });
        }
        break;
      
      case 'invoice':
        // Future: Add payment receipt creation, etc.
        break;
    }

    return actions;
  }

  /**
   * Check if a conversion is possible
   */
  static canConvert(fromType: string, toType: string, status: string): boolean {
    const validConversions: Record<string, Record<string, string[]>> = {
      'quotation': {
        'sales_order': ['accepted']
      },
      'sales_order': {
        'invoice': ['confirmed'],
        'delivery_note': ['confirmed']
      }
    };

    return validConversions[fromType]?.[toType]?.includes(status) || false;
  }

  /**
   * Get workflow status message for UI display
   */
  static getWorkflowStatusMessage(documentType: string, status: string): string {
    switch (documentType) {
      case 'quotation':
        if (status === 'accepted') {
          return 'Ready to convert to Sales Order';
        }
        return 'Accept quotation to enable conversion';
      
      case 'sales_order':
        if (status === 'confirmed') {
          return 'Ready to create Invoice and Delivery Note';
        }
        return 'Confirm sales order to enable conversions';
      
      default:
        return '';
    }
  }

  /**
   * Get next possible document types based on current document and status
   */
  static getNextDocumentTypes(documentType: string, status: string): string[] {
    const nextTypes: string[] = [];

    if (documentType === 'quotation' && status === 'accepted') {
      nextTypes.push('sales_order');
    }

    if (documentType === 'sales_order' && status === 'confirmed') {
      nextTypes.push('invoice', 'delivery_note');
    }

    return nextTypes;
  }

  /**
   * Update document status and trigger workflow actions if needed
   */
  static async updateDocumentStatus(
    documentType: string, 
    documentId: string, 
    newStatus: string
  ): Promise<{ updated: boolean; triggeredActions: string[] }> {
    try {
      // First try to handle local storage documents
      const { DocumentStorageService } = await import('@/services/documentStorageService');
      const storageKey = this.getStorageKey(documentType);
      const localDocuments = DocumentStorageService.getDocuments(storageKey);
      const localDocument = localDocuments.find(doc => doc.id === documentId);
      
      if (localDocument) {
        // Update document in local storage
        const updatedDocument = {
          ...localDocument,
          status: newStatus,
          updated_at: new Date().toISOString()
        };
        
        const saved = DocumentStorageService.saveDocument(storageKey, updatedDocument);
        if (!saved) {
          throw new Error('Failed to update document status in local storage');
        }
        
        console.log(`Local document ${documentId} (${documentType}) status updated to ${newStatus}`);
        
        // Check for automatic workflow triggers
        const triggeredActions: string[] = [];
        const availableActions = this.getAvailableActions(documentType, newStatus);

        // Log available actions for manual triggering
        if (availableActions.length > 0) {
          console.log(`Document ${documentId} (${documentType}) status updated to ${newStatus}. Available actions:`, availableActions);
        }

        return {
          updated: true,
          triggeredActions
        };
      }
      
      // If not found in local storage, try database (for older documents)
      const tableName = this.getTableName(documentType);
      
      // Update the document status in database
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (updateError) {
        console.error('Error updating document status:', updateError);
        throw new Error(`Status update error: ${updateError.message}`);
      }

      // Check for automatic workflow triggers
      const triggeredActions: string[] = [];
      const availableActions = this.getAvailableActions(documentType, newStatus);

      // Log available actions for manual triggering
      if (availableActions.length > 0) {
        console.log(`Document ${documentId} (${documentType}) status updated to ${newStatus}. Available actions:`, availableActions);
      }

      return {
        updated: true,
        triggeredActions
      };

    } catch (error) {
      console.error('Error updating document status:', error);
      throw error;
    }
  }

  /**
   * Get table name for document type
   */
  private static getTableName(documentType: string): string {
    const tableMap: Record<string, string> = {
      'quotation': 'quotations',
      'sales_order': 'sales_orders',
      'invoice': 'invoices',
      'delivery_note': 'delivery_notes'
    };

    return tableMap[documentType] || documentType;
  }

  /**
   * Get storage key for document type (for local storage)
   */
  private static getStorageKey(documentType: string): string {
    const storageKeyMap: Record<string, string> = {
      'quotation': 'quote',
      'sales_order': 'sales-order',
      'invoice': 'invoice',
      'delivery_note': 'delivery-note'
    };

    return storageKeyMap[documentType] || documentType;
  }
}
