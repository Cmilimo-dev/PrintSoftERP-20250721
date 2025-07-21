import { LineItem, BaseSalesDocument, TaxSetting, Currency } from '../types/salesTypes';

/**
 * Calculate the total amount for a single line item
 */
export function calculateLineItemTotal(lineItem: LineItem): number {
  if (!lineItem || !lineItem.quantity || !lineItem.unitPrice) {
    return 0;
  }

  const baseAmount = lineItem.quantity * lineItem.unitPrice;
  const discountAmount = lineItem.discount || 0;
  const taxAmount = lineItem.tax || 0;

  // Apply discount
  const afterDiscount = baseAmount - (baseAmount * discountAmount / 100);
  
  // Apply tax
  const withTax = afterDiscount + (afterDiscount * taxAmount / 100);

  return Math.round(withTax * 100) / 100;
}

/**
 * Calculate subtotal (before tax and discount)
 */
export function calculateSubtotal(lineItems: LineItem[]): number {
  if (!Array.isArray(lineItems)) {
    return 0;
  }

  return lineItems.reduce((total, item) => {
    if (!item || !item.quantity || !item.unitPrice) {
      return total;
    }
    return total + (item.quantity * item.unitPrice);
  }, 0);
}

/**
 * Calculate total discount amount
 */
export function calculateTotalDiscount(lineItems: LineItem[]): number {
  if (!Array.isArray(lineItems)) {
    return 0;
  }

  return lineItems.reduce((total, item) => {
    if (!item || !item.quantity || !item.unitPrice || !item.discount) {
      return total;
    }
    const lineAmount = item.quantity * item.unitPrice;
    const discountAmount = lineAmount * (item.discount / 100);
    return total + discountAmount;
  }, 0);
}

/**
 * Calculate total tax amount
 */
export function calculateTotalTax(lineItems: LineItem[]): number {
  if (!Array.isArray(lineItems)) {
    return 0;
  }

  return lineItems.reduce((total, item) => {
    if (!item || !item.quantity || !item.unitPrice) {
      return total;
    }
    const lineAmount = item.quantity * item.unitPrice;
    const discountAmount = item.discount ? lineAmount * (item.discount / 100) : 0;
    const afterDiscount = lineAmount - discountAmount;
    const taxAmount = item.tax ? afterDiscount * (item.tax / 100) : 0;
    return total + taxAmount;
  }, 0);
}

/**
 * Calculate document total
 */
export function calculateDocumentTotal(lineItems: LineItem[], documentDiscount: number = 0): number {
  if (!Array.isArray(lineItems)) {
    return 0;
  }

  const lineItemsTotal = lineItems.reduce((total, item) => {
    return total + calculateLineItemTotal(item);
  }, 0);

  // Apply document-level discount if any
  const documentDiscountAmount = lineItemsTotal * (documentDiscount / 100);
  const finalTotal = lineItemsTotal - documentDiscountAmount;

  return Math.round(finalTotal * 100) / 100;
}

/**
 * Validate line item data
 */
