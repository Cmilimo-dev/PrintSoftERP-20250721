// Clean ERP types without business document dependencies

export interface ERPLineItem {
  id?: string;
  itemCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
  taxAmount?: number;
  unit?: string;
  category?: string;
}

export interface ERPCustomer {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  postal_code?: string;
  country?: string;
  customer_number?: string;
  customerNumber?: string;
  credit_limit?: number;
  creditLimit?: number;
  payment_terms?: number | string;
  paymentTerms?: string;
  preferred_currency?: string;
  customer_type?: 'individual' | 'company';
  company_name?: string;
  first_name?: string;
  last_name?: string;
  tax_number?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ERPVendor {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  vendorNumber?: string;
  paymentTerms?: string;
}

export interface ERPCompany {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  taxId: string;
  website?: string;
  logo?: string;
}

export interface ERPDocument {
  id: string;
  documentNumber: string;
  date: string;
  total: number;
  currency: string;
  status?: string;
  customer?: ERPCustomer;
  vendor?: ERPVendor;
  items: ERPLineItem[];
  subtotal: number;
  taxAmount: number;
  company: ERPCompany;
  taxSettings: {
    type: 'inclusive' | 'exclusive';
    defaultRate: number;
  };
  notes?: string;
  dueDate?: string;
  validUntil?: string;
  paymentTerms?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ERPDocumentType = 
  | 'sales-order' 
  | 'quotation' 
  | 'invoice' 
  | 'delivery-note' 
  | 'purchase-order'
  | 'payment-receipt';

export interface ERPDocumentStats {
  title: string;
  value: number | string;
  icon: any;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// Inventory types
export interface ERPInventoryItem {
  id: string;
  itemCode: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  sellPrice: number;
  location?: string;
  supplier?: string;
  lastRestocked?: string;
}

export interface ERPStockMovement {
  id: string;
  itemCode: string;
  movementType: 'in' | 'out' | 'adjustment';
  quantity: number;
  referenceDocument?: string;
  reason?: string;
  date: string;
  userId?: string;
}

// Financial types
export interface ERPAccount {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parentAccount?: string;
  balance: number;
  isActive: boolean;
}

export interface ERPTransaction {
  id: string;
  date: string;
  reference: string;
  description: string;
  amount: number;
  accountId: string;
  debitCredit: 'debit' | 'credit';
  status: 'pending' | 'approved' | 'rejected';
}

// Analytics types
export interface ERPMetric {
  name: string;
  value: number;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  period: string;
}

export interface ERPChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}

// Form data interfaces
export interface ERPFormData {
  customer?: ERPCustomer;
  vendor?: ERPVendor;
  items: ERPLineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  paymentTerms?: string;
  dueDate?: string;
  validUntil?: string;
}

// Export interfaces
export interface ERPExportOptions {
  format: 'pdf' | 'csv' | 'excel' | 'mht';
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ERPListExportData {
  headers: string[];
  rows: any[][];
  title?: string;
  summary?: {
    totalRecords: number;
    totalValue?: number;
  };
}
