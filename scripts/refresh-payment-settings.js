// Run this in your browser console to enable bank and M-Pesa details
// Copy and paste the entire block into the console and press Enter

(function refreshPaymentSettings() {
  try {
    // Get current settings from localStorage
    const currentSettings = JSON.parse(localStorage.getItem('system_settings') || '{}');
    
    // Update payment settings to enable bank and M-Pesa
    if (!currentSettings.integrations) {
      currentSettings.integrations = {};
    }
    
    if (!currentSettings.integrations.payments) {
      currentSettings.integrations.payments = {};
    }
    
    // Enable bank details
    currentSettings.integrations.payments.bank = {
      enabled: true,
      bankName: 'Equity Bank Kenya Ltd.',
      accountName: 'EnerTek Solar',
      accountNumber: '0240991234567',
      branchCode: 'EQBLKENA',
      swiftCode: 'EQBLKENA'
    };
    
    // Enable M-Pesa details
    currentSettings.integrations.payments.mpesa = {
      enabled: true,
      businessShortCode: '400200',
      tillNumber: '5678901',
      payBillNumber: '400200',
      accountReference: 'TAX123456789',
      businessName: 'EnerTek Solar'
    };
    
    // Enable display settings
    currentSettings.integrations.payments.displaySettings = {
      showPaymentTerms: true,
      showBankDetails: true,
      showMpesaDetails: true,
      layoutStyle: 'detailed',
      sectionOrder: ['terms', 'bank', 'mpesa']
    };
    
    // Ensure showInDocuments is enabled
    currentSettings.integrations.payments.showInDocuments = true;
    
    // Save back to localStorage
    localStorage.setItem('system_settings', JSON.stringify(currentSettings));
    
    console.log('✅ Payment settings updated successfully!');
    console.log('🏦 Bank details enabled');
    console.log('📱 M-Pesa details enabled');
    console.log('📄 Payment terms enabled');
    console.log('🔄 Please refresh the page to see changes');
    
    return true;
  } catch (error) {
    console.error('❌ Error updating payment settings:', error);
    return false;
  }
})();
