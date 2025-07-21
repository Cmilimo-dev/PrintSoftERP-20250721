// Financial Module Independent Storage Service
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
} from '../types/financialTypes';

export class FinancialStorageService {
  // Storage Keys
  private static readonly ACCOUNTS_KEY = 'financial_accounts';
  private static readonly JOURNAL_ENTRIES_KEY = 'financial_journal_entries';
  private static readonly PAYMENTS_KEY = 'financial_payments';
  private static readonly INVOICES_KEY = 'financial_invoices';
  private static readonly BILLS_KEY = 'financial_bills';
  private static readonly TAX_RATES_KEY = 'financial_tax_rates';
  private static readonly BANK_ACCOUNTS_KEY = 'financial_bank_accounts';
  private static readonly BANK_TRANSACTIONS_KEY = 'financial_bank_transactions';
  private static readonly RECONCILIATIONS_KEY = 'financial_reconciliations';
  private static readonly BUDGETS_KEY = 'financial_budgets';
  private static readonly REPORTS_KEY = 'financial_reports';
  private static readonly SETTINGS_KEY = 'financial_settings';
  private static readonly ACTIVITY_LOG_KEY = 'financial_activity_log';

  // Activity Log
  private static logActivity(action: string, entityType: string, entityId: string, details?: any): void {
    try {
      const activities = this.getActivityLog();
      const activity = {
        id: this.generateId(),
        action,
        entityType,
        entityId,
        details,
        timestamp: new Date().toISOString(),
        user: 'current_user' // Replace with actual user context
      };
      activities.push(activity);
      
      // Keep only last 1000 activities
      if (activities.length > 1000) {
        activities.splice(0, activities.length - 1000);
      }
      
      localStorage.setItem(this.ACTIVITY_LOG_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error('Error logging financial activity:', error);
    }
  }

  private static getActivityLog(): any[] {
    try {
      const log = localStorage.getItem(this.ACTIVITY_LOG_KEY);
      return log ? JSON.parse(log) : [];
    } catch (error) {
      console.error('Error retrieving financial activity log:', error);
      return [];
    }
  }

  // Utility Functions
  private static generateId(): string {
    return `fin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
      throw new Error(`Failed to save ${key} data`);
    }
  }

  private static getFromStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error retrieving ${key} from storage:`, error);
      return [];
    }
  }

  // =================
  // CHART OF ACCOUNTS
  // =================

  static getAllAccounts(): ChartOfAccounts[] {
    return this.getFromStorage<ChartOfAccounts>(this.ACCOUNTS_KEY);
  }

  static getAccountById(id: string): ChartOfAccounts | null {
    const accounts = this.getAllAccounts();
    return accounts.find(account => account.id === id) || null;
  }

  static getAccountByNumber(accountNumber: string): ChartOfAccounts | null {
    const accounts = this.getAllAccounts();
    return accounts.find(account => account.accountNumber === accountNumber) || null;
  }

  static getAccountsByType(accountType: AccountType): ChartOfAccounts[] {
    const accounts = this.getAllAccounts();
    return accounts.filter(account => account.accountType === accountType);
  }

  static saveAccount(account: ChartOfAccounts): ChartOfAccounts {
    try {
      const accounts = this.getAllAccounts();
      const now = new Date().toISOString();
      
      const existingIndex = accounts.findIndex(a => a.id === account.id);
      
      if (existingIndex >= 0) {
        accounts[existingIndex] = { ...account, updatedAt: now };
        this.logActivity('UPDATE', 'account', account.id, { 
          name: account.accountName, 
          number: account.accountNumber 
        });
      } else {
        const newAccount = { 
          ...account, 
          id: account.id || this.generateId(),
          createdAt: now,
          updatedAt: now 
        };
        accounts.push(newAccount);
        this.logActivity('CREATE', 'account', newAccount.id, { 
          name: newAccount.accountName, 
          number: newAccount.accountNumber 
        });
        account = newAccount;
      }
      
      this.saveToStorage(this.ACCOUNTS_KEY, accounts);
      return account;
    } catch (error) {
      console.error('Error saving account:', error);
      throw new Error('Failed to save account');
    }
  }

  static deleteAccount(id: string): boolean {
    try {
      const accounts = this.getAllAccounts();
      const accountIndex = accounts.findIndex(a => a.id === id);
      
      if (accountIndex >= 0) {
        const account = accounts[accountIndex];
        accounts.splice(accountIndex, 1);
        this.saveToStorage(this.ACCOUNTS_KEY, accounts);
        this.logActivity('DELETE', 'account', id, { 
          name: account.accountName, 
          number: account.accountNumber 
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new Error('Failed to delete account');
    }
  }

  static searchAccounts(criteria: AccountSearchCriteria): ChartOfAccounts[] {
    try {
      let accounts = this.getAllAccounts();

      if (criteria.query) {
        const query = criteria.query.toLowerCase();
        accounts = accounts.filter(account =>
          account.accountName.toLowerCase().includes(query) ||
          account.accountNumber.toLowerCase().includes(query) ||
          account.description?.toLowerCase().includes(query)
        );
      }

      if (criteria.accountType) {
        accounts = accounts.filter(account => account.accountType === criteria.accountType);
      }

      if (criteria.accountSubtype) {
        accounts = accounts.filter(account => account.accountSubtype === criteria.accountSubtype);
      }

      if (criteria.isActive !== undefined) {
        accounts = accounts.filter(account => account.isActive === criteria.isActive);
      }

      if (criteria.parentAccountId) {
        accounts = accounts.filter(account => account.parentAccountId === criteria.parentAccountId);
      }

      if (criteria.balanceMin !== undefined) {
        accounts = accounts.filter(account => account.currentBalance >= criteria.balanceMin!);
      }

      if (criteria.balanceMax !== undefined) {
        accounts = accounts.filter(account => account.currentBalance <= criteria.balanceMax!);
      }

      if (criteria.createdAfter) {
        accounts = accounts.filter(account => account.createdAt >= criteria.createdAfter!);
      }

      if (criteria.createdBefore) {
        accounts = accounts.filter(account => account.createdAt <= criteria.createdBefore!);
      }

      return accounts;
    } catch (error) {
      console.error('Error searching accounts:', error);
      return [];
    }
  }

  // =================
  // JOURNAL ENTRIES
  // =================

  static getAllJournalEntries(): JournalEntry[] {
    return this.getFromStorage<JournalEntry>(this.JOURNAL_ENTRIES_KEY);
  }

  static getJournalEntryById(id: string): JournalEntry | null {
    const entries = this.getAllJournalEntries();
    return entries.find(entry => entry.id === id) || null;
  }

  static getJournalEntryByNumber(entryNumber: string): JournalEntry | null {
    const entries = this.getAllJournalEntries();
    return entries.find(entry => entry.entryNumber === entryNumber) || null;
  }

  static saveJournalEntry(entry: JournalEntry): JournalEntry {
    try {
      const entries = this.getAllJournalEntries();
      const now = new Date().toISOString();
      
      const existingIndex = entries.findIndex(e => e.id === entry.id);
      
      if (existingIndex >= 0) {
        entries[existingIndex] = { ...entry, updatedAt: now };
        this.logActivity('UPDATE', 'journal_entry', entry.id, { 
          entryNumber: entry.entryNumber,
          amount: entry.totalDebit
        });
      } else {
        const newEntry = { 
          ...entry, 
          id: entry.id || this.generateId(),
          createdAt: now,
          updatedAt: now 
        };
        entries.push(newEntry);
        this.logActivity('CREATE', 'journal_entry', newEntry.id, { 
          entryNumber: newEntry.entryNumber,
          amount: newEntry.totalDebit
        });
        entry = newEntry;
      }
      
      this.saveToStorage(this.JOURNAL_ENTRIES_KEY, entries);
      
      // Update account balances
      this.updateAccountBalancesFromJournalEntry(entry);
      
      return entry;
    } catch (error) {
      console.error('Error saving journal entry:', error);
      throw new Error('Failed to save journal entry');
    }
  }

  static deleteJournalEntry(id: string): boolean {
    try {
      const entries = this.getAllJournalEntries();
      const entryIndex = entries.findIndex(e => e.id === id);
      
      if (entryIndex >= 0) {
        const entry = entries[entryIndex];
        entries.splice(entryIndex, 1);
        this.saveToStorage(this.JOURNAL_ENTRIES_KEY, entries);
        this.logActivity('DELETE', 'journal_entry', id, { 
          entryNumber: entry.entryNumber,
          amount: entry.totalDebit
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw new Error('Failed to delete journal entry');
    }
  }

  static searchJournalEntries(criteria: TransactionSearchCriteria): JournalEntry[] {
    try {
      let entries = this.getAllJournalEntries();

      if (criteria.query) {
        const query = criteria.query.toLowerCase();
        entries = entries.filter(entry =>
          entry.description.toLowerCase().includes(query) ||
          entry.entryNumber.toLowerCase().includes(query) ||
          entry.reference?.toLowerCase().includes(query)
        );
      }

      if (criteria.accountIds && criteria.accountIds.length > 0) {
        entries = entries.filter(entry =>
          entry.lineItems.some(line => criteria.accountIds!.includes(line.accountId))
        );
      }

      if (criteria.dateFrom) {
        entries = entries.filter(entry => entry.date >= criteria.dateFrom!);
      }

      if (criteria.dateTo) {
        entries = entries.filter(entry => entry.date <= criteria.dateTo!);
      }

      if (criteria.amountMin !== undefined) {
        entries = entries.filter(entry => entry.totalDebit >= criteria.amountMin!);
      }

      if (criteria.amountMax !== undefined) {
        entries = entries.filter(entry => entry.totalDebit <= criteria.amountMax!);
      }

      if (criteria.status) {
        entries = entries.filter(entry => entry.status === criteria.status);
      }

      if (criteria.reference) {
        entries = entries.filter(entry => 
          entry.reference?.toLowerCase().includes(criteria.reference!.toLowerCase())
        );
      }

      if (criteria.tags && criteria.tags.length > 0) {
        entries = entries.filter(entry =>
          criteria.tags!.some(tag => entry.tags.includes(tag))
        );
      }

      return entries;
    } catch (error) {
      console.error('Error searching journal entries:', error);
      return [];
    }
  }

  private static updateAccountBalancesFromJournalEntry(entry: JournalEntry): void {
    if (entry.status !== 'posted') return;

    try {
      const accounts = this.getAllAccounts();
      let accountsUpdated = false;

      entry.lineItems.forEach(lineItem => {
        const accountIndex = accounts.findIndex(a => a.id === lineItem.accountId);
        if (accountIndex >= 0) {
          const account = accounts[accountIndex];
          
          // Update debit and credit balances
          account.debitBalance += lineItem.debitAmount;
          account.creditBalance += lineItem.creditAmount;
          
          // Update current balance based on account type
          if (['asset', 'expense'].includes(account.accountType)) {
            account.currentBalance += (lineItem.debitAmount - lineItem.creditAmount);
          } else {
            account.currentBalance += (lineItem.creditAmount - lineItem.debitAmount);
          }
          
          account.lastTransactionDate = entry.date;
          account.updatedAt = new Date().toISOString();
          accountsUpdated = true;
        }
      });

      if (accountsUpdated) {
        this.saveToStorage(this.ACCOUNTS_KEY, accounts);
      }
    } catch (error) {
      console.error('Error updating account balances:', error);
    }
  }

  // =================
  // PAYMENTS
  // =================

  static getAllPayments(): Payment[] {
    return this.getFromStorage<Payment>(this.PAYMENTS_KEY);
  }

  static getPaymentById(id: string): Payment | null {
    const payments = this.getAllPayments();
    return payments.find(payment => payment.id === id) || null;
  }

  static getPaymentByNumber(paymentNumber: string): Payment | null {
    const payments = this.getAllPayments();
    return payments.find(payment => payment.paymentNumber === paymentNumber) || null;
  }

  static savePayment(payment: Payment): Payment {
    try {
      const payments = this.getAllPayments();
      const now = new Date().toISOString();
      
      const existingIndex = payments.findIndex(p => p.id === payment.id);
      
      if (existingIndex >= 0) {
        payments[existingIndex] = { ...payment, updatedAt: now };
        this.logActivity('UPDATE', 'payment', payment.id, { 
          paymentNumber: payment.paymentNumber,
          amount: payment.amount
        });
      } else {
        const newPayment = { 
          ...payment, 
          id: payment.id || this.generateId(),
          createdAt: now,
          updatedAt: now 
        };
        payments.push(newPayment);
        this.logActivity('CREATE', 'payment', newPayment.id, { 
          paymentNumber: newPayment.paymentNumber,
          amount: newPayment.amount
        });
        payment = newPayment;
      }
      
      this.saveToStorage(this.PAYMENTS_KEY, payments);
      return payment;
    } catch (error) {
      console.error('Error saving payment:', error);
      throw new Error('Failed to save payment');
    }
  }

  static deletePayment(id: string): boolean {
    try {
      const payments = this.getAllPayments();
      const paymentIndex = payments.findIndex(p => p.id === id);
      
      if (paymentIndex >= 0) {
        const payment = payments[paymentIndex];
        payments.splice(paymentIndex, 1);
        this.saveToStorage(this.PAYMENTS_KEY, payments);
        this.logActivity('DELETE', 'payment', id, { 
          paymentNumber: payment.paymentNumber,
          amount: payment.amount
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw new Error('Failed to delete payment');
    }
  }

  static searchPayments(criteria: PaymentSearchCriteria): Payment[] {
    try {
      let payments = this.getAllPayments();

      if (criteria.query) {
        const query = criteria.query.toLowerCase();
        payments = payments.filter(payment =>
          payment.description?.toLowerCase().includes(query) ||
          payment.paymentNumber.toLowerCase().includes(query) ||
          payment.reference?.toLowerCase().includes(query)
        );
      }

      if (criteria.type) {
        payments = payments.filter(payment => payment.type === criteria.type);
      }

      if (criteria.dateFrom) {
        payments = payments.filter(payment => payment.date >= criteria.dateFrom!);
      }

      if (criteria.dateTo) {
        payments = payments.filter(payment => payment.date <= criteria.dateTo!);
      }

      if (criteria.amountMin !== undefined) {
        payments = payments.filter(payment => payment.amount >= criteria.amountMin!);
      }

      if (criteria.amountMax !== undefined) {
        payments = payments.filter(payment => payment.amount <= criteria.amountMax!);
      }

      if (criteria.paymentMethod) {
        payments = payments.filter(payment => payment.paymentMethod === criteria.paymentMethod);
      }

      if (criteria.status) {
        payments = payments.filter(payment => payment.status === criteria.status);
      }

      if (criteria.customerId) {
        payments = payments.filter(payment => payment.customerId === criteria.customerId);
      }

      if (criteria.supplierId) {
        payments = payments.filter(payment => payment.supplierId === criteria.supplierId);
      }

      if (criteria.accountId) {
        payments = payments.filter(payment => 
          payment.fromAccountId === criteria.accountId || 
          payment.toAccountId === criteria.accountId
        );
      }

      return payments;
    } catch (error) {
      console.error('Error searching payments:', error);
      return [];
    }
  }

  // =================
  // INVOICES
  // =================

  static getAllInvoices(): Invoice[] {
    return this.getFromStorage<Invoice>(this.INVOICES_KEY);
  }

  static getInvoiceById(id: string): Invoice | null {
    const invoices = this.getAllInvoices();
    return invoices.find(invoice => invoice.id === id) || null;
  }

  static getInvoiceByNumber(invoiceNumber: string): Invoice | null {
    const invoices = this.getAllInvoices();
    return invoices.find(invoice => invoice.invoiceNumber === invoiceNumber) || null;
  }

  static saveInvoice(invoice: Invoice): Invoice {
    try {
      const invoices = this.getAllInvoices();
      const now = new Date().toISOString();
      
      const existingIndex = invoices.findIndex(i => i.id === invoice.id);
      
      if (existingIndex >= 0) {
        invoices[existingIndex] = { ...invoice, updatedAt: now };
        this.logActivity('UPDATE', 'invoice', invoice.id, { 
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.totalAmount
        });
      } else {
        const newInvoice = { 
          ...invoice, 
          id: invoice.id || this.generateId(),
          createdAt: now,
          updatedAt: now 
        };
        invoices.push(newInvoice);
        this.logActivity('CREATE', 'invoice', newInvoice.id, { 
          invoiceNumber: newInvoice.invoiceNumber,
          amount: newInvoice.totalAmount
        });
        invoice = newInvoice;
      }
      
      this.saveToStorage(this.INVOICES_KEY, invoices);
      return invoice;
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw new Error('Failed to save invoice');
    }
  }

  static deleteInvoice(id: string): boolean {
    try {
      const invoices = this.getAllInvoices();
      const invoiceIndex = invoices.findIndex(i => i.id === id);
      
      if (invoiceIndex >= 0) {
        const invoice = invoices[invoiceIndex];
        invoices.splice(invoiceIndex, 1);
        this.saveToStorage(this.INVOICES_KEY, invoices);
        this.logActivity('DELETE', 'invoice', id, { 
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.totalAmount
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw new Error('Failed to delete invoice');
    }
  }

  // =================
  // BILLS
  // =================

  static getAllBills(): Bill[] {
    return this.getFromStorage<Bill>(this.BILLS_KEY);
  }

  static getBillById(id: string): Bill | null {
    const bills = this.getAllBills();
    return bills.find(bill => bill.id === id) || null;
  }

  static getBillByNumber(billNumber: string): Bill | null {
    const bills = this.getAllBills();
    return bills.find(bill => bill.billNumber === billNumber) || null;
  }

  static saveBill(bill: Bill): Bill {
    try {
      const bills = this.getAllBills();
      const now = new Date().toISOString();
      
      const existingIndex = bills.findIndex(b => b.id === bill.id);
      
      if (existingIndex >= 0) {
        bills[existingIndex] = { ...bill, updatedAt: now };
        this.logActivity('UPDATE', 'bill', bill.id, { 
          billNumber: bill.billNumber,
          amount: bill.totalAmount
        });
      } else {
        const newBill = { 
          ...bill, 
          id: bill.id || this.generateId(),
          createdAt: now,
          updatedAt: now 
        };
        bills.push(newBill);
        this.logActivity('CREATE', 'bill', newBill.id, { 
          billNumber: newBill.billNumber,
          amount: newBill.totalAmount
        });
        bill = newBill;
      }
      
      this.saveToStorage(this.BILLS_KEY, bills);
      return bill;
    } catch (error) {
      console.error('Error saving bill:', error);
      throw new Error('Failed to save bill');
    }
  }

  static deleteBill(id: string): boolean {
    try {
      const bills = this.getAllBills();
      const billIndex = bills.findIndex(b => b.id === id);
      
      if (billIndex >= 0) {
        const bill = bills[billIndex];
        bills.splice(billIndex, 1);
        this.saveToStorage(this.BILLS_KEY, bills);
        this.logActivity('DELETE', 'bill', id, { 
          billNumber: bill.billNumber,
          amount: bill.totalAmount
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw new Error('Failed to delete bill');
    }
  }

  // =================
  // TAX RATES
  // =================

  static getAllTaxRates(): TaxRate[] {
    return this.getFromStorage<TaxRate>(this.TAX_RATES_KEY);
  }

  static getTaxRateById(id: string): TaxRate | null {
    const taxRates = this.getAllTaxRates();
    return taxRates.find(rate => rate.id === id) || null;
  }

  static saveTaxRate(taxRate: TaxRate): TaxRate {
    try {
      const taxRates = this.getAllTaxRates();
      const now = new Date().toISOString();
      
      const existingIndex = taxRates.findIndex(t => t.id === taxRate.id);
      
      if (existingIndex >= 0) {
        taxRates[existingIndex] = { ...taxRate, updatedAt: now };
        this.logActivity('UPDATE', 'tax_rate', taxRate.id, { 
          name: taxRate.name,
          rate: taxRate.rate
        });
      } else {
        const newTaxRate = { 
          ...taxRate, 
          id: taxRate.id || this.generateId(),
          createdAt: now,
          updatedAt: now 
        };
        taxRates.push(newTaxRate);
        this.logActivity('CREATE', 'tax_rate', newTaxRate.id, { 
          name: newTaxRate.name,
          rate: newTaxRate.rate
        });
        taxRate = newTaxRate;
      }
      
      this.saveToStorage(this.TAX_RATES_KEY, taxRates);
      return taxRate;
    } catch (error) {
      console.error('Error saving tax rate:', error);
      throw new Error('Failed to save tax rate');
    }
  }

  static deleteTaxRate(id: string): boolean {
    try {
      const taxRates = this.getAllTaxRates();
      const taxRateIndex = taxRates.findIndex(t => t.id === id);
      
      if (taxRateIndex >= 0) {
        const taxRate = taxRates[taxRateIndex];
        taxRates.splice(taxRateIndex, 1);
        this.saveToStorage(this.TAX_RATES_KEY, taxRates);
        this.logActivity('DELETE', 'tax_rate', id, { 
          name: taxRate.name,
          rate: taxRate.rate
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting tax rate:', error);
      throw new Error('Failed to delete tax rate');
    }
  }

  // =================
  // BANK ACCOUNTS
  // =================

  static getAllBankAccounts(): BankAccount[] {
    return this.getFromStorage<BankAccount>(this.BANK_ACCOUNTS_KEY);
  }

  static getBankAccountById(id: string): BankAccount | null {
    const bankAccounts = this.getAllBankAccounts();
    return bankAccounts.find(account => account.id === id) || null;
  }

  static saveBankAccount(bankAccount: BankAccount): BankAccount {
    try {
      const bankAccounts = this.getAllBankAccounts();
      const now = new Date().toISOString();
      
      const existingIndex = bankAccounts.findIndex(b => b.id === bankAccount.id);
      
      if (existingIndex >= 0) {
        bankAccounts[existingIndex] = { ...bankAccount, updatedAt: now };
        this.logActivity('UPDATE', 'bank_account', bankAccount.id, { 
          name: bankAccount.accountName,
          bank: bankAccount.bankName
        });
      } else {
        const newBankAccount = { 
          ...bankAccount, 
          id: bankAccount.id || this.generateId(),
          createdAt: now,
          updatedAt: now 
        };
        bankAccounts.push(newBankAccount);
        this.logActivity('CREATE', 'bank_account', newBankAccount.id, { 
          name: newBankAccount.accountName,
          bank: newBankAccount.bankName
        });
        bankAccount = newBankAccount;
      }
      
      this.saveToStorage(this.BANK_ACCOUNTS_KEY, bankAccounts);
      return bankAccount;
    } catch (error) {
      console.error('Error saving bank account:', error);
      throw new Error('Failed to save bank account');
    }
  }

  static deleteBankAccount(id: string): boolean {
    try {
      const bankAccounts = this.getAllBankAccounts();
      const bankAccountIndex = bankAccounts.findIndex(b => b.id === id);
      
      if (bankAccountIndex >= 0) {
        const bankAccount = bankAccounts[bankAccountIndex];
        bankAccounts.splice(bankAccountIndex, 1);
        this.saveToStorage(this.BANK_ACCOUNTS_KEY, bankAccounts);
        this.logActivity('DELETE', 'bank_account', id, { 
          name: bankAccount.accountName,
          bank: bankAccount.bankName
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting bank account:', error);
      throw new Error('Failed to delete bank account');
    }
  }

  // =================
  // ANALYTICS
  // =================

  static calculateFinancialAnalytics(startDate: string, endDate: string): FinancialAnalytics {
    try {
      const accounts = this.getAllAccounts();
      const journalEntries = this.getAllJournalEntries().filter(entry => 
        entry.date >= startDate && entry.date <= endDate && entry.status === 'posted'
      );

      // Get account balances by type
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

      // Calculate ratios
      const grossProfit = totalRevenue - totalExpenses;
      const netIncome = grossProfit; // Simplified
      
      return {
        period: `${startDate} to ${endDate}`,
        startDate,
        endDate,
        currency: 'KES' as Currency, // Default currency
        
        // Profitability Ratios
        grossProfitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
        netProfitMargin: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0,
        operatingMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
        returnOnAssets: totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0,
        returnOnEquity: totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0,
        
        // Liquidity Ratios
        currentRatio: totalLiabilities > 0 ? totalAssets / totalLiabilities : 0,
        quickRatio: totalLiabilities > 0 ? totalAssets / totalLiabilities : 0, // Simplified
        cashRatio: 0, // Would need cash account specifics
        workingCapital: totalAssets - totalLiabilities,
        
        // Efficiency Ratios
        assetTurnover: totalAssets > 0 ? totalRevenue / totalAssets : 0,
        inventoryTurnover: 0, // Would need inventory specifics
        receivablesTurnover: 0, // Would need receivables specifics
        payablesTurnover: 0, // Would need payables specifics
        
        // Leverage Ratios
        debtToEquity: totalEquity > 0 ? totalLiabilities / totalEquity : 0,
        debtToAssets: totalAssets > 0 ? totalLiabilities / totalAssets : 0,
        equityRatio: totalAssets > 0 ? totalEquity / totalAssets : 0,
        interestCoverage: 0, // Would need interest expense specifics
        
        // Cash Flow Metrics
        operatingCashFlow: grossProfit, // Simplified
        freeCashFlow: grossProfit, // Simplified
        cashFlowToDebt: totalLiabilities > 0 ? grossProfit / totalLiabilities : 0,
        
        // Trend Analysis (simplified - would need historical data)
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
  // SETTINGS
  // =================

  static getSettings(): FinancialSettings | null {
    try {
      const settings = localStorage.getItem(this.SETTINGS_KEY);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error retrieving financial settings:', error);
      return null;
    }
  }

  static saveSettings(settings: FinancialSettings): void {
    try {
      const now = new Date().toISOString();
      const settingsWithTimestamp = {
        ...settings,
        updatedAt: now,
        createdAt: settings.createdAt || now
      };
      
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settingsWithTimestamp));
      this.logActivity('UPDATE', 'settings', 'financial_settings', settings);
    } catch (error) {
      console.error('Error saving financial settings:', error);
      throw new Error('Failed to save financial settings');
    }
  }

  // =================
  // IMPORT/EXPORT
  // =================

  static importAccounts(data: AccountImportData[]): { success: number; errors: string[] } {
    const results = { success: 0, errors: [] as string[] };
    
    try {
      data.forEach((item, index) => {
        try {
          // Validate required fields
          if (!item.accountNumber || !item.accountName) {
            results.errors.push(`Row ${index + 1}: Account number and name are required`);
            return;
          }

          // Check for duplicate account number
          if (this.getAccountByNumber(item.accountNumber)) {
            results.errors.push(`Row ${index + 1}: Account with number ${item.accountNumber} already exists`);
            return;
          }

          // Create account
          const account: ChartOfAccounts = {
            id: this.generateId(),
            accountNumber: item.accountNumber,
            accountName: item.accountName,
            accountType: item.accountType,
            accountSubtype: item.accountSubtype,
            parentAccountId: undefined, // Would need to resolve from parentAccountNumber
            description: item.description,
            isActive: item.isActive !== undefined ? item.isActive : true,
            isSystemAccount: false,
            currency: item.currency || 'KES',
            openingBalance: item.openingBalance || 0,
            currentBalance: item.openingBalance || 0,
            debitBalance: 0,
            creditBalance: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          this.saveAccount(account);
          results.success++;
        } catch (error) {
          results.errors.push(`Row ${index + 1}: ${error.message}`);
        }
      });
    } catch (error) {
      results.errors.push(`Import failed: ${error.message}`);
    }

    return results;
  }

  static exportAccounts(): ChartOfAccounts[] {
    return this.getAllAccounts();
  }

  static exportJournalEntries(startDate?: string, endDate?: string): JournalEntry[] {
    let entries = this.getAllJournalEntries();
    
    if (startDate) {
      entries = entries.filter(e => e.date >= startDate);
    }
    
    if (endDate) {
      entries = entries.filter(e => e.date <= endDate);
    }
    
    return entries;
  }

  static exportPayments(startDate?: string, endDate?: string): Payment[] {
    let payments = this.getAllPayments();
    
    if (startDate) {
      payments = payments.filter(p => p.date >= startDate);
    }
    
    if (endDate) {
      payments = payments.filter(p => p.date <= endDate);
    }
    
    return payments;
  }

  // =================
  // UTILITY FUNCTIONS
  // =================

  static clearAllData(): void {
    try {
      const keys = [
        this.ACCOUNTS_KEY,
        this.JOURNAL_ENTRIES_KEY,
        this.PAYMENTS_KEY,
        this.INVOICES_KEY,
        this.BILLS_KEY,
        this.TAX_RATES_KEY,
        this.BANK_ACCOUNTS_KEY,
        this.BANK_TRANSACTIONS_KEY,
        this.RECONCILIATIONS_KEY,
        this.BUDGETS_KEY,
        this.REPORTS_KEY,
        this.ACTIVITY_LOG_KEY
      ];

      keys.forEach(key => localStorage.removeItem(key));
      this.logActivity('CLEAR_ALL', 'system', 'financial', {});
      console.log('All financial data cleared successfully');
    } catch (error) {
      console.error('Error clearing financial data:', error);
      throw new Error('Failed to clear financial data');
    }
  }

  static getStorageStats(): {
    accounts: number;
    journalEntries: number;
    payments: number;
    invoices: number;
    bills: number;
    taxRates: number;
    bankAccounts: number;
    totalActivities: number;
  } {
    try {
      return {
        accounts: this.getAllAccounts().length,
        journalEntries: this.getAllJournalEntries().length,
        payments: this.getAllPayments().length,
        invoices: this.getAllInvoices().length,
        bills: this.getAllBills().length,
        taxRates: this.getAllTaxRates().length,
        bankAccounts: this.getAllBankAccounts().length,
        totalActivities: this.getActivityLog().length
      };
    } catch (error) {
      console.error('Error getting financial storage stats:', error);
      return {
        accounts: 0,
        journalEntries: 0,
        payments: 0,
        invoices: 0,
        bills: 0,
        taxRates: 0,
        bankAccounts: 0,
        totalActivities: 0
      };
    }
  }
}
