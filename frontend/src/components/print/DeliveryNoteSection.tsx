
import React from 'react';
import { DeliveryNote } from '@/types/businessDocuments';

interface DeliveryNoteSectionProps {
  document: DeliveryNote;
}

const DeliveryNoteSection: React.FC<DeliveryNoteSectionProps> = ({ document }) => {
  return (
    <div className="delivery-note-section mb-6 print:mb-5 relative z-10">
      {/* Delivery Information */}
      <div className="delivery-info mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deliver To Section */}
          <div>
            <div className="section-header bg-blue-50 px-4 py-3 border border-blue-200 font-bold text-sm text-blue-800">
              🚚 Deliver To:
            </div>
            <div className="delivery-content p-4 border border-t-0 text-sm bg-white">
              {document.customer && (
                <div className="space-y-1">
                  <div className="font-bold text-lg">{document.customer.name}</div>
                  <div className="text-gray-700">{document.customer.address}</div>
                  <div className="text-gray-700">{document.customer.city}, {document.customer.state} {document.customer.zip}</div>
                  {document.customer.phone && (
                    <div className="text-gray-600 mt-2"><strong>Phone:</strong> {document.customer.phone}</div>
                  )}
                  {document.relatedOrder && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded"><strong>Reference Order:</strong> {document.relatedOrder}</div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Delivery Address Section (if different) */}
          {document.deliveryAddress && document.deliveryAddress !== document.customer?.address && (
            <div>
              <div className="section-header bg-green-50 px-4 py-3 border border-green-200 font-bold text-sm text-green-800">
                📍 Delivery Address:
              </div>
              <div className="delivery-content p-4 border border-t-0 text-sm bg-white">
                <div className="text-gray-700 whitespace-pre-line">{document.deliveryAddress}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Items Table for Delivery - No Prices */}
      <div className="delivery-items mb-6">
        <table className="w-full border-collapse border border-gray-800">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="p-2 text-left text-xs font-bold border border-gray-800">Item</th>
              <th className="p-2 text-left text-xs font-bold border border-gray-800">Description</th>
              <th className="p-2 text-center text-xs font-bold border border-gray-800">Qty Ordered</th>
              <th className="p-2 text-center text-xs font-bold border border-gray-800">Qty Delivered</th>
              <th className="p-2 text-left text-xs font-bold border border-gray-800">Notes</th>
            </tr>
          </thead>
          <tbody>
            {document.items.map((item, index) => (
              <tr key={index} className={index % 2 === 1 ? 'bg-gray-100' : ''}>
                <td className="text-xs p-2 border border-gray-300 font-semibold">{item.itemCode}</td>
                <td className="text-xs p-2 border border-gray-300">{item.description}</td>
                <td className="text-center text-xs p-2 border border-gray-300">{item.quantity} {item.unit || 'pcs'}</td>
                <td className="text-center text-xs p-2 border border-gray-300">{item.quantity} {item.unit || 'pcs'}</td>
                <td className="text-xs p-2 border border-gray-300">Delivered in good condition</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delivery Information */}
      <div className="delivery-details mb-6 text-sm">
        <div className="font-bold mb-4 text-blue-800">Delivery Information:</div>
        <div className="ml-4 space-y-2">
          <div><strong>Delivery Date:</strong> {new Date(document.deliveryDate).toLocaleDateString('en-US')}</div>
          {document.carrier && <div><strong>Carrier:</strong> {document.carrier}</div>}
          {document.trackingNumber && <div><strong>Tracking Number:</strong> {document.trackingNumber}</div>}
        </div>
      </div>

      {/* Customer Signature */}
      <div className="signature-section grid grid-cols-2 gap-6 mt-8 text-sm">
        <div>
          <div className="font-bold mb-4">Customer Signature:</div>
          <div className="border-b border-gray-800 pb-2 mb-2" style={{ minHeight: '40px' }}></div>
        </div>
        <div>
          <div className="font-bold mb-4">Date:</div>
          <div className="border-b border-gray-800 pb-2 mb-2" style={{ minHeight: '40px' }}></div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryNoteSection;
