// PrintSoft ERP - Token Fix Script
// Run this in your browser console to clear expired tokens

console.log('🔧 PrintSoft ERP Token Fix Script');
console.log('================================');

// Check current token status
const currentToken = localStorage.getItem('access_token');
const currentUser = localStorage.getItem('user');

console.log('Current token:', currentToken ? 'Present' : 'Not found');
console.log('Current user:', currentUser ? 'Present' : 'Not found');

// Clear expired tokens
localStorage.removeItem('access_token');
localStorage.removeItem('user');

// Clear any other related storage
localStorage.removeItem('subscription');
localStorage.removeItem('settings');

console.log('✅ Cleared expired tokens from localStorage');
console.log('✅ Cleared related cached data');

// Force page reload to trigger authentication flow
console.log('🔄 Reloading page to trigger fresh authentication...');
setTimeout(() => {
    location.reload();
}, 1000);

console.log('');
console.log('📝 Next steps:');
console.log('1. Page will reload automatically');
console.log('2. You should see the login page');
console.log('3. Use these credentials to login:');
console.log('   Email: admin@printsoft.com');
console.log('   Password: admin123');
console.log('4. All 403 Forbidden errors should be resolved');
