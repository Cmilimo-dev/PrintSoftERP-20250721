// Customer Module Independent Types
export type Currency = 'KES' | 'USD' | 'EUR' | 'GBP';

export type CustomerType = 'individual' | 'company';

export type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'prospect';

export type CommunicationPreference = 'email' | 'phone' | 'sms' | 'mail' | 'whatsapp';

export type PaymentTerms = 'immediate' | 'net_7' | 'net_15' | 'net_30' | 'net_60' | 'net_90' | 'custom';

export type CreditRating = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';

// Base Address Interface
export interface Address {
  id?: string;
  type: 'billing' | 'shipping' | 'primary' | 'secondary';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

// Contact Information
export interface ContactInfo {
  id?: string;
  type: 'primary' | 'secondary' | 'emergency';
  name: string;
  title?: string;
  phone?: string;
  email?: string;
  mobile?: string;
  isDefault?: boolean;
}

// Customer Credit Information
export interface CreditInfo {
  creditLimit: number;
  availableCredit: number;
  currentBalance: number;
  creditRating: CreditRating;
  paymentTerms: PaymentTerms;
  customPaymentTerms?: number; // days
  lastCreditCheck?: string;
  creditNotes?: string;
}

// Customer Preferences
export interface CustomerPreferences {
  preferredCurrency: Currency;
  communicationPreferences: CommunicationPreference[];
  language: string;
  timezone: string;
  invoiceDeliveryMethod: 'email' | 'mail' | 'pickup' | 'portal';
  statementFrequency: 'monthly' | 'quarterly' | 'annually' | 'on_request';
  marketingOptIn: boolean;
}

// Customer Statistics
export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  firstOrderDate?: string;
  daysSinceLastOrder?: number;
  lifetimeValue: number;
  paymentHistory: {
    onTimePayments: number;
    latePayments: number;
    averageDaysToPayment: number;
  };
}

// Customer Tags and Categories
export interface CustomerTag {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

export interface CustomerCategory {
  id: string;
  name: string;
  description?: string;
  discountPercentage?: number;
  parentCategoryId?: string;
}

// Base Customer Interface
export interface BaseCustomer {
  id: string;
  customerNumber: string;
  customerType: CustomerType;
  status: CustomerStatus;
  
  // Basic Information
  firstName?: string;
  lastName?: string;
  companyName?: string;
  displayName: string; // Computed field
  
  // Contact Information
  primaryEmail?: string;
  primaryPhone?: string;
  website?: string;
  
  // Financial Information
  creditInfo: CreditInfo;
  
  // Addresses and Contacts
  addresses: Address[];
  contacts: ContactInfo[];
  
  // Preferences and Settings
  preferences: CustomerPreferences;
  
  // Categories and Tags
  categoryId?: string;
  tags: CustomerTag[];
  
  // Tax and Legal
  taxNumber?: string;
  vatNumber?: string;
  registrationNumber?: string;
  
  // Notes and Internal Information
  notes?: string;
  internalNotes?: string;
  
  // Statistics
  stats: CustomerStats;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  
  // Custom Fields
  customFields?: { [key: string]: any };
}

// Individual Customer
export interface IndividualCustomer extends BaseCustomer {
  customerType: 'individual';
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  occupation?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'other';
}

// Company Customer
export interface CompanyCustomer extends BaseCustomer {
  customerType: 'company';
  companyName: string;
  industry?: string;
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  establishedYear?: number;
  parentCompanyId?: string;
  subsidiaries?: string[];
}

// Union type for all customers
export type Customer = IndividualCustomer | CompanyCustomer;

// Customer Search and Filter Types
export interface CustomerSearchCriteria {
  query?: string;
  customerType?: CustomerType;
  status?: CustomerStatus;
  categoryId?: string;
  tags?: string[];
  city?: string;
  state?: string;
  country?: string;
  creditRating?: CreditRating;
  createdAfter?: string;
  createdBefore?: string;
  lastOrderAfter?: string;
  lastOrderBefore?: string;
  minLifetimeValue?: number;
  maxLifetimeValue?: number;
}

// Customer Analytics Types
export interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  topCustomersByValue: Array<{
    customer: Customer;
    totalValue: number;
    orderCount: number;
  }>;
  customersByRegion: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
  customersByCategory: Array<{
    category: CustomerCategory;
    count: number;
    percentage: number;
  }>;
  averageCustomerLifetimeValue: number;
  customerRetentionRate: number;
  customerAcquisitionCost?: number;
}

