export type Currency = 'USD' | 'LBP';

export type TransactionType = 
  | 'receive_customer'
  | 'pay_customer'
  | 'commission'
  | 'personal_withdrawal'
  | 'capital_deposit'
  | 'promo_receipt'
  | 'external_loan_received'
  | 'external_loan_repayment';

export interface Transaction {
  id: string;
  type: TransactionType;
  amountUSD: number;
  amountLBP: number;
  description: string;
  date: string;
  timestamp: number;
}

export interface WalletBalance {
  usd: number;
  lbp: number;
}

export interface InitialBalance {
  usd: number;
  lbp: number;
}

export interface CompanyDebt {
  usd: number;
  lbp: number;
}

export type LoanStatus = 'active' | 'repaid';

export interface Loan {
  id: string;
  lenderName: string;
  amountUSD: number;
  amountLBP: number;
  remainingUSD: number;
  remainingLBP: number;
  status: LoanStatus;
  dateBorrowed: string;
  dateRepaid?: string;
  timestamp: number;
}

export interface ActiveLoans {
  usd: number;
  lbp: number;
}

export const TRANSACTION_LABELS: Record<TransactionType, { en: string; ar: string; color: string }> = {
  receive_customer: {
    en: 'Receive from Customer',
    ar: 'استلام من زبون',
    color: '#10B981'
  },
  pay_customer: {
    en: 'Pay to Customer',
    ar: 'دفع لزبون',
    color: '#EF4444'
  },
  commission: {
    en: 'Monthly Commission',
    ar: 'عمولة شهرية',
    color: '#10B981'
  },
  personal_withdrawal: {
    en: 'Personal Withdrawal',
    ar: 'سحب شخصي',
    color: '#EF4444'
  },
  capital_deposit: {
    en: 'Capital Deposit',
    ar: 'إيداع رأس مال',
    color: '#10B981'
  },
  promo_receipt: {
    en: 'Promo from Company',
    ar: 'بونص من الشركة',
    color: '#10B981'
  },
  external_loan_received: {
    en: 'Borrow Money',
    ar: 'اقتراض مال',
    color: '#F59E0B'
  },
  external_loan_repayment: {
    en: 'Repay Loan',
    ar: 'تسديد قرض',
    color: '#EF4444'
  }
};
