import { SystemSettingsService } from '@/modules/system-settings/services/systemSettingsService';
import { PaymentInfo } from '@/modules/system-settings/types/systemSettingsTypes';

export interface DocumentPaymentInfo {
  // Control flags
  showInDocuments: boolean;
  showPaymentTerms: boolean;
  showBankDetails: boolean;
  showMpesaDetails: boolean;
  
  // Data structures
  paymentTerms?: {
    standardTerms: string;
    warrantyText: string;
    ownershipText: string;
    deliveryTerms: string;
    customTermsList: Array<{
      label: string;
      description: string;
    }>;
  };
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchCode: string;
    swiftCode: string;
  };
  mpesaDetails?: {
    businessShortCode: string;
    tillNumber: string;
    payBillNumber: string;
    accountReference: string;
    businessName: string;
  };
  
  // Display settings
  paymentInstructions: string;
  layoutStyle: 'compact' | 'detailed' | 'minimal';
  sectionOrder: Array<'terms' | 'bank' | 'mpesa'>;
}

export class PaymentIntegrationService {
  /**
   * Get payment information for document forms
   */
  static getDocumentPaymentInfo(): DocumentPaymentInfo {
    // Force fresh settings retrieval every time
    const settings = SystemSettingsService.getSettings();
    const paymentSettings = settings.integrations?.payments || {};
    const companyInfo = settings.companyInfo || {};
    
    // Debug: Check what's actually in localStorage
    const rawStorageData = localStorage.getItem('system_settings');
    console.log('🔍 Raw localStorage data:', rawStorageData ? JSON.parse(rawStorageData).integrations?.payments : 'No data');
    console.log('🔍 Parsed settings:', paymentSettings);

    console.log('🔧 PaymentIntegrationService Debug:', {
      fullSettings: settings,
      paymentSettings: paymentSettings,
      showInDocuments: paymentSettings.showInDocuments,
      bankSettings: paymentSettings.bank,
      mpesaSettings: paymentSettings.mpesa
    });
    
    console.log('🏦 Bank values breakdown:', {
      'bank object exists': !!paymentSettings.bank,
      'bankName': paymentSettings.bank?.bankName,
      'bankName type': typeof paymentSettings.bank?.bankName,
      'branchCode': paymentSettings.bank?.branchCode,
      'swiftCode': paymentSettings.bank?.swiftCode
    });
    
    console.log('📱 M-Pesa values breakdown:', {
      'mpesa object exists': !!paymentSettings.mpesa,
      'businessShortCode': paymentSettings.mpesa?.businessShortCode,
      'businessShortCode type': typeof paymentSettings.mpesa?.businessShortCode,
      'payBillNumber': paymentSettings.mpesa?.payBillNumber
    });

    // Always return payment information - the preview shows it, so documents should too
    const result: DocumentPaymentInfo = {
      showInDocuments: paymentSettings.showInDocuments !== false, // Default to true
      showPaymentTerms: true, // Always show payment terms
      showBankDetails: true, // Always show bank details
      showMpesaDetails: true, // Always show M-Pesa details
      layoutStyle: paymentSettings.displaySettings?.layoutStyle || 'detailed',
      sectionOrder: paymentSettings.displaySettings?.sectionOrder || ['terms', 'bank', 'mpesa'],
      paymentInstructions: paymentSettings.instructions || ''
    };

    // Always add payment terms
    result.paymentTerms = {
      standardTerms: paymentSettings.paymentTerms?.standardTerms || 'Standard Terms Apply',
      warrantyText: paymentSettings.paymentTerms?.warrantyText || 'Standard warranty applies',
      ownershipText: (paymentSettings.paymentTerms?.ownershipText || 'Goods belong to {companyName} until completion of payments').replace('{companyName}', companyInfo.companyName || 'Enertek solar services'),
      deliveryTerms: paymentSettings.paymentTerms?.deliveryTerms || 'Payment due on delivery',
      customTermsList: paymentSettings.paymentTerms?.customTermsList || []
    };

    // Use configured bank details (these are the values you see in preview)
    result.bankDetails = {
      bankName: paymentSettings.bank?.bankName || 'Not configured',
      accountName: paymentSettings.bank?.accountName || 'Not configured', 
      accountNumber: paymentSettings.bank?.accountNumber || 'Not configured',
      branchCode: paymentSettings.bank?.branchCode || 'Not configured',
      swiftCode: paymentSettings.bank?.swiftCode || 'Not configured'
    };

    // Use configured M-Pesa details (these are the values you see in preview)
    result.mpesaDetails = {
      businessShortCode: paymentSettings.mpesa?.businessShortCode || 'Not configured',
      tillNumber: paymentSettings.mpesa?.tillNumber || 'Not configured',
      payBillNumber: paymentSettings.mpesa?.payBillNumber || 'Not configured',
      accountReference: paymentSettings.mpesa?.accountReference || 'Not configured',
      businessName: paymentSettings.mpesa?.businessName || 'Not configured'
    };

    console.log('✅ Final Payment Info:', result);
    return result;
  }

