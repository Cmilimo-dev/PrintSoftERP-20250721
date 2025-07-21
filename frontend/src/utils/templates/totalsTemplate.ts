
import { BaseDocument } from '@/types/businessDocuments';
import { calculateTax } from './numberUtils';

export const generateTotalsSection = (document: BaseDocument, documentType: string, currencySymbol: string, defaultCurrency: string) => {
  if (['payment-receipt', 'financial-report', 'delivery-note'].includes(documentType)) {
    return '';
  }

  // Improved tax calculation
  const taxRate = document.taxSettings.defaultRate || 16; // Default KES VAT rate
  const calculatedTaxAmount = calculateTax(document.subtotal, document.taxSettings);

  return `
    <div style="display: flex; justify-content: flex-end; margin: 20px 0; position: relative;">
      <table style="width: 320px; border-collapse: collapse; border: 2px solid #2d3748; background: white;">
        <tbody>
          <tr>
            <td style="background-color: #f7fafc; padding: 12px 16px; border: 1px solid #2d3748; font-weight: bold; text-align: right; font-size: 12px; color: #2d3748;">
              Subtotal
            </td>
            <td style="padding: 12px 16px; border: 1px solid #2d3748; text-align: right; font-size: 12px; background: white; color: #2d3748;">
              ${currencySymbol} ${document.subtotal.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f7fafc; padding: 12px 16px; border: 1px solid #2d3748; font-weight: bold; text-align: right; font-size: 12px; color: #2d3748;">
              VAT (${taxRate}%)
            </td>
            <td style="padding: 12px 16px; border: 1px solid #2d3748; text-align: right; font-size: 12px; background: white; color: #2d3748;">
              ${currencySymbol} ${calculatedTaxAmount.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style="background-color: #2d3748; color: white; padding: 12px 16px; border: 1px solid #1a202c; font-weight: bold; text-align: right; font-size: 13px;">
              TOTAL (${defaultCurrency})
            </td>
            <td style="background-color: #2d3748; color: white; padding: 12px 16px; border: 1px solid #1a202c; text-align: right; font-weight: bold; font-size: 13px;">
              ${currencySymbol} ${document.total.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
};
