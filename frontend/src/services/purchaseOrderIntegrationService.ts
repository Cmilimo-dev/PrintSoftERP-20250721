import { supabase } from '@/integrations/supabase/client';

export interface Supplier {
  id: string;
  supplierNumber: string;
  name: string;
  companyName: string;
  type: 'manufacturer' | 'distributor' | 'wholesaler' | 'service_provider';
  email: string;
  phone: string;
  website?: string;
  taxId?: string;
  registrationNumber?: string;
  address: {
    billing: Address;
    shipping?: Address;
  };
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    position?: string;
  };
  paymentTerms: 'cod' | 'net_15' | 'net_30' | 'net_60' | 'net_90' | 'prepaid';
  creditLimit: number;
  creditUsed: number;
  currency: string;
  leadTime: number; // days
  minimumOrderValue: number;
  discountTerms?: {
    volumeDiscount: number;
    earlyPaymentDiscount: number;
    loyaltyDiscount: number;
  };
  rating: {
    quality: number; // 1-5
    delivery: number; // 1-5
    service: number; // 1-5
    overall: number; // 1-5
  };
  certifications?: string[];
  status: 'active' | 'inactive' | 'suspended' | 'blacklisted';
  category: string[];
  preferredStatus: 'preferred' | 'approved' | 'trial' | 'standard';
  createdAt: string;
  updatedAt: string;
  lastOrderDate?: string;
  totalOrders: number;
  totalPurchaseValue: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface PurchaseRequisition {
  id: string;
  requisitionNumber: string;
  requestedBy: {
    id: string;
    name: string;
    department: string;
    email: string;
  };
  department: string;
  requestDate: string;
  requiredDate: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'cancelled' | 'converted';
  approvals: ApprovalStep[];
  items: RequisitionItem[];
  justification: string;
  notes?: string;
  attachments?: string[];
  totalEstimatedValue: number;
  currency: string;
  convertedToPOId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStep {
  id: string;
  stepNumber: number;
  approverRole: string;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedAt?: string;
  comments?: string;
  requiredApprovalAmount?: number;
}

export interface RequisitionItem {
  id: string;
  productId?: string;
  product?: {
    id: string;
    partNumber: string;
    name: string;
    description?: string;
    category: string;
    preferredSupplier?: string;
  };
  description: string;
  specification?: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
  estimatedTotal: number;
  suggestedSupplier?: {
    id: string;
    name: string;
    lastPrice?: number;
    leadTime?: number;
  };
  urgency: 'standard' | 'urgent' | 'emergency';
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  requisitionId?: string;
  supplierId: string;
  supplier?: Supplier;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: 'draft' | 'sent' | 'acknowledged' | 'confirmed' | 'partial_received' | 'received' | 'invoiced' | 'paid' | 'cancelled' | 'completed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  buyerId: string;
  buyer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  deliveryAddress: Address;
  billingAddress: Address;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentTerms: string;
  deliveryTerms: string;
  shippingMethod: string;
  trackingNumber?: string;
  notes?: string;
  termsAndConditions?: string;
  attachments?: string[];
  sentAt?: string;
  acknowledgedAt?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  receivingStatus: 'pending' | 'partial' | 'complete';
  invoiceStatus: 'pending' | 'partial' | 'complete';
  paymentStatus: 'pending' | 'partial' | 'paid';
}

export interface PurchaseOrderItem {
  id: string;
  productId?: string;
  product?: {
    id: string;
    partNumber: string;
    name: string;
    description?: string;
    category: string;
    specifications?: any;
  };
  description: string;
  specification?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
  taxRate: number;
  taxAmount: number;
  expectedDeliveryDate?: string;
  receivedQuantity: number;
  pendingQuantity: number;
  status: 'pending' | 'partial_received' | 'received' | 'cancelled';
  notes?: string;
  qualityChecked: boolean;
  qualityNotes?: string;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  purchaseOrderId: string;
  purchaseOrder?: PurchaseOrder;
  supplierId: string;
  receivedDate: string;
  receivedBy: {
    id: string;
    name: string;
    department: string;
  };
  warehouseLocation: {
    id: string;
    name: string;
    section?: string;
  };
  items: GoodsReceiptItem[];
  status: 'draft' | 'confirmed' | 'quality_checked' | 'stored' | 'rejected';
  totalQuantityReceived: number;
  discrepancyNotes?: string;
  qualityInspection?: {
    inspectedBy: string;
    inspectionDate: string;
    passed: boolean;
    notes?: string;
    attachments?: string[];
  };
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GoodsReceiptItem {
  id: string;
  purchaseOrderItemId: string;
  productId?: string;
  product?: {
    id: string;
    partNumber: string;
    name: string;
  };
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  rejectionReason?: string;
  unit: string;
  batchNumber?: string;
  serialNumbers?: string[];
  expiryDate?: string;
  storageLocation: {
    warehouse: string;
    section?: string;
    aisle?: string;
    shelf?: string;
    bin?: string;
  };
  qualityStatus: 'pending' | 'passed' | 'failed' | 'conditional';
  notes?: string;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  supplierInvoiceNumber: string;
  purchaseOrderId?: string;
  supplierId: string;
  supplier?: Supplier;
  invoiceDate: string;
  dueDate: string;
  receivedDate: string;
  status: 'received' | 'verified' | 'approved' | 'disputed' | 'paid' | 'rejected';
  items: SupplierInvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  currency: string;
  paymentTerms: string;
  verificationStatus: 'pending' | 'verified' | 'discrepancy_found';
  discrepancies?: InvoiceDiscrepancy[];
  notes?: string;
  attachments?: string[];
  verifiedBy?: string;
  verifiedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierInvoiceItem {
  id: string;
  purchaseOrderItemId?: string;
  productId?: string;
  product?: {
    id: string;
    partNumber: string;
    name: string;
  };
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
  taxRate: number;
  taxAmount: number;
  receivedQuantity?: number;
  verificationStatus: 'pending' | 'verified' | 'discrepancy';
}

export interface InvoiceDiscrepancy {
  id: string;
  type: 'quantity' | 'price' | 'description' | 'missing_item' | 'extra_item';
  description: string;
  expectedValue: any;
  actualValue: any;
  impact: 'minor' | 'major' | 'critical';
  status: 'open' | 'resolved' | 'accepted';
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface SupplierPayment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  supplierId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'check' | 'cash' | 'credit_card' | 'wire_transfer';
  reference: string;
  bankAccount?: {
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  notes?: string;
  attachments?: string[];
  authorizedBy: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementDashboardMetrics {
  totalSpend: number;
  totalOrders: number;
  averageOrderValue: number;
  totalSuppliers: number;
  activeSuppliers: number;
  pendingRequisitions: number;
  pendingApprovals: number;
  ordersAwaitingDelivery: number;
  overdueDeliveries: number;
  pendingInvoices: number;
  overduePayments: number;
  savingsFromNegotiations: number;
  onTimeDeliveryRate: number;
  qualityRejectionRate: number;
  topSuppliers: Array<{
    supplierId: string;
    supplierName: string;
    totalOrders: number;
    totalSpend: number;
    onTimeDelivery: number;
    qualityRating: number;
  }>;
  spendByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
    orderCount: number;
  }>;
  recentOrders: PurchaseOrder[];
  recentReceipts: GoodsReceipt[];
  upcomingDeliveries: Array<{
    orderId: string;
    orderNumber: string;
    supplier: string;
    expectedDate: string;
    value: number;
  }>;
}

export interface ProcurementAnalytics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
  spend: {
    current: number;
    previous: number;
    growth: number;
    budget?: number;
    variance?: number;
  };
  orders: {
    current: number;
    previous: number;
    growth: number;
  };
  suppliers: {
    active: number;
    new: number;
    performance: {
      onTimeDelivery: number;
      qualityScore: number;
      responsiveness: number;
    };
  };
  categories: {
    topSpending: Array<{
      category: string;
      amount: number;
      percentage: number;
      trend: number;
    }>;
  };
  efficiency: {
    cycleTime: number; // Days from requisition to delivery
    approvalTime: number; // Days for approval process
    costSavings: number;
    processCompliance: number;
  };
}

/**
 * Purchase Order Integration Service
 * Comprehensive procurement management from requisition to payment
 */
export class PurchaseOrderIntegrationService {

  /**
   * Get purchase requisitions with filtering and pagination
   */
  static async getPurchaseRequisitions(
    filters: {
      requestedBy?: string;
      department?: string;
      status?: string;
      priority?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
    } = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ requisitions: PurchaseRequisition[]; total: number; hasMore: boolean }> {
    try {
      let query = supabase
        .from('purchase_requisitions')
        .select(`
          *,
          requisition_items(
            *,
            products(id, part_number, name, description, category)
          ),
          approval_steps(*),
          requesters:employees!requested_by(id, first_name, last_name, email, department)
        `, { count: 'exact' });

      // Apply filters
      if (filters.requestedBy) {
        query = query.eq('requested_by', filters.requestedBy);
      }
      if (filters.department) {
        query = query.eq('department', filters.department);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.dateFrom) {
        query = query.gte('request_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('request_date', filters.dateTo);
      }
      if (filters.search) {
        query = query.or(`requisition_number.ilike.%${filters.search}%,justification.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query
        .order('request_date', { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data: requisitions, error, count } = await query;

      if (error) {
        console.error('Error fetching purchase requisitions:', error);
        return { requisitions: [], total: 0, hasMore: false };
      }

      const transformedRequisitions: PurchaseRequisition[] = (requisitions || []).map(this.transformRequisitionData);

      return {
        requisitions: transformedRequisitions,
        total: count || 0,
        hasMore: (count || 0) > offset + pageSize
      };

    } catch (error) {
      console.error('Error in getPurchaseRequisitions:', error);
      return { requisitions: [], total: 0, hasMore: false };
    }
  }

  /**
   * Create new purchase requisition
   */
  static async createPurchaseRequisition(requisitionData: Omit<PurchaseRequisition, 'id' | 'requisitionNumber' | 'createdAt' | 'updatedAt'>): Promise<PurchaseRequisition | null> {
    try {
      const requisitionNumber = await this.generateRequisitionNumber();

      const newRequisitionData = {
        requisition_number: requisitionNumber,
        requested_by: requisitionData.requestedBy.id,
        department: requisitionData.department,
        request_date: requisitionData.requestDate,
        required_date: requisitionData.requiredDate,
        priority: requisitionData.priority,
        status: requisitionData.status,
        justification: requisitionData.justification,
        notes: requisitionData.notes,
        attachments: requisitionData.attachments,
        total_estimated_value: requisitionData.totalEstimatedValue,
        currency: requisitionData.currency,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newRequisition, error } = await supabase
        .from('purchase_requisitions')
        .insert(newRequisitionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating purchase requisition:', error);
        throw new Error('Failed to create purchase requisition');
      }

      // Create requisition items
      if (requisitionData.items && requisitionData.items.length > 0) {
        const requisitionItems = requisitionData.items.map(item => ({
          requisition_id: newRequisition.id,
          product_id: item.productId,
          description: item.description,
          specification: item.specification,
          quantity: item.quantity,
          unit: item.unit,
          estimated_unit_price: item.estimatedUnitPrice,
          estimated_total: item.estimatedTotal,
          suggested_supplier_id: item.suggestedSupplier?.id,
          urgency: item.urgency,
          notes: item.notes
        }));

        await supabase
          .from('requisition_items')
          .insert(requisitionItems);
      }

      // Create approval workflow
      await this.createApprovalWorkflow(newRequisition.id, requisitionData.totalEstimatedValue);

      return await this.getRequisitionById(newRequisition.id);

    } catch (error) {
      console.error('Error in createPurchaseRequisition:', error);
      return null;
    }
  }

  /**
   * Get purchase orders with filtering and pagination
   */
  static async getPurchaseOrders(
    filters: {
      supplierId?: string;
      status?: string;
      buyerId?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
    } = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ orders: PurchaseOrder[]; total: number; hasMore: boolean }> {
    try {
      let query = supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers(*),
          purchase_order_items(
            *,
            products(id, part_number, name, description, category, specifications)
          ),
          buyers:employees!buyer_id(id, first_name, last_name, email, phone)
        `, { count: 'exact' });

      // Apply filters
      if (filters.supplierId) {
        query = query.eq('supplier_id', filters.supplierId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.buyerId) {
        query = query.eq('buyer_id', filters.buyerId);
      }
      if (filters.dateFrom) {
        query = query.gte('order_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('order_date', filters.dateTo);
      }
      if (filters.search) {
        query = query.or(`order_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query
        .order('order_date', { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data: orders, error, count } = await query;

      if (error) {
        console.error('Error fetching purchase orders:', error);
        return { orders: [], total: 0, hasMore: false };
      }

      const transformedOrders: PurchaseOrder[] = (orders || []).map(this.transformPurchaseOrderData);

      return {
        orders: transformedOrders,
        total: count || 0,
        hasMore: (count || 0) > offset + pageSize
      };

    } catch (error) {
      console.error('Error in getPurchaseOrders:', error);
      return { orders: [], total: 0, hasMore: false };
    }
  }

  /**
   * Create new purchase order
   */
  static async createPurchaseOrder(orderData: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder | null> {
    try {
      const orderNumber = await this.generatePurchaseOrderNumber();

      const purchaseOrderData = {
        order_number: orderNumber,
        requisition_id: orderData.requisitionId,
        supplier_id: orderData.supplierId,
        order_date: orderData.orderDate,
        expected_delivery_date: orderData.expectedDeliveryDate,
        status: orderData.status,
        priority: orderData.priority,
        buyer_id: orderData.buyerId,
        delivery_address: orderData.deliveryAddress,
        billing_address: orderData.billingAddress,
        subtotal: orderData.subtotal,
        tax_amount: orderData.taxAmount,
        shipping_cost: orderData.shippingCost,
        discount_amount: orderData.discountAmount,
        total_amount: orderData.totalAmount,
        currency: orderData.currency,
        payment_terms: orderData.paymentTerms,
        delivery_terms: orderData.deliveryTerms,
        shipping_method: orderData.shippingMethod,
        notes: orderData.notes,
        terms_and_conditions: orderData.termsAndConditions,
        attachments: orderData.attachments,
        receiving_status: orderData.receivingStatus,
        invoice_status: orderData.invoiceStatus,
        payment_status: orderData.paymentStatus,
        created_by: orderData.createdBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newOrder, error } = await supabase
        .from('purchase_orders')
        .insert(purchaseOrderData)
        .select()
        .single();

      if (error) {
        console.error('Error creating purchase order:', error);
        throw new Error('Failed to create purchase order');
      }

      // Create purchase order items
      if (orderData.items && orderData.items.length > 0) {
        const orderItems = orderData.items.map(item => ({
          purchase_order_id: newOrder.id,
          product_id: item.productId,
          description: item.description,
          specification: item.specification,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unitPrice,
          discount_percent: item.discountPercent,
          discount_amount: item.discountAmount,
          line_total: item.lineTotal,
          tax_rate: item.taxRate,
          tax_amount: item.taxAmount,
          expected_delivery_date: item.expectedDeliveryDate,
          received_quantity: item.receivedQuantity,
          pending_quantity: item.pendingQuantity,
          status: item.status,
          notes: item.notes,
          quality_checked: item.qualityChecked,
          quality_notes: item.qualityNotes
        }));

        await supabase
          .from('purchase_order_items')
          .insert(orderItems);
      }

      return await this.getPurchaseOrderById(newOrder.id);

    } catch (error) {
      console.error('Error in createPurchaseOrder:', error);
      return null;
    }
  }

  /**
   * Convert requisition to purchase order
   */
  static async convertRequisitionToPurchaseOrder(
    requisitionId: string,
    supplierId: string,
    orderData: Partial<PurchaseOrder>
  ): Promise<PurchaseOrder | null> {
    try {
      const requisition = await this.getRequisitionById(requisitionId);
      if (!requisition) {
        throw new Error('Requisition not found');
      }

      // Create purchase order from requisition
      const purchaseOrderData: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'> = {
        requisitionId: requisition.id,
        supplierId,
        orderDate: new Date().toISOString(),
        expectedDeliveryDate: orderData.expectedDeliveryDate || requisition.requiredDate,
        status: 'draft',
        priority: requisition.priority,
        buyerId: orderData.buyerId || requisition.requestedBy.id,
        buyer: {
          id: orderData.buyerId || requisition.requestedBy.id,
          name: orderData.buyer?.name || requisition.requestedBy.name,
          email: orderData.buyer?.email || requisition.requestedBy.email
        },
        deliveryAddress: orderData.deliveryAddress!,
        billingAddress: orderData.billingAddress!,
        items: requisition.items.map(item => ({
          id: '', // Will be generated
          productId: item.productId,
          product: item.product,
          description: item.description,
          specification: item.specification,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.estimatedUnitPrice,
          discountPercent: 0,
          discountAmount: 0,
          lineTotal: item.estimatedTotal,
          taxRate: 0,
          taxAmount: 0,
          receivedQuantity: 0,
          pendingQuantity: item.quantity,
          status: 'pending',
          qualityChecked: false
        })),
        subtotal: requisition.totalEstimatedValue,
        taxAmount: 0,
        shippingCost: 0,
        discountAmount: 0,
        totalAmount: requisition.totalEstimatedValue,
        currency: requisition.currency,
        paymentTerms: orderData.paymentTerms || 'net_30',
        deliveryTerms: orderData.deliveryTerms || 'FOB Origin',
        shippingMethod: orderData.shippingMethod || 'standard',
        receivingStatus: 'pending',
        invoiceStatus: 'pending',
        paymentStatus: 'pending',
        createdBy: orderData.createdBy || requisition.requestedBy.id,
        ...orderData
      };

      const purchaseOrder = await this.createPurchaseOrder(purchaseOrderData);

      if (purchaseOrder) {
        // Update requisition status to converted
        await supabase
          .from('purchase_requisitions')
          .update({
            status: 'converted',
            converted_to_po_id: purchaseOrder.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', requisitionId);
      }

      return purchaseOrder;

    } catch (error) {
      console.error('Error in convertRequisitionToPurchaseOrder:', error);
      return null;
    }
  }

  /**
   * Create goods receipt
   */
  static async createGoodsReceipt(receiptData: Omit<GoodsReceipt, 'id' | 'receiptNumber' | 'createdAt' | 'updatedAt'>): Promise<GoodsReceipt | null> {
    try {
      const receiptNumber = await this.generateGoodsReceiptNumber();

      const goodsReceiptData = {
        receipt_number: receiptNumber,
        purchase_order_id: receiptData.purchaseOrderId,
        supplier_id: receiptData.supplierId,
        received_date: receiptData.receivedDate,
        received_by: receiptData.receivedBy.id,
        warehouse_location_id: receiptData.warehouseLocation.id,
        status: receiptData.status,
        total_quantity_received: receiptData.totalQuantityReceived,
        discrepancy_notes: receiptData.discrepancyNotes,
        quality_inspection: receiptData.qualityInspection,
        notes: receiptData.notes,
        attachments: receiptData.attachments,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newReceipt, error } = await supabase
        .from('goods_receipts')
        .insert(goodsReceiptData)
        .select()
        .single();

      if (error) {
        console.error('Error creating goods receipt:', error);
        throw new Error('Failed to create goods receipt');
      }

      // Create goods receipt items
      if (receiptData.items && receiptData.items.length > 0) {
        const receiptItems = receiptData.items.map(item => ({
          goods_receipt_id: newReceipt.id,
          purchase_order_item_id: item.purchaseOrderItemId,
          product_id: item.productId,
          ordered_quantity: item.orderedQuantity,
          received_quantity: item.receivedQuantity,
          accepted_quantity: item.acceptedQuantity,
          rejected_quantity: item.rejectedQuantity,
          rejection_reason: item.rejectionReason,
          unit: item.unit,
          batch_number: item.batchNumber,
          serial_numbers: item.serialNumbers,
          expiry_date: item.expiryDate,
          storage_location: item.storageLocation,
          quality_status: item.qualityStatus,
          notes: item.notes
        }));

        await supabase
          .from('goods_receipt_items')
          .insert(receiptItems);

        // Update purchase order item received quantities
        for (const item of receiptData.items) {
          await supabase
            .from('purchase_order_items')
            .update({
              received_quantity: supabase.raw('received_quantity + ?', [item.acceptedQuantity]),
              pending_quantity: supabase.raw('pending_quantity - ?', [item.acceptedQuantity]),
              updated_at: new Date().toISOString()
            })
            .eq('id', item.purchaseOrderItemId);
        }
      }

      return await this.getGoodsReceiptById(newReceipt.id);

    } catch (error) {
      console.error('Error in createGoodsReceipt:', error);
      return null;
    }
  }

  /**
   * Get suppliers with filtering and pagination
   */
  static async getSuppliers(
    filters: {
      status?: string;
      category?: string;
      preferredStatus?: string;
      search?: string;
    } = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ suppliers: Supplier[]; total: number; hasMore: boolean }> {
    try {
      let query = supabase
        .from('suppliers')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.preferredStatus) {
        query = query.eq('preferred_status', filters.preferredStatus);
      }
      if (filters.category) {
        query = query.contains('category', [filters.category]);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,supplier_number.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query
        .order('name', { ascending: true })
        .range(offset, offset + pageSize - 1);

      const { data: suppliers, error, count } = await query;

      if (error) {
        console.error('Error fetching suppliers:', error);
        return { suppliers: [], total: 0, hasMore: false };
      }

      const transformedSuppliers: Supplier[] = (suppliers || []).map(this.transformSupplierData);

      return {
        suppliers: transformedSuppliers,
        total: count || 0,
        hasMore: (count || 0) > offset + pageSize
      };

    } catch (error) {
      console.error('Error in getSuppliers:', error);
      return { suppliers: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get procurement dashboard metrics
   */
  static async getProcurementDashboardMetrics(period: string = 'month'): Promise<ProcurementDashboardMetrics> {
    try {
      const currentDate = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(currentDate.getMonth() / 3);
          startDate = new Date(currentDate.getFullYear(), quarter * 3, 1);
          break;
        default:
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      }

      // Get current period metrics
      const { data: currentOrders } = await supabase
        .from('purchase_orders')
        .select('total_amount, status')
        .gte('order_date', startDate.toISOString())
        .lte('order_date', currentDate.toISOString());

      const totalSpend = currentOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const totalOrders = currentOrders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;

      // Get supplier metrics
      const { count: totalSuppliers } = await supabase
        .from('suppliers')
        .select('*', { count: 'exact', head: true });

      const { count: activeSuppliers } = await supabase
        .from('suppliers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get requisition and approval metrics
      const { count: pendingRequisitions } = await supabase
        .from('purchase_requisitions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted');

      const { count: pendingApprovals } = await supabase
        .from('approval_steps')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get order status counts
      const { count: ordersAwaitingDelivery } = await supabase
        .from('purchase_orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['sent', 'acknowledged', 'confirmed']);

      const { count: overdueDeliveries } = await supabase
        .from('purchase_orders')
        .select('*', { count: 'exact', head: true })
        .lt('expected_delivery_date', new Date().toISOString())
        .neq('status', 'received');

      // Get invoice and payment metrics
      const { count: pendingInvoices } = await supabase
        .from('supplier_invoices')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'received');

      const { count: overduePayments } = await supabase
        .from('supplier_invoices')
        .select('*', { count: 'exact', head: true })
        .lt('due_date', new Date().toISOString())
        .neq('status', 'paid');

      // Get recent data
      const { data: recentOrdersData } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers(*),
          buyers:employees!buyer_id(id, first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const recentOrders = (recentOrdersData || []).map(this.transformPurchaseOrderData);

      const { data: recentReceiptsData } = await supabase
        .from('goods_receipts')
        .select(`
          *,
          purchase_orders(order_number, supplier_id),
          suppliers(name)
        `)
        .order('received_date', { ascending: false })
        .limit(5);

      const recentReceipts = (recentReceiptsData || []).map(this.transformGoodsReceiptData);

      return {
        totalSpend,
        totalOrders,
        averageOrderValue,
        totalSuppliers: totalSuppliers || 0,
        activeSuppliers: activeSuppliers || 0,
        pendingRequisitions: pendingRequisitions || 0,
        pendingApprovals: pendingApprovals || 0,
        ordersAwaitingDelivery: ordersAwaitingDelivery || 0,
        overdueDeliveries: overdueDeliveries || 0,
        pendingInvoices: pendingInvoices || 0,
        overduePayments: overduePayments || 0,
        savingsFromNegotiations: 0, // Would require complex calculation
        onTimeDeliveryRate: 0, // Would require complex calculation
        qualityRejectionRate: 0, // Would require complex calculation
        topSuppliers: [], // Would require more complex query
        spendByCategory: [], // Would require category aggregation
        recentOrders,
        recentReceipts,
        upcomingDeliveries: [] // Would require future delivery calculation
      };

    } catch (error) {
      console.error('Error getting procurement dashboard metrics:', error);
      return {
        totalSpend: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalSuppliers: 0,
        activeSuppliers: 0,
        pendingRequisitions: 0,
        pendingApprovals: 0,
        ordersAwaitingDelivery: 0,
        overdueDeliveries: 0,
        pendingInvoices: 0,
        overduePayments: 0,
        savingsFromNegotiations: 0,
        onTimeDeliveryRate: 0,
        qualityRejectionRate: 0,
        topSuppliers: [],
        spendByCategory: [],
        recentOrders: [],
        recentReceipts: [],
        upcomingDeliveries: []
      };
    }
  }

  // Helper methods

  /**
   * Get requisition by ID
   */
  private static async getRequisitionById(id: string): Promise<PurchaseRequisition | null> {
    try {
      const { data: requisition, error } = await supabase
        .from('purchase_requisitions')
        .select(`
          *,
          requisition_items(
            *,
            products(id, part_number, name, description, category)
          ),
          approval_steps(*),
          requesters:employees!requested_by(id, first_name, last_name, email, department)
        `)
        .eq('id', id)
        .single();

      if (error || !requisition) {
        console.error('Error fetching requisition by ID:', error);
        return null;
      }

      return this.transformRequisitionData(requisition);

    } catch (error) {
      console.error('Error in getRequisitionById:', error);
      return null;
    }
  }

  /**
   * Get purchase order by ID
   */
  private static async getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
    try {
      const { data: order, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers(*),
          purchase_order_items(
            *,
            products(id, part_number, name, description, category, specifications)
          ),
          buyers:employees!buyer_id(id, first_name, last_name, email, phone)
        `)
        .eq('id', id)
        .single();

      if (error || !order) {
        console.error('Error fetching purchase order by ID:', error);
        return null;
      }

      return this.transformPurchaseOrderData(order);

    } catch (error) {
      console.error('Error in getPurchaseOrderById:', error);
      return null;
    }
  }

  /**
   * Get goods receipt by ID
   */
  private static async getGoodsReceiptById(id: string): Promise<GoodsReceipt | null> {
    try {
      const { data: receipt, error } = await supabase
        .from('goods_receipts')
        .select(`
          *,
          purchase_orders(order_number, supplier_id),
          suppliers(name),
          goods_receipt_items(
            *,
            products(id, part_number, name)
          ),
          receivers:employees!received_by(id, first_name, last_name, department),
          warehouse_locations(id, name, section)
        `)
        .eq('id', id)
        .single();

      if (error || !receipt) {
        console.error('Error fetching goods receipt by ID:', error);
        return null;
      }

      return this.transformGoodsReceiptData(receipt);

    } catch (error) {
      console.error('Error in getGoodsReceiptById:', error);
      return null;
    }
  }

  /**
   * Create approval workflow for requisition
   */
  private static async createApprovalWorkflow(requisitionId: string, totalValue: number): Promise<void> {
    try {
      const approvalSteps: Omit<ApprovalStep, 'id'>[] = [];

      // Define approval rules based on amount
      if (totalValue > 100000) {
        approvalSteps.push({
          stepNumber: 1,
          approverRole: 'department_manager',
          status: 'pending',
          requiredApprovalAmount: 10000
        });
        approvalSteps.push({
          stepNumber: 2,
          approverRole: 'procurement_manager',
          status: 'pending',
          requiredApprovalAmount: 50000
        });
        approvalSteps.push({
          stepNumber: 3,
          approverRole: 'finance_director',
          status: 'pending',
          requiredApprovalAmount: 100000
        });
      } else if (totalValue > 50000) {
        approvalSteps.push({
          stepNumber: 1,
          approverRole: 'department_manager',
          status: 'pending',
          requiredApprovalAmount: 10000
        });
        approvalSteps.push({
          stepNumber: 2,
          approverRole: 'procurement_manager',
          status: 'pending',
          requiredApprovalAmount: 50000
        });
      } else if (totalValue > 10000) {
        approvalSteps.push({
          stepNumber: 1,
          approverRole: 'department_manager',
          status: 'pending',
          requiredApprovalAmount: 10000
        });
      }

      if (approvalSteps.length > 0) {
        const approvalData = approvalSteps.map(step => ({
          requisition_id: requisitionId,
          step_number: step.stepNumber,
          approver_role: step.approverRole,
          status: step.status,
          required_approval_amount: step.requiredApprovalAmount
        }));

        await supabase
          .from('approval_steps')
          .insert(approvalData);
      }

    } catch (error) {
      console.error('Error creating approval workflow:', error);
    }
  }

  /**
   * Generate requisition number
   */
  private static async generateRequisitionNumber(): Promise<string> {
    try {
      const { count } = await supabase
        .from('purchase_requisitions')
        .select('*', { count: 'exact', head: true });

      const sequence = (count || 0) + 1;
      return `PR-${new Date().getFullYear()}-${sequence.toString().padStart(6, '0')}`;

    } catch (error) {
      console.error('Error generating requisition number:', error);
      return `PR-${Date.now()}`;
    }
  }

  /**
   * Generate purchase order number
   */
  private static async generatePurchaseOrderNumber(): Promise<string> {
    try {
      const { count } = await supabase
        .from('purchase_orders')
        .select('*', { count: 'exact', head: true });

      const sequence = (count || 0) + 1;
      return `PO-${new Date().getFullYear()}-${sequence.toString().padStart(6, '0')}`;

    } catch (error) {
      console.error('Error generating purchase order number:', error);
      return `PO-${Date.now()}`;
    }
  }

  /**
   * Generate goods receipt number
   */
  private static async generateGoodsReceiptNumber(): Promise<string> {
    try {
      const { count } = await supabase
        .from('goods_receipts')
        .select('*', { count: 'exact', head: true });

      const sequence = (count || 0) + 1;
      return `GR-${new Date().getFullYear()}-${sequence.toString().padStart(6, '0')}`;

    } catch (error) {
      console.error('Error generating goods receipt number:', error);
      return `GR-${Date.now()}`;
    }
  }

  // Data transformation methods

  private static transformRequisitionData(data: any): PurchaseRequisition {
    return {
      id: data.id,
      requisitionNumber: data.requisition_number,
      requestedBy: {
        id: data.requesters.id,
        name: `${data.requesters.first_name} ${data.requesters.last_name}`,
        department: data.requesters.department,
        email: data.requesters.email
      },
      department: data.department,
      requestDate: data.request_date,
      requiredDate: data.required_date,
      priority: data.priority,
      status: data.status,
      approvals: (data.approval_steps || []).map(this.transformApprovalStepData),
      items: (data.requisition_items || []).map(this.transformRequisitionItemData),
      justification: data.justification,
      notes: data.notes,
      attachments: data.attachments || [],
      totalEstimatedValue: data.total_estimated_value || 0,
      currency: data.currency || 'KES',
      convertedToPOId: data.converted_to_po_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private static transformApprovalStepData(data: any): ApprovalStep {
    return {
      id: data.id,
      stepNumber: data.step_number,
      approverRole: data.approver_role,
      approverId: data.approver_id,
      approverName: data.approver_name,
      status: data.status,
      approvedAt: data.approved_at,
      comments: data.comments,
      requiredApprovalAmount: data.required_approval_amount
    };
  }

  private static transformRequisitionItemData(data: any): RequisitionItem {
    return {
      id: data.id,
      productId: data.product_id,
      product: data.products ? {
        id: data.products.id,
        partNumber: data.products.part_number,
        name: data.products.name,
        description: data.products.description,
        category: data.products.category,
        preferredSupplier: data.products.preferred_supplier
      } : undefined,
      description: data.description,
      specification: data.specification,
      quantity: data.quantity,
      unit: data.unit,
      estimatedUnitPrice: data.estimated_unit_price,
      estimatedTotal: data.estimated_total,
      suggestedSupplier: data.suggested_supplier_id ? {
        id: data.suggested_supplier_id,
        name: data.suggested_supplier_name,
        lastPrice: data.suggested_supplier_last_price,
        leadTime: data.suggested_supplier_lead_time
      } : undefined,
      urgency: data.urgency,
      notes: data.notes
    };
  }

  private static transformPurchaseOrderData(data: any): PurchaseOrder {
    return {
      id: data.id,
      orderNumber: data.order_number,
      requisitionId: data.requisition_id,
      supplierId: data.supplier_id,
      supplier: data.suppliers ? this.transformSupplierData(data.suppliers) : undefined,
      orderDate: data.order_date,
      expectedDeliveryDate: data.expected_delivery_date,
      actualDeliveryDate: data.actual_delivery_date,
      status: data.status,
      priority: data.priority,
      buyerId: data.buyer_id,
      buyer: {
        id: data.buyers?.id || data.buyer_id,
        name: data.buyers ? `${data.buyers.first_name} ${data.buyers.last_name}` : '',
        email: data.buyers?.email || '',
        phone: data.buyers?.phone
      },
      deliveryAddress: data.delivery_address,
      billingAddress: data.billing_address,
      items: (data.purchase_order_items || []).map(this.transformPurchaseOrderItemData),
      subtotal: data.subtotal || 0,
      taxAmount: data.tax_amount || 0,
      shippingCost: data.shipping_cost || 0,
      discountAmount: data.discount_amount || 0,
      totalAmount: data.total_amount || 0,
      currency: data.currency || 'KES',
      paymentTerms: data.payment_terms,
      deliveryTerms: data.delivery_terms,
      shippingMethod: data.shipping_method,
      trackingNumber: data.tracking_number,
      notes: data.notes,
      termsAndConditions: data.terms_and_conditions,
      attachments: data.attachments || [],
      sentAt: data.sent_at,
      acknowledgedAt: data.acknowledged_at,
      confirmedAt: data.confirmed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at,
      receivingStatus: data.receiving_status,
      invoiceStatus: data.invoice_status,
      paymentStatus: data.payment_status
    };
  }

  private static transformPurchaseOrderItemData(data: any): PurchaseOrderItem {
    return {
      id: data.id,
      productId: data.product_id,
      product: data.products ? {
        id: data.products.id,
        partNumber: data.products.part_number,
        name: data.products.name,
        description: data.products.description,
        category: data.products.category,
        specifications: data.products.specifications
      } : undefined,
      description: data.description,
      specification: data.specification,
      quantity: data.quantity,
      unit: data.unit,
      unitPrice: data.unit_price,
      discountPercent: data.discount_percent || 0,
      discountAmount: data.discount_amount || 0,
      lineTotal: data.line_total,
      taxRate: data.tax_rate || 0,
      taxAmount: data.tax_amount || 0,
      expectedDeliveryDate: data.expected_delivery_date,
      receivedQuantity: data.received_quantity || 0,
      pendingQuantity: data.pending_quantity || 0,
      status: data.status,
      notes: data.notes,
      qualityChecked: data.quality_checked || false,
      qualityNotes: data.quality_notes
    };
  }

  private static transformSupplierData(data: any): Supplier {
    return {
      id: data.id,
      supplierNumber: data.supplier_number,
      name: data.name,
      companyName: data.company_name,
      type: data.type,
      email: data.email,
      phone: data.phone,
      website: data.website,
      taxId: data.tax_id,
      registrationNumber: data.registration_number,
      address: {
        billing: data.billing_address,
        shipping: data.shipping_address
      },
      contactPerson: data.contact_person,
      paymentTerms: data.payment_terms,
      creditLimit: data.credit_limit || 0,
      creditUsed: data.credit_used || 0,
      currency: data.currency || 'KES',
      leadTime: data.lead_time || 0,
      minimumOrderValue: data.minimum_order_value || 0,
      discountTerms: data.discount_terms,
      rating: data.rating || { quality: 0, delivery: 0, service: 0, overall: 0 },
      certifications: data.certifications || [],
      status: data.status,
      category: data.category || [],
      preferredStatus: data.preferred_status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastOrderDate: data.last_order_date,
      totalOrders: data.total_orders || 0,
      totalPurchaseValue: data.total_purchase_value || 0
    };
  }

  private static transformGoodsReceiptData(data: any): GoodsReceipt {
    return {
      id: data.id,
      receiptNumber: data.receipt_number,
      purchaseOrderId: data.purchase_order_id,
      purchaseOrder: data.purchase_orders ? {
        id: data.purchase_orders.id,
        orderNumber: data.purchase_orders.order_number,
        supplierId: data.purchase_orders.supplier_id
      } as any : undefined,
      supplierId: data.supplier_id,
      receivedDate: data.received_date,
      receivedBy: {
        id: data.receivers?.id || data.received_by,
        name: data.receivers ? `${data.receivers.first_name} ${data.receivers.last_name}` : '',
        department: data.receivers?.department || ''
      },
      warehouseLocation: {
        id: data.warehouse_locations?.id || data.warehouse_location_id,
        name: data.warehouse_locations?.name || '',
        section: data.warehouse_locations?.section
      },
      items: (data.goods_receipt_items || []).map(this.transformGoodsReceiptItemData),
      status: data.status,
      totalQuantityReceived: data.total_quantity_received || 0,
      discrepancyNotes: data.discrepancy_notes,
      qualityInspection: data.quality_inspection,
      notes: data.notes,
      attachments: data.attachments || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private static transformGoodsReceiptItemData(data: any): GoodsReceiptItem {
    return {
      id: data.id,
      purchaseOrderItemId: data.purchase_order_item_id,
      productId: data.product_id,
      product: data.products ? {
        id: data.products.id,
        partNumber: data.products.part_number,
        name: data.products.name
      } : undefined,
      orderedQuantity: data.ordered_quantity,
      receivedQuantity: data.received_quantity,
      acceptedQuantity: data.accepted_quantity,
      rejectedQuantity: data.rejected_quantity,
      rejectionReason: data.rejection_reason,
      unit: data.unit,
      batchNumber: data.batch_number,
      serialNumbers: data.serial_numbers || [],
      expiryDate: data.expiry_date,
      storageLocation: data.storage_location,
      qualityStatus: data.quality_status,
      notes: data.notes
    };
  }
}
