// Clean ERP financial hook without business document dependencies
import { useState, useEffect } from 'react';
import { ERPAccount, ERPTransaction } from '../types/erpTypes';
import { erpDataService } from '../services/erpDataService';

export interface UseERPFinancialReturn {
  accounts: ERPAccount[];
  transactions: ERPTransaction[];
  loading: boolean;
  error: string | null;
  saveAccount: (account: ERPAccount) => Promise<ERPAccount>;
  deleteAccount: (id: string) => Promise<void>;
  getAccount: (id: string) => ERPAccount | undefined;
  saveTransaction: (transaction: ERPTransaction) => Promise<ERPTransaction>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransaction: (id: string) => ERPTransaction | undefined;
  getAccountBalance: (accountId: string) => number;
  refreshFinancial: () => void;
}

export function useERPFinancial(): UseERPFinancialReturn {
  const [accounts, setAccounts] = useState<ERPAccount[]>([]);
  const [transactions, setTransactions] = useState<ERPTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFinancial = () => {
    try {
      setLoading(true);
      setError(null);
      const accountsData = erpDataService.getAccounts();
      const transactionsData = erpDataService.getTransactions();
      setAccounts(accountsData);
      setTransactions(transactionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancial();
  }, []);

  const saveAccount = async (account: ERPAccount): Promise<ERPAccount> => {
    try {
      setError(null);
      const savedAccount = erpDataService.saveAccount(account);
      loadFinancial(); // Refresh the list
      return savedAccount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save account';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteAccount = async (id: string): Promise<void> => {
    try {
      setError(null);
      erpDataService.deleteAccount(id);
      loadFinancial(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getAccount = (id: string): ERPAccount | undefined => {
    return accounts.find(account => account.id === id);
  };

  const saveTransaction = async (transaction: ERPTransaction): Promise<ERPTransaction> => {
    try {
      setError(null);
      const savedTransaction = erpDataService.saveTransaction(transaction);
      loadFinancial(); // Refresh the list
      return savedTransaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    try {
      setError(null);
      erpDataService.deleteTransaction(id);
      loadFinancial(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getTransaction = (id: string): ERPTransaction | undefined => {
    return transactions.find(transaction => transaction.id === id);
  };

  const getAccountBalance = (accountId: string): number => {
    const account = getAccount(accountId);
    if (!account) return 0;

    const accountTransactions = transactions.filter(t => t.accountId === accountId && t.status === 'approved');
    
    return accountTransactions.reduce((balance, transaction) => {
      if (transaction.debitCredit === 'debit') {
        return balance + transaction.amount;
      } else {
        return balance - transaction.amount;
      }
    }, account.balance);
  };

  const refreshFinancial = () => {
    loadFinancial();
  };

  return {
    accounts,
    transactions,
    loading,
    error,
    saveAccount,
    deleteAccount,
    getAccount,
    saveTransaction,
    deleteTransaction,
    getTransaction,
    getAccountBalance,
    refreshFinancial
  };
}