export function validateLineItem(lineItem: LineItem): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!lineItem) {
    return { isValid: false, errors: ['Line item is required'] };
  }

  if (!lineItem.product?.name && !lineItem.description) {
    errors.push('Product name or description is required');
  }

  if (!lineItem.quantity || lineItem.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (!lineItem.unitPrice || lineItem.unitPrice < 0) {
    errors.push('Unit price must be greater than or equal to 0');
  }

  if (lineItem.discount && (lineItem.discount < 0 || lineItem.discount > 100)) {
    errors.push('Discount must be between 0 and 100');
  }

  if (lineItem.tax && (lineItem.tax < 0 || lineItem.tax > 100)) {
    errors.push('Tax must be between 0 and 100');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format currency with proper decimal places and symbol
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
 * Apply discount to amount
 */
export function applyDiscount(amount: number, discountPercentage: number): {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountPercentage: number;
} {
  const originalAmount = amount || 0;
  const discount = Math.max(0, Math.min(100, discountPercentage || 0));
  const discountAmount = originalAmount * (discount / 100);
  const finalAmount = originalAmount - discountAmount;

  return {
    originalAmount: Math.round(originalAmount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalAmount: Math.round(finalAmount * 100) / 100,
    discountPercentage: discount
  };
}

/**
 * Calculate document summary
 */
export function calculateDocumentSummary(lineItems: LineItem[], documentDiscount: number = 0): {
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  total: number;
  itemCount: number;
  averageItemPrice: number;
} {
  if (!Array.isArray(lineItems)) {
    return {
      subtotal: 0,
      totalDiscount: 0,
      totalTax: 0,
      total: 0,
      itemCount: 0,
      averageItemPrice: 0
    };
  }

  const subtotal = calculateSubtotal(lineItems);
  const totalDiscount = calculateTotalDiscount(lineItems);
  const totalTax = calculateTotalTax(lineItems);
  const total = calculateDocumentTotal(lineItems, documentDiscount);
  const itemCount = lineItems.length;
  const averageItemPrice = itemCount > 0 ? subtotal / itemCount : 0;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount,
    averageItemPrice: Math.round(averageItemPrice * 100) / 100
  };
}

/**
 * Convert currency (basic conversion - in real app, use exchange rates API)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRates?: { [key: string]: number }
): {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  exchangeRate: number;
} {
  // Basic exchange rates (in real app, fetch from API)
  const defaultRates: { [key: string]: number } = {
    'KES_USD': 0.0077,
    'KES_EUR': 0.0071,
    'KES_GBP': 0.0061,
    'USD_KES': 130.26,
    'USD_EUR': 0.92,
    'USD_GBP': 0.79,
    'EUR_KES': 141.55,
    'EUR_USD': 1.09,
    'EUR_GBP': 0.86,
    'GBP_KES': 164.75,
    'GBP_USD': 1.27,
    'GBP_EUR': 1.16
  };

  const rates = exchangeRates || defaultRates;

  if (fromCurrency === toCurrency) {
    return {
      originalAmount: amount,
      convertedAmount: amount,
      fromCurrency,
      toCurrency,
      exchangeRate: 1
    };
  }

  const rateKey = `${fromCurrency}_${toCurrency}`;
  const exchangeRate = rates[rateKey] || 1;
  const convertedAmount = amount * exchangeRate;

  return {
    originalAmount: Math.round(amount * 100) / 100,
    convertedAmount: Math.round(convertedAmount * 100) / 100,
    fromCurrency,
    toCurrency,
    exchangeRate
  };
}

/**
 * Calculate tax breakdown by tax rate
 */
export function calculateTaxBreakdown(lineItems: LineItem[]): {
  [taxRate: string]: {
    taxRate: number;
    taxableAmount: number;
    taxAmount: number;
    items: number;
  };
} {
  if (!Array.isArray(lineItems)) {
    return {};
  }

  const breakdown: { [taxRate: string]: any } = {};

  lineItems.forEach(item => {
    if (!item || !item.quantity || !item.unitPrice) {
      return;
    }

    const taxRate = item.tax || 0;
    const key = `${taxRate}%`;

    if (!breakdown[key]) {
      breakdown[key] = {
        taxRate,
        taxableAmount: 0,
        taxAmount: 0,
        items: 0
      };
    }

    const lineAmount = item.quantity * item.unitPrice;
    const discountAmount = item.discount ? lineAmount * (item.discount / 100) : 0;
    const taxableAmount = lineAmount - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);

    breakdown[key].taxableAmount += taxableAmount;
    breakdown[key].taxAmount += taxAmount;
    breakdown[key].items += 1;
  });

  // Round all amounts
  Object.keys(breakdown).forEach(key => {
    breakdown[key].taxableAmount = Math.round(breakdown[key].taxableAmount * 100) / 100;
    breakdown[key].taxAmount = Math.round(breakdown[key].taxAmount * 100) / 100;
  });

  return breakdown;
}

/**
 * Generate document reference number
 */
export function generateReference(prefix: string = 'REF', length: number = 8): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, length);
  return `${prefix}-${timestamp.slice(-4)}-${random.toUpperCase()}`;
}

/**
 * Calculate payment due date
 */
export function calculateDueDate(documentDate: string, paymentTerms: number = 30): string {
  const date = new Date(documentDate);
  date.setDate(date.getDate() + paymentTerms);
  return date.toISOString().split('T')[0];
}

/**
 * Validate document totals
 */
