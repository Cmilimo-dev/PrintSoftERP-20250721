
import React from 'react';
import { Vendor } from '@/types/purchaseOrder';

interface VendorSectionProps {
  vendor: Vendor;
}

const VendorSection: React.FC<VendorSectionProps> = ({ vendor }) => {
  return (
    <div className="vendor-section mb-5 print:mb-4 relative z-10">
      <div className="section-header bg-gray-100 px-3 py-2 border border-gray-300 font-bold text-xs text-gray-700 print:bg-gray-200 print:px-2 print:py-1">
        To:
      </div>
      <div className="vendor-content px-3 py-3 border border-gray-300 border-t-0 text-xs print:text-xs print:px-2 print:py-2">
        <div className="vendor-name font-semibold text-gray-800 mb-2 print:mb-1">{vendor.name}</div>
        {vendor.address && (
          <div className="mb-2 print:mb-1">
            <div>{vendor.address}</div>
            <div>
              {vendor.city && `${vendor.city}, `}
              {vendor.state} {vendor.zip}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 mb-2">
          {vendor.phone && (
            <div><span className="font-semibold">Phone:</span> {vendor.phone}</div>
          )}
          {vendor.email && (
            <div><span className="font-semibold">Email:</span> {vendor.email}</div>
          )}
        </div>
        {vendor.expectedDelivery && (
          <div>
            <span className="font-semibold">Expected Delivery:</span> {new Date(vendor.expectedDelivery).toLocaleDateString('en-GB')}
          </div>
        )}
        {vendor.capabilities && vendor.capabilities.length > 0 && (
          <div className="mt-2">
            <span className="font-semibold">Capabilities:</span> {vendor.capabilities.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorSection;
