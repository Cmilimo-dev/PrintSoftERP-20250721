
import React from 'react';
import { Customer } from '@/types/businessDocuments';

interface CustomerSectionProps {
  customer: Customer;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({ customer }) => {
  return (
    <div className="vendor-section mb-5 print:mb-4 relative z-10">
      <div className="section-header bg-gray-100 px-3 py-2 border border-gray-300 font-bold text-xs text-gray-700 print:bg-gray-200 print:px-2 print:py-1">
        To:
      </div>
      <div className="vendor-content px-3 py-3 border border-gray-300 border-t-0 text-xs print:text-xs print:px-2 print:py-2">
        <div className="vendor-name font-semibold text-gray-800 mb-2 print:mb-1">{customer.name}</div>
        {customer.address && (
          <div className="mb-2 print:mb-1">
            <div>{customer.address}</div>
            <div>
              {customer.city && `${customer.city}, `}
              {customer.state} {customer.zip}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 mb-2">
          {customer.phone && (
            <div><span className="font-semibold">Phone:</span> {customer.phone}</div>
          )}
          {customer.email && (
            <div><span className="font-semibold">Email:</span> {customer.email}</div>
          )}
        </div>
        {customer.taxId && (
          <div>
            <span className="font-semibold">Tax ID:</span> {customer.taxId}
          </div>
        )}
        {customer.paymentTerms && (
          <div className="mt-2">
            <span className="font-semibold">Payment Terms:</span> {customer.paymentTerms}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSection;
