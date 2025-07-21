// Simple verification script to check signature data
console.log('🔍 Verifying signature system...');

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Check localStorage for system settings
  const settings = localStorage.getItem('system_settings');
  
  if (settings) {
    try {
      const parsed = JSON.parse(settings);
      console.log('✅ System settings found');
      console.log('📋 Authorized Signatures:', parsed.authorizedSignatures?.length || 0);
      
      if (parsed.authorizedSignatures) {
        parsed.authorizedSignatures.forEach((sig, index) => {
          console.log(`  ${index + 1}. ${sig.name} - ${sig.title} (${sig.department})`);
        });
      }
      
      console.log('⚙️ Signature Settings:', {
        enabled: parsed.signatures?.enabled,
        showOnDocuments: parsed.signatures?.showOnDocuments
      });
      
    } catch (error) {
      console.error('❌ Error parsing settings:', error);
    }
  } else {
    console.log('⚠️ No system settings found in localStorage');
  }
  
  // Test department signature service
  console.log('\n🧪 Testing signature update events...');
  
  // Listen for custom signature events
  window.addEventListener('signatureUpdated', () => {
    console.log('🔔 Signature update event received!');
  });
  
  // Test manual trigger
  setTimeout(() => {
    console.log('🚀 Triggering test signature update...');
    window.dispatchEvent(new CustomEvent('signatureUpdated'));
  }, 1000);
  
} else {
  console.log('⚠️ Not in browser environment');
}
