// Script to test authentication and set up token in localStorage
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhmZjdhODRkLTFhNzUtNGJmMy1hNjAzLTk3Nzg4ZmYwOWFjMSIsImVtYWlsIjoidGVzdEBwcmludHNvZnQuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTE5ODQ4NTgsImV4cCI6MTc1MjA3MTI1OH0.U2ylmG2wL91-zSfJXqW_TxXxyO-JGvcSVSlJR0ExekU";

const user = {
  id: "8ff7a84d-1a75-4bf3-a603-97788ff09ac1",
  email: "test@printsoft.com",
  first_name: "Test", 
  last_name: "User",
  role: "user"
};

// Set items in localStorage
localStorage.setItem('access_token', token);
localStorage.setItem('user', JSON.stringify(user));

console.log('✅ Authentication token and user data set in localStorage');
console.log('Token:', token);
console.log('User:', user);

// Test API call
fetch('http://localhost:3001/rest/v1/settings', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('✅ Settings API response:', data);
})
.catch(error => {
  console.error('❌ Settings API error:', error);
});
