// Independent Purchasing Module Types
// Contains all types needed for purchasing without external dependencies

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

export interface BasePurchasingDocument {
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
}

export interface PurchaseOrder extends BasePurchasingDocument {
  vendor: Vendor;
  status?: 'draft' | 'approved' | 'authorized' | 'pending';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
}

export interface GoodsReceivingVoucher extends BasePurchasingDocument {
  vendor: Vendor;
  purchaseOrderId?: string;
  receivedDate: string;
  grvNumber: string;
  status: 'pending' | 'approved' | 'completed';
  receivedBy?: string;
  qualityCheck?: 'passed' | 'failed' | 'pending';
  storageLocation?: string;
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
  documentType: PurchasingDocumentType;
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

// System Settings for Purchasing
export interface PurchasingSystemSettings {
  company: Company;
  companyDisplay: CompanyDisplaySettings;
  documentSettings: DocumentSettings[];
  etimsSettings: EtimsSettings;
  currency: string;
  taxSettings: TaxSettings;
  autoNumbering: {
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

export type PurchasingDocumentType = 'purchase-order' | 'goods-receiving-voucher';

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
}

// Advanced Purchasing Types (from purchaseOrderIntegrationService)
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

export interface AdvancedPurchaseOrder {
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
  purchaseOrder?: AdvancedPurchaseOrder;
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
