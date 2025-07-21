
import { BaseDocument } from '@/types/businessDocuments';

export const generatePaymentReceiptContent = (document: BaseDocument, currencySymbol: string) => {
  const receipt = document as any;
  
  // Calculate payment status
  const calculatePaymentStatus = () => {
    const amountPaid = receipt.amountPaid || 0;
    const totalAmount = receipt.invoiceTotal || document.total || 0;
    
    if (totalAmount === 0) return { status: 'PAID IN FULL', percentage: 100 };
    
    const percentage = Math.round((amountPaid / totalAmount) * 100);
    
    if (percentage >= 100) {
      return { status: 'PAID IN FULL', percentage: 100 };
    } else {
      return { status: `${percentage}% PAID`, percentage };
    }
  };

  const paymentStatus = calculatePaymentStatus();
  
  return `
    <!-- Payment Status Banner - Dynamic based on payment amount -->
    <div style="background-color: #dcfce7; border: 1px solid #16a34a; padding: 20px; margin: 20px 0; position: relative;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="flex: 1;">
          <div style="font-size: 16px; font-weight: bold; color: #000; margin-bottom: 8px;">Payment Received</div>
          <div style="font-size: 14px; color: #000; margin-bottom: 4px;"><strong>Amount Paid:</strong> ${currencySymbol} ${receipt.amountPaid?.toFixed(2) || '0.00'}</div>
          ${receipt.invoiceTotal ? `<div style="font-size: 14px; color: #000; margin-bottom: 4px;"><strong>Invoice Total:</strong> ${currencySymbol} ${receipt.invoiceTotal.toFixed(2)}</div>` : ''}
          <div style="font-size: 14px; color: #000; margin-bottom: 4px;">
            <strong>Payment Method:</strong> 
            <span style="background-color: #1e40af; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; margin-left: 8px;">
              ${receipt.paymentMethod || 'N/A'}
            </span>
          </div>
          <div style="font-size: 14px; color: #000;"><strong>Reference:</strong> ${receipt.reference || 'N/A'}</div>
        </div>
        <div style="text-align: right;">
          <div style="border: 3px solid #16a34a; color: #16a34a; padding: 12px 24px; font-weight: bold; font-size: 18px; background-color: white;">
            ${paymentStatus.status}
          </div>
        </div>
      </div>
    </div>

    <!-- Received From Section -->
    <div style="margin: 30px 0;">
      <div style="font-size: 16px; font-weight: bold; color: #1e40af; margin-bottom: 10px;">
        ${receipt.receiptType === 'customer' ? 'Received From:' : 'Paid To:'}
      </div>
      <div style="margin-left: 0; font-size: 14px; line-height: 1.6; color: #000;">
        ${receipt.receiptType === 'customer' && receipt.customer ? `
          <div style="font-weight: bold; margin-bottom: 4px;">${receipt.customer.name}</div>
          <div>${receipt.customer.address}</div>
          <div>${receipt.customer.city}, ${receipt.customer.state} ${receipt.customer.zip}</div>
          <div>${receipt.customer.country || 'Kenya'}</div>
        ` : ''}
        ${receipt.receiptType === 'vendor' && receipt.vendor ? `
          <div style="font-weight: bold; margin-bottom: 4px;">${receipt.vendor.name}</div>
          <div>${receipt.vendor.address}</div>
          <div>${receipt.vendor.city}, ${receipt.vendor.state} ${receipt.vendor.zip}</div>
        ` : ''}
      </div>
    </div>

    <!-- Payment Summary Section -->
    <div style="margin: 30px 0; border: 1px solid #ccc; padding: 20px; background-color: #f9f9f9;">
      <div style="font-size: 16px; font-weight: bold; color: #1e40af; margin-bottom: 15px;">Payment Summary</div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span style="font-size: 14px;">Amount Paid:</span>
        <span style="font-size: 14px; font-weight: bold;">${currencySymbol} ${receipt.amountPaid?.toFixed(2) || '0.00'}</span>
      </div>
      ${receipt.invoiceTotal ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="font-size: 14px;">Invoice Total:</span>
          <span style="font-size: 14px;">${currencySymbol} ${receipt.invoiceTotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="font-size: 14px;">Remaining Balance:</span>
          <span style="font-size: 14px; ${(receipt.invoiceTotal - (receipt.amountPaid || 0)) <= 0 ? 'color: #16a34a;' : 'color: #dc2626;'}">${currencySymbol} ${Math.max(0, receipt.invoiceTotal - (receipt.amountPaid || 0)).toFixed(2)}</span>
        </div>
      ` : ''}
      <div style="border-top: 2px solid #1e40af; padding-top: 10px; margin-top: 15px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="font-size: 16px; font-weight: bold;">Payment Status:</span>
          <span style="font-size: 16px; font-weight: bold; color: #16a34a;">${paymentStatus.status}</span>
        </div>
      </div>
    </div>

    <!-- Notes Section -->
    ${document.notes ? `
      <div style="margin: 30px 0;">
        <div style="font-size: 16px; font-weight: bold; color: #1e40af; margin-bottom: 8px;">Notes:</div>
        <div style="font-size: 13px; line-height: 1.6;">
          ${document.notes}
        </div>
      </div>
    ` : ''}

    <!-- Receipt Information -->
    <div style="margin: 30px 0;">
      <div style="font-size: 16px; font-weight: bold; color: #1e40af; margin-bottom: 8px;">Receipt Information:</div>
      <div style="font-size: 13px; line-height: 1.8; color: #000;">
        <div>• This receipt confirms payment has been received</div>
        <div>• Please retain this receipt for your records</div>
        <div>• For inquiries, contact us at ${document.company.phone} or ${document.company.email}</div>
        ${receipt.relatedInvoice ? `<div>• Related Invoice: ${receipt.relatedInvoice}</div>` : ''}
      </div>
    </div>

    <!-- Signature Section for Payment Receipts -->
    ${receipt.signature?.enabled ? `
      <div style="margin: 40px 0 20px 0; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: end; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; min-width: 200px;">
            <div style="border-bottom: 2px solid #333; margin-bottom: 8px; height: 50px; display: flex; align-items: end; justify-content: center;">
              <!-- Signature image would be loaded dynamically -->
            </div>
            <div style="font-size: 10px; color: #4a5568;">
              <div style="font-weight: bold; margin-bottom: 2px;">Authorized Signature</div>
              <div>Finance Department</div>
            </div>
          </div>
          <div style="text-align: center; min-width: 150px;">
            <div style="border-bottom: 2px solid #333; margin-bottom: 8px; height: 20px;"></div>
            <div style="font-size: 10px; color: #4a5568;">Date</div>
          </div>
        </div>
      </div>
    ` : ''}
  `;
};
