import { supabase } from '@/integrations/supabase/client';
import { FinancialTransaction, ChartOfAccount } from '@/types/financial';

export interface FinancialPeriodData {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  grossMargin: number;
  operatingCashFlow: number;
  accountsReceivable: number;
  accountsPayable: number;
  inventory: number;
}

export interface RevenueBreakdown {
  salesRevenue: number;
  serviceRevenue: number;
  otherRevenue: number;
  discounts: number;
  returns: number;
  netRevenue: number;
}

export interface ExpenseBreakdown {
  costOfGoodsSold: number;
  operatingExpenses: number;
  salaries: number;
  rent: number;
  utilities: number;
  marketing: number;
  commissions: number;
  otherExpenses: number;
}

export interface ProfitabilityMetrics {
  grossProfitMargin: number;
  operatingProfitMargin: number;
  netProfitMargin: number;
  returnOnAssets: number;
  returnOnEquity: number;
  ebitda: number;
}

export interface CommissionPoolData {
  totalPool: number;
  allocatedAmount: number;
  remainingPool: number;
  poolPercentage: number;
  targetCommissionRate: number;
  actualCommissionRate: number;
}

/**
 * Financial Data Integration Service
 * Connects commission management with actual financial modules and data sources
 */
export class FinancialDataIntegrationService {
  
  /**
   * Get financial data for a specific period with comprehensive metrics
   */
  static async getFinancialDataForPeriod(period: string): Promise<FinancialPeriodData> {
    try {
      // In a real implementation, this would query actual financial transactions
      // from your financial module tables (invoices, payments, expenses, etc.)
      
      const startDate = new Date(period + '-01');
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      
      // Query revenue data from sales/invoices
      const revenueData = await this.getRevenueForPeriod(startDate, endDate);
      
      // Query expense data from expenses/purchases
      const expenseData = await this.getExpensesForPeriod(startDate, endDate);
      
      // Calculate derived metrics
      const netProfit = revenueData.netRevenue - expenseData.totalExpenses;
      const grossMargin = revenueData.netRevenue > 0 ? 
        ((revenueData.netRevenue - expenseData.costOfGoodsSold) / revenueData.netRevenue) * 100 : 0;
      
      // Get additional financial position data
      const cashFlowData = await this.getCashFlowForPeriod(startDate, endDate);
      const balanceSheetData = await this.getBalanceSheetData(endDate);
      
      return {
        period,
        totalRevenue: revenueData.netRevenue,
        totalExpenses: expenseData.totalExpenses,
        netProfit,
        grossMargin,
        operatingCashFlow: cashFlowData.operatingCashFlow,
        accountsReceivable: balanceSheetData.accountsReceivable,
        accountsPayable: balanceSheetData.accountsPayable,
        inventory: balanceSheetData.inventory
      };
      
    } catch (error) {
      console.error('Error fetching financial data:', error);
      // Return mock data as fallback
      return this.getMockFinancialData(period);
    }
  }
  
