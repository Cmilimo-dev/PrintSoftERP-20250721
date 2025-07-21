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
}

export interface Vendor {
  id?: string;
  vendorNumber?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  expectedDelivery: string;
  phone?: string;
  email?: string;
  taxId?: string;
  capabilities?: string[];
  preferredCurrency?: string;
  paymentTerms?: string;
  leadTime?: number;
  createdDate?: string;
}

export interface TaxSettings {
  type: 'inclusive' | 'exclusive' | 'per_item' | 'overall';
  defaultRate: number;
  customRates?: { [key: string]: number };
}

export interface BaseDocument {
  id: string;
  documentNumber: string;
  date: string;
  company: Company;
  items: LineItem[];
  total: number;
  currency: string;
  taxSettings: TaxSettings;
  subtotal: number;
  taxAmount: number;
  qrCodeData?: string;
  notes?: string;
  terms?: string;
  signature?: {
    enabled: boolean;
    signatureId?: string;
    documentType?: string;
  };
}

export interface PurchaseOrder extends BaseDocument {
  vendor: Vendor;
  status?: 'draft' | 'approved' | 'authorized' | 'pending';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
}

export interface Invoice extends BaseDocument {
  customer: Customer;
  dueDate: string;
  invoiceDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  paymentTerms?: string;
  paymentMethod?: string;
}

export interface Quote extends BaseDocument {
  customer: Customer;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  paymentTerms?: string;
  validityPeriod?: string;
}

export interface SalesOrder extends BaseDocument {
  customer: Customer;
  expectedDelivery: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  paymentTerms?: string;
  paymentStatus?: 'pending' | 'paid' | 'overdue';
}

export interface PaymentReceipt extends BaseDocument {
  customer?: Customer;
  vendor?: Vendor;
  paymentMethod: string;
  reference: string;
  amountPaid: number;
  invoiceTotal?: number;
  receiptType: 'customer' | 'vendor';
  relatedInvoice?: string;
  status: 'draft' | 'confirmed' | 'processed';
}

export interface DeliveryNote extends BaseDocument {
  customer: Customer;
  deliveryDate: string;
  carrier?: string;
  trackingNumber?: string;
  deliveryAddress: string;
  receivedBy?: string;
  deliveredBy?: string;
  relatedOrder?: string;
}

export interface GoodsReceivingVoucher extends BaseDocument {
  vendor: Vendor;
  purchaseOrderId?: string;
  receivedDate: string;
  grvNumber: string;
  status: 'pending' | 'approved' | 'completed';
  receivedBy?: string;
  qualityCheck?: 'passed' | 'failed' | 'pending';
  storageLocation?: string;
}

export interface FinancialReport extends Omit<BaseDocument, 'items' | 'subtotal' | 'taxAmount'> {
  reportType: 'monthly' | 'quarterly' | 'yearly';
  periodStart: string;
  periodEnd: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashFlow: number;
  transactions: Array<{
    date: string;
    description: string;
    type: 'credit' | 'debit';
    amount: number;
  }>;
  budgetAnalysis: Array<{
    category: string;
    budgeted: number;
    actual: number;
    variance: number;
  }>;
}

// Credit Note interface
export interface CreditNote extends BaseDocument {
  customer: Customer;
  originalInvoice: string;
  creditDate: string;
  reason: string;
  refundMethod?: 'cash' | 'credit' | 'bank-transfer';
  status: 'draft' | 'issued' | 'applied';
  creditType: 'full' | 'partial';
}

// Payment interface
export interface Payment extends BaseDocument {
  customer?: Customer;
  vendor?: Vendor;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank-transfer' | 'check' | 'card' | 'mobile-money';
  reference: string;
  amountPaid: number;
  paymentType: 'customer-payment' | 'vendor-payment';
  relatedDocuments?: string[];
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    routingNumber?: string;
  };
  status: 'pending' | 'confirmed' | 'failed';
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
  documentType: DocumentType;
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

// System Settings
export interface SystemSettings {
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
    vendors: {
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
}

// Customer Return interface
export interface CustomerReturn extends BaseDocument {
  customer: Customer;
  originalOrder?: string;
  returnDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  refundMethod?: 'cash' | 'credit' | 'replacement' | 'store-credit';
  returnType: 'defective' | 'unwanted' | 'damaged' | 'wrong-item' | 'other';
  inspectionNotes?: string;
  refundAmount?: number;
}

// Goods Return interface (for returning goods to vendors)
export interface GoodsReturn extends BaseDocument {
  vendor: Vendor;
  originalPurchaseOrder?: string;
  returnDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  returnType: 'defective' | 'overstock' | 'damaged' | 'wrong-item' | 'quality-issue';
  inspectionNotes?: string;
  creditExpected?: boolean;
  replacementRequested?: boolean;
}

export type DocumentType = 'purchase-order' | 'invoice' | 'quote' | 'sales-order' | 'payment-receipt' | 'delivery-note' | 'financial-report' | 'goods-receiving-voucher' | 'credit-note' | 'payment' | 'customer-return' | 'goods-return' | 'vendor';
