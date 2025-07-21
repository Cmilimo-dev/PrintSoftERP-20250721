import { Customer, IndividualCustomer, CompanyCustomer, Address, ContactInfo, CustomerStats, CreditInfo, Currency, PaymentTerms, CustomerType, CustomerAnalytics } from '../types/customerTypes';

/**
 * Customer Display and Formatting Utilities
 */

/**
 * Get customer display name
 */
export function getCustomerDisplayName(customer: Customer): string {
  if (customer.customerType === 'company') {
    return (customer as CompanyCustomer).companyName;
  } else {
    const individual = customer as IndividualCustomer;
    return `${individual.firstName} ${individual.lastName}`.trim();
  }
}

/**
 * Get customer short name (for limited space displays)
 */
export function getCustomerShortName(customer: Customer, maxLength: number = 20): string {
  const fullName = getCustomerDisplayName(customer);
  if (fullName.length <= maxLength) {
    return fullName;
  }
  
  if (customer.customerType === 'company') {
    // For companies, try to abbreviate
    const words = fullName.split(' ');
    if (words.length > 1) {
      return words.map(word => word.charAt(0).toUpperCase()).join('.') + '.';
    }
    return fullName.substring(0, maxLength - 3) + '...';
  } else {
    // For individuals, show first name + last initial
    const individual = customer as IndividualCustomer;
    const firstInitial = individual.firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = individual.lastName?.charAt(0)?.toUpperCase() || '';
    return `${individual.firstName} ${lastInitial}.`;
  }
}

/**
 * Format customer address for display
 */
export function formatAddress(address: Address, format: 'single-line' | 'multi-line' = 'multi-line'): string {
  if (!address) return '';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country
  ].filter(Boolean);
  
  if (format === 'single-line') {
    return parts.join(', ');
  }
  
  return parts.join('\n');
}

/**
 * Get primary address
 */
export function getPrimaryAddress(customer: Customer): Address | null {
  const primaryAddress = customer.addresses.find(addr => addr.isDefault);
  return primaryAddress || customer.addresses[0] || null;
}

/**
 * Get billing address
 */
export function getBillingAddress(customer: Customer): Address | null {
  const billingAddress = customer.addresses.find(addr => addr.type === 'billing');
  return billingAddress || getPrimaryAddress(customer);
}

/**
 * Get shipping address
 */
export function getShippingAddress(customer: Customer): Address | null {
  const shippingAddress = customer.addresses.find(addr => addr.type === 'shipping');
  return shippingAddress || getPrimaryAddress(customer);
}

/**
 * Get primary contact
 */
export function getPrimaryContact(customer: Customer): ContactInfo | null {
  const primaryContact = customer.contacts.find(contact => contact.isDefault);
  return primaryContact || customer.contacts[0] || null;
}

/**
 * Customer Validation Utilities
 */

/**
 * Validate customer data
 */
export function validateCustomer(customer: Customer): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!customer.customerNumber) {
    errors.push('Customer number is required');
  }

  if (customer.customerType === 'individual') {
    const individual = customer as IndividualCustomer;
    if (!individual.firstName) {
      errors.push('First name is required for individual customers');
    }
    if (!individual.lastName) {
      errors.push('Last name is required for individual customers');
    }
  } else if (customer.customerType === 'company') {
    const company = customer as CompanyCustomer;
    if (!company.companyName) {
      errors.push('Company name is required for company customers');
    }
  }

  // Email validation
  if (customer.primaryEmail && !isValidEmail(customer.primaryEmail)) {
    errors.push('Invalid email format');
  }

  // Phone validation
  if (customer.primaryPhone && !isValidPhone(customer.primaryPhone)) {
    warnings.push('Phone number format may be invalid');
  }

  // Address validation
  customer.addresses.forEach((address, index) => {
    if (!address.street) {
      warnings.push(`Address ${index + 1}: Street is missing`);
    }
    if (!address.city) {
      warnings.push(`Address ${index + 1}: City is missing`);
    }
    if (!address.country) {
      warnings.push(`Address ${index + 1}: Country is missing`);
    }
  });

  // Credit info validation
  if (customer.creditInfo.creditLimit < 0) {
    errors.push('Credit limit cannot be negative');
  }

  if (customer.creditInfo.currentBalance > customer.creditInfo.creditLimit) {
    warnings.push('Current balance exceeds credit limit');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  // Basic phone validation - can be enhanced based on requirements
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(cleanPhone);
}

