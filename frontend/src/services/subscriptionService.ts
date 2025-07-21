import { API_BASE_URL } from '@/config/api';

export interface SubscriptionStatus {
  isActive: boolean;
  expiresAt: string;
  plan: string;
  userId?: string;
  features?: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
}

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

export const subscriptionService = {
  // Check current subscription status
  async checkSubscription(): Promise<SubscriptionStatus> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }
      
      const data = await response.json();
      
      // Transform backend response to match frontend interface
      return {
        isActive: data.status === 'active',
        expiresAt: data.expires_at || '',
        plan: data.plan,
        userId: data.user_id,
        features: data.features
      };
    } catch (error) {
      console.error('Subscription check error:', error);
      // Return default inactive status on error
      return {
        isActive: false,
        expiresAt: '',
        plan: 'free'
      };
    }
  },

  // Get available subscription plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscriptions/plans`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }
      const data = await response.json();
      
      // Transform backend response to match frontend interface
      return data.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        interval: plan.billing_period === 'yearly' ? 'yearly' : 'monthly',
        features: plan.features
      }));
    } catch (error) {
      console.error('Plans fetch error:', error);
      return [];
    }
  },

  // Subscribe to a plan
  async subscribe(planId: string): Promise<{ success: boolean; message: string; paymentUrl?: string }> {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ plan_id: planId }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Subscription error:', error);
      return { success: false, message: 'Subscription failed' };
    }
  },

  // Cache subscription status for offline use
  cacheSubscriptionStatus(status: SubscriptionStatus): void {
    localStorage.setItem('subscriptionStatus', JSON.stringify({
      ...status,
      cachedAt: Date.now()
    }));
  },

  // Get cached subscription status
  getCachedSubscriptionStatus(): SubscriptionStatus | null {
    try {
      const cached = localStorage.getItem('subscriptionStatus');
      if (cached) {
        const data = JSON.parse(cached);
        // Check if cache is less than 5 minutes old
        if (Date.now() - data.cachedAt < 5 * 60 * 1000) {
          return data;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }
};
