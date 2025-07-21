import { supabase } from '../integrations/supabase/client';
import { FinancialDatabaseService } from './financialDatabaseService';
import { FinancialValidationService } from './financialValidationService';

export interface RecurringTransaction {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number; // every X frequency (e.g., every 2 weeks)
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  accountId: string;
  category: string;
  isActive: boolean;
  autoExecute: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutoReconciliationRule {
  id: string;
  name: string;
  description: string;
  bankStatementPattern: string; // regex pattern to match
  accountId: string;
  category: string;
  confidence: number; // 0-1 confidence score
  isActive: boolean;
  matchCount: number;
  lastMatched?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmartCategorizationRule {
  id: string;
  name: string;
  pattern: string; // regex or keyword pattern
  category: string;
  subcategory?: string;
  confidence: number;
  isActive: boolean;
  machineGenerated: boolean;
  usage_count: number;
  createdAt: string;
  updatedAt: string;
}

export interface BankStatementEntry {
  id: string;
  bankAccountId: string;
  transactionDate: string;
  description: string;
  amount: number;
  balance: number;
  reference: string;
  isReconciled: boolean;
  matchedTransactionId?: string;
  suggestedCategory?: string;
  confidence?: number;
  createdAt: string;
}

export class FinancialAutomationService {
  
  // =================
  // RECURRING TRANSACTIONS
  // =================

  static async createRecurringTransaction(transaction: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
    try {
      // Validate the recurring transaction
      const validation = FinancialValidationService.validateRecurringTransaction(transaction);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const nextDueDate = this.calculateNextDueDate(
        transaction.startDate!, 
        transaction.frequency!, 
        transaction.interval || 1
      );

      const recurringTx: Partial<RecurringTransaction> = {
        ...transaction,
        id: transaction.id || `RT-${Date.now()}`,
        nextDueDate,
        isActive: transaction.isActive ?? true,
        autoExecute: transaction.autoExecute ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert(recurringTx)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating recurring transaction:', error);
      throw error;
    }
  }

  static async getAllRecurringTransactions(): Promise<RecurringTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .order('nextDueDate');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
      return [];
    }
  }

  static async getDueRecurringTransactions(daysAhead: number = 7): Promise<RecurringTransaction[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('isActive', true)
        .lte('nextDueDate', futureDate.toISOString())
        .order('nextDueDate');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching due recurring transactions:', error);
      return [];
    }
  }

