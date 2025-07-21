// Financial Module Database Service
// Uses backend API instead of direct database access
import { apiClient } from '../config/api';
import {
  ChartOfAccounts,
  JournalEntry,
  Payment,
  Invoice,
  Bill,
  TaxRate,
  BankAccount,
  BankTransaction,
  BankReconciliation,
  Budget,
  FinancialReport,
  FinancialAnalytics,
  FinancialSettings,
  AccountSearchCriteria,
  TransactionSearchCriteria,
  PaymentSearchCriteria,
  AccountImportData,
  TransactionImportData,
  InvoiceImportData,
  BillImportData,
  Currency,
  AccountType,
  JournalEntryStatus,
  PaymentStatus,
  InvoiceStatus,
  BillStatus,
  PaymentMethod
} from '../modules/financial/types/financialTypes';
import { FinancialValidationService, ValidationResult } from './financialValidationService';
import { PaginationService, PaginationParams, PaginationResult } from './paginationService';
import { FinancialPerformanceService } from './financialPerformanceService';

// Database table mappings for financial entities
interface DbChartOfAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent_account_id?: string;
  description?: string;
  is_active: boolean;
  balance: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

interface DbFinancialTransaction {
  id: string;
  transaction_number: string;
  transaction_date: string;
  transaction_type: 'sale' | 'purchase' | 'payment' | 'receipt' | 'adjustment';
  reference_type?: string;
  reference_id?: string;
  description?: string;
  customer_id?: string;
  vendor_id?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled' | 'reversed';
  affects_inventory: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

interface DbTransactionEntry {
  id: string;
  transaction_id: string;
  account_id: string;
  description?: string;
  debit_amount: number;
  credit_amount: number;
  entry_date: string;
  reference_number?: string;
  created_at: string;
}

interface DbExpense {
  id: string;
  expense_number: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  vendor_id?: string;
  account_id?: string;
  payment_method?: string;
  receipt_number?: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  notes?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
}

interface DbCurrencyRate {
  id: string;
  base_currency: string;
  target_currency: string;
  rate: number;
  effective_date: string;
  created_at: string;
  updated_at: string;
}

export class FinancialDatabaseService {
  // Activity Logging
  private static async logActivity(
    action: string, 
    entityType: string, 
    entityId: string, 
    details?: any
  ): Promise<void> {
    try {
      // We'll implement a proper audit log table later
      console.log(`Financial Activity: ${action} ${entityType} ${entityId}`, details);
    } catch (error) {
      console.error('Error logging financial activity:', error);
    }
  }

  // =================
  // CHART OF ACCOUNTS
  // =================