  /**
   * Format payment information for document display
   */
  static formatPaymentInfoForDocument(): string {
    const paymentInfo = this.getDocumentPaymentInfo();
    let formattedInfo = '';

    if (paymentInfo.showBankDetails && paymentInfo.bankDetails) {
      formattedInfo += `BANK DETAILS:\n`;
      formattedInfo += `Bank: ${paymentInfo.bankDetails.bankName}\n`;
      formattedInfo += `Account Name: ${paymentInfo.bankDetails.accountName}\n`;
      formattedInfo += `Account Number: ${paymentInfo.bankDetails.accountNumber}\n`;
      if (paymentInfo.bankDetails.branchCode) {
        formattedInfo += `Branch Code: ${paymentInfo.bankDetails.branchCode}\n`;
      }
      if (paymentInfo.bankDetails.swiftCode) {
        formattedInfo += `SWIFT Code: ${paymentInfo.bankDetails.swiftCode}\n`;
      }
      formattedInfo += '\n';
    }

    if (paymentInfo.showMpesaDetails && paymentInfo.mpesaDetails) {
      formattedInfo += `MPESA PAYMENT:\n`;
      if (paymentInfo.mpesaDetails.payBillNumber) {
        formattedInfo += `Pay Bill: ${paymentInfo.mpesaDetails.payBillNumber}\n`;
      }
      if (paymentInfo.mpesaDetails.tillNumber) {
        formattedInfo += `Till Number: ${paymentInfo.mpesaDetails.tillNumber}\n`;
      }
      if (paymentInfo.mpesaDetails.businessShortCode) {
        formattedInfo += `Business Short Code: ${paymentInfo.mpesaDetails.businessShortCode}\n`;
      }
      if (paymentInfo.mpesaDetails.accountReference) {
        formattedInfo += `Account Reference: ${paymentInfo.mpesaDetails.accountReference}\n`;
      }
      formattedInfo += '\n';
    }

    if (paymentInfo.paymentInstructions) {
      formattedInfo += `PAYMENT INSTRUCTIONS:\n${paymentInfo.paymentInstructions}\n`;
    }

    return formattedInfo.trim();
  }

  /**
   * Get display settings for company branding in documents
   */
  static getCompanyDisplaySettings() {
    const settings = SystemSettingsService.getSettings();
    return settings.companyDisplay;
  }

  /**
   * Format company header for documents
   */
  static formatCompanyHeader(): {
    showLogo: boolean;
    showCompanyName: boolean;
    logoUrl?: string;
    companyName: string;
    displayFormat: 'logo_only' | 'name_only' | 'logo_and_name';
  } {
    const settings = SystemSettingsService.getSettings();
    const displaySettings = settings.companyDisplay;
    const companyInfo = settings.companyInfo;
    const format = displaySettings.headerDisplayFormat || 'logo_and_name';

    // Override individual settings based on the display format
    let showLogo = displaySettings.showLogo && !!displaySettings.logoUrl;
    let showCompanyName = displaySettings.showCompanyName;

    switch (format) {
      case 'logo-only':
        showLogo = !!displaySettings.logoUrl;
        showCompanyName = false;
        break;
      case 'name-only':
        showLogo = false;
        showCompanyName = true;
        break;
      case 'logo-with-name':
        showLogo = !!displaySettings.logoUrl;
        showCompanyName = true;
        break;
      case 'none':
        showLogo = false;
        showCompanyName = false;
        break;
    }

    return {
      showLogo,
      showCompanyName,
      logoUrl: displaySettings.logoUrl,
      companyName: companyInfo.companyName,
      displayFormat: format,
    };
  }
}