  static async executeRecurringTransaction(recurringId: string): Promise<void> {
    try {
      const { data: recurring, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('id', recurringId)
        .single();

      if (error) throw error;
      if (!recurring) throw new Error('Recurring transaction not found');

      // Create the actual transaction
      const transaction = {
        transaction_number: `RT-${Date.now()}`,
        transaction_date: new Date().toISOString(),
        transaction_type: 'adjustment' as const,
        description: `Recurring: ${recurring.description}`,
        total_amount: recurring.amount,
        currency: recurring.currency,
        status: 'completed' as const,
        affects_inventory: false
      };

      await FinancialDatabaseService.saveTransaction(transaction);

      // Update next due date
      const nextDueDate = this.calculateNextDueDate(
        recurring.nextDueDate,
        recurring.frequency,
        recurring.interval
      );

      await supabase
        .from('recurring_transactions')
        .update({ 
          nextDueDate,
          updatedAt: new Date().toISOString()
        })
        .eq('id', recurringId);

    } catch (error) {
      console.error('Error executing recurring transaction:', error);
      throw error;
    }
  }

  static async processAutomaticRecurringTransactions(): Promise<void> {
    try {
      const dueTransactions = await this.getDueRecurringTransactions(0); // Due today
      const autoTransactions = dueTransactions.filter(tx => tx.autoExecute);

      for (const transaction of autoTransactions) {
        try {
          await this.executeRecurringTransaction(transaction.id);
          console.log(`Auto-executed recurring transaction: ${transaction.name}`);
        } catch (error) {
          console.error(`Failed to auto-execute transaction ${transaction.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error processing automatic recurring transactions:', error);
    }
  }

  // =================
  // AUTO-RECONCILIATION
  // =================

  static async createReconciliationRule(rule: Partial<AutoReconciliationRule>): Promise<AutoReconciliationRule> {
    try {
      const newRule: Partial<AutoReconciliationRule> = {
        ...rule,
        id: rule.id || `AR-${Date.now()}`,
        confidence: rule.confidence || 0.8,
        isActive: rule.isActive ?? true,
        matchCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('auto_reconciliation_rules')
        .insert(newRule)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating reconciliation rule:', error);
      throw error;
    }
  }

  static async processAutoReconciliation(bankStatements: BankStatementEntry[]): Promise<{
    reconciled: number;
    suggestions: Array<{
      statement: BankStatementEntry;
      suggestedTransaction?: any;
      confidence: number;
    }>;
  }> {
    try {
      const rules = await this.getActiveReconciliationRules();
      const transactions = await FinancialDatabaseService.getAllTransactions();
      
      let reconciledCount = 0;
      const suggestions = [];

      for (const statement of bankStatements) {
        if (statement.isReconciled) continue;

        // Try to match with existing transactions
        const exactMatch = transactions.find(tx => 
          Math.abs(tx.total_amount - Math.abs(statement.amount)) < 0.01 &&
          this.isSameDay(new Date(tx.transaction_date), new Date(statement.transactionDate))
        );

        if (exactMatch) {
          // Exact match found - auto reconcile
          await this.reconcileStatement(statement.id, exactMatch.id);
          reconciledCount++;
          continue;
        }

        // Try pattern matching with rules
        let bestMatch = null;
        let highestConfidence = 0;

        for (const rule of rules) {
          const regex = new RegExp(rule.bankStatementPattern, 'i');
          if (regex.test(statement.description)) {
            if (rule.confidence > highestConfidence) {
              highestConfidence = rule.confidence;
              bestMatch = rule;
            }
          }
        }

        if (bestMatch && highestConfidence > 0.7) {
          suggestions.push({
            statement,
            suggestedTransaction: bestMatch,
            confidence: highestConfidence
          });
        }
      }

      return { reconciled: reconciledCount, suggestions };
    } catch (error) {
      console.error('Error processing auto reconciliation:', error);
      return { reconciled: 0, suggestions: [] };
    }
  }

  // =================
  // SMART CATEGORIZATION
  // =================

  static async createCategorizationRule(rule: Partial<SmartCategorizationRule>): Promise<SmartCategorizationRule> {
    try {
      const newRule: Partial<SmartCategorizationRule> = {
        ...rule,
        id: rule.id || `SC-${Date.now()}`,
        confidence: rule.confidence || 0.8,
        isActive: rule.isActive ?? true,
        machineGenerated: rule.machineGenerated ?? false,
        usage_count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('smart_categorization_rules')
        .insert(newRule)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating categorization rule:', error);
      throw error;
    }
  }

  static async categorizeTransaction(description: string): Promise<{
    category?: string;
    subcategory?: string;
    confidence: number;
    ruleUsed?: string;
  }> {
    try {
      const rules = await this.getActiveCategorizationRules();
      
      let bestMatch = null;
      let highestConfidence = 0;

      for (const rule of rules) {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(description)) {
          if (rule.confidence > highestConfidence) {
            highestConfidence = rule.confidence;
            bestMatch = rule;
          }
        }
      }

      if (bestMatch) {
        // Update usage count
        await supabase
          .from('smart_categorization_rules')
          .update({ 
            usage_count: bestMatch.usage_count + 1,
            updatedAt: new Date().toISOString()
          })
          .eq('id', bestMatch.id);

        return {
          category: bestMatch.category,
          subcategory: bestMatch.subcategory,
          confidence: highestConfidence,
          ruleUsed: bestMatch.id
        };
      }

      return { confidence: 0 };
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      return { confidence: 0 };
    }
  }

  static async learnFromUserCategorization(
    description: string, 
    category: string, 
    subcategory?: string
  ): Promise<void> {
    try {
      // Extract keywords from description for pattern generation
      const keywords = this.extractKeywords(description);
      
      for (const keyword of keywords) {
        const pattern = `\\b${keyword}\\b`;
        
        // Check if similar rule already exists
        const existingRule = await this.findSimilarCategorizationRule(pattern, category);
        
        if (existingRule) {
          // Increase confidence of existing rule
          await supabase
            .from('smart_categorization_rules')
            .update({
              confidence: Math.min(existingRule.confidence + 0.1, 1.0),
              usage_count: existingRule.usage_count + 1,
              updatedAt: new Date().toISOString()
            })
            .eq('id', existingRule.id);
        } else {
          // Create new machine-generated rule
          await this.createCategorizationRule({
            name: `Auto-learned: ${keyword}`,
            pattern,
            category,
            subcategory,
            confidence: 0.6,
            machineGenerated: true
          });
        }
      }
    } catch (error) {
      console.error('Error learning from user categorization:', error);
    }
  }

  // =================
  // FINANCIAL INSIGHTS & ANALYTICS
  // =================

  static async generateFinancialInsights(): Promise<{
    spending_patterns: any[];
    anomalies: any[];
    recommendations: any[];
    forecast: any;
  }> {
    try {
      const transactions = await FinancialDatabaseService.getAllTransactions();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // Analyze spending patterns
      const spendingPatterns = this.analyzeSpendingPatterns(transactions);
      
      // Detect anomalies
      const anomalies = this.detectAnomalies(transactions);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(transactions, spendingPatterns);
      
      // Create forecast
      const forecast = this.generateForecast(transactions);

      return {
        spending_patterns: spendingPatterns,
        anomalies,
        recommendations,
        forecast
      };
    } catch (error) {
      console.error('Error generating financial insights:', error);
      return {
        spending_patterns: [],
        anomalies: [],
        recommendations: [],
        forecast: null
      };
    }
  }

  // =================
  // UTILITY METHODS
  // =================

  private static calculateNextDueDate(
    startDate: string, 
    frequency: string, 
    interval: number
  ): string {
    const date = new Date(startDate);
    
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + interval);
        break;
      case 'weekly':
        date.setDate(date.getDate() + (interval * 7));
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + interval);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + (interval * 3));
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + interval);
        break;
    }
    
    return date.toISOString();
  }

  private static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private static async getActiveReconciliationRules(): Promise<AutoReconciliationRule[]> {
    const { data, error } = await supabase
      .from('auto_reconciliation_rules')
      .select('*')
      .eq('isActive', true)
      .order('confidence', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  private static async getActiveCategorizationRules(): Promise<SmartCategorizationRule[]> {
    const { data, error } = await supabase
      .from('smart_categorization_rules')
      .select('*')
      .eq('isActive', true)
      .order('confidence', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  private static async reconcileStatement(statementId: string, transactionId: string): Promise<void> {
    await supabase
      .from('bank_statements')
      .update({
        isReconciled: true,
        matchedTransactionId: transactionId,
        updatedAt: new Date().toISOString()
      })
      .eq('id', statementId);
  }

  private static extractKeywords(description: string): string[] {
    // Simple keyword extraction - can be enhanced with NLP
    const words = description.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['the', 'and', 'for', 'with', 'from', 'this', 'that', 'payment', 'transaction'].includes(word));
    
    return [...new Set(words)]; // Remove duplicates
  }

  private static async findSimilarCategorizationRule(
    pattern: string, 
    category: string
  ): Promise<SmartCategorizationRule | null> {
    const { data, error } = await supabase
      .from('smart_categorization_rules')
      .select('*')
      .eq('pattern', pattern)
      .eq('category', category)
      .single();
    
    if (error) return null;
    return data;
  }

  private static analyzeSpendingPatterns(transactions: any[]): any[] {
    // Implement spending pattern analysis
    const patterns = [];
    // Add pattern analysis logic here
    return patterns;
  }

  private static detectAnomalies(transactions: any[]): any[] {
    // Implement anomaly detection
    const anomalies = [];
    // Add anomaly detection logic here
    return anomalies;
  }

  private static generateRecommendations(transactions: any[], patterns: any[]): any[] {
    // Generate financial recommendations
    const recommendations = [];
    // Add recommendation logic here
    return recommendations;
  }

  private static generateForecast(transactions: any[]): any {
    // Generate financial forecast
    // Add forecasting logic here
    return {};
  }
}
