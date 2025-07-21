
export interface LineItem {
  itemCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
  taxAmount?: number;
}

export interface Company {
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
}

export interface Vendor {
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
}

export interface TaxSettings {
  type: 'inclusive' | 'exclusive' | 'per_item' | 'overall';
  defaultRate: number;
  customRates?: { [key: string]: number };
}

export interface CurrencySettings {
  primary: string;
  secondary?: string;
  exchangeRate?: number;
  displayBoth?: boolean;
}

export interface PurchaseOrder {
  id: string;
  documentNumber: string;
  date: string;
  company: Company;
  vendor: Vendor;
  items: LineItem[];
  total: number;
  currency: string;
  taxSettings: TaxSettings;
  subtotal: number;
  taxAmount: number;
  qrCodeData?: string;
  notes?: string;
  terms?: string;
}