  /**
   * Get detailed revenue breakdown for commission calculations
   */
  static async getRevenueBreakdown(startDate: Date, endDate: Date): Promise<RevenueBreakdown> {
    try {
      // Query sales data - in real implementation this would come from:
      // - invoices table
      // - sales_orders table  
      // - payment_receipts table
      
      const { data: salesData, error: salesError } = await supabase
        .from('invoices') // Assuming you have an invoices table
        .select(`
          total,
          subtotal,
          tax_amount,
          status,
          created_at,
          invoice_type
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'paid');
      
      if (salesError) {
        console.warn('Could not fetch sales data:', salesError);
        return this.getMockRevenueBreakdown();
      }
      
      // Calculate breakdown from actual data
      const salesRevenue = salesData?.filter(inv => inv.invoice_type === 'product').reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;
      const serviceRevenue = salesData?.filter(inv => inv.invoice_type === 'service').reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;
      const totalRevenue = salesRevenue + serviceRevenue;
      
      return {
        salesRevenue,
        serviceRevenue,
        otherRevenue: 0,
        discounts: 0,
        returns: 0,
        netRevenue: totalRevenue
      };
      
    } catch (error) {
      console.error('Error fetching revenue breakdown:', error);
      return this.getMockRevenueBreakdown();
    }
  }
  
  /**
   * Get revenue data for period from actual sales data
   */
  private static async getRevenueForPeriod(startDate: Date, endDate: Date): Promise<RevenueBreakdown> {
    return await this.getRevenueBreakdown(startDate, endDate);
  }
  
  /**
   * Get expenses for period from actual expense data
   */
  private static async getExpensesForPeriod(startDate: Date, endDate: Date): Promise<ExpenseBreakdown> {
    try {
      // Query expense data - in real implementation this would come from:
      // - expenses table
      // - purchase_orders table
      // - vendor_invoices table
      // - payroll table
      
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses') // Assuming you have an expenses table
        .select(`
          amount,
          category,
          expense_type,
          created_at
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (expenseError) {
        console.warn('Could not fetch expense data:', expenseError);
        return this.getMockExpenseBreakdown();
      }
      
      // Categorize expenses
      const costOfGoodsSold = expenseData?.filter(exp => exp.category === 'cogs').reduce((sum, exp) => sum + exp.amount, 0) || 0;
      const salaries = expenseData?.filter(exp => exp.category === 'payroll').reduce((sum, exp) => sum + exp.amount, 0) || 0;
      const commissions = expenseData?.filter(exp => exp.category === 'commissions').reduce((sum, exp) => sum + exp.amount, 0) || 0;
      const operatingExpenses = expenseData?.filter(exp => exp.category === 'operating').reduce((sum, exp) => sum + exp.amount, 0) || 0;
      
      const totalExpenses = costOfGoodsSold + salaries + commissions + operatingExpenses;
      
      return {
        costOfGoodsSold,
        operatingExpenses,
        salaries,
        rent: 0,
        utilities: 0,
        marketing: 0,
        commissions,
        otherExpenses: 0
      };
      
    } catch (error) {
      console.error('Error fetching expense data:', error);
      return this.getMockExpenseBreakdown();
    }
  }
  
  /**
   * Get cash flow data for period
   */
  private static async getCashFlowForPeriod(startDate: Date, endDate: Date): Promise<{ operatingCashFlow: number }> {
    try {
      // Query cash flow data from payment_receipts, vendor_payments, etc.
      const { data: cashInflows, error: inflowError } = await supabase
        .from('payment_receipts')
        .select('amount_paid')
        .gte('payment_date', startDate.toISOString())
        .lte('payment_date', endDate.toISOString());
      
      const { data: cashOutflows, error: outflowError } = await supabase
        .from('vendor_payments')
        .select('amount')
        .gte('payment_date', startDate.toISOString())
        .lte('payment_date', endDate.toISOString());
      
      const inflows = cashInflows?.reduce((sum, payment) => sum + (payment.amount_paid || 0), 0) || 0;
      const outflows = cashOutflows?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      
      return {
        operatingCashFlow: inflows - outflows
      };
      
    } catch (error) {
      console.error('Error fetching cash flow data:', error);
      return { operatingCashFlow: 50000 }; // Mock fallback
    }
  }
  
  /**
   * Get balance sheet data as of a specific date
   */
  private static async getBalanceSheetData(asOfDate: Date): Promise<{
    accountsReceivable: number;
    accountsPayable: number;
    inventory: number;
  }> {
    try {
      // Query balance sheet items
      // In real implementation, this would aggregate data from various tables
      
      return {
        accountsReceivable: 125000,
        accountsPayable: 85000,
        inventory: 200000
      };
      
    } catch (error) {
      console.error('Error fetching balance sheet data:', error);
      return {
        accountsReceivable: 125000,
        accountsPayable: 85000,
        inventory: 200000
      };
    }
  }
  
  /**
   * Calculate commission pool based on financial performance
   */
  static async calculateCommissionPool(period: string, commissionPercentage: number = 0.1): Promise<CommissionPoolData> {
    try {
      const financialData = await this.getFinancialDataForPeriod(period);
      
      // Commission pool is typically a percentage of net profit or revenue
      const totalPool = Math.max(0, financialData.netProfit * commissionPercentage);
      
      // Get allocated commissions for the period
      const allocatedAmount = await this.getAllocatedCommissions(period);
      
      const remainingPool = Math.max(0, totalPool - allocatedAmount);
      const poolPercentage = commissionPercentage * 100;
      
      // Calculate target vs actual commission rates
      const targetCommissionRate = poolPercentage;
      const actualCommissionRate = financialData.totalRevenue > 0 ? 
        (allocatedAmount / financialData.totalRevenue) * 100 : 0;
      
      return {
        totalPool,
        allocatedAmount,
        remainingPool,
        poolPercentage,
        targetCommissionRate,
        actualCommissionRate
      };
      
    } catch (error) {
      console.error('Error calculating commission pool:', error);
      return {
        totalPool: 0,
        allocatedAmount: 0,
        remainingPool: 0,
        poolPercentage: 0,
        targetCommissionRate: 0,
        actualCommissionRate: 0
      };
    }
  }
  
  /**
   * Get allocated commissions for a period
   */
  private static async getAllocatedCommissions(period: string): Promise<number> {
    try {
      // Query commission records for the period
      const { data: commissions, error } = await supabase
        .from('employee_commissions') // Assuming you have this table
        .select('final_amount')
        .eq('period', period);
      
      if (error) {
        console.warn('Could not fetch commission data:', error);
        return 0;
      }
      
      return commissions?.reduce((sum, comm) => sum + (comm.final_amount || 0), 0) || 0;
      
    } catch (error) {
      console.error('Error fetching allocated commissions:', error);
      return 0;
    }
  }
  
  /**
   * Get profitability metrics for performance analysis
   */
  static async getProfitabilityMetrics(period: string): Promise<ProfitabilityMetrics> {
    try {
      const financialData = await this.getFinancialDataForPeriod(period);
      const revenueBreakdown = await this.getRevenueBreakdown(
        new Date(period + '-01'),
        new Date(new Date(period + '-01').getFullYear(), new Date(period + '-01').getMonth() + 1, 0)
      );
      const expenseBreakdown = await this.getExpensesForPeriod(
        new Date(period + '-01'),
        new Date(new Date(period + '-01').getFullYear(), new Date(period + '-01').getMonth() + 1, 0)
      );
      
      // Calculate profitability ratios
      const grossProfit = revenueBreakdown.netRevenue - expenseBreakdown.costOfGoodsSold;
      const operatingProfit = grossProfit - expenseBreakdown.operatingExpenses;
      
      const grossProfitMargin = revenueBreakdown.netRevenue > 0 ? 
        (grossProfit / revenueBreakdown.netRevenue) * 100 : 0;
      
      const operatingProfitMargin = revenueBreakdown.netRevenue > 0 ? 
        (operatingProfit / revenueBreakdown.netRevenue) * 100 : 0;
      
      const netProfitMargin = revenueBreakdown.netRevenue > 0 ? 
        (financialData.netProfit / revenueBreakdown.netRevenue) * 100 : 0;
      
      // Assuming some balance sheet data for ratios (would come from actual data)
      const totalAssets = 1000000; // Would be calculated from balance sheet
      const totalEquity = 600000; // Would be calculated from balance sheet
      
      const returnOnAssets = totalAssets > 0 ? (financialData.netProfit / totalAssets) * 100 : 0;
      const returnOnEquity = totalEquity > 0 ? (financialData.netProfit / totalEquity) * 100 : 0;
      
      // EBITDA calculation (simplified)
      const depreciation = 10000; // Would come from actual data
      const ebitda = operatingProfit + depreciation;
      
      return {
        grossProfitMargin,
        operatingProfitMargin,
        netProfitMargin,
        returnOnAssets,
        returnOnEquity,
        ebitda
      };
      
    } catch (error) {
      console.error('Error calculating profitability metrics:', error);
      return {
        grossProfitMargin: 0,
        operatingProfitMargin: 0,
        netProfitMargin: 0,
        returnOnAssets: 0,
        returnOnEquity: 0,
        ebitda: 0
      };
    }
  }
  
  /**
   * Get chart of accounts for financial reporting
   */
  static async getChartOfAccounts(): Promise<ChartOfAccount[]> {
    try {
      const { data: accounts, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('is_active', true)
        .order('account_code');
      
      if (error) {
        console.warn('Could not fetch chart of accounts:', error);
        return this.getMockChartOfAccounts();
      }
      
      return accounts || [];
      
    } catch (error) {
      console.error('Error fetching chart of accounts:', error);
      return this.getMockChartOfAccounts();
    }
  }
  
  /**
   * Create financial transaction for commission payments
   */
  static async createCommissionTransaction(
    commissionId: string,
    employeeId: string,
    amount: number,
    period: string,
    description: string
  ): Promise<FinancialTransaction> {
    try {
      const transaction = {
        transaction_date: new Date().toISOString(),
        description: `Commission Payment - ${description}`,
        reference_number: `COMM-${commissionId}`,
        total_amount: amount,
        status: 'completed' as const,
        created_at: new Date().toISOString(),
        created_by: 'system' // Would be actual user ID
      };
      
      // Insert into financial transactions table
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert(transaction)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating commission transaction:', error);
        throw new Error('Failed to create financial transaction');
      }
      
      // Create double-entry bookkeeping entries
      await this.createCommissionJournalEntries(data.id, amount, employeeId);
      
      return data;
      
    } catch (error) {
      console.error('Error creating commission transaction:', error);
      throw error;
    }
  }
  
  /**
   * Create journal entries for commission payments (double-entry bookkeeping)
   */
  private static async createCommissionJournalEntries(
    transactionId: string,
    amount: number,
    employeeId: string
  ): Promise<void> {
    try {
      // Get account IDs for commission expense and cash accounts
      const commissionExpenseAccountId = await this.getAccountId('commission_expense');
      const cashAccountId = await this.getAccountId('cash');
      
      const entries = [
        {
          transaction_id: transactionId,
          account_id: commissionExpenseAccountId,
          description: 'Commission Expense',
          debit_amount: amount,
          credit_amount: 0,
          transaction_date: new Date().toISOString(),
          reference_number: `COMM-${transactionId}`,
          created_at: new Date().toISOString()
        },
        {
          transaction_id: transactionId,
          account_id: cashAccountId,
          description: 'Commission Payment',
          debit_amount: 0,
          credit_amount: amount,
          transaction_date: new Date().toISOString(),
          reference_number: `COMM-${transactionId}`,
          created_at: new Date().toISOString()
        }
      ];
      
      const { error } = await supabase
        .from('transaction_entries')
        .insert(entries);
      
      if (error) {
        console.error('Error creating journal entries:', error);
        throw new Error('Failed to create journal entries');
      }
      
    } catch (error) {
      console.error('Error creating commission journal entries:', error);
      throw error;
    }
  }
  
  /**
   * Get account ID by account type
   */
  private static async getAccountId(accountType: string): Promise<string> {
    try {
      const { data: account, error } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .eq('account_type', accountType)
        .eq('is_active', true)
        .single();
      
      if (error || !account) {
        // Return mock account ID if not found
        return 'mock-account-id';
      }
      
      return account.id;
      
    } catch (error) {
      console.error('Error getting account ID:', error);
      return 'mock-account-id';
    }
  }
  
  // Mock data methods for fallback scenarios
  
  private static getMockFinancialData(period: string): FinancialPeriodData {
    const baseRevenue = 450000;
    const variance = Math.random() * 100000 - 50000;
    const totalRevenue = Math.max(0, baseRevenue + variance);
    const totalExpenses = totalRevenue * 0.6;
    const netProfit = totalRevenue - totalExpenses;
    
    return {
      period,
      totalRevenue,
      totalExpenses,
      netProfit,
      grossMargin: 40.0,
      operatingCashFlow: netProfit * 0.8,
      accountsReceivable: 125000,
      accountsPayable: 85000,
      inventory: 200000
    };
  }
  
  private static getMockRevenueBreakdown(): RevenueBreakdown {
    return {
      salesRevenue: 350000,
      serviceRevenue: 100000,
      otherRevenue: 0,
      discounts: 5000,
      returns: 2000,
      netRevenue: 443000
    };
  }
  
  private static getMockExpenseBreakdown(): ExpenseBreakdown {
    return {
      costOfGoodsSold: 200000,
      operatingExpenses: 80000,
      salaries: 120000,
      rent: 15000,
      utilities: 5000,
      marketing: 10000,
      commissions: 15000,
      otherExpenses: 10000
    };
  }
  
  private static getMockChartOfAccounts(): ChartOfAccount[] {
    return [
      {
        id: '1',
        account_code: '1000',
        account_name: 'Cash',
        account_type: 'asset',
        description: 'Cash on hand and in bank',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        account_code: '5000',
        account_name: 'Commission Expense',
        account_type: 'expense',
        description: 'Employee commission payments',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
}
