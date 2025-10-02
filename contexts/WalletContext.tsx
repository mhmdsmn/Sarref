import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Transaction, WalletBalance, InitialBalance, CompanyDebt, Loan, ActiveLoans } from '@/constants/types';

const STORAGE_KEYS = {
  TRANSACTIONS: '@agent_finance_transactions',
  INITIAL_BALANCE: '@agent_finance_initial_balance',
  LOANS: '@agent_finance_loans',
  BACKUPS: '@agent_finance_backups',
} as const;

const DEFAULT_INITIAL_BALANCE: InitialBalance = {
  usd: 2000,
  lbp: 4450000,
};

export const [WalletProvider, useWallet] = createContextHook(() => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [initialBalance, setInitialBalance] = useState<InitialBalance>(DEFAULT_INITIAL_BALANCE);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const saveData = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions)),
        AsyncStorage.setItem(STORAGE_KEYS.INITIAL_BALANCE, JSON.stringify(initialBalance)),
        AsyncStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans)),
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [transactions, initialBalance, loans]);

  useEffect(() => {
    if (!isLoading) {
      saveData();
    }
  }, [transactions, initialBalance, loans, isLoading, saveData]);

  const loadData = async () => {
    try {
      const [transactionsData, initialBalanceData, loansData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.INITIAL_BALANCE),
        AsyncStorage.getItem(STORAGE_KEYS.LOANS),
      ]);

      if (transactionsData) {
        setTransactions(JSON.parse(transactionsData));
      }

      if (initialBalanceData) {
        setInitialBalance(JSON.parse(initialBalanceData));
      }

      if (loansData) {
        setLoans(JSON.parse(loansData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const currentBalance: WalletBalance = useMemo(() => {
    let usd = initialBalance.usd;
    let lbp = initialBalance.lbp;

    transactions.forEach((transaction) => {
      switch (transaction.type) {
        case 'receive_customer':
        case 'commission':
        case 'promo_receipt':
        case 'external_loan_received':
          usd += transaction.amountUSD;
          lbp += transaction.amountLBP;
          break;
        case 'pay_customer':
        case 'personal_withdrawal':
        case 'capital_deposit':
        case 'external_loan_repayment':
          usd -= transaction.amountUSD;
          lbp -= transaction.amountLBP;
          break;
      }
    });

    return { usd, lbp };
  }, [transactions, initialBalance]);

  const companyDebtStatus = useMemo(() => {
    const debtUSD = initialBalance.usd - currentBalance.usd;
    const debtLBP = initialBalance.lbp - currentBalance.lbp;

    return {
      companyOwesYou: {
        usd: Math.max(0, debtUSD),
        lbp: Math.max(0, debtLBP)
      },
      youOweCompany: {
        usd: Math.max(0, -debtUSD),
        lbp: Math.max(0, -debtLBP)
      },
      isSettled: debtUSD === 0 && debtLBP === 0
    };
  }, [initialBalance, currentBalance]);

  const activeLoans: ActiveLoans = useMemo(() => {
    return loans
      .filter(loan => loan.status === 'active')
      .reduce((acc, loan) => ({
        usd: acc.usd + loan.remainingUSD,
        lbp: acc.lbp + loan.remainingLBP
      }), { usd: 0, lbp: 0 });
  }, [loans]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateInitialBalance = useCallback((balance: InitialBalance) => {
    setInitialBalance(balance);
  }, []);

  const addLoan = useCallback((loan: Omit<Loan, 'id' | 'timestamp'>) => {
    const newLoan: Loan = {
      ...loan,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    setLoans((prev) => [newLoan, ...prev]);
  }, []);

  const repayLoan = useCallback((loanId: string, amountUSD: number, amountLBP: number) => {
    setLoans((prev) => prev.map((loan) => {
      if (loan.id === loanId) {
        const newRemainingUSD = Math.max(0, loan.remainingUSD - amountUSD);
        const newRemainingLBP = Math.max(0, loan.remainingLBP - amountLBP);
        const isFullyRepaid = newRemainingUSD === 0 && newRemainingLBP === 0;

        return {
          ...loan,
          remainingUSD: newRemainingUSD,
          remainingLBP: newRemainingLBP,
          status: isFullyRepaid ? 'repaid' as const : loan.status,
          dateRepaid: isFullyRepaid ? new Date().toISOString().split('T')[0] : loan.dateRepaid,
        };
      }
      return loan;
    }));
  }, []);

  const createBackup = useCallback(async () => {
    try {
      const backup = {
        transactions,
        initialBalance,
        loans,
        timestamp: Date.now(),
        date: new Date().toISOString(),
      };

      const backupsData = await AsyncStorage.getItem(STORAGE_KEYS.BACKUPS);
      const backups = backupsData ? JSON.parse(backupsData) : [];
      backups.unshift(backup);

      const recentBackups = backups.slice(0, 10);
      await AsyncStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(recentBackups));

      return backup;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }, [transactions, initialBalance, loans]);

  const restoreBackup = useCallback(async (backup: any) => {
    try {
      setTransactions(backup.transactions || []);
      setInitialBalance(backup.initialBalance || DEFAULT_INITIAL_BALANCE);
      setLoans(backup.loans || []);
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }, []);

  const getBackups = useCallback(async () => {
    try {
      const backupsData = await AsyncStorage.getItem(STORAGE_KEYS.BACKUPS);
      return backupsData ? JSON.parse(backupsData) : [];
    } catch (error) {
      console.error('Error getting backups:', error);
      return [];
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.TRANSACTIONS, STORAGE_KEYS.INITIAL_BALANCE, STORAGE_KEYS.LOANS]);
      setTransactions([]);
      setInitialBalance(DEFAULT_INITIAL_BALANCE);
      setLoans([]);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }, []);

  const setCurrentBalance = useCallback((balance: WalletBalance) => {
    setTransactions([]);
    setInitialBalance(balance);
  }, []);

  return useMemo(() => ({
    transactions,
    currentBalance,
    initialBalance,
    companyOwesYou: companyDebtStatus.companyOwesYou,
    youOweCompany: companyDebtStatus.youOweCompany,
    isSettled: companyDebtStatus.isSettled,
    loans,
    activeLoans,
    isLoading,
    addTransaction,
    deleteTransaction,
    updateInitialBalance,
    addLoan,
    repayLoan,
    createBackup,
    restoreBackup,
    getBackups,
    clearAllData,
    setCurrentBalance,
  }), [transactions, currentBalance, initialBalance, companyDebtStatus, loans, activeLoans, isLoading, addTransaction, deleteTransaction, updateInitialBalance, addLoan, repayLoan, createBackup, restoreBackup, getBackups, clearAllData, setCurrentBalance]);
});
