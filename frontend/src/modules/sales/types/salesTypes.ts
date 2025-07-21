// Independent Sales Module Types
// Contains all types needed for sales without external dependencies

export interface LineItem {
  id?: string;
  productId?: string;
  itemCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
  taxAmount?: number;
  unit?: string;
  discount?: number;
  discountAmount?: number;
}

export interface Company {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  taxId: string;
  logo?: string;
  website?: string;
  etimsPin?: string;
  registrationNumber?: string;
}

export interface Customer {
  id?: string;
  customerNumber?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  email?: string;
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  createdDate?: string;
  customerType?: 'individual' | 'company';
  companyName?: string;
  firstName?: string;
  lastName?: string;
  status?: 'active' | 'inactive';
  notes?: string;
}

export interface TaxSettings {
  type: 'inclusive' | 'exclusive' | 'per_item' | 'overall';
  defaultRate: number;
  customRates?: { [key: string]: number };
}

export interface BaseSalesDocument {
  id: string;
  documentNumber: string;
  date: string;
  company: Company;
  customer: Customer;
  items: LineItem[];
  total: number;
  currency: string;
  taxSettings: TaxSettings;
  subtotal: number;
  taxAmount: number;
  qrCodeData?: string;
  notes?: string;
  terms?: string;
  paymentTerms?: string;
  validUntil?: string;
  dueDate?: string;
}

export interface Quote extends BaseSalesDocument {
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validityPeriod?: string;
  quoteNumber?: string;
  expirationDate?: string;
}

export interface SalesOrder extends BaseSalesDocument {
  expectedDelivery: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'overdue';
  orderNumber?: string;
  shippingAddress?: string;
  deliveryMethod?: string;
  trackingNumber?: string;
}

export interface Invoice extends BaseSalesDocument {
  dueDate: string;
  invoiceDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  invoiceNumber?: string;
  amountPaid?: number;
  amountDue?: number;
  lateFee?: number;
}

export interface DeliveryNote extends BaseSalesDocument {
  deliveryDate: string;
  carrier?: string;
  trackingNumber?: string;
  deliveryAddress: string;
  receivedBy?: string;
  deliveredBy?: string;
  relatedOrder?: string;
  deliveryMethod?: string;
  deliveryInstructions?: string;
}

export interface CreditNote extends BaseSalesDocument {
  originalInvoice: string;
  creditDate: string;
  reason: string;
  refundMethod?: 'cash' | 'credit' | 'bank-transfer';
  status: 'draft' | 'issued' | 'applied';
  creditType: 'full' | 'partial';
  creditAmount: number;
}

export interface Payment extends BaseSalesDocument {
  paymentDate: string;
  paymentMethod: 'cash' | 'bank-transfer' | 'check' | 'card' | 'mobile-money';
  reference: string;
  amountPaid: number;
  paymentType: 'customer-payment';
  relatedDocuments?: string[];
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    routingNumber?: string;
  };
  status: 'pending' | 'confirmed' | 'failed';
}

// Advanced Sales Types

export interface SalesLead {
  id: string;
  leadNumber: string;
  companyName?: string;
  contactName: string;
  email?: string;
  phone?: string;
  address?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high';
  estimatedValue?: number;
  expectedCloseDate?: string;
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOpportunity {
  id: string;
  opportunityNumber: string;
  title: string;
  description?: string;
  customer: Customer;
  estimatedValue: number;
  probability: number; // 0-100
  stage: 'prospect' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  expectedCloseDate: string;
  actualCloseDate?: string;
  source: string;
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  competitors?: string[];
  salesRep: {
    id: string;
    name: string;
    email: string;
  };
  activities: Array<{
    id: string;
    type: 'call' | 'email' | 'meeting' | 'demo' | 'proposal';
    date: string;
    description: string;
    outcome?: string;
  }>;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesTarget {
  id: string;
  salesRepId: string;
  salesRepName: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  targetAmount: number;
  actualAmount: number;
  targetUnits?: number;
  actualUnits?: number;
  currency: string;
  status: 'active' | 'completed' | 'missed';
  createdAt: string;
  updatedAt: string;
}

export interface Commission {
  id: string;
  salesRepId: string;
  salesRepName: string;
  documentId: string;
  documentType: 'invoice' | 'sales-order';
  documentNumber: string;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  calculationDate: string;
  paymentDate?: string;
  status: 'calculated' | 'approved' | 'paid';
  notes?: string;
}

// Company Display Settings
export interface CompanyDisplaySettings {
  logoPosition: 'only-logo' | 'left-logo-with-name' | 'top-logo-with-name' | 'no-logo';
  showCompanyName: boolean;
  showAddress: boolean;
  showContactInfo: boolean;
  showRegistrationDetails: boolean;
  customLogoSize?: {
    width: number;
    height: number;
  };
}

// Document Settings
export interface DocumentSettings {
  documentType: SalesDocumentType;
  prefix: string;
  nextNumber: number;
  numberLength: number;
  resetPeriod: 'never' | 'yearly' | 'monthly';
  format: string; // e.g., "{prefix}-{year}-{number:0000}"
  enabled: boolean;
}

// eTIMS Integration Settings
export interface EtimsSettings {
  enabled: boolean;
  pin: string;
  apiUrl: string;
  environment: 'sandbox' | 'production';
  autoSubmit: boolean;
  certificatePath?: string;
}

// System Settings for Sales
export interface SalesSystemSettings {
  company: Company;
  companyDisplay: CompanyDisplaySettings;
  documentSettings: DocumentSettings[];
  etimsSettings: EtimsSettings;
  currency: string;
  taxSettings: TaxSettings;
  autoNumbering: {
    customers: {
      enabled: boolean;
      prefix: string;
      nextNumber: number;
      format: string;
    };
    items: {
      enabled: boolean;
      prefix: string;
      nextNumber: number;
      format: string;
    };
  };
  commissionSettings: {
    enabled: boolean;
    defaultRate: number;
    calculationMethod: 'gross' | 'net';
    paymentSchedule: 'immediate' | 'monthly' | 'quarterly';
  };
}

export type SalesDocumentType = 
  | 'quote' 
  | 'sales-order' 
  | 'invoice' 
  | 'delivery-note' 
  | 'credit-note' 
  | 'payment';

// Product interface for inventory integration
export interface Product {
  id: string;
  itemCode: string;
  description: string;
  unitPrice: number;
  stockQuantity?: number;
  category?: string;
  barcode?: string;
  taxRate?: number;
  unit?: string;
  cost?: number;
  margin?: number;
}

// Sales Analytics Types
export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomers: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
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
  conversionRates: {
    quoteToOrder: number;
    orderToInvoice: number;
    invoiceToPayment: number;
  };
}

export interface SalesReport {
  id: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  title: string;
  description?: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  metrics: SalesMetrics;
  generatedAt: string;
  generatedBy: string;
  currency: string;
}
