// Dynamic API configuration for mobile access and production
const getApiBaseUrl = () => {
  // Environment variable takes precedence (for production)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Check if we're running as a mobile app (Capacitor)
  const isMobileApp = !!(window as any).Capacitor;
  
  // Get the current hostname
  const hostname = window.location.hostname;
  
  // If accessing from localhost (development on computer), use localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // If accessing from network IP, use the same IP for API calls
  if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return `http://${hostname}:3001`;
  }
  
  // For mobile apps in production, use your production backend URL
  if (isMobileApp) {
    // This will be your Render backend URL once deployed
    return 'https://printsoft-erp-backend.onrender.com';
  }
  
  // Default fallback
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Simple API client
export const apiClient = {
  async get(url: string, options?: RequestInit) {
    const response = await fetch(`${API_CONFIG.baseURL}${url}`, {
      method: 'GET',
      headers: {
        ...API_CONFIG.headers,
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  async post(url: string, data?: any, options?: RequestInit) {
    const response = await fetch(`${API_CONFIG.baseURL}${url}`, {
      method: 'POST',
      headers: {
        ...API_CONFIG.headers,
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};

console.log('API Configuration:', {
  baseURL: API_CONFIG.baseURL,
  hostname: window.location.hostname,
  origin: window.location.origin,
});

export default API_CONFIG;
