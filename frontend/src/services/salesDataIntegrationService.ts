import { supabase } from '@/integrations/supabase/client';

export interface Customer {
  id: string;
  customerNumber: string;
  name: string;
  companyName?: string;
  type: 'individual' | 'business';
  email: string;
  phone: string;
  website?: string;
  taxId?: string;
  address: {
    billing: Address;
    shipping?: Address;
  };
  contactPerson?: {
    name: string;
    email: string;
    phone: string;
    position?: string;
  };
  creditLimit: number;
  creditUsed: number;
  paymentTerms: 'cash' | 'net_15' | 'net_30' | 'net_60' | 'net_90';
  status: 'active' | 'inactive' | 'suspended';
  salesRep?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  lastOrderDate?: string;
  totalOrders: number;
  totalSalesValue: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  orderDate: string;
  requestedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  salesRep: {
    id: string;
    name: string;
    email: string;
    commission: number;
  };
  shippingAddress: Address;
  billingAddress: Address;
  items: SalesOrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'check' | 'credit';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  shippingMethod: string;
  trackingNumber?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface SalesOrderItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    partNumber: string;
    name: string;
    description?: string;
    category: string;
    unitPrice: number;
    weight?: number;
  };
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
  taxRate: number;
  taxAmount: number;
  deliveryDate?: string;
  status: 'pending' | 'confirmed' | 'backordered' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  salesOrderId?: string;
  customerId: string;
  customer?: Customer;
  invoiceDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  currency: string;
  paymentTerms: string;
  notes?: string;
  attachments?: string[];
  sentAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    partNumber: string;
    name: string;
    description?: string;
  };
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
  taxRate: number;
  taxAmount: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customer?: Customer;
  quoteDate: string;
  validUntil: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted';
  items: QuoteItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentTerms: string;
  deliveryTerms: string;
  validityPeriod: number; // days
  notes?: string;
  termsAndConditions?: string;
  attachments?: string[];
  sentAt?: string;
  viewedAt?: string;
  respondedAt?: string;
  convertedToOrderId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  salesRep: {
    id: string;
    name: string;
    email: string;
  };
}

export interface QuoteItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    partNumber: string;
    name: string;
    description?: string;
    category: string;
  };
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
  taxRate: number;
  taxAmount: number;
  deliveryTime?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  customerId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'check' | 'other';
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  notes?: string;
  attachments?: string[];
  processedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesDashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomers: number;
  pendingOrders: number;
  shippedOrders: number;
  overdueInvoices: number;
  outstandingAmount: number;
  quotesAwaitingResponse: number;
  conversionRate: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalOrders: number;
    totalRevenue: number;
  }>;
  salesByPeriod: Array<{
    period: string;
    revenue: number;
    orders: number;
  }>;
  salesByRep: Array<{
    repId: string;
    repName: string;
    orders: number;
    revenue: number;
    commission: number;
  }>;
  recentOrders: SalesOrder[];
  recentPayments: Payment[];
}

export interface SalesAnalytics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
  revenue: {
    current: number;
    previous: number;
    growth: number;
    target?: number;
  };
  orders: {
    current: number;
    previous: number;
    growth: number;
  };
  customers: {
    new: number;
    returning: number;
    churn: number;
  };
  products: {
    topSelling: Array<{
      productId: string;
      name: string;
      quantity: number;
      revenue: number;
    }>;
    categoryBreakdown: Array<{
      category: string;
      quantity: number;
      revenue: number;
      percentage: number;
    }>;
  };
  geographical: Array<{
    region: string;
    orders: number;
    revenue: number;
    customers: number;
  }>;
}

/**
 * Sales Data Integration Service
 * Comprehensive sales management with orders, invoices, quotes, and payments
 */
export class SalesDataIntegrationService {