/**
 * Customer Financial Utilities
 */

/**
 * Calculate available credit
 */
export function calculateAvailableCredit(customer: Customer): number {
  return Math.max(0, customer.creditInfo.creditLimit - customer.creditInfo.currentBalance);
}

/**
 * Check if customer is over credit limit
 */
export function isOverCreditLimit(customer: Customer): boolean {
  return customer.creditInfo.currentBalance > customer.creditInfo.creditLimit;
}

/**
 * Calculate credit utilization percentage
 */
export function calculateCreditUtilization(customer: Customer): number {
  if (customer.creditInfo.creditLimit === 0) return 0;
  return (customer.creditInfo.currentBalance / customer.creditInfo.creditLimit) * 100;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: Currency = 'KES', showSymbol: boolean = true): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    amount = 0;
  }

  const currencySymbols: { [key in Currency]: string } = {
    'KES': 'KSh',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };

  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (showSymbol) {
    const symbol = currencySymbols[currency] || currency;
    return `${symbol} ${formatted}`;
  }

  return formatted;
}

/**
 * Convert payment terms to days
 */
export function paymentTermsToDays(paymentTerms: PaymentTerms, customDays?: number): number {
  switch (paymentTerms) {
    case 'immediate': return 0;
    case 'net_7': return 7;
    case 'net_15': return 15;
    case 'net_30': return 30;
    case 'net_60': return 60;
    case 'net_90': return 90;
    case 'custom': return customDays || 30;
    default: return 30;
  }
}

/**
 * Customer Statistics Utilities
 */

/**
 * Calculate customer lifetime value
 */
export function calculateLifetimeValue(customer: Customer): number {
  return customer.stats.lifetimeValue;
}

/**
 * Calculate average order value
 */
export function calculateAverageOrderValue(customer: Customer): number {
  if (customer.stats.totalOrders === 0) return 0;
  return customer.stats.totalSpent / customer.stats.totalOrders;
}

/**
 * Calculate days since last order
 */
