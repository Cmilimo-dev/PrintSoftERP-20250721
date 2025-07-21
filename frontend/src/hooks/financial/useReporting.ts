
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AccountsReceivableAging, CurrencyRate } from '@/types/financial';

export const useAccountsReceivableAging = () => {
  return useQuery({
    queryKey: ['accounts_receivable_aging'],
    queryFn: async () => {
      // Mock comprehensive aging data for demonstration
      const mockData: AccountsReceivableAging[] = [
        {
          customer_id: '1',
          customer_name: 'Acme Corporation Ltd.',
          current: 45000,
          days_30: 12000,
          days_60: 8500,
          days_90: 3200,
          over_90: 1500,
          total: 70200
        },
        {
          customer_id: '2',
          customer_name: 'Global Tech Solutions',
          current: 28000,
          days_30: 15000,
          days_60: 0,
          days_90: 0,
          over_90: 0,
          total: 43000
        },
        {
          customer_id: '3',
          customer_name: 'Premier Manufacturing Inc.',
          current: 0,
          days_30: 18500,
          days_60: 25000,
          days_90: 12000,
          over_90: 8500,
          total: 64000
        },
        {
          customer_id: '4',
          customer_name: 'Innovative Designs Co.',
          current: 22000,
          days_30: 0,
          days_60: 0,
          days_90: 0,
          over_90: 0,
          total: 22000
        },
        {
          customer_id: '5',
          customer_name: 'Strategic Consulting Group',
          current: 15000,
          days_30: 8000,
          days_60: 4500,
          days_90: 0,
          over_90: 0,
          total: 27500
        },
        {
          customer_id: '6',
          customer_name: 'Metro Business Services',
          current: 0,
          days_30: 0,
          days_60: 0,
          days_90: 5500,
          over_90: 12000,
          total: 17500
        },
        {
          customer_id: '7',
          customer_name: 'Pacific Trading Company',
          current: 35000,
          days_30: 7500,
          days_60: 2000,
          days_90: 0,
          over_90: 0,
          total: 44500
        },
        {
          customer_id: '8',
          customer_name: 'Excellence Marketing Ltd.',
          current: 18500,
          days_30: 12000,
          days_60: 9500,
          days_90: 6000,
          over_90: 2500,
          total: 48500
        }
      ];
      return mockData;
    },
  });
};

export const useCurrencyRates = () => {
  return useQuery({
    queryKey: ['currency_rates'],
    queryFn: async () => {
      // Mock currency rates data since the table structure needs to be clarified
      const mockRates: CurrencyRate[] = [
        {
          id: '1',
          base_currency: 'USD',
          target_currency: 'KES',
          rate: 150.25,
          effective_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          base_currency: 'EUR',
          target_currency: 'KES',
          rate: 165.80,
          effective_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      return mockRates;
    },
  });
};
