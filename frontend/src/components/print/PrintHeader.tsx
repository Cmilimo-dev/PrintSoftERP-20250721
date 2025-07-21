
import React from 'react';
import QRCodeGenerator from '../QRCodeGenerator';
import { Company } from '@/types/businessDocuments';
import { DocumentType } from '@/types/businessDocuments';
import { SystemSettingsService } from '@/modules/system-settings/services/systemSettingsService';

interface PrintHeaderProps {
  company: Company;
  documentNumber: string;
  date: string;
  currency: string;
  qrCodeData?: string;
  documentType?: DocumentType;
}

const PrintHeader: React.FC<PrintHeaderProps> = ({
  company,
  documentNumber,
  date,
  currency,
  qrCodeData,
  documentType = 'purchase-order'
}) => {
  const getDocumentTitle = () => {
    switch (documentType) {
      case 'purchase-order': return 'PURCHASE ORDER';
      case 'invoice': return 'INVOICE';
      case 'quote': return 'QUOTE';
      case 'sales-order': return 'SALES ORDER';
      case 'payment-receipt': return 'PAYMENT RECEIPT';
      case 'delivery-note': return 'DELIVERY NOTE';
      case 'financial-report': return 'FINANCIAL REPORT';
      default: return 'DOCUMENT';
    }
  };

  const getDocumentPrefix = () => {
    switch (documentType) {
      case 'purchase-order': return 'PO';
      case 'invoice': return 'Invoice';
      case 'quote': return 'Quote';
      case 'sales-order': return 'SO';
      case 'payment-receipt': return 'Receipt';
      case 'delivery-note': return 'DN';
      case 'financial-report': return 'Report';
      default: return 'Doc';
    }
  };

  // Get display settings to determine what to show
  const displaySettings = SystemSettingsService.getSettings().companyDisplay;

  return (
    <div className="header-section flex justify-between items-start mb-6 border-b-2 border-gray-800 pb-4 print:mb-5 print:pb-3 relative z-10">
      <div className="company-info flex-1 pr-5">
{company.logo && displaySettings.headerDisplayFormat !== 'name-only' && displaySettings.headerDisplayFormat !== 'none' && (
          <div className="mb-4">
            <img 
              src={company.logo} 
              alt="Company Logo" 
              className="w-24 h-16 object-contain print:w-20 print:h-12"
            />
          </div>
        )}
{displaySettings.headerDisplayFormat !== 'logo-only' && displaySettings.headerDisplayFormat !== 'none' && (
          <div className="company-name text-lg font-bold text-gray-800 mb-2 print:text-base print:mb-1">
            {company.name}
          </div>
        )}
        <div className="company-details text-xs text-gray-600 leading-relaxed print:text-xs print:leading-normal">
          <div>{company.address}</div>
          <div>{company.city}, {company.state} {company.zip}</div>
          <div>{company.country}</div>
          <div>Tel: {company.phone}</div>
          <div>Email: {company.email}</div>
          {company.website && (
            <div>Web: {company.website}</div>
          )}
          <div>VAT Number: {company.taxId}</div>
        </div>
      </div>
      <div className="po-info text-right flex-1">
        <div className="po-title text-2xl font-bold text-gray-700 mb-3 print:text-xl print:mb-2">
          {getDocumentTitle()}
        </div>
        <div className="po-details text-xs text-gray-800 print:text-xs mb-4">
          <div className="mb-1"><span className="font-semibold">{getDocumentPrefix()} Number:</span> {documentNumber}</div>
          <div className="mb-1"><span className="font-semibold">Date:</span> {new Date(date).toLocaleDateString('en-GB')}</div>
          <div className="mb-1"><span className="font-semibold">Currency:</span> {currency}</div>
          <div className="mb-3"><span className="font-semibold">Print Date:</span> {new Date().toLocaleDateString('en-GB')}</div>
        </div>
        <div className="flex justify-end">
          <QRCodeGenerator 
            data={qrCodeData || documentNumber}
            size={80}
            className="print:w-16 print:h-16"
          />
        </div>
      </div>
    </div>
  );
};

export default PrintHeader;
