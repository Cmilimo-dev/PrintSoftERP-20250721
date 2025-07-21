// Financial Validation Service
// Provides comprehensive validation for financial data and operations
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
  AccountType,
  JournalEntryStatus,
  PaymentStatus,
  InvoiceStatus,
  BillStatus,
  PaymentMethod,
  Currency
} from '../modules/financial/types/financialTypes';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export class FinancialValidationService {
  // =================
  // CHART OF ACCOUNTS VALIDATION
  // =================

  static validateChartOfAccount(account: Partial<ChartOfAccounts>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields validation
    if (!account.accountNumber || account.accountNumber.trim() === '') {
      errors.push({
        field: 'accountNumber',
        message: 'Account number is required',
        code: 'ACCOUNT_NUMBER_REQUIRED',
        severity: 'error'
      });
    }

    if (!account.accountName || account.accountName.trim() === '') {
      errors.push({
        field: 'accountName',
        message: 'Account name is required',
        code: 'ACCOUNT_NAME_REQUIRED',
        severity: 'error'
      });
    }

    if (!account.accountType) {
      errors.push({
        field: 'accountType',
        message: 'Account type is required',
        code: 'ACCOUNT_TYPE_REQUIRED',
        severity: 'error'
      });
    }

    // Format validation
    if (account.accountNumber) {
      if (!/^[A-Z0-9\-\.]+$/i.test(account.accountNumber)) {
        errors.push({
          field: 'accountNumber',
          message: 'Account number can only contain letters, numbers, hyphens, and periods',
          code: 'ACCOUNT_NUMBER_FORMAT',
          severity: 'error'
        });
      }

      if (account.accountNumber.length > 50) {
        errors.push({
          field: 'accountNumber',
          message: 'Account number cannot exceed 50 characters',
          code: 'ACCOUNT_NUMBER_LENGTH',
          severity: 'error'
        });
      }
    }

    if (account.accountName && account.accountName.length > 255) {
      errors.push({
        field: 'accountName',
        message: 'Account name cannot exceed 255 characters',
        code: 'ACCOUNT_NAME_LENGTH',
        severity: 'error'
      });
    }

    // Business logic validation
    if (account.accountType) {
      const validAccountTypes: AccountType[] = ['asset', 'liability', 'equity', 'revenue', 'expense'];
      if (!validAccountTypes.includes(account.accountType as AccountType)) {
        errors.push({
          field: 'accountType',
          message: 'Invalid account type',
          code: 'INVALID_ACCOUNT_TYPE',
          severity: 'error'
        });
      }
    }

    // Balance validation
    if (account.currentBalance !== undefined) {
      if (isNaN(account.currentBalance)) {
        errors.push({
          field: 'currentBalance',
          message: 'Current balance must be a valid number',
          code: 'INVALID_BALANCE',
          severity: 'error'
        });
      }

      if (Math.abs(account.currentBalance) > 999999999999.99) {
        errors.push({
          field: 'currentBalance',
          message: 'Balance amount is too large',
          code: 'BALANCE_TOO_LARGE',
          severity: 'error'
        });
      }
    }

    // Warnings
    if (account.currentBalance !== undefined && account.currentBalance < 0 && 
        ['asset', 'revenue'].includes(account.accountType as string)) {
      warnings.push({
        field: 'currentBalance',
        message: 'Negative balance for asset/revenue account may indicate data entry error',
        code: 'NEGATIVE_BALANCE_WARNING'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // =================
  // JOURNAL ENTRY VALIDATION
  // =================

  static validateJournalEntry(entry: Partial<JournalEntry>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!entry.entryNumber || entry.entryNumber.trim() === '') {
      errors.push({
        field: 'entryNumber',
        message: 'Entry number is required',
        code: 'ENTRY_NUMBER_REQUIRED',
        severity: 'error'
      });
    }

    if (!entry.date) {
      errors.push({
        field: 'date',
        message: 'Entry date is required',
        code: 'ENTRY_DATE_REQUIRED',
        severity: 'error'
      });
    }

    if (!entry.description || entry.description.trim() === '') {
      errors.push({
        field: 'description',
        message: 'Entry description is required',
        code: 'ENTRY_DESCRIPTION_REQUIRED',
        severity: 'error'
      });
    }

    if (!entry.lineItems || entry.lineItems.length === 0) {
      errors.push({
        field: 'lineItems',
        message: 'At least one line item is required',
        code: 'LINE_ITEMS_REQUIRED',
        severity: 'error'
      });
    }

    // Date validation
    if (entry.date) {
      const entryDate = new Date(entry.date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const oneYearAhead = new Date();
      oneYearAhead.setFullYear(today.getFullYear() + 1);

      if (entryDate > oneYearAhead) {
        warnings.push({
          field: 'date',
          message: 'Entry date is more than one year in the future',
          code: 'FUTURE_DATE_WARNING'
        });
      }

      if (entryDate < oneYearAgo) {
        warnings.push({
          field: 'date',
          message: 'Entry date is more than one year in the past',
          code: 'OLD_DATE_WARNING'
        });
      }
    }

    // Line items validation
    if (entry.lineItems && entry.lineItems.length > 0) {
      let totalDebits = 0;
      let totalCredits = 0;

      entry.lineItems.forEach((lineItem, index) => {
        if (!lineItem.accountId) {
          errors.push({
            field: `lineItems[${index}].accountId`,
            message: `Line item ${index + 1}: Account is required`,
            code: 'LINE_ITEM_ACCOUNT_REQUIRED',
            severity: 'error'
          });
        }

        if (lineItem.debitAmount === undefined && lineItem.creditAmount === undefined) {
          errors.push({
            field: `lineItems[${index}]`,
            message: `Line item ${index + 1}: Either debit or credit amount is required`,
            code: 'LINE_ITEM_AMOUNT_REQUIRED',
            severity: 'error'
          });
        }

        if (lineItem.debitAmount !== undefined && lineItem.creditAmount !== undefined && 
            lineItem.debitAmount > 0 && lineItem.creditAmount > 0) {
          errors.push({
            field: `lineItems[${index}]`,
            message: `Line item ${index + 1}: Cannot have both debit and credit amounts`,
            code: 'BOTH_DEBIT_CREDIT',
            severity: 'error'
          });
        }

        if (lineItem.debitAmount !== undefined) {
          if (isNaN(lineItem.debitAmount) || lineItem.debitAmount < 0) {
            errors.push({
              field: `lineItems[${index}].debitAmount`,
              message: `Line item ${index + 1}: Debit amount must be a positive number`,
              code: 'INVALID_DEBIT_AMOUNT',
              severity: 'error'
            });
          } else {
            totalDebits += lineItem.debitAmount;
          }
        }

        if (lineItem.creditAmount !== undefined) {
          if (isNaN(lineItem.creditAmount) || lineItem.creditAmount < 0) {
            errors.push({
              field: `lineItems[${index}].creditAmount`,
              message: `Line item ${index + 1}: Credit amount must be a positive number`,
              code: 'INVALID_CREDIT_AMOUNT',
              severity: 'error'
            });
          } else {
            totalCredits += lineItem.creditAmount;
          }
        }
      });

      // Double-entry bookkeeping validation
      const difference = Math.abs(totalDebits - totalCredits);
      if (difference > 0.01) { // Allow for small rounding differences
        errors.push({
          field: 'lineItems',
          message: `Total debits (${totalDebits.toFixed(2)}) must equal total credits (${totalCredits.toFixed(2)})`,
          code: 'UNBALANCED_ENTRY',
          severity: 'error'
        });
      }

      // Update totals
      if (entry.totalDebit !== undefined && Math.abs(entry.totalDebit - totalDebits) > 0.01) {
        warnings.push({
          field: 'totalDebit',
          message: 'Total debit amount does not match sum of line items',
          code: 'TOTAL_DEBIT_MISMATCH'
        });
      }

      if (entry.totalCredit !== undefined && Math.abs(entry.totalCredit - totalCredits) > 0.01) {
        warnings.push({
          field: 'totalCredit',
          message: 'Total credit amount does not match sum of line items',
          code: 'TOTAL_CREDIT_MISMATCH'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // =================
  // PAYMENT VALIDATION
  // =================

  static validatePayment(payment: Partial<Payment>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!payment.paymentNumber || payment.paymentNumber.trim() === '') {
      errors.push({
        field: 'paymentNumber',
        message: 'Payment number is required',
        code: 'PAYMENT_NUMBER_REQUIRED',
        severity: 'error'
      });
    }

    if (!payment.amount || payment.amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Payment amount must be greater than zero',
        code: 'INVALID_PAYMENT_AMOUNT',
        severity: 'error'
      });
    }

    if (!payment.date) {
      errors.push({
        field: 'date',
        message: 'Payment date is required',
        code: 'PAYMENT_DATE_REQUIRED',
        severity: 'error'
      });
    }

    if (!payment.paymentMethod) {
      errors.push({
        field: 'paymentMethod',
        message: 'Payment method is required',
        code: 'PAYMENT_METHOD_REQUIRED',
        severity: 'error'
      });
    }

    // Amount validation
    if (payment.amount !== undefined) {
      if (isNaN(payment.amount)) {
        errors.push({
          field: 'amount',
          message: 'Payment amount must be a valid number',
          code: 'INVALID_AMOUNT_FORMAT',
          severity: 'error'
        });
      }

      if (payment.amount > 10000000) {
        warnings.push({
          field: 'amount',
          message: 'Large payment amount - please verify',
          code: 'LARGE_PAYMENT_WARNING'
        });
      }
    }

    // Business logic validation
    if (!payment.customerId && !payment.supplierId) {
      errors.push({
        field: 'party',
        message: 'Either customer or supplier must be specified',
        code: 'PAYMENT_PARTY_REQUIRED',
        severity: 'error'
      });
    }

    if (payment.customerId && payment.supplierId) {
      errors.push({
        field: 'party',
        message: 'Payment cannot be for both customer and supplier',
        code: 'MULTIPLE_PAYMENT_PARTIES',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // =================
  // BANK ACCOUNT VALIDATION
  // =================

  static validateBankAccount(bankAccount: Partial<BankAccount>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!bankAccount.accountName || bankAccount.accountName.trim() === '') {
      errors.push({
        field: 'accountName',
        message: 'Account name is required',
        code: 'BANK_ACCOUNT_NAME_REQUIRED',
        severity: 'error'
      });
    }

    if (!bankAccount.bankName || bankAccount.bankName.trim() === '') {
      errors.push({
        field: 'bankName',
        message: 'Bank name is required',
        code: 'BANK_NAME_REQUIRED',
        severity: 'error'
      });
    }

    if (!bankAccount.accountNumber || bankAccount.accountNumber.trim() === '') {
      errors.push({
        field: 'accountNumber',
        message: 'Account number is required',
        code: 'BANK_ACCOUNT_NUMBER_REQUIRED',
        severity: 'error'
      });
    }

    // Format validation
    if (bankAccount.accountNumber) {
      if (!/^[0-9\-\s]+$/.test(bankAccount.accountNumber)) {
        errors.push({
          field: 'accountNumber',
          message: 'Bank account number should only contain numbers, hyphens, and spaces',
          code: 'INVALID_BANK_ACCOUNT_FORMAT',
          severity: 'error'
        });
      }

      if (bankAccount.accountNumber.replace(/[\-\s]/g, '').length < 8) {
        warnings.push({
          field: 'accountNumber',
          message: 'Bank account number seems too short',
          code: 'SHORT_ACCOUNT_NUMBER'
        });
      }
    }

    // Balance validation
    if (bankAccount.currentBalance !== undefined && isNaN(bankAccount.currentBalance)) {
      errors.push({
        field: 'currentBalance',
        message: 'Current balance must be a valid number',
        code: 'INVALID_BALANCE_FORMAT',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // =================
  // GENERAL VALIDATION UTILITIES
  // =================

  static validateCurrency(currency: string): boolean {
    const validCurrencies = ['KES', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
    return validCurrencies.includes(currency);
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhoneNumber(phone: string): boolean {
    // Basic phone validation for international formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  static validateDateRange(startDate: string, endDate: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      errors.push({
        field: 'startDate',
        message: 'Invalid start date format',
        code: 'INVALID_START_DATE',
        severity: 'error'
      });
    }

    if (isNaN(end.getTime())) {
      errors.push({
        field: 'endDate',
        message: 'Invalid end date format',
        code: 'INVALID_END_DATE',
        severity: 'error'
      });
    }

    if (start > end) {
      errors.push({
        field: 'dateRange',
        message: 'Start date cannot be after end date',
        code: 'INVALID_DATE_RANGE',
        severity: 'error'
      });
    }

    const daysDiff = Math.abs((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      warnings.push({
        field: 'dateRange',
        message: 'Date range spans more than one year',
        code: 'LARGE_DATE_RANGE'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // =================
  // BATCH VALIDATION
  // =================

  static validateBatch<T>(
    items: T[],
    validator: (item: T) => ValidationResult
  ): { valid: T[]; invalid: Array<{ item: T; validation: ValidationResult }> } {
    const valid: T[] = [];
    const invalid: Array<{ item: T; validation: ValidationResult }> = [];

    items.forEach(item => {
      const validation = validator(item);
      if (validation.isValid) {
        valid.push(item);
      } else {
        invalid.push({ item, validation });
      }
    });

    return { valid, invalid };
  }

  // =================
  // ERROR MESSAGE FORMATTING
  // =================

  static formatErrorMessages(validation: ValidationResult): string[] {
    return validation.errors.map(error => `${error.field}: ${error.message}`);
  }

  static formatWarningMessages(validation: ValidationResult): string[] {
    return validation.warnings.map(warning => `${warning.field}: ${warning.message}`);
  }

  static getFieldErrors(validation: ValidationResult, fieldName: string): ValidationError[] {
    return validation.errors.filter(error => error.field === fieldName);
  }

  static hasFieldError(validation: ValidationResult, fieldName: string): boolean {
    return validation.errors.some(error => error.field === fieldName);
  }

  // =================
  // FINANCIAL AUTOMATION VALIDATION
  // =================

  static validateRecurringTransaction(transaction: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!transaction.name || transaction.name.trim().length === 0) {
      errors.push('Recurring transaction name is required');
    }

    if (!transaction.description || transaction.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!transaction.amount || transaction.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!transaction.currency || transaction.currency.trim().length === 0) {
      errors.push('Currency is required');
    }

    const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
    if (!transaction.frequency || !validFrequencies.includes(transaction.frequency)) {
      errors.push('Valid frequency is required (daily, weekly, monthly, quarterly, yearly)');
    }

    if (!transaction.interval || transaction.interval < 1) {
      errors.push('Interval must be at least 1');
    }

    if (!transaction.startDate) {
      errors.push('Start date is required');
    } else {
      const startDate = new Date(transaction.startDate);
      if (isNaN(startDate.getTime())) {
        errors.push('Valid start date is required');
      }
    }

    if (transaction.endDate) {
      const endDate = new Date(transaction.endDate);
      const startDate = new Date(transaction.startDate);
      if (isNaN(endDate.getTime())) {
        errors.push('Valid end date is required');
      } else if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }
    }

    if (!transaction.accountId || transaction.accountId.trim().length === 0) {
      errors.push('Account ID is required');
    }

    if (!transaction.category || transaction.category.trim().length === 0) {
      errors.push('Category is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateReconciliationRule(rule: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.name || rule.name.trim().length === 0) {
      errors.push('Rule name is required');
    }

    if (!rule.description || rule.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!rule.bankStatementPattern || rule.bankStatementPattern.trim().length === 0) {
      errors.push('Bank statement pattern is required');
    }

    // Validate regex pattern
    try {
      new RegExp(rule.bankStatementPattern);
    } catch (e) {
      errors.push('Invalid regex pattern for bank statement matching');
    }

    if (!rule.accountId || rule.accountId.trim().length === 0) {
      errors.push('Account ID is required');
    }

    if (!rule.category || rule.category.trim().length === 0) {
      errors.push('Category is required');
    }

    if (rule.confidence !== undefined) {
      if (typeof rule.confidence !== 'number' || rule.confidence < 0 || rule.confidence > 1) {
        errors.push('Confidence must be a number between 0 and 1');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateCategorizationRule(rule: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.name || rule.name.trim().length === 0) {
      errors.push('Rule name is required');
    }

    if (!rule.pattern || rule.pattern.trim().length === 0) {
      errors.push('Pattern is required');
    }

    // Validate regex pattern
    try {
      new RegExp(rule.pattern);
    } catch (e) {
      errors.push('Invalid regex pattern');
    }

    if (!rule.category || rule.category.trim().length === 0) {
      errors.push('Category is required');
    }

    if (rule.confidence !== undefined) {
      if (typeof rule.confidence !== 'number' || rule.confidence < 0 || rule.confidence > 1) {
        errors.push('Confidence must be a number between 0 and 1');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateBankStatement(statement: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!statement.bankAccountId || statement.bankAccountId.trim().length === 0) {
      errors.push('Bank account ID is required');
    }

    if (!statement.transactionDate) {
      errors.push('Transaction date is required');
    } else {
      const date = new Date(statement.transactionDate);
      if (isNaN(date.getTime())) {
        errors.push('Valid transaction date is required');
      }
    }

    if (!statement.description || statement.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (statement.amount === undefined || statement.amount === null) {
      errors.push('Amount is required');
    } else if (typeof statement.amount !== 'number') {
      errors.push('Amount must be a number');
    }

    if (statement.balance === undefined || statement.balance === null) {
      errors.push('Balance is required');
    } else if (typeof statement.balance !== 'number') {
      errors.push('Balance must be a number');
    }

    if (!statement.reference || statement.reference.trim().length === 0) {
      errors.push('Reference is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
