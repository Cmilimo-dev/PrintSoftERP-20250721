console.log('🚀 Testing Supabase Integration...\n');

// Test basic connectivity
console.log('1. Testing Supabase connectivity...');
fetch('https://horacqblqojxtomwxkfh.supabase.co/rest/v1/departments?select=count', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvcmFjcWJscW9qeHRvbXd4a2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDExMTQsImV4cCI6MjA2NDYxNzExNH0.9ZaymlvwkGGz4raai7S2YW5NlOqEFveroScSwIiidJU',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvcmFjcWJscW9qeHRvbXd4a2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDExMTQsImV4cCI6MjA2NDYxNzExNH0.9ZaymlvwkGGz4raai7S2YW5NlOqEFveroScSwIiidJU'
  }
})
.then(response => {
  if (response.ok) {
    console.log('✅ Supabase connectivity: SUCCESS');
  } else {
    console.log('❌ Supabase connectivity: FAILED');
  }
})
.catch(error => {
  console.log('❌ Supabase connectivity: ERROR', error.message);
});

// Test each table
const tables = [
  'departments',
  'roles', 
  'permissions',
  'user_profiles',
  'parts',
  'locations',
  'current_inventory',
  'customers',
  'suppliers',
  'leads'
];

tables.forEach((table, index) => {
  setTimeout(() => {
    console.log(`${index + 2}. Testing table: ${table}...`);
    
    fetch(`https://horacqblqojxtomwxkfh.supabase.co/rest/v1/${table}?select=count`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvcmFjcWJscW9qeHRvbXd4a2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDExMTQsImV4cCI6MjA2NDYxNzExNH0.9ZaymlvwkGGz4raai7S2YW5NlOqEFveroScSwIiidJU',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvcmFjcWJscW9qeHRvbXd4a2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDExMTQsImV4cCI6MjA2NDYxNzExNH0.9ZaymlvwkGGz4raai7S2YW5NlOqEFveroScSwIiidJU'
      }
    })
    .then(response => {
      if (response.ok) {
        console.log(`  ✅ Table ${table}: ACCESSIBLE`);
      } else {
        console.log(`  ❌ Table ${table}: HTTP ${response.status}`);
      }
    })
    .catch(error => {
      console.log(`  ❌ Table ${table}: ERROR`);
    });
  }, (index + 1) * 200);
});

// Final summary
setTimeout(() => {
  console.log('\n🎉 Supabase Integration Test Complete!');
  console.log('\nNext steps:');
  console.log('1. Visit http://localhost:8082/ to test the application');
  console.log('2. Navigate to Settings > User Management to test user functions');
  console.log('3. Check inventory, customers, and other modules');
  console.log('4. Verify auth functionality if needed');
}, (tables.length + 2) * 200);
