import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { subscriptionService, SubscriptionStatus } from '../services/subscriptionService';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionContextType {
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
  isFeatureAvailable: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();

  const refreshSubscription = async () => {
    // Only fetch if user is authenticated
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Try to get cached status first
      const cached = subscriptionService.getCachedSubscriptionStatus();
      if (cached) {
        setSubscription(cached);
      }

      // Then fetch fresh data
      const status = await subscriptionService.checkSubscription();
      setSubscription(status);
      subscriptionService.cacheSubscriptionStatus(status);
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
      // Try to use cached data if available
      const cached = subscriptionService.getCachedSubscriptionStatus();
      if (cached) {
        setSubscription(cached);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFeatureAvailable = (feature: string): boolean => {
    if (!subscription) return false;
    if (!subscription.isActive) return false;
    
    // Define feature access based on plans
    const planFeatures: Record<string, string[]> = {
      free: ['basic_invoicing', 'basic_reports'],
      starter: ['basic_invoicing', 'basic_reports', 'inventory_management'],
      professional: ['basic_invoicing', 'basic_reports', 'inventory_management', 'advanced_reports', 'multi_user'],
      enterprise: ['basic_invoicing', 'basic_reports', 'inventory_management', 'advanced_reports', 'multi_user', 'api_access', 'custom_fields']
    };

    const features = planFeatures[subscription.plan] || [];
    return features.includes(feature);
  };

  useEffect(() => {
    // Only refresh subscription when auth loading is done
    if (!authLoading) {
      refreshSubscription();
    }
  }, [user, authLoading]);

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    refreshSubscription,
    isFeatureAvailable,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