export function validateDocumentTotals(document: BaseSalesDocument): {
  isValid: boolean;
  errors: string[];
  calculatedValues: {
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    total: number;
  };
} {
  const errors: string[] = [];
  
  if (!document || !document.lineItems) {
    return {
      isValid: false,
      errors: ['Document or line items missing'],
      calculatedValues: { subtotal: 0, totalDiscount: 0, totalTax: 0, total: 0 }
    };
  }

  const calculated = calculateDocumentSummary(document.lineItems);
  const tolerance = 0.01; // Allow 1 cent tolerance for rounding differences

  const subtotalDiff = Math.abs(document.subtotal - calculated.subtotal);
  const discountDiff = Math.abs((document.discount || 0) - calculated.totalDiscount);
  const taxDiff = Math.abs((document.tax || 0) - calculated.totalTax);
  const totalDiff = Math.abs(document.total - calculated.total);

  if (subtotalDiff > tolerance) {
    errors.push(`Subtotal mismatch: expected ${calculated.subtotal}, got ${document.subtotal}`);
  }

  if (discountDiff > tolerance) {
    errors.push(`Discount mismatch: expected ${calculated.totalDiscount}, got ${document.discount || 0}`);
  }

  if (taxDiff > tolerance) {
    errors.push(`Tax mismatch: expected ${calculated.totalTax}, got ${document.tax || 0}`);
  }

  if (totalDiff > tolerance) {
    errors.push(`Total mismatch: expected ${calculated.total}, got ${document.total}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    calculatedValues: {
      subtotal: calculated.subtotal,
      totalDiscount: calculated.totalDiscount,
      totalTax: calculated.totalTax,
      total: calculated.total
    }
  };
}

/**
 * Get line item display name
 */
export function getLineItemDisplayName(lineItem: LineItem): string {
  if (lineItem.product?.name) {
    return lineItem.product.name;
  }
  
  if (lineItem.description) {
    return lineItem.description;
  }
  
  return 'Unnamed Item';
}

/**
 * Calculate margin
 */
export function calculateMargin(sellingPrice: number, costPrice: number): {
  marginAmount: number;
  marginPercentage: number;
  markupPercentage: number;
} {
  const margin = sellingPrice - costPrice;
  const marginPercentage = sellingPrice > 0 ? (margin / sellingPrice) * 100 : 0;
  const markupPercentage = costPrice > 0 ? (margin / costPrice) * 100 : 0;

  return {
    marginAmount: Math.round(margin * 100) / 100,
    marginPercentage: Math.round(marginPercentage * 100) / 100,
    markupPercentage: Math.round(markupPercentage * 100) / 100
  };
}

/**
 * Calculate outstanding amount (for invoices)
 */
export function calculateOutstandingAmount(totalAmount: number, paidAmount: number = 0): {
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  percentagePaid: number;
  isFullyPaid: boolean;
} {
  const outstanding = Math.max(0, totalAmount - paidAmount);
  const percentagePaid = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  const isFullyPaid = outstanding <= 0.01; // Allow for small rounding differences

  return {
    totalAmount: Math.round(totalAmount * 100) / 100,
    paidAmount: Math.round(paidAmount * 100) / 100,
    outstandingAmount: Math.round(outstanding * 100) / 100,
    percentagePaid: Math.round(percentagePaid * 100) / 100,
    isFullyPaid
  };
}

/**
 * Round to specified decimal places
 */
export function roundToDecimalPlaces(value: number, decimalPlaces: number = 2): number {
  const multiplier = Math.pow(10, decimalPlaces);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate compound totals for multiple documents
 */
export function calculateCompoundTotals(documents: BaseSalesDocument[]): {
  totalCount: number;
  totalAmount: number;
  totalSubtotal: number;
  totalTax: number;
  totalDiscount: number;
  averageAmount: number;
  currency: Currency;
} {
  if (!Array.isArray(documents) || documents.length === 0) {
    return {
      totalCount: 0,
      totalAmount: 0,
      totalSubtotal: 0,
      totalTax: 0,
      totalDiscount: 0,
      averageAmount: 0,
      currency: 'KES'
    };
  }

  const totals = documents.reduce((acc, doc) => {
    return {
      totalAmount: acc.totalAmount + (doc.total || 0),
      totalSubtotal: acc.totalSubtotal + (doc.subtotal || 0),
      totalTax: acc.totalTax + (doc.tax || 0),
      totalDiscount: acc.totalDiscount + (doc.discount || 0)
    };
  }, {
    totalAmount: 0,
    totalSubtotal: 0,
    totalTax: 0,
    totalDiscount: 0
  });

  const averageAmount = documents.length > 0 ? totals.totalAmount / documents.length : 0;
  const currency = documents[0]?.currency || 'KES';

  return {
    totalCount: documents.length,
    totalAmount: roundToDecimalPlaces(totals.totalAmount),
    totalSubtotal: roundToDecimalPlaces(totals.totalSubtotal),
    totalTax: roundToDecimalPlaces(totals.totalTax),
    totalDiscount: roundToDecimalPlaces(totals.totalDiscount),
    averageAmount: roundToDecimalPlaces(averageAmount),
    currency
  };
}