// Customer Communication Types
export interface CustomerCommunication {
  id: string;
  customerId: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'sms' | 'whatsapp';
  subject: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'replied';
  createdAt: string;
  createdBy: string;
  scheduledFor?: string;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
}

// Customer Document Types
export interface CustomerDocument {
  id: string;
  customerId: string;
  type: 'contract' | 'agreement' | 'identity' | 'tax_certificate' | 'business_license' | 'other';
  name: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  expiryDate?: string;
  isPublic: boolean;
  tags?: string[];
}

// Customer Activity Log
export interface CustomerActivity {
  id: string;
  customerId: string;
  type: 'created' | 'updated' | 'order_placed' | 'payment_received' | 'communication' | 'document_uploaded' | 'status_changed';
  description: string;
  metadata?: { [key: string]: any };
  performedBy: string;
  performedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

// Customer Import/Export Types
export interface CustomerImportData {
  customerType: CustomerType;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  taxNumber?: string;
  creditLimit?: number;
  paymentTerms?: PaymentTerms;
  notes?: string;
  categoryName?: string;
  tags?: string;
  customFields?: { [key: string]: any };
}

export interface CustomerExportData extends Customer {
  categoryName?: string;
  tagNames: string[];
  primaryAddress?: Address;
  primaryContact?: ContactInfo;
}

// Customer Relationship Types
export interface CustomerRelationship {
  id: string;
  customerId: string;
  relatedCustomerId: string;
  relationshipType: 'parent' | 'subsidiary' | 'partner' | 'referrer' | 'referred_by' | 'competitor' | 'supplier' | 'other';
  description?: string;
  establishedDate: string;
  status: 'active' | 'inactive' | 'ended';
  createdAt: string;
  updatedAt: string;
}

// Customer Segmentation
export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: CustomerSearchCriteria;
  color?: string;
  isActive: boolean;
  customerCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Customer Loyalty Program
export interface CustomerLoyalty {
  id: string;
  customerId: string;
  programId: string;
  programName: string;
  tier: string;
  points: number;
  lifetimePoints: number;
  joinedAt: string;
  lastActivityAt: string;
  benefits: Array<{
    type: string;
    description: string;
    value: number;
  }>;
  expiryDate?: string;
}

// Customer Support Ticket
export interface CustomerSupportTicket {
  id: string;
  customerId: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: 'billing' | 'technical' | 'product' | 'complaint' | 'feature_request' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  satisfaction?: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
}

// System Settings for Customer Module
export interface CustomerModuleSettings {
  defaultCurrency: Currency;
  defaultPaymentTerms: PaymentTerms;
  defaultCreditLimit: number;
  requireApprovalForCreditIncrease: boolean;
  autoGenerateCustomerNumbers: boolean;
  customerNumberFormat: string;
  enableCustomerPortal: boolean;
  enableLoyaltyProgram: boolean;
  enableCustomerSegmentation: boolean;
  allowSelfRegistration: boolean;
  requireEmailVerification: boolean;
  duplicateDetection: {
    enabled: boolean;
    checkFields: Array<'email' | 'phone' | 'taxNumber' | 'companyName'>;
    threshold: number;
  };
  dataRetention: {
    inactiveCustomerPeriod: number; // months
    deleteAfterPeriod: number; // months
    archiveInsteadOfDelete: boolean;
  };
  notifications: {
    newCustomerRegistration: boolean;
    customerStatusChange: boolean;
    creditLimitExceeded: boolean;
    paymentOverdue: boolean;
  };
}

// Customer Report Types
export interface CustomerReport {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'aging' | 'activity' | 'analytics' | 'custom';
  parameters: {
    dateRange?: {
      start: string;
      end: string;
    };
    customerIds?: string[];
    categories?: string[];
    segments?: string[];
    includeInactive?: boolean;
    groupBy?: 'none' | 'category' | 'region' | 'segment' | 'status';
    metrics?: string[];
  };
  format: 'pdf' | 'excel' | 'csv' | 'json';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    recipients: string[];
  };
  createdAt: string;
  createdBy: string;
  lastRunAt?: string;
  nextRunAt?: string;
}
