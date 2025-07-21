
import { BaseDocument } from '@/types/businessDocuments';

export const generateDeliveryNoteContent = (document: BaseDocument) => {
  const deliveryNote = document as any;
  
  return `
    <!-- Delivery Information -->
    <div style="margin: 20px 0;">
      <div style="background-color: #f7fafc; padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: bold; font-size: 12px; color: #2d3748;">
        Deliver To:
      </div>
      <div style="padding: 12px; border: 1px solid #e2e8f0; border-top: none; font-size: 11px; background: white; line-height: 1.4;">
        ${deliveryNote.customer ? `
          <div style="font-weight: bold; margin-bottom: 6px; color: #2d3748;">${deliveryNote.customer.name}</div>
          <div>${deliveryNote.customer.address}</div>
          <div>${deliveryNote.customer.city}, ${deliveryNote.customer.state} ${deliveryNote.customer.zip}</div>
          ${deliveryNote.relatedOrder ? `<div style="margin-top: 8px;"><strong>Reference:</strong> ${deliveryNote.relatedOrder}</div>` : ''}
        ` : ''}
      </div>
    </div>

    <!-- Items Table for Delivery - No Prices -->
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 2px solid #2d3748;">
      <thead>
        <tr>
          <th style="background-color: #1e40af; color: white; padding: 10px 8px; text-align: left; font-size: 11px; font-weight: bold; border: 1px solid #2d3748; width: 20%;">Item</th>
          <th style="background-color: #1e40af; color: white; padding: 10px 8px; text-align: left; font-size: 11px; font-weight: bold; border: 1px solid #2d3748; width: 35%;">Description</th>
          <th style="background-color: #1e40af; color: white; padding: 10px 8px; text-align: center; font-size: 11px; font-weight: bold; border: 1px solid #2d3748; width: 15%;">Qty Ordered</th>
          <th style="background-color: #1e40af; color: white; padding: 10px 8px; text-align: center; font-size: 11px; font-weight: bold; border: 1px solid #2d3748; width: 15%;">Qty Delivered</th>
          <th style="background-color: #1e40af; color: white; padding: 10px 8px; text-align: left; font-size: 11px; font-weight: bold; border: 1px solid #2d3748; width: 15%;">Notes</th>
        </tr>
      </thead>
      <tbody>
        ${document.items.map((item, index) => `
          <tr style="${index % 2 === 1 ? 'background-color: #f7fafc;' : ''}">
            <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px; font-weight: bold; vertical-align: top;">${item.itemCode}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px; vertical-align: top;">${item.description}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px; text-align: center; vertical-align: top;">${item.quantity}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px; text-align: center; vertical-align: top;">${item.quantity}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px; vertical-align: top;">Delivered in good condition</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Delivery Details -->
    <div style="margin: 20px 0; font-size: 11px; background-color: #f0f9ff; padding: 12px; border: 1px solid #0369a1;">
      <div style="font-weight: bold; margin-bottom: 8px; color: #0369a1;">Delivery Information:</div>
      <div style="margin-left: 16px; line-height: 1.6;">
        <div><strong>Delivery Date:</strong> ${new Date(deliveryNote.deliveryDate).toLocaleDateString('en-GB')}</div>
        ${deliveryNote.carrier ? `<div><strong>Carrier:</strong> ${deliveryNote.carrier}</div>` : ''}
        ${deliveryNote.trackingNumber ? `<div><strong>Tracking Number:</strong> ${deliveryNote.trackingNumber}</div>` : ''}
      </div>
    </div>

    <!-- Customer Signature Section -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 40px 0; font-size: 11px;">
      <div>
        <div style="font-weight: bold; margin-bottom: 15px; color: #2d3748;">Customer Signature:</div>
        <div style="border-bottom: 1px solid #2d3748; padding-bottom: 2px; margin-bottom: 5px; min-height: 40px;"></div>
      </div>
      <div>
        <div style="font-weight: bold; margin-bottom: 15px; color: #2d3748;">Date:</div>
        <div style="border-bottom: 1px solid #2d3748; padding-bottom: 2px; margin-bottom: 5px; min-height: 40px;"></div>
      </div>
    </div>
  `;
};
