import { LineItem, TaxSettings } from '../types/purchasingTypes';

export const calculateItemTotal = (
  quantity: number,
  unitPrice: number,
  taxRate: number,
  taxSettings: TaxSettings
): { total: number; taxAmount: number } => {
  const subtotal = quantity * unitPrice;
  let taxAmount = 0;
  let total = subtotal;

  if (taxSettings.type === 'exclusive') {
    taxAmount = (subtotal * taxRate) / 100;
    total = subtotal + taxAmount;
  } else if (taxSettings.type === 'inclusive') {
    taxAmount = (subtotal * taxRate) / (100 + taxRate);
    total = subtotal;
  } else if (taxSettings.type === 'per_item') {
    taxAmount = (subtotal * taxRate) / 100;
    total = subtotal + taxAmount;
  }

  return {
    total: Math.round(total * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100
  };
};

export const calculateDocumentTotals = (
  items: LineItem[],
  taxSettings: TaxSettings
): {
  subtotal: number;
  taxAmount: number;
  total: number;
} => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  
  let totalTaxAmount = 0;
  let grandTotal = 0;

  if (taxSettings.type === 'overall') {
    totalTaxAmount = (subtotal * taxSettings.defaultRate) / 100;
    grandTotal = subtotal + totalTaxAmount;
  } else {
    totalTaxAmount = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    grandTotal = items.reduce((sum, item) => sum + item.total, 0);
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(totalTaxAmount * 100) / 100,
    total: Math.round(grandTotal * 100) / 100
  };
};

export const validateLineItem = (item: LineItem): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!item.itemCode || item.itemCode.trim() === '') {
    errors.push('Item code is required');
  }

  if (!item.description || item.description.trim() === '') {
    errors.push('Description is required');
  }

  if (item.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (item.unitPrice < 0) {
    errors.push('Unit price cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatCurrency = (amount: number, currency: string = 'KES'): string => {
  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const calculateLineItemWithTax = (item: LineItem, taxSettings: TaxSettings): LineItem => {
  const taxRate = item.taxRate || taxSettings.defaultRate;
  const { total, taxAmount } = calculateItemTotal(
    item.quantity,
    item.unitPrice,
    taxRate,
    taxSettings
  );

  return {
    ...item,
    taxRate,
    taxAmount,
    total
  };
};

export const applyDiscountToLineItem = (
  item: LineItem,
  discountPercent: number,
  taxSettings: TaxSettings
): LineItem => {
  const discountAmount = (item.quantity * item.unitPrice * discountPercent) / 100;
  const discountedSubtotal = (item.quantity * item.unitPrice) - discountAmount;
  
  const taxRate = item.taxRate || taxSettings.defaultRate;
  let taxAmount = 0;
  let total = discountedSubtotal;

  if (taxSettings.type === 'exclusive') {
    taxAmount = (discountedSubtotal * taxRate) / 100;
    total = discountedSubtotal + taxAmount;
  } else if (taxSettings.type === 'inclusive') {
    taxAmount = (discountedSubtotal * taxRate) / (100 + taxRate);
    total = discountedSubtotal;
  }

  return {
    ...item,
    taxRate,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

export const calculateDocumentSummary = (items: LineItem[], currency: string = 'KES') => {
  const itemCount = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalTax = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  return {
    itemCount,
    totalQuantity,
    subtotal: Math.round(subtotal * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    formattedSubtotal: formatCurrency(subtotal, currency),
    formattedTotalTax: formatCurrency(totalTax, currency),
    formattedGrandTotal: formatCurrency(grandTotal, currency)
  };
};

export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  return Math.round(amount * exchangeRate * 100) / 100;
};

export const calculateTaxBreakdown = (items: LineItem[], taxSettings: TaxSettings) => {
  const taxBreakdown: { [rate: string]: { amount: number; taxable: number } } = {};

  items.forEach(item => {
    const taxRate = item.taxRate || taxSettings.defaultRate;
    const rateKey = `${taxRate}%`;
    
    if (!taxBreakdown[rateKey]) {
      taxBreakdown[rateKey] = { amount: 0, taxable: 0 };
    }
    
    taxBreakdown[rateKey].amount += item.taxAmount || 0;
    taxBreakdown[rateKey].taxable += item.quantity * item.unitPrice;
  });

  return Object.entries(taxBreakdown).map(([rate, data]) => ({
    rate,
    taxableAmount: Math.round(data.taxable * 100) / 100,
    taxAmount: Math.round(data.amount * 100) / 100
  }));
};
