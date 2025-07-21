// Test script to verify frontend API integration
// This should be run in the browser console after logging in

// Test function to verify number generation
async function testNumberGeneration() {
  const { apiClient } = await import('./src/lib/api-client.ts');
  
  console.log('Testing frontend API integration for number generation...');
  
  const documentTypes = [
    'sales_order',
    'purchase_order', 
    'invoice',
    'quotation',
    'customer',
    'vendor'
  ];
  
  for (const docType of documentTypes) {
    try {
      const number = await apiClient.generateNumber(docType);
      console.log(`✅ ${docType.padEnd(15)} -> ${number}`);
    } catch (error) {
      console.error(`❌ ${docType.padEnd(15)} -> ${error.message}`);
    }
  }
}

// Test function to verify UnifiedNumberService
async function testUnifiedNumberService() {
  const { default: UnifiedNumberService } = await import('./src/services/unifiedNumberService.ts');
  
  console.log('Testing UnifiedNumberService...');
  
  try {
    const salesOrder = await UnifiedNumberService.generateDocumentNumber('sales-order');
    console.log('✅ Sales Order (via UnifiedNumberService):', salesOrder);
  } catch (error) {
    console.error('❌ Sales Order failed:', error.message);
  }
  
  try {
    const customer = await UnifiedNumberService.generateCustomerNumber();
    console.log('✅ Customer (via UnifiedNumberService):', customer);
  } catch (error) {
    console.error('❌ Customer failed:', error.message);
  }
}

// Run tests
console.log('Run testNumberGeneration() or testUnifiedNumberService() to test the integration');
window.testNumberGeneration = testNumberGeneration;
window.testUnifiedNumberService = testUnifiedNumberService;
