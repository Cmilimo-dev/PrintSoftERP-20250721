
import React from 'react';
import { TaxSettings } from '@/types/businessDocuments';

interface TotalsSectionProps {
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  currencySymbol: string;
  taxSettings: TaxSettings;
}

const TotalsSection: React.FC<TotalsSectionProps> = ({
  subtotal,
  taxAmount,
  total,
  currency,
  currencySymbol,
  taxSettings
}) => {
  return (
    <div className="totals-section flex justify-end mb-6 print:mb-5 relative z-[200] bg-white print:z-[200]">
      <table className="totals-table w-80 border-collapse border-2 border-gray-800 bg-white relative z-[200] print:z-[200]">
        <tbody>
          <tr>
            <td className="totals-label bg-gray-100 px-4 py-3 border border-gray-300 font-bold text-right text-sm print:px-3 print:py-2 print:text-xs relative z-[200] print:bg-gray-100" style={{ backgroundColor: '#f7fafc' }}>
              Subtotal
            </td>
            <td className="totals-amount px-4 py-3 border border-gray-300 text-right text-sm print:px-3 print:py-2 print:text-xs bg-white relative z-[200]" style={{ backgroundColor: 'white' }}>
              {currencySymbol} {subtotal.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td className="totals-label bg-gray-100 px-4 py-3 border border-gray-300 font-bold text-right text-sm print:px-3 print:py-2 print:text-xs relative z-[200] print:bg-gray-100" style={{ backgroundColor: '#f7fafc' }}>
              VAT ({taxSettings.defaultRate}%)
            </td>
            <td className="totals-amount px-4 py-3 border border-gray-300 text-right text-sm print:px-3 print:py-2 print:text-xs bg-white relative z-[200]" style={{ backgroundColor: 'white' }}>
              {currencySymbol} {taxAmount.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td className="total-final bg-gray-700 text-white px-4 py-3 border border-gray-800 font-bold text-right text-sm print:px-3 print:py-2 print:text-xs relative z-[200]" style={{ backgroundColor: '#374151', color: 'white' }}>
              TOTAL ({currency})
            </td>
            <td className="total-final bg-gray-700 text-white px-4 py-3 border border-gray-800 text-right font-bold text-sm print:px-3 print:py-2 print:text-xs relative z-[200]" style={{ backgroundColor: '#374151', color: 'white' }}>
              {currencySymbol} {total.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TotalsSection;
