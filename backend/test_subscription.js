const API_BASE_URL = 'http://localhost:3001';

// Test login and get token
async function login() {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('✅ Login successful');
    return data.token;
  } else {
    console.error('❌ Login failed:', data);
    return null;
  }
}

// Test subscription status
async function checkSubscription(token) {
  const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('📋 Subscription status:', data);
  
  // Transform to frontend format
  const transformed = {
    isActive: data.status === 'active',
    expiresAt: data.expires_at || '',
    plan: data.plan,
    userId: data.user_id,
    features: data.features
  };
  
  console.log('🔄 Transformed for frontend:', transformed);
  return transformed;
}

// Test subscription plans
async function getPlans() {
  const response = await fetch(`${API_BASE_URL}/api/subscriptions/plans`);
  const data = await response.json();
  console.log('📦 Available plans:', data);
  
  // Transform to frontend format
  const transformed = data.map(plan => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    currency: plan.currency,
    interval: plan.billing_period === 'yearly' ? 'yearly' : 'monthly',
    features: plan.features
  }));
  
  console.log('🔄 Transformed for frontend:', transformed);
  return transformed;
}

// Run tests
async function runTests() {
  console.log('🧪 Starting subscription service tests...\n');
  
  try {
    // Test login
    const token = await login();
    if (!token) return;
    
    console.log('');
    
    // Test subscription status
    await checkSubscription(token);
    
    console.log('');
    
    // Test plans
    await getPlans();
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();