export function calculateDaysSinceLastOrder(customer: Customer): number {
  if (!customer.stats.lastOrderDate) return -1;
  
  const lastOrder = new Date(customer.stats.lastOrderDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastOrder.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get customer status based on activity
 */
export function getCustomerActivityStatus(customer: Customer): 'new' | 'active' | 'inactive' | 'at_risk' {
  const daysSinceLastOrder = calculateDaysSinceLastOrder(customer);
  
  if (customer.stats.totalOrders === 0) {
    return 'new';
  }
  
  if (daysSinceLastOrder <= 30) {
    return 'active';
  } else if (daysSinceLastOrder <= 90) {
    return 'at_risk';
  } else {
    return 'inactive';
  }
}

/**
 * Customer Segmentation Utilities
 */

/**
 * Segment customer by value
 */
export function segmentByValue(customer: Customer): 'high_value' | 'medium_value' | 'low_value' {
  const lifetimeValue = customer.stats.lifetimeValue;
  
  if (lifetimeValue >= 50000) {
    return 'high_value';
  } else if (lifetimeValue >= 10000) {
    return 'medium_value';
  } else {
    return 'low_value';
  }
}

/**
 * Segment customer by frequency
 */
export function segmentByFrequency(customer: Customer): 'frequent' | 'occasional' | 'rare' {
  const totalOrders = customer.stats.totalOrders;
  const daysSinceFirst = customer.stats.firstOrderDate 
    ? Math.ceil((new Date().getTime() - new Date(customer.stats.firstOrderDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  if (daysSinceFirst === 0) return 'rare';
  
  const ordersPerMonth = (totalOrders / daysSinceFirst) * 30;
  
  if (ordersPerMonth >= 2) {
    return 'frequent';
  } else if (ordersPerMonth >= 0.5) {
    return 'occasional';
  } else {
    return 'rare';
  }
}

/**
 * Customer Search and Filter Utilities
 */

/**
 * Create customer search index
 */
export function createSearchIndex(customer: Customer): string[] {
  const searchTerms = [
    customer.customerNumber,
    getCustomerDisplayName(customer),
    customer.primaryEmail,
    customer.primaryPhone,
    customer.taxNumber,
    customer.vatNumber
  ].filter(Boolean) as string[];

  // Add address terms
  customer.addresses.forEach(address => {
    searchTerms.push(address.city, address.state, address.country);
  });

  // Add contact terms
  customer.contacts.forEach(contact => {
    searchTerms.push(contact.name, contact.email, contact.phone);
  });

  // Add tag names
  customer.tags.forEach(tag => {
    searchTerms.push(tag.name);
  });

  return searchTerms.map(term => term.toLowerCase()).filter(Boolean);
}

/**
 * Check if customer matches search query
 */
export function matchesSearchQuery(customer: Customer, query: string): boolean {
  if (!query) return true;
  
  const searchIndex = createSearchIndex(customer);
  const queryTerms = query.toLowerCase().split(' ').filter(Boolean);
  
  return queryTerms.every(term => 
    searchIndex.some(indexTerm => indexTerm.includes(term))
  );
}

/**
 * Data Export Utilities
 */

/**
 * Prepare customer for export
 */
export function prepareCustomerForExport(customer: Customer): any {
  const primaryAddress = getPrimaryAddress(customer);
  const primaryContact = getPrimaryContact(customer);
  
  return {
    customerNumber: customer.customerNumber,
    customerType: customer.customerType,
    displayName: getCustomerDisplayName(customer),
    firstName: customer.customerType === 'individual' ? (customer as IndividualCustomer).firstName : '',
    lastName: customer.customerType === 'individual' ? (customer as IndividualCustomer).lastName : '',
    companyName: customer.customerType === 'company' ? (customer as CompanyCustomer).companyName : '',
    email: customer.primaryEmail || '',
    phone: customer.primaryPhone || '',
    website: customer.website || '',
    street: primaryAddress?.street || '',
    city: primaryAddress?.city || '',
    state: primaryAddress?.state || '',
    postalCode: primaryAddress?.postalCode || '',
    country: primaryAddress?.country || '',
    taxNumber: customer.taxNumber || '',
    vatNumber: customer.vatNumber || '',
    creditLimit: customer.creditInfo.creditLimit,
    currentBalance: customer.creditInfo.currentBalance,
    paymentTerms: customer.creditInfo.paymentTerms,
    status: customer.status,
    totalOrders: customer.stats.totalOrders,
    totalSpent: customer.stats.totalSpent,
    lifetimeValue: customer.stats.lifetimeValue,
    lastOrderDate: customer.stats.lastOrderDate || '',
    createdAt: customer.createdAt,
    tags: customer.tags.map(tag => tag.name).join(', '),
    notes: customer.notes || ''
  };
}

/**
 * Import customer data validation
 */
export function validateImportData(data: any): {
  isValid: boolean;
  errors: string[];
  customer?: Customer;
} {
  const errors: string[] = [];

  // Required fields validation
  if (!data.customerType || !['individual', 'company'].includes(data.customerType)) {
    errors.push('Valid customer type is required (individual or company)');
  }

  if (data.customerType === 'individual') {
    if (!data.firstName) errors.push('First name is required for individual customers');
    if (!data.lastName) errors.push('Last name is required for individual customers');
  }

  if (data.customerType === 'company') {
    if (!data.companyName) errors.push('Company name is required for company customers');
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Create customer object from import data
  const customer: Customer = {
    id: generateId(),
    customerNumber: data.customerNumber || '',
    customerType: data.customerType,
    status: data.status || 'active',
    displayName: data.customerType === 'individual' 
      ? `${data.firstName} ${data.lastName}`.trim()
      : data.companyName,
    primaryEmail: data.email || undefined,
    primaryPhone: data.phone || undefined,
    website: data.website || undefined,
    creditInfo: {
      creditLimit: parseFloat(data.creditLimit) || 0,
      availableCredit: parseFloat(data.creditLimit) || 0,
      currentBalance: parseFloat(data.currentBalance) || 0,
      creditRating: 'unknown',
      paymentTerms: data.paymentTerms || 'net_30'
    },
    addresses: data.street ? [{
      id: generateId(),
      type: 'primary',
      street: data.street,
      city: data.city || '',
      state: data.state || '',
      postalCode: data.postalCode || '',
      country: data.country || '',
      isDefault: true
    }] : [],
    contacts: [],
    preferences: {
      preferredCurrency: 'KES',
      communicationPreferences: ['email'],
      language: 'en',
      timezone: 'Africa/Nairobi',
      invoiceDeliveryMethod: 'email',
      statementFrequency: 'monthly',
      marketingOptIn: false
    },
    tags: [],
    taxNumber: data.taxNumber || undefined,
    vatNumber: data.vatNumber || undefined,
    notes: data.notes || undefined,
    stats: {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      lifetimeValue: 0,
      paymentHistory: {
        onTimePayments: 0,
        latePayments: 0,
        averageDaysToPayment: 0
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as Customer;

  // Add specific fields based on customer type
  if (data.customerType === 'individual') {
    (customer as IndividualCustomer).firstName = data.firstName;
    (customer as IndividualCustomer).lastName = data.lastName;
  } else {
    (customer as CompanyCustomer).companyName = data.companyName;
  }

  return { isValid: true, errors: [], customer };
}

/**
 * Utility Functions
 */

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone customer object
 */
export function cloneCustomer(customer: Customer): Customer {
  return JSON.parse(JSON.stringify(customer));
}

/**
 * Merge customer data (for updates)
 */
export function mergeCustomerData(existing: Customer, updates: Partial<Customer>): Customer {
  const merged = { ...existing, ...updates };
  merged.updatedAt = new Date().toISOString();
  
  // Ensure required fields are not overwritten with undefined
  if (!merged.customerNumber) merged.customerNumber = existing.customerNumber;
  if (!merged.customerType) merged.customerType = existing.customerType;
  if (!merged.displayName) merged.displayName = existing.displayName;
  
  return merged;
}

/**
 * Calculate customer score (for ranking/prioritization)
 */
export function calculateCustomerScore(customer: Customer): number {
  let score = 0;
  
  // Value component (40% of score)
  const valueScore = Math.min(customer.stats.lifetimeValue / 100000, 1) * 40;
  
  // Frequency component (30% of score)
  const frequencyScore = Math.min(customer.stats.totalOrders / 50, 1) * 30;
  
  // Recency component (20% of score)
  const daysSinceLastOrder = calculateDaysSinceLastOrder(customer);
  const recencyScore = daysSinceLastOrder > 0 ? Math.max(0, (365 - daysSinceLastOrder) / 365) * 20 : 0;
  
  // Payment behavior component (10% of score)
  const paymentScore = customer.stats.paymentHistory.onTimePayments > 0
    ? (customer.stats.paymentHistory.onTimePayments / 
       (customer.stats.paymentHistory.onTimePayments + customer.stats.paymentHistory.latePayments)) * 10
    : 5; // Neutral score for new customers
  
  score = valueScore + frequencyScore + recencyScore + paymentScore;
  
  return Math.round(score * 100) / 100; // Round to 2 decimal places
}
