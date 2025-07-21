
import React from 'react';
import { LineItem, TaxSettings } from '@/types/businessDocuments';

interface ItemsTableProps {
  items: LineItem[];
  taxSettings: TaxSettings;
  currencySymbol: string;
}

const ItemsTable: React.FC<ItemsTableProps> = ({ items, taxSettings, currencySymbol }) => {
  return (
    <div className="mb-5 print:mb-4 relative z-10">
      <table className="items-table w-full border-collapse table-fixed border border-gray-800">
        <thead>
          <tr>
            <th className="col-ln bg-gray-700 text-white p-2 text-left text-xs font-bold border border-gray-800 print:p-1 print:text-xs">
              Ln
            </th>
            <th className="col-desc bg-gray-700 text-white p-2 text-left text-xs font-bold border border-gray-800 print:p-1 print:text-xs">
              Part Description
            </th>
            <th className="col-qty bg-gray-700 text-white p-2 text-left text-xs font-bold border border-gray-800 print:p-1 print:text-xs">
              Quantity
            </th>
            <th className="col-price bg-gray-700 text-white p-2 text-left text-xs font-bold border border-gray-800 print:p-1 print:text-xs">
              Unit Price
            </th>
            {taxSettings.type === 'per_item' && (
              <th className="bg-gray-700 text-white p-2 text-left text-xs font-bold border border-gray-800 print:p-1 print:text-xs">
                Tax Rate
              </th>
            )}
            <th className="col-total bg-gray-700 text-white p-2 text-left text-xs font-bold border border-gray-800 print:p-1 print:text-xs">
              Total Price
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className={index % 2 === 1 ? 'print:bg-gray-100' : ''}>
              <td className="text-center text-xs p-2 border border-gray-300 print:p-1 print:text-xs">
                {index + 1}
              </td>
              <td className="text-xs p-2 border border-gray-300 print:p-1 print:text-xs">
                <span className="item-code">{item.itemCode}</span>
                <span className="item-description">{item.description}</span>
              </td>
              <td className="text-center text-xs p-2 border border-gray-300 print:p-1 print:text-xs">
                {item.quantity}.00 ea
              </td>
              <td className="text-right text-xs p-2 border border-gray-300 print:p-1 print:text-xs">
                {currencySymbol} {item.unitPrice.toFixed(2)}
              </td>
              {taxSettings.type === 'per_item' && (
                <td className="text-center text-xs p-2 border border-gray-300 print:p-1 print:text-xs">
                  {item.taxRate}%
                </td>
              )}
              <td className="text-right text-xs p-2 border border-gray-300 print:p-1 print:text-xs">
                {currencySymbol} {item.total.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsTable;
