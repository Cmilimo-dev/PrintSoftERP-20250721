
import React from 'react';
import { PaymentReceipt } from '@/types/businessDocuments';
import { EnhancedDocumentSignature } from '@/components/documents/EnhancedDocumentSignature';

interface PaymentReceiptSectionProps {
  document: PaymentReceipt;
  currencySymbol: string;
}

const PaymentReceiptSection: React.FC<PaymentReceiptSectionProps> = ({ document, currencySymbol }) => {
  return (
    <div className="payment-receipt-section mb-6 print:mb-5 relative z-10">
      {/* Payment Status Banner */}
      <div className="bg-green-100 border border-green-300 p-4 mb-4 relative">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm font-semibold text-gray-800">Payment Received</div>
            <div className="text-sm"><strong>Amount Paid:</strong> {currencySymbol} {document.amountPaid.toFixed(2)}</div>
            <div className="text-sm"><strong>Payment Method:</strong> <span className="bg-blue-800 text-white px-2 py-1 rounded text-xs">{document.paymentMethod}</span></div>
            <div className="text-sm"><strong>Reference:</strong> {document.reference}</div>
          </div>
          <div className="text-right">
            <div className="inline-block border-2 border-green-600 text-green-600 px-6 py-2 rounded font-bold text-lg">
              PAID IN FULL
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="payment-details mb-4">
        <div className="section-header bg-gray-100 px-3 py-2 border font-bold text-sm">
          {document.receiptType === 'customer' ? 'Received From:' : 'Paid To:'}
        </div>
        <div className="payment-content p-3 border border-t-0 text-sm">
          {document.receiptType === 'customer' && document.customer && (
            <div>
              <div className="font-bold mb-2">{document.customer.name}</div>
              <div>{document.customer.address}</div>
              <div>{document.customer.city}, {document.customer.state} {document.customer.zip}</div>
              {document.customer.phone && <div>Phone: {document.customer.phone}</div>}
              {document.customer.email && <div>Email: {document.customer.email}</div>}
            </div>
          )}
          {document.receiptType === 'vendor' && document.vendor && (
            <div>
              <div className="font-bold mb-2">{document.vendor.name}</div>
              <div>{document.vendor.address}</div>
              <div>{document.vendor.city}, {document.vendor.state} {document.vendor.zip}</div>
              {document.vendor.phone && <div>Phone: {document.vendor.phone}</div>}
              {document.vendor.email && <div>Email: {document.vendor.email}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Receipt Information */}
      <div className="receipt-info mt-6 text-sm">
        <div className="font-bold mb-2">Receipt Information:</div>
        <div className="ml-4 space-y-1">
          <div>This receipt confirms payment has been received</div>
          <div>Please retain this receipt for your records</div>
          <div>For inquiries, contact us at {document.company.phone} or {document.company.email}</div>
          {document.relatedInvoice && (
            <div className="mt-2">
              <strong>Related Invoice:</strong> {document.relatedInvoice}
            </div>
          )}
        </div>
      </div>
      
      {/* Signature Section */}
      {document.signature?.enabled && (
        <div className="signature-section mt-8">
          <EnhancedDocumentSignature 
            documentType="payment_receipt"
            signatureId={document.signature.signatureId}
            showPrintLayout={true}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentReceiptSection;
