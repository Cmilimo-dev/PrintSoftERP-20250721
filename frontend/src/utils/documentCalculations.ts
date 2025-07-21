
import { LineItem, TaxSettings } from '@/types/businessDocuments';

export const calculateItemTotal = (
  quantity: number, 
  unitPrice: number, 
  taxRate: number = 0,
  taxSettings: TaxSettings
) => {
  const baseTotal = quantity * unitPrice;
  const taxAmount = taxSettings.type === 'inclusive' ? 
    (baseTotal * taxRate) / (100 + taxRate) : 
    baseTotal * (taxRate / 100);
  
  return {
    total: taxSettings.type === 'inclusive' ? baseTotal : baseTotal + taxAmount,
    taxAmount: taxAmount
  };
};

export const calculateDocumentTotals = (items: LineItem[], taxSettings: TaxSettings) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalTaxAmount = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  const grandTotal = taxSettings.type === 'overall' ? 
    subtotal + (subtotal * taxSettings.defaultRate / 100) :
    items.reduce((sum, item) => sum + item.total, 0);
  
  return {
    subtotal,
    taxAmount: taxSettings.type === 'overall' ? subtotal * taxSettings.defaultRate / 100 : totalTaxAmount,
    total: grandTotal
  };
};
