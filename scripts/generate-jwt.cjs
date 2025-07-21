const crypto = require('crypto');

// Our PostgREST JWT secret
const secret = 'this-is-a-very-long-secret-key-for-postgrest-development-purposes-only';

// JWT Header
const header = {
  "alg": "HS256",
  "typ": "JWT"
};

// JWT Payload
const payload = {
  "aud": "postgrest",
  "exp": 1906689600, // Far future expiry
  "iat": Math.floor(Date.now() / 1000), // Current time
  "iss": "postgrest",
  "jti": "dev-token-" + Math.random().toString(36).substr(2, 9),
  "role": "apple",
  "sub": "apple"
};

// Base64 URL encode
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Create JWT
const headerEncoded = base64UrlEncode(JSON.stringify(header));
const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
const data = headerEncoded + '.' + payloadEncoded;

// Sign with HMAC SHA256
const signature = crypto
  .createHmac('sha256', secret)
  .update(data)
  .digest('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '');

const jwt = data + '.' + signature;

console.log('Generated JWT token:');
console.log(jwt);
console.log('\nPayload:', JSON.stringify(payload, null, 2));
