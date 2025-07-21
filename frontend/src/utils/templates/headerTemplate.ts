
import { BaseDocument } from '@/types/businessDocuments';
import { generateQRCode } from './numberUtils';
import { getDocumentTitle } from './documentTitles';
import { PaymentIntegrationService } from '@/services/paymentIntegrationService';
import { SystemSettingsService } from '@/modules/system-settings/services/systemSettingsService';

// PrintSoft logo as inline SVG data URL
const PRINTSOFT_LOGO_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="60" height="60" rx="8" fill="url(#grad1)"/>
  <text x="30" y="42" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="white">P</text>
</svg>
`)}`;

// Get the appropriate logo URL to use
const getLogoUrl = (companyHeader: any): string => {
  // If a custom logo is configured, use it
  if (companyHeader.logoUrl && companyHeader.logoUrl.trim() !== '') {
    return companyHeader.logoUrl;
  }
  // Otherwise, use our PrintSoft logo
  return PRINTSOFT_LOGO_SVG;
};

export const generateHeader = (document: BaseDocument, documentType: string, defaultCurrency: string) => {
  return `
    <!-- Header Section -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #2d3748; padding-bottom: 16px;">
      <div style="flex: 1; padding-right: 20px;">
${(() => {
          const companyHeader = PaymentIntegrationService.formatCompanyHeader();
          const displaySettings = SystemSettingsService.getSettings().companyDisplay;
          let content = '';
          if (companyHeader.showLogo && companyHeader.logoUrl) {
            const logoWidth = displaySettings.customLogoSize?.width || 100;
            const logoHeight = displaySettings.customLogoSize?.height || 50;
            content += `<img src="${companyHeader.logoUrl}" alt="Company Logo" style="width: ${logoWidth}px; height: ${logoHeight}px; object-fit: contain; display: block; margin-bottom: 8px;" />`;
          }
          if (companyHeader.showCompanyName) {
            content += `<div style="font-size: 18px; font-weight: bold; color: #2d3748; margin-bottom: 8px;">${companyHeader.companyName}</div>`;
          }
          return content;
        })()}
        <div style="font-size: 11px; color: #4a5568; line-height: 1.6;">
          <div>${document.company.address}</div>
          <div>${document.company.city}, ${document.company.state} ${document.company.zip}</div>
          <div>${document.company.country}</div>
          <div>Tel: ${document.company.phone}</div>
          <div>Email: ${document.company.email}</div>
          ${document.company.website ? `<div>Web: ${document.company.website}</div>` : ''}
          <div>VAT Number: ${document.company.taxId}</div>
        </div>
      </div>
      <div style="text-align: right; flex: 1;">
        <div style="font-size: 22px; font-weight: bold; color: #4a5568; margin-bottom: 12px;">
          ${getDocumentTitle(documentType as any)}
        </div>
        <div style="font-size: 11px; color: #2d3748; margin-bottom: 16px;">
          <div style="margin-bottom: 4px;"><span style="font-weight: 600;">Document #:</span> ${document.documentNumber}</div>
          <div style="margin-bottom: 4px;"><span style="font-weight: 600;">Date:</span> ${new Date(document.date).toLocaleDateString('en-GB')}</div>
          <div style="margin-bottom: 4px;"><span style="font-weight: 600;">Currency:</span> ${defaultCurrency}</div>
          <div style="margin-bottom: 8px;"><span style="font-weight: 600;">Print Date:</span> ${new Date().toLocaleDateString('en-GB')}</div>
          <!-- QR Code positioned below Print Date -->
          <div style="margin-top: 8px;">
            <img src="${generateQRCode(document.qrCodeData || document.documentNumber)}" alt="QR Code" style="width: 80px; height: 80px;" />
          </div>
        </div>
      </div>
    </div>
  `;
};