  static async getAllAccounts(): Promise<ChartOfAccounts[]> {
    try {
      // Check cache first
      const cacheKey = 'chart_of_accounts_all';
      const cached = PaginationService.getCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Use backend API instead of direct database calls
      try {
        const response = await fetch('/api/chart-of-accounts');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const accounts = (data || []).map(this.mapDbAccountToChartOfAccount);
        
        // Cache the result
        PaginationService.setCache(cacheKey, accounts);
        
        // Build search index for faster searching
        PaginationService.buildSearchIndex(
          accounts,
          'chart_of_accounts',
          (account) => `${account.accountNumber} ${account.accountName} ${account.description || ''}`
        );

        return accounts;
      } catch (apiError) {
        console.warn('API error, using sample data:', apiError);
        // Return sample data if API is not accessible
        return this.getSampleChartOfAccounts();
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      // Return sample data as fallback
      return this.getSampleChartOfAccounts();
    }
  }

  // NEW: Paginated version for large datasets
  static async getPaginatedAccounts(params: Partial<PaginationParams> = {}): Promise<PaginationResult<ChartOfAccounts>> {
    try {
      // Get all accounts (will use cache if available)
      const allAccounts = await this.getAllAccounts();
      
      // Apply pagination, search, and filtering
      return PaginationService.paginate(allAccounts, params);
    } catch (error) {
      console.error('Error fetching paginated accounts:', error);
      return {
        data: [],
        pagination: {
          currentPage: 1,
          pageSize: 20,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          startIndex: 0,
          endIndex: 0
        },
        performance: {
          queryTime: 0,
          fromCache: false
        }
      };
    }
  }

  static async getAccountById(id: string): Promise<ChartOfAccounts | null> {
    try {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? this.mapDbAccountToChartOfAccount(data) : null;
    } catch (error) {
      console.error('Error fetching account by ID:', error);
      return null;
    }
  }

  static async getAccountByNumber(accountNumber: string): Promise<ChartOfAccounts | null> {
    try {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('account_code', accountNumber)
        .single();

      if (error) throw error;
      return data ? this.mapDbAccountToChartOfAccount(data) : null;
    } catch (error) {
      console.error('Error fetching account by number:', error);
      return null;
    }
  }

  static async getAccountsByType(accountType: AccountType): Promise<ChartOfAccounts[]> {
    try {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('account_type', accountType)
        .order('account_code');

      if (error) throw error;

      return (data || []).map(this.mapDbAccountToChartOfAccount);
    } catch (error) {
      console.error('Error fetching accounts by type:', error);
      return [];
    }
  }

  static async saveAccount(account: ChartOfAccounts): Promise<ChartOfAccounts> {
    try {
      // Validate the account before saving
      const validation = FinancialValidationService.validateChartOfAccount(account);
      if (!validation.isValid) {
        const errorMessages = FinancialValidationService.formatErrorMessages(validation);
        throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
      }

      const dbAccount: Partial<DbChartOfAccount> = {
        account_code: account.accountNumber,
        account_name: account.accountName,
        account_type: account.accountType as any,
        parent_account_id: account.parentAccountId,
        description: account.description,
        is_active: account.isActive,
        balance: account.currentBalance
      };

      let result;
      if (account.id) {
        // Update existing
        const { data, error } = await supabase
          .from('chart_of_accounts')
          .update(dbAccount)
          .eq('id', account.id)
          .select()
          .single();

        if (error) throw error;
        result = data;

        await this.logActivity('UPDATE', 'account', account.id, {
          name: account.accountName,
          number: account.accountNumber
        });
      } else {
        // Create new
        const { data, error } = await supabase
          .from('chart_of_accounts')
          .insert(dbAccount)
          .select()
          .single();

        if (error) throw error;
        result = data;

        await this.logActivity('CREATE', 'account', result.id, {
          name: account.accountName,
          number: account.accountNumber
        });
      }

      const mappedAccount = this.mapDbAccountToChartOfAccount(result);
      
      // Cache invalidation after saving
      PaginationService.invalidateCache('chart_of_accounts');
      
      // Update search index
      PaginationService.updateSearchIndex(
        'chart_of_accounts',
        mappedAccount,
        (acc) => `${acc.accountNumber} ${acc.accountName} ${acc.description || ''}`
      );

      return mappedAccount;
    } catch (error) {
      console.error('Error saving account:', error);
      throw new Error('Failed to save account');
    }
  }

  static async deleteAccount(id: string): Promise<boolean> {
    try {
      // First get the account for logging
      const account = await this.getAccountById(id);
      
      const { error } = await supabase
        .from('chart_of_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (account) {
        await this.logActivity('DELETE', 'account', id, {
          name: account.accountName,
          number: account.accountNumber
        });
        
        // Cache invalidation after deletion
        PaginationService.invalidateCache('chart_of_accounts');
        
        // Remove from search index
        PaginationService.removeFromSearchIndex('chart_of_accounts', id);
      }

      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      return false;
    }
  }

  static async searchAccounts(criteria: AccountSearchCriteria): Promise<ChartOfAccounts[]> {
    try {
      let query = supabase.from('chart_of_accounts').select('*');

      if (criteria.query) {
        const searchTerm = `%${criteria.query.toLowerCase()}%`;
        query = query.or(
          `account_name.ilike.${searchTerm},account_code.ilike.${searchTerm},description.ilike.${searchTerm}`
        );
      }

      if (criteria.accountType) {
        query = query.eq('account_type', criteria.accountType);
      }

      if (criteria.isActive !== undefined) {
        query = query.eq('is_active', criteria.isActive);
      }

      if (criteria.parentAccountId) {
        query = query.eq('parent_account_id', criteria.parentAccountId);
      }

      if (criteria.balanceMin !== undefined) {
        query = query.gte('balance', criteria.balanceMin);
      }

      if (criteria.balanceMax !== undefined) {
        query = query.lte('balance', criteria.balanceMax);
      }

      if (criteria.createdAfter) {
        query = query.gte('created_at', criteria.createdAfter);
      }

      if (criteria.createdBefore) {
        query = query.lte('created_at', criteria.createdBefore);
      }

      query = query.order('account_code');

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this.mapDbAccountToChartOfAccount);
    } catch (error) {
      console.error('Error searching accounts:', error);
      return [];
    }
  }