  /**
   * Get sales orders with filtering and pagination
   */
  static async getSalesOrders(
    filters: {
      customerId?: string;
      status?: string;
      salesRep?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
    } = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ orders: SalesOrder[]; total: number; hasMore: boolean }> {
    try {
      let query = supabase
        .from('sales_orders')
        .select(`
          *,
          customers(*),
          sales_order_items(
            *,
            products(id, part_number, name, description, category, selling_price, weight)
          ),
          sales_reps:employees!sales_rep_id(id, first_name, last_name, email)
        `, { count: 'exact' });

      // Apply filters
      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.salesRep) {
        query = query.eq('sales_rep_id', filters.salesRep);
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
        console.error('Error fetching sales orders:', error);
        return { orders: [], total: 0, hasMore: false };
      }

      const transformedOrders: SalesOrder[] = (orders || []).map(this.transformSalesOrderData);

      return {
        orders: transformedOrders,
        total: count || 0,
        hasMore: (count || 0) > offset + pageSize
      };

    } catch (error) {
      console.error('Error in getSalesOrders:', error);
      return { orders: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get sales order by ID
   */
  static async getSalesOrderById(id: string): Promise<SalesOrder | null> {
    try {
      const { data: order, error } = await supabase
        .from('sales_orders')
        .select(`
          *,
          customers(*),
          sales_order_items(
            *,
            products(id, part_number, name, description, category, selling_price, weight)
          ),
          sales_reps:employees!sales_rep_id(id, first_name, last_name, email)
        `)
        .eq('id', id)
        .single();

      if (error || !order) {
        console.error('Error fetching sales order by ID:', error);
        return null;
      }

      return this.transformSalesOrderData(order);

    } catch (error) {
      console.error('Error in getSalesOrderById:', error);
      return null;
    }
  }

  /**
   * Create new sales order
   */
  static async createSalesOrder(orderData: Omit<SalesOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<SalesOrder | null> {
    try {
      const orderNumber = await this.generateOrderNumber();

      const salesOrderData = {
        order_number: orderNumber,
        customer_id: orderData.customerId,
        order_date: orderData.orderDate,
        requested_delivery_date: orderData.requestedDeliveryDate,
        status: orderData.status,
        priority: orderData.priority,
        sales_rep_id: orderData.salesRep.id,
        shipping_address: orderData.shippingAddress,
        billing_address: orderData.billingAddress,
        subtotal: orderData.subtotal,
        tax_amount: orderData.taxAmount,
        shipping_cost: orderData.shippingCost,
        discount_amount: orderData.discountAmount,
        total_amount: orderData.totalAmount,
        currency: orderData.currency,
        payment_method: orderData.paymentMethod,
        payment_status: orderData.paymentStatus,
        shipping_method: orderData.shippingMethod,
        notes: orderData.notes,
        attachments: orderData.attachments,
        created_by: orderData.createdBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newOrder, error } = await supabase
        .from('sales_orders')
        .insert(salesOrderData)
        .select(`
          *,
          customers(*),
          sales_reps:employees!sales_rep_id(id, first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error('Error creating sales order:', error);
        throw new Error('Failed to create sales order');
      }

      // Create order items
      if (orderData.items && orderData.items.length > 0) {
        const orderItems = orderData.items.map(item => ({
          sales_order_id: newOrder.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount_percent: item.discountPercent,
          discount_amount: item.discountAmount,
          line_total: item.lineTotal,
          tax_rate: item.taxRate,
          tax_amount: item.taxAmount,
          delivery_date: item.deliveryDate,
          status: item.status,
          notes: item.notes
        }));

        await supabase
          .from('sales_order_items')
          .insert(orderItems);
      }

      return await this.getSalesOrderById(newOrder.id);

    } catch (error) {
      console.error('Error in createSalesOrder:', error);
      return null;
    }
  }

  /**
   * Update sales order
   */
  static async updateSalesOrder(id: string, updates: Partial<SalesOrder>): Promise<SalesOrder | null> {
    try {
      const updateData = {
        ...updates.customerId && { customer_id: updates.customerId },
        ...updates.orderDate && { order_date: updates.orderDate },
        ...updates.requestedDeliveryDate && { requested_delivery_date: updates.requestedDeliveryDate },
        ...updates.actualDeliveryDate && { actual_delivery_date: updates.actualDeliveryDate },
        ...updates.status && { status: updates.status },
        ...updates.priority && { priority: updates.priority },
        ...updates.salesRep?.id && { sales_rep_id: updates.salesRep.id },
        ...updates.shippingAddress && { shipping_address: updates.shippingAddress },
        ...updates.billingAddress && { billing_address: updates.billingAddress },
        ...updates.subtotal !== undefined && { subtotal: updates.subtotal },
        ...updates.taxAmount !== undefined && { tax_amount: updates.taxAmount },
        ...updates.shippingCost !== undefined && { shipping_cost: updates.shippingCost },
        ...updates.discountAmount !== undefined && { discount_amount: updates.discountAmount },
        ...updates.totalAmount !== undefined && { total_amount: updates.totalAmount },
        ...updates.paymentMethod && { payment_method: updates.paymentMethod },
        ...updates.paymentStatus && { payment_status: updates.paymentStatus },
        ...updates.shippingMethod && { shipping_method: updates.shippingMethod },
        ...updates.trackingNumber && { tracking_number: updates.trackingNumber },
        ...updates.notes && { notes: updates.notes },
        ...updates.attachments && { attachments: updates.attachments },
        ...updates.approvedBy && { approved_by: updates.approvedBy },
        ...updates.approvedAt && { approved_at: updates.approvedAt },
        updated_at: new Date().toISOString()
      };

      const { data: updatedOrder, error } = await supabase
        .from('sales_orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating sales order:', error);
        throw new Error('Failed to update sales order');
      }

      return await this.getSalesOrderById(id);

    } catch (error) {
      console.error('Error in updateSalesOrder:', error);
      return null;
    }
  }

  /**
   * Get quotes with filtering and pagination
   */
  static async getQuotes(
    filters: {
      customerId?: string;
      status?: string;
      salesRep?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ quotes: Quote[]; total: number; hasMore: boolean }> {
    try {
      let query = supabase
        .from('quotes')
        .select(`
          *,
          customers(*),
          quote_items(
            *,
            products(id, part_number, name, description, category)
          ),
          sales_reps:employees!sales_rep_id(id, first_name, last_name, email)
        `, { count: 'exact' });

      // Apply filters
      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.salesRep) {
        query = query.eq('sales_rep_id', filters.salesRep);
      }
      if (filters.dateFrom) {
        query = query.gte('quote_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('quote_date', filters.dateTo);
      }

      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query
        .order('quote_date', { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data: quotes, error, count } = await query;

      if (error) {
        console.error('Error fetching quotes:', error);
        return { quotes: [], total: 0, hasMore: false };
      }

      const transformedQuotes: Quote[] = (quotes || []).map(this.transformQuoteData);

      return {
        quotes: transformedQuotes,
        total: count || 0,
        hasMore: (count || 0) > offset + pageSize
      };

    } catch (error) {
      console.error('Error in getQuotes:', error);
      return { quotes: [], total: 0, hasMore: false };
    }
  }

  /**
   * Create new quote
   */
  static async createQuote(quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt'>): Promise<Quote | null> {
    try {
      const quoteNumber = await this.generateQuoteNumber();

      const newQuoteData = {
        quote_number: quoteNumber,
        customer_id: quoteData.customerId,
        quote_date: quoteData.quoteDate,
        valid_until: quoteData.validUntil,
        status: quoteData.status,
        subtotal: quoteData.subtotal,
        tax_amount: quoteData.taxAmount,
        discount_amount: quoteData.discountAmount,
        total_amount: quoteData.totalAmount,
        currency: quoteData.currency,
        payment_terms: quoteData.paymentTerms,
        delivery_terms: quoteData.deliveryTerms,
        validity_period: quoteData.validityPeriod,
        notes: quoteData.notes,
        terms_and_conditions: quoteData.termsAndConditions,
        attachments: quoteData.attachments,
        sales_rep_id: quoteData.salesRep.id,
        created_by: quoteData.createdBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newQuote, error } = await supabase
        .from('quotes')
        .insert(newQuoteData)
        .select()
        .single();

      if (error) {
        console.error('Error creating quote:', error);
        throw new Error('Failed to create quote');
      }

      // Create quote items
      if (quoteData.items && quoteData.items.length > 0) {
        const quoteItems = quoteData.items.map(item => ({
          quote_id: newQuote.id,
          product_id: item.productId,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount_percent: item.discountPercent,
          discount_amount: item.discountAmount,
          line_total: item.lineTotal,
          tax_rate: item.taxRate,
          tax_amount: item.taxAmount,
          delivery_time: item.deliveryTime,
          notes: item.notes
        }));

        await supabase
          .from('quote_items')
          .insert(quoteItems);
      }

      return await this.getQuoteById(newQuote.id);

    } catch (error) {
      console.error('Error in createQuote:', error);
      return null;
    }
  }

  /**
   * Get quote by ID
   */
  static async getQuoteById(id: string): Promise<Quote | null> {
    try {
      const { data: quote, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customers(*),
          quote_items(
            *,
            products(id, part_number, name, description, category)
          ),
          sales_reps:employees!sales_rep_id(id, first_name, last_name, email)
        `)
        .eq('id', id)
        .single();

      if (error || !quote) {
        console.error('Error fetching quote by ID:', error);
        return null;
      }

      return this.transformQuoteData(quote);

    } catch (error) {
      console.error('Error in getQuoteById:', error);
      return null;
    }
  }

  /**
   * Convert quote to sales order
   */
  static async convertQuoteToOrder(quoteId: string, orderData: Partial<SalesOrder>): Promise<SalesOrder | null> {
    try {
      const quote = await this.getQuoteById(quoteId);
      if (!quote) {
        throw new Error('Quote not found');
      }

      // Create sales order from quote
      const salesOrderData: Omit<SalesOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'> = {
        customerId: quote.customerId,
        orderDate: new Date().toISOString(),
        status: 'pending',
        priority: 'normal',
        salesRep: quote.salesRep,
        shippingAddress: orderData.shippingAddress || quote.customer?.address.shipping || quote.customer?.address.billing!,
        billingAddress: orderData.billingAddress || quote.customer?.address.billing!,
        items: quote.items.map(item => ({
          id: '', // Will be generated
          productId: item.productId,
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          discountAmount: item.discountAmount,
          lineTotal: item.lineTotal,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          status: 'pending'
        })),
        subtotal: quote.subtotal,
        taxAmount: quote.taxAmount,
        shippingCost: 0,
        discountAmount: quote.discountAmount,
        totalAmount: quote.totalAmount,
        currency: quote.currency,
        paymentMethod: 'credit',
        paymentStatus: 'pending',
        shippingMethod: orderData.shippingMethod || 'standard',
        createdBy: orderData.createdBy || quote.createdBy,
        ...orderData
      };

      const salesOrder = await this.createSalesOrder(salesOrderData);

      if (salesOrder) {
        // Update quote status to converted
        await supabase
          .from('quotes')
          .update({
            status: 'converted',
            converted_to_order_id: salesOrder.id,
            responded_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', quoteId);
      }

      return salesOrder;

    } catch (error) {
      console.error('Error in convertQuoteToOrder:', error);
      return null;
    }
  }

  /**
   * Get invoices with filtering and pagination
   */
  static async getInvoices(
    filters: {
      customerId?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      overdue?: boolean;
    } = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ invoices: Invoice[]; total: number; hasMore: boolean }> {
    try {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          customers(*),
          invoice_items(
            *,
            products(id, part_number, name, description)
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.dateFrom) {
        query = query.gte('invoice_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('invoice_date', filters.dateTo);
      }
      if (filters.overdue) {
        query = query.lt('due_date', new Date().toISOString())
                     .neq('status', 'paid');
      }

      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query
        .order('invoice_date', { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data: invoices, error, count } = await query;

      if (error) {
        console.error('Error fetching invoices:', error);
        return { invoices: [], total: 0, hasMore: false };
      }

      const transformedInvoices: Invoice[] = (invoices || []).map(this.transformInvoiceData);

      return {
        invoices: transformedInvoices,
        total: count || 0,
        hasMore: (count || 0) > offset + pageSize
      };

    } catch (error) {
      console.error('Error in getInvoices:', error);
      return { invoices: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get sales dashboard metrics
   */
  static async getSalesDashboardMetrics(period: string = 'month'): Promise<SalesDashboardMetrics> {
    try {
      const currentDate = new Date();
      let startDate: Date;
      let previousStartDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          previousStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
          break;
        case 'quarter':
          const quarter = Math.floor(currentDate.getMonth() / 3);
          startDate = new Date(currentDate.getFullYear(), quarter * 3, 1);
          previousStartDate = new Date(currentDate.getFullYear(), (quarter - 1) * 3, 1);
          break;
        default:
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          previousStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      }

      // Get current period metrics
      const { data: currentOrders } = await supabase
        .from('sales_orders')
        .select('total_amount, status')
        .gte('order_date', startDate.toISOString())
        .lte('order_date', currentDate.toISOString());

      const totalRevenue = currentOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const totalOrders = currentOrders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get customer metrics
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: newCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Get order status counts
      const { count: pendingOrders } = await supabase
        .from('sales_orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: shippedOrders } = await supabase
        .from('sales_orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'shipped');

      // Get invoice metrics
      const { count: overdueInvoices } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .lt('due_date', new Date().toISOString())
        .neq('status', 'paid');

      const { data: outstandingInvoices } = await supabase
        .from('invoices')
        .select('balance_amount')
        .neq('status', 'paid');

      const outstandingAmount = outstandingInvoices?.reduce((sum, inv) => sum + (inv.balance_amount || 0), 0) || 0;

      // Get quote metrics
      const { count: quotesAwaitingResponse } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent');

      // Get conversion rate (quotes to orders)
      const { count: totalQuotes } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .gte('quote_date', previousStartDate.toISOString());

      const { count: convertedQuotes } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'converted')
        .gte('quote_date', previousStartDate.toISOString());

      const conversionRate = totalQuotes && totalQuotes > 0 ? (convertedQuotes || 0) / totalQuotes * 100 : 0;

      // Get recent data
      const { data: recentOrdersData } = await supabase
        .from('sales_orders')
        .select(`
          *,
          customers(*),
          sales_reps:employees!sales_rep_id(id, first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const recentOrders = (recentOrdersData || []).map(this.transformSalesOrderData);

      const { data: recentPaymentsData } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false })
        .limit(5);

      const recentPayments = (recentPaymentsData || []).map(this.transformPaymentData);

      return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalCustomers: totalCustomers || 0,
        newCustomers: newCustomers || 0,
        pendingOrders: pendingOrders || 0,
        shippedOrders: shippedOrders || 0,
        overdueInvoices: overdueInvoices || 0,
        outstandingAmount,
        quotesAwaitingResponse: quotesAwaitingResponse || 0,
        conversionRate,
        topProducts: [], // Would require more complex query
        topCustomers: [], // Would require more complex query
        salesByPeriod: [], // Would require time series analysis
        salesByRep: [], // Would require sales rep aggregation
        recentOrders,
        recentPayments
      };

    } catch (error) {
      console.error('Error getting sales dashboard metrics:', error);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalCustomers: 0,
        newCustomers: 0,
        pendingOrders: 0,
        shippedOrders: 0,
        overdueInvoices: 0,
        outstandingAmount: 0,
        quotesAwaitingResponse: 0,
        conversionRate: 0,
        topProducts: [],
        topCustomers: [],
        salesByPeriod: [],
        salesByRep: [],
        recentOrders: [],
        recentPayments: []
      };
    }
  }

  /**
   * Generate order number
   */
  private static async generateOrderNumber(): Promise<string> {
    try {
      const { count } = await supabase
        .from('sales_orders')
        .select('*', { count: 'exact', head: true });

      const sequence = (count || 0) + 1;
      return `SO-${new Date().getFullYear()}-${sequence.toString().padStart(6, '0')}`;

    } catch (error) {
      console.error('Error generating order number:', error);
      return `SO-${Date.now()}`;
    }
  }

  /**
   * Generate quote number
   */
  private static async generateQuoteNumber(): Promise<string> {
    try {
      const { count } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true });

      const sequence = (count || 0) + 1;
      return `QT-${new Date().getFullYear()}-${sequence.toString().padStart(6, '0')}`;

    } catch (error) {
      console.error('Error generating quote number:', error);
      return `QT-${Date.now()}`;
    }
  }

  // Data transformation methods

  private static transformSalesOrderData(data: any): SalesOrder {
    return {
      id: data.id,
      orderNumber: data.order_number,
      customerId: data.customer_id,
      customer: data.customers ? this.transformCustomerData(data.customers) : undefined,
      orderDate: data.order_date,
      requestedDeliveryDate: data.requested_delivery_date,
      actualDeliveryDate: data.actual_delivery_date,
      status: data.status,
      priority: data.priority,
      salesRep: {
        id: data.sales_reps?.id || data.sales_rep_id,
        name: data.sales_reps ? `${data.sales_reps.first_name} ${data.sales_reps.last_name}` : '',
        email: data.sales_reps?.email || '',
        commission: data.commission || 0
      },
      shippingAddress: data.shipping_address,
      billingAddress: data.billing_address,
      items: (data.sales_order_items || []).map(this.transformSalesOrderItemData),
      subtotal: data.subtotal || 0,
      taxAmount: data.tax_amount || 0,
      shippingCost: data.shipping_cost || 0,
      discountAmount: data.discount_amount || 0,
      totalAmount: data.total_amount || 0,
      currency: data.currency || 'KES',
      paymentMethod: data.payment_method,
      paymentStatus: data.payment_status,
      shippingMethod: data.shipping_method,
      trackingNumber: data.tracking_number,
      notes: data.notes,
      attachments: data.attachments || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at
    };
  }

  private static transformSalesOrderItemData(data: any): SalesOrderItem {
    return {
      id: data.id,
      productId: data.product_id,
      product: data.products ? {
        id: data.products.id,
        partNumber: data.products.part_number,
        name: data.products.name,
        description: data.products.description,
        category: data.products.category,
        unitPrice: data.products.selling_price || 0,
        weight: data.products.weight
      } : undefined,
      quantity: data.quantity,
      unitPrice: data.unit_price,
      discountPercent: data.discount_percent || 0,
      discountAmount: data.discount_amount || 0,
      lineTotal: data.line_total,
      taxRate: data.tax_rate || 0,
      taxAmount: data.tax_amount || 0,
      deliveryDate: data.delivery_date,
      status: data.status,
      notes: data.notes
    };
  }

  private static transformQuoteData(data: any): Quote {
    return {
      id: data.id,
      quoteNumber: data.quote_number,
      customerId: data.customer_id,
      customer: data.customers ? this.transformCustomerData(data.customers) : undefined,
      quoteDate: data.quote_date,
      validUntil: data.valid_until,
      status: data.status,
      items: (data.quote_items || []).map(this.transformQuoteItemData),
      subtotal: data.subtotal || 0,
      taxAmount: data.tax_amount || 0,
      discountAmount: data.discount_amount || 0,
      totalAmount: data.total_amount || 0,
      currency: data.currency || 'KES',
      paymentTerms: data.payment_terms,
      deliveryTerms: data.delivery_terms,
      validityPeriod: data.validity_period,
      notes: data.notes,
      termsAndConditions: data.terms_and_conditions,
      attachments: data.attachments || [],
      sentAt: data.sent_at,
      viewedAt: data.viewed_at,
      respondedAt: data.responded_at,
      convertedToOrderId: data.converted_to_order_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      salesRep: {
        id: data.sales_reps?.id || data.sales_rep_id,
        name: data.sales_reps ? `${data.sales_reps.first_name} ${data.sales_reps.last_name}` : '',
        email: data.sales_reps?.email || ''
      }
    };
  }

  private static transformQuoteItemData(data: any): QuoteItem {
    return {
      id: data.id,
      productId: data.product_id,
      product: data.products ? {
        id: data.products.id,
        partNumber: data.products.part_number,
        name: data.products.name,
        description: data.products.description,
        category: data.products.category
      } : undefined,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unit_price,
      discountPercent: data.discount_percent || 0,
      discountAmount: data.discount_amount || 0,
      lineTotal: data.line_total,
      taxRate: data.tax_rate || 0,
      taxAmount: data.tax_amount || 0,
      deliveryTime: data.delivery_time,
      notes: data.notes
    };
  }

  private static transformInvoiceData(data: any): Invoice {
    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      salesOrderId: data.sales_order_id,
      customerId: data.customer_id,
      customer: data.customers ? this.transformCustomerData(data.customers) : undefined,
      invoiceDate: data.invoice_date,
      dueDate: data.due_date,
      status: data.status,
      items: (data.invoice_items || []).map(this.transformInvoiceItemData),
      subtotal: data.subtotal || 0,
      taxAmount: data.tax_amount || 0,
      discountAmount: data.discount_amount || 0,
      totalAmount: data.total_amount || 0,
      paidAmount: data.paid_amount || 0,
      balanceAmount: data.balance_amount || 0,
      currency: data.currency || 'KES',
      paymentTerms: data.payment_terms,
      notes: data.notes,
      attachments: data.attachments || [],
      sentAt: data.sent_at,
      paidAt: data.paid_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by
    };
  }

  private static transformInvoiceItemData(data: any): InvoiceItem {
    return {
      id: data.id,
      productId: data.product_id,
      product: data.products ? {
        id: data.products.id,
        partNumber: data.products.part_number,
        name: data.products.name,
        description: data.products.description
      } : undefined,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unit_price,
      discountPercent: data.discount_percent || 0,
      discountAmount: data.discount_amount || 0,
      lineTotal: data.line_total,
      taxRate: data.tax_rate || 0,
      taxAmount: data.tax_amount || 0
    };
  }

  private static transformPaymentData(data: any): Payment {
    return {
      id: data.id,
      paymentNumber: data.payment_number,
      invoiceId: data.invoice_id,
      customerId: data.customer_id,
      paymentDate: data.payment_date,
      amount: data.amount,
      paymentMethod: data.payment_method,
      reference: data.reference,
      status: data.status,
      notes: data.notes,
      attachments: data.attachments || [],
      processedBy: data.processed_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private static transformCustomerData(data: any): Customer {
    return {
      id: data.id,
      customerNumber: data.customer_number,
      name: data.name,
      companyName: data.company_name,
      type: data.type,
      email: data.email,
      phone: data.phone,
      website: data.website,
      taxId: data.tax_id,
      address: {
        billing: data.billing_address,
        shipping: data.shipping_address
      },
      contactPerson: data.contact_person,
      creditLimit: data.credit_limit || 0,
      creditUsed: data.credit_used || 0,
      paymentTerms: data.payment_terms,
      status: data.status,
      salesRep: data.sales_rep,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastOrderDate: data.last_order_date,
      totalOrders: data.total_orders || 0,
      totalSalesValue: data.total_sales_value || 0
    };
  }
}
