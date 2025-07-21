
export interface FinancialTransaction {
  id: string;
  transaction_date: string;
  description: string;
  reference_number: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  created_by?: string;
  transaction_entries?: TransactionEntry[];
}

export interface TransactionEntry {
  id: string;
  transaction_id: string;
  account_id: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  transaction_date: string;
  reference_number: string;
  created_at: string;
  chart_of_accounts?: {
    account_code: string;
    account_name: string;
  };
}

export interface ChartOfAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  description?: string;
  parent_account_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AccountsReceivableAging {
  customer_id: string;
  customer_name: string;
  current: number;
  days_30: number;
  days_60: number;
  days_90: number;
  over_90: number;
  total: number;
}

export interface AgingReport {
  customer_id: string;
  customer_name: string;
  current: number;
  days_30: number;
  days_60: number;
  days_90: number;
  over_90: number;
  total: number;
}

export interface CurrencyRate {
  id: string;
  base_currency: string;
  target_currency: string;
  rate: number;
  effective_date: string;
  created_at: string;
  updated_at: string;
}