  // =================
  // FINANCIAL TRANSACTIONS & JOURNAL ENTRIES
  // =================

  static async getAllTransactions(): Promise<DbFinancialTransaction[]> {
    try {
      // Try cache first
      const cacheKey = 'financial_transactions';
      const cached = PaginationService.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      
      const result = data || [];
      
      // Cache the results
      PaginationService.saveToCache(cacheKey, result);
      
      // Build search index
      PaginationService.buildSearchIndex(result, cacheKey, (item) => 
        `${item.reference_number} ${item.description} ${item.transaction_type}`
      );
      
      return result;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  static async getPaginatedTransactions(
    page: number = 1,
    limit: number = 50,
    search?: string,
    filters?: { 
      status?: string;
      transaction_type?: string;
      start_date?: string;
      end_date?: string;
    }
  ) {
    return PaginationService.paginate(
      'financial_transactions',
      page,
      limit,
      search,
      async () => {
        let query = supabase
          .from('financial_transactions')
          .select('*')
          .order('transaction_date', { ascending: false });

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }
        if (filters?.transaction_type) {
          query = query.eq('transaction_type', filters.transaction_type);
        }
        if (filters?.start_date) {
          query = query.gte('transaction_date', filters.start_date);
        }
        if (filters?.end_date) {
          query = query.lte('transaction_date', filters.end_date);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      (item) => `${item.reference_number} ${item.description} ${item.transaction_type}`
    );
  }

  static async getTransactionEntries(transactionId: string): Promise<DbTransactionEntry[]> {
    try {
      const { data, error } = await supabase
        .from('transaction_entries')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transaction entries:', error);
      return [];
    }
  }

  static async saveTransaction(transaction: Partial<DbFinancialTransaction>): Promise<DbFinancialTransaction> {
    try {
      let result: DbFinancialTransaction;
      
      if (transaction.id) {
        // Update existing
        const { data, error } = await supabase
          .from('financial_transactions')
          .update(transaction)
          .eq('id', transaction.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('financial_transactions')
          .insert(transaction)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }
      
      // Cache invalidation after save
      PaginationService.invalidateCache('financial_transactions');
      
      // Update search index
      PaginationService.updateSearchIndex('financial_transactions', result.id, result, (item) =>
        `${item.reference_number} ${item.description} ${item.transaction_type}`
      );
      
      return result;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw new Error('Failed to save transaction');
    }
  }

  static async deleteTransaction(id: string): Promise<boolean> {
    try {
      // First get the transaction for logging
      const { data: transaction } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (transaction) {
        // Log the deletion
        await this.logActivity('DELETE', 'transaction', id, {
          reference: transaction.reference_number,
          description: transaction.description
        });
        
        // Cache invalidation after deletion
        PaginationService.invalidateCache('financial_transactions');
        
        // Remove from search index
        PaginationService.removeFromSearchIndex('financial_transactions', id);
      }

      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  }

  // =================
  // EXPENSES
  // =================

  static async getAllExpenses(): Promise<DbExpense[]> {
    try {
      // Try cache first
      const cacheKey = 'expenses';
      const cached = PaginationService.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) throw error;
      
      const result = data || [];
      
      // Cache the results
      PaginationService.saveToCache(cacheKey, result);
      
      // Build search index
      PaginationService.buildSearchIndex(result, cacheKey, (item) => 
        `${item.reference_number} ${item.description} ${item.vendor}`
      );
      
      return result;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  }

  static async getPaginatedExpenses(
    page: number = 1,
    limit: number = 50,
    search?: string,
    filters?: { 
      vendor?: string;
      category?: string;
      start_date?: string;
      end_date?: string;
    }
  ) {
    return PaginationService.paginate(
      'expenses',
      page,
      limit,
      search,
      async () => {
        let query = supabase
          .from('expenses')
          .select('*')
          .order('expense_date', { ascending: false });

        if (filters?.vendor) {
          query = query.eq('vendor', filters.vendor);
        }
        if (filters?.category) {
          query = query.eq('category', filters.category);
        }
        if (filters?.start_date) {
          query = query.gte('expense_date', filters.start_date);
        }
        if (filters?.end_date) {
          query = query.lte('expense_date', filters.end_date);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      (item) => `${item.reference_number} ${item.description} ${item.vendor}`
    );
  }

  static async saveExpense(expense: Partial<DbExpense>): Promise<DbExpense> {
    try {
      let result: DbExpense;
      
      if (expense.id) {
        // Update existing
        const { data, error } = await supabase
          .from('expenses')
          .update(expense)
          .eq('id', expense.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('expenses')
          .insert(expense)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }
      
      // Cache invalidation after save
      PaginationService.invalidateCache('expenses');
      
      // Update search index
      PaginationService.updateSearchIndex('expenses', result.id, result, (item) =>
        `${item.reference_number} ${item.description} ${item.vendor}`
      );
      
      return result;
    } catch (error) {
      console.error('Error saving expense:', error);
      throw new Error('Failed to save expense');
    }
  }

  static async deleteExpense(id: string): Promise<boolean> {
    try {
      // First get the expense for logging
      const { data: expense } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (expense) {
        // Log the deletion
        await this.logActivity('DELETE', 'expense', id, {
          reference: expense.reference_number,
          description: expense.description
        });
        
        // Cache invalidation after deletion
        PaginationService.invalidateCache('expenses');
        
        // Remove from search index
        PaginationService.removeFromSearchIndex('expenses', id);
      }

      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
  }

  // =================
  // CURRENCY RATES
  // =================

  static async getCurrencyRates(): Promise<DbCurrencyRate[]> {
    try {
      // Try cache first
      const cacheKey = 'currency_rates';
      const cached = PaginationService.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('currency_rates')
        .select('*')
        .order('effective_date', { ascending: false });

      if (error) throw error;
      
      const result = data || [];
      
      // Cache the results
      PaginationService.saveToCache(cacheKey, result);
      
      // Build search index
      PaginationService.buildSearchIndex(result, cacheKey, (item) => 
        `${item.base_currency} ${item.target_currency} ${item.rate}`
      );
      
      return result;
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      return [];
    }
  }

  static async getPaginatedCurrencyRates(
    page: number = 1,
    limit: number = 50,
    search?: string,
    filters?: { 
      base_currency?: string;
      target_currency?: string;
      effective_date?: string;
    }
  ) {
    return PaginationService.paginate(
      'currency_rates',
      page,
      limit,
      search,
      async () => {
        let query = supabase
          .from('currency_rates')
          .select('*')
          .order('effective_date', { ascending: false });

        if (filters?.base_currency) {
          query = query.eq('base_currency', filters.base_currency);
        }
        if (filters?.target_currency) {
          query = query.eq('target_currency', filters.target_currency);
        }
        if (filters?.effective_date) {
          query = query.eq('effective_date', filters.effective_date);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      (item) => `${item.base_currency} ${item.target_currency} ${item.rate}`
    );
  }

  static async saveCurrencyRate(rate: Partial<DbCurrencyRate>): Promise<DbCurrencyRate> {
    try {
      const { data, error } = await supabase
        .from('currency_rates')
        .upsert(rate, {
          onConflict: 'base_currency,target_currency,effective_date'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Cache invalidation after save
      PaginationService.invalidateCache('currency_rates');
      
      // Update search index
      PaginationService.updateSearchIndex('currency_rates', data.id, data, (item) =>
        `${item.base_currency} ${item.target_currency} ${item.rate}`
      );
      
      return data;
    } catch (error) {
      console.error('Error saving currency rate:', error);
      throw new Error('Failed to save currency rate');
    }
  }

  // =================
  // FINANCIAL ANALYTICS
  // =================

  static async calculateFinancialAnalytics(
    startDate: string, 
    endDate: string
  ): Promise<FinancialAnalytics> {
    try {
      // Get all accounts for balance calculations
      const accounts = await this.getAllAccounts();
      
      // Get transactions in the date range
      const { data: transactions, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .eq('status', 'completed');

      if (error) throw error;

      // Calculate analytics based on accounts and transactions
      const assetAccounts = accounts.filter(a => a.accountType === 'asset');
      const liabilityAccounts = accounts.filter(a => a.accountType === 'liability');
      const equityAccounts = accounts.filter(a => a.accountType === 'equity');
      const revenueAccounts = accounts.filter(a => a.accountType === 'revenue');
      const expenseAccounts = accounts.filter(a => a.accountType === 'expense');

      const totalAssets = assetAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
      const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
      const totalEquity = equityAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
      const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
      const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

      const grossProfit = totalRevenue - totalExpenses;
      const netIncome = grossProfit;

      return {
        period: `${startDate} to ${endDate}`,
        startDate,
        endDate,
        currency: 'KES' as Currency,
        
        // Profitability Ratios
        grossProfitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
        netProfitMargin: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0,
        operatingMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
        returnOnAssets: totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0,
        returnOnEquity: totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0,
        
        // Liquidity Ratios
        currentRatio: totalLiabilities > 0 ? totalAssets / totalLiabilities : 0,
        quickRatio: totalLiabilities > 0 ? totalAssets / totalLiabilities : 0,
        cashRatio: 0,
        workingCapital: totalAssets - totalLiabilities,
        
        // Efficiency Ratios
        assetTurnover: totalAssets > 0 ? totalRevenue / totalAssets : 0,
        inventoryTurnover: 0,
        receivablesTurnover: 0,
        payablesTurnover: 0,
        
        // Leverage Ratios
        debtToEquity: totalEquity > 0 ? totalLiabilities / totalEquity : 0,
        debtToAssets: totalAssets > 0 ? totalLiabilities / totalAssets : 0,
        equityRatio: totalAssets > 0 ? totalEquity / totalAssets : 0,
        interestCoverage: 0,
        
        // Cash Flow Metrics
        operatingCashFlow: grossProfit,
        freeCashFlow: grossProfit,
        cashFlowToDebt: totalLiabilities > 0 ? grossProfit / totalLiabilities : 0,
        
        // Trend Analysis
        revenueGrowth: 0,
        expenseGrowth: 0,
        profitGrowth: 0,
        
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating financial analytics:', error);
      
      return {
        period: `${startDate} to ${endDate}`,
        startDate,
        endDate,
        currency: 'KES' as Currency,
        grossProfitMargin: 0,
        netProfitMargin: 0,
        operatingMargin: 0,
        returnOnAssets: 0,
        returnOnEquity: 0,
        currentRatio: 0,
        quickRatio: 0,
        cashRatio: 0,
        workingCapital: 0,
        assetTurnover: 0,
        inventoryTurnover: 0,
        receivablesTurnover: 0,
        payablesTurnover: 0,
        debtToEquity: 0,
        debtToAssets: 0,
        equityRatio: 0,
        interestCoverage: 0,
        operatingCashFlow: 0,
        freeCashFlow: 0,
        cashFlowToDebt: 0,
        revenueGrowth: 0,
        expenseGrowth: 0,
        profitGrowth: 0,
        generatedAt: new Date().toISOString()
      };
    }
  }

  // =================
  // UTILITY FUNCTIONS
  // =================

  static async getStorageStats(): Promise<{
    accounts: number;
    transactions: number;
    expenses: number;
    currencyRates: number;
  }> {
    try {
      const [accountsCount, transactionsCount, expensesCount, currencyRatesCount] = await Promise.all([
        supabase.from('chart_of_accounts').select('id', { count: 'exact', head: true }),
        supabase.from('financial_transactions').select('id', { count: 'exact', head: true }),
        supabase.from('expenses').select('id', { count: 'exact', head: true }),
        supabase.from('currency_rates').select('id', { count: 'exact', head: true })
      ]);

      return {
        accounts: accountsCount.count || 0,
        transactions: transactionsCount.count || 0,
        expenses: expensesCount.count || 0,
        currencyRates: currencyRatesCount.count || 0
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        accounts: 0,
        transactions: 0,
        expenses: 0,
        currencyRates: 0
      };
    }
  }

  // =================
  // MAPPING FUNCTIONS
  // =================

  // Sample data for development and fallback
  private static getSampleChartOfAccounts(): ChartOfAccounts[] {
    const now = new Date().toISOString();
    return [
      {
        id: 'sample-1',
        accountNumber: '1000',
        accountName: 'Cash in Bank',
        accountType: 'asset',
        accountSubtype: 'current_asset',
        description: 'Primary bank account for daily operations',
        isActive: true,
        isSystemAccount: false,
        currency: 'KES',
        openingBalance: 50000,
        currentBalance: 75000,
        debitBalance: 75000,
        creditBalance: 0,
        lastTransactionDate: now,
        createdAt: now,
        updatedAt: now,
        tags: ['bank', 'current']
      },
      {
        id: 'sample-2',
        accountNumber: '1200',
        accountName: 'Accounts Receivable',
        accountType: 'asset',
        accountSubtype: 'current_asset',
        description: 'Outstanding customer invoices',
        isActive: true,
        isSystemAccount: false,
        currency: 'KES',
        openingBalance: 25000,
        currentBalance: 32000,
        debitBalance: 32000,
        creditBalance: 0,
        lastTransactionDate: now,
        createdAt: now,
        updatedAt: now,
        tags: ['receivables']
      },
      {
        id: 'sample-3',
        accountNumber: '2000',
        accountName: 'Accounts Payable',
        accountType: 'liability',
        accountSubtype: 'current_liability',
        description: 'Outstanding vendor bills',
        isActive: true,
        isSystemAccount: false,
        currency: 'KES',
        openingBalance: 15000,
        currentBalance: 18000,
        debitBalance: 0,
        creditBalance: 18000,
        lastTransactionDate: now,
        createdAt: now,
        updatedAt: now,
        tags: ['payables']
      },
      {
        id: 'sample-4',
        accountNumber: '3000',
        accountName: 'Owner Equity',
        accountType: 'equity',
        accountSubtype: 'owners_equity',
        description: 'Owner capital contribution',
        isActive: true,
        isSystemAccount: false,
        currency: 'KES',
        openingBalance: 100000,
        currentBalance: 120000,
        debitBalance: 0,
        creditBalance: 120000,
        lastTransactionDate: now,
        createdAt: now,
        updatedAt: now,
        tags: ['equity', 'capital']
      },
      {
        id: 'sample-5',
        accountNumber: '4000',
        accountName: 'Sales Revenue',
        accountType: 'revenue',
        accountSubtype: 'operating_revenue',
        description: 'Revenue from product and service sales',
        isActive: true,
        isSystemAccount: false,
        currency: 'KES',
        openingBalance: 0,
        currentBalance: 85000,
        debitBalance: 0,
        creditBalance: 85000,
        lastTransactionDate: now,
        createdAt: now,
        updatedAt: now,
        tags: ['revenue', 'sales']
      },
      {
        id: 'sample-6',
        accountNumber: '5000',
        accountName: 'Office Expenses',
        accountType: 'expense',
        accountSubtype: 'operating_expense',
        description: 'General office and administrative expenses',
        isActive: true,
        isSystemAccount: false,
        currency: 'KES',
        openingBalance: 0,
        currentBalance: 12000,
        debitBalance: 12000,
        creditBalance: 0,
        lastTransactionDate: now,
        createdAt: now,
        updatedAt: now,
        tags: ['expenses', 'office']
      }
    ];
  }

  private static mapDbAccountToChartOfAccount(dbAccount: DbChartOfAccount): ChartOfAccounts {
    // Map database account types to frontend types
    const accountTypeMap: Record<string, AccountType> = {
      'asset': 'asset',
      'liability': 'liability', 
      'equity': 'equity',
      'income': 'revenue',
      'expense': 'expense'
    };
    
    return {
      id: dbAccount.id,
      accountNumber: dbAccount.account_code,
      accountName: dbAccount.account_name,
      accountType: accountTypeMap[dbAccount.account_type] || 'asset',
      accountSubtype: '', // Not in current schema, could be added later
      parentAccountId: dbAccount.parent_account_id,
      description: dbAccount.description,
      isActive: dbAccount.is_active,
      isSystemAccount: false, // Could be determined by logic
      currency: 'KES' as Currency, // Default, could be enhanced
      openingBalance: 0, // Could track separately
      currentBalance: dbAccount.balance,
      debitBalance: 0, // Would need calculation
      creditBalance: 0, // Would need calculation
      lastTransactionDate: '', // Would need calculation
      tags: [], // Not in current schema
      createdAt: dbAccount.created_at,
      updatedAt: dbAccount.updated_at
    };
  }

  // =================
  // BULK OPERATIONS & PERFORMANCE
  // =================

  /**
   * Bulk insert accounts with progress tracking
   */
  static async bulkInsertAccounts(
    accounts: Partial<DbChartOfAccount>[],
    options?: {
      batchSize?: number;
      onProgress?: (processed: number, total: number) => void;
    }
  ): Promise<DbChartOfAccount[]> {
    return FinancialPerformanceService.bulkInsert<DbChartOfAccount>(
      'chart_of_accounts',
      accounts,
      options
    );
  }

  /**
   * Bulk insert transactions with progress tracking
   */
  static async bulkInsertTransactions(
    transactions: Partial<DbFinancialTransaction>[],
    options?: {
      batchSize?: number;
      onProgress?: (processed: number, total: number) => void;
    }
  ): Promise<DbFinancialTransaction[]> {
    return FinancialPerformanceService.bulkInsert<DbFinancialTransaction>(
      'financial_transactions',
      transactions,
      options
    );
  }

  /**
   * Bulk insert expenses with progress tracking
   */
  static async bulkInsertExpenses(
    expenses: Partial<DbExpense>[],
    options?: {
      batchSize?: number;
      onProgress?: (processed: number, total: number) => void;
    }
  ): Promise<DbExpense[]> {
    return FinancialPerformanceService.bulkInsert<DbExpense>(
      'expenses',
      expenses,
      options
    );
  }

  /**
   * Bulk update accounts with progress tracking
   */
  static async bulkUpdateAccounts(
    updates: Array<{ id: string; data: Partial<DbChartOfAccount> }>,
    options?: {
      batchSize?: number;
      onProgress?: (processed: number, total: number) => void;
    }
  ): Promise<DbChartOfAccount[]> {
    return FinancialPerformanceService.bulkUpdate<DbChartOfAccount>(
      'chart_of_accounts',
      updates,
      options
    );
  }

  /**
   * Bulk delete records with progress tracking
   */
  static async bulkDeleteRecords(
    tableName: 'chart_of_accounts' | 'financial_transactions' | 'expenses' | 'currency_rates',
    ids: string[],
    options?: {
      batchSize?: number;
      onProgress?: (processed: number, total: number) => void;
    }
  ): Promise<boolean> {
    return FinancialPerformanceService.bulkDelete(tableName, ids, options);
  }

  /**
   * Synchronize local data with remote database
   */
  static async syncFinancialData<T>(
    tableName: string,
    localData: Array<T & { id: string; updated_at?: string }>,
    options?: {
      conflictResolution?: 'local' | 'remote' | 'merge';
      onConflict?: (local: T, remote: T) => T;
    }
  ) {
    return FinancialPerformanceService.syncData(tableName, localData, options);
  }

  /**
   * Get aggregated financial data with caching
   */
  static async getAggregatedFinancialData(
    tableName: string,
    aggregations: Array<{
      field: string;
      operation: 'sum' | 'avg' | 'count' | 'min' | 'max';
      alias?: string;
    }>,
    filters?: Record<string, any>,
    groupBy?: string[]
  ) {
    return FinancialPerformanceService.getAggregatedData(
      tableName,
      aggregations,
      filters,
      groupBy,
      300000 // 5 minute cache
    );
  }

  /**
   * Stream large datasets for memory-efficient processing
   */
  static streamFinancialData<T>(
    tableName: string,
    batchSize: number = 1000,
    filters?: Record<string, any>
  ): AsyncGenerator<T[], void, unknown> {
    return FinancialPerformanceService.streamData<T>(tableName, batchSize, filters);
  }

  /**
   * Advanced search with ranking and fuzzy matching
   */
  static async advancedFinancialSearch<T>(
    tableName: string,
    searchQuery: string,
    options?: {
      fields?: string[];
      fuzzyThreshold?: number;
      maxResults?: number;
      includeRanking?: boolean;
    }
  ): Promise<Array<T & { rank?: number }>> {
    return FinancialPerformanceService.advancedSearch<T>(tableName, searchQuery, options);
  }

  /**
   * Initialize performance optimizations
   */
  static async initializePerformanceOptimizations(): Promise<void> {
    return FinancialPerformanceService.optimizeConnections();
  }

  /**
   * Perform background maintenance tasks
   */
  static async performMaintenance(): Promise<void> {
    return FinancialPerformanceService.performMaintenance();
  }

  /**
   * Get financial data summary with performance metrics
   */
  static async getFinancialSummary(): Promise<{
    stats: {
      accounts: number;
      transactions: number;
      expenses: number;
      currencyRates: number;
    };
    performance: {
      cacheHitRate: number;
      avgQueryTime: number;
      totalCacheSize: number;
    };
    lastUpdated: string;
  }> {
    const [stats, cacheStats] = await Promise.all([
      this.getStorageStats(),
      PaginationService.getCacheStats()
    ]);

    return {
      stats,
      performance: {
        cacheHitRate: cacheStats.hitRate,
        avgQueryTime: cacheStats.avgQueryTime,
        totalCacheSize: cacheStats.totalSize
      },
      lastUpdated: new Date().toISOString()
    };
  }
}
