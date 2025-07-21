// Financial Module Independent Types
export type Currency = 'KES' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF';

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'cost_of_goods_sold';

export type AccountSubtype = 
  // Assets
  | 'current_asset' | 'fixed_asset' | 'other_asset' | 'inventory' | 'accounts_receivable' | 'cash' | 'bank'
  // Liabilities
  | 'current_liability' | 'long_term_liability' | 'accounts_payable' | 'credit_card' | 'loan' | 'tax_liability'
  // Equity
  | 'owners_equity' | 'retained_earnings' | 'capital' | 'drawings'
  // Revenue
  | 'operating_revenue' | 'other_revenue' | 'interest_income' | 'sales_revenue'
  // Expenses
  | 'operating_expense' | 'administrative_expense' | 'selling_expense' | 'financial_expense' | 'other_expense'
  // Cost of Goods Sold
  | 'direct_costs' | 'materials' | 'labor' | 'overhead';

export type TransactionType = 'debit' | 'credit';

export type JournalEntryStatus = 'draft' | 'posted' | 'void' | 'reversed';

export type PaymentMethod = 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'mobile_money' | 'other';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partial';

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'void';

export type BillStatus = 'draft' | 'received' | 'approved' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'void';

export type TaxType = 'sales_tax' | 'vat' | 'gst' | 'income_tax' | 'withholding_tax' | 'custom';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export type ReportType = 'income_statement' | 'balance_sheet' | 'cash_flow' | 'trial_balance' | 'general_ledger' | 'aging_report' | 'tax_report' | 'custom';

export type ReconciliationStatus = 'pending' | 'matched' | 'unmatched' | 'cleared' | 'disputed';

export type BudgetType = 'operating' | 'capital' | 'cash_flow' | 'project' | 'department';

export type BudgetPeriod = 'monthly' | 'quarterly' | 'annually';

export type BudgetStatus = 'draft' | 'active' | 'completed' | 'cancelled';

// Chart of Accounts
export interface ChartOfAccounts {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  accountSubtype: AccountSubtype;
  parentAccountId?: string;
  description?: string;
  isActive: boolean;
  isSystemAccount: boolean;
  defaultTaxRateId?: string;
  currency: Currency;
  openingBalance: number;
  currentBalance: number;
  debitBalance: number;
  creditBalance: number;
  lastTransactionDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  notes?: string;
}

// Journal Entry
export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  reference?: string;
  description: string;
  status: JournalEntryStatus;
  totalDebit: number;
  totalCredit: number;
  currency: Currency;
  exchangeRate?: number;
  attachments: JournalAttachment[];
  lineItems: JournalLineItem[];
  tags: string[];
  approvedBy?: string;
  approvedAt?: string;
  postedBy?: string;
  postedAt?: string;
  reversedBy?: string;
  reversedAt?: string;
  reversalReason?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Journal Line Item
export interface JournalLineItem {
  id: string;
  accountId: string;
  description?: string;
  debitAmount: number;
  creditAmount: number;
  currency: Currency;
  exchangeRate?: number;
  taxRateId?: string;
  taxAmount?: number;
  customerId?: string;
  supplierId?: string;
  projectId?: string;
  departmentId?: string;
  notes?: string;
}

// Journal Attachment
export interface JournalAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

// Payment
export interface Payment {
  id: string;
  paymentNumber: string;
  type: 'payment' | 'receipt';
  date: string;
  amount: number;
  currency: Currency;
  exchangeRate?: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  description?: string;
  fromAccountId: string;
  toAccountId: string;
  customerId?: string;
  supplierId?: string;
  invoiceIds: string[];
  billIds: string[];
  attachments: PaymentAttachment[];
  fees: PaymentFee[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  notes?: string;
}

// Payment Attachment
export interface PaymentAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

// Payment Fee
export interface PaymentFee {
  id: string;
  description: string;
  amount: number;
  accountId: string;
}

// Invoice
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: Currency;
  exchangeRate?: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  terms?: string;
  notes?: string;
  internalNotes?: string;
  lineItems: InvoiceLineItem[];
  taxes: InvoiceTax[];
  payments: InvoicePayment[];
  attachments: InvoiceAttachment[];
  tags: string[];
  sentAt?: string;
  viewedAt?: string;
  lastReminderSent?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Invoice Line Item
export interface InvoiceLineItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxRateId?: string;
  taxAmount?: number;
  totalAmount: number;
  accountId?: string;
}

// Invoice Tax
export interface InvoiceTax {
  id: string;
  taxRateId: string;
  taxName: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

// Invoice Payment
export interface InvoicePayment {
  id: string;
  paymentId: string;
  amount: number;
  date: string;
  notes?: string;
}

// Invoice Attachment
export interface InvoiceAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

// Bill
export interface Bill {
  id: string;
  billNumber: string;
  supplierInvoiceNumber?: string;
  supplierId: string;
  date: string;
  dueDate: string;
  status: BillStatus;
  currency: Currency;
  exchangeRate?: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  terms?: string;
  notes?: string;
  internalNotes?: string;
  lineItems: BillLineItem[];
  taxes: BillTax[];
  payments: BillPayment[];
  attachments: BillAttachment[];
  tags: string[];
  receivedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Bill Line Item
export interface BillLineItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxRateId?: string;
  taxAmount?: number;
  totalAmount: number;
  accountId?: string;
}

// Bill Tax
export interface BillTax {
  id: string;
  taxRateId: string;
  taxName: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

// Bill Payment
export interface BillPayment {
  id: string;
  paymentId: string;
  amount: number;
  date: string;
  notes?: string;
}

// Bill Attachment
export interface BillAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

// Tax Rate
export interface TaxRate {
  id: string;
  name: string;
  type: TaxType;
  rate: number;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  validFrom: string;
  validTo?: string;
  applicableAccounts: string[];
  createdAt: string;
  updatedAt: string;
}

// Bank Account
export interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  iban?: string;
  swiftCode?: string;
  currency: Currency;
  accountType: 'checking' | 'savings' | 'credit' | 'loan' | 'investment';
  currentBalance: number;
  availableBalance: number;
  isActive: boolean;
  isDefault: boolean;
  chartOfAccountsId: string;
  lastReconciledDate?: string;
  lastReconciledBalance?: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// Bank Transaction
export interface BankTransaction {
  id: string;
  bankAccountId: string;
  date: string;
  description: string;
  reference?: string;
  amount: number;
  type: 'debit' | 'credit';
  balance: number;
  status: ReconciliationStatus;
  journalEntryId?: string;
  paymentId?: string;
  category?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Bank Reconciliation
export interface BankReconciliation {
  id: string;
  bankAccountId: string;
  periodStart: string;
  periodEnd: string;
  statementBalance: number;
  bookBalance: number;
  adjustments: ReconciliationAdjustment[];
  reconciledTransactions: string[];
  unreconciledTransactions: string[];
  status: 'in_progress' | 'completed' | 'reviewed';
  completedBy?: string;
  completedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// Reconciliation Adjustment
export interface ReconciliationAdjustment {
  id: string;
  description: string;
  amount: number;
  type: 'add' | 'subtract';
  accountId: string;
  journalEntryId?: string;
}

// Budget
export interface Budget {
  id: string;
  name: string;
  type: BudgetType;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  status: BudgetStatus;
  currency: Currency;
  totalBudgetAmount: number;
  totalActualAmount: number;
  totalVariance: number;
  lineItems: BudgetLineItem[];
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  notes?: string;
}

// Budget Line Item
export interface BudgetLineItem {
  id: string;
  accountId: string;
  description?: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  notes?: string;
}

// Financial Report
export interface FinancialReport {
  id: string;
  name: string;
  type: ReportType;
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  currency: Currency;
  parameters: ReportParameters;
  data: ReportData;
  generatedAt: string;
  generatedBy: string;
  isScheduled: boolean;
  scheduleConfig?: ReportSchedule;
  createdAt: string;
  updatedAt: string;
}

// Report Parameters
export interface ReportParameters {
  accounts?: string[];
  departments?: string[];
  projects?: string[];
  customers?: string[];
  suppliers?: string[];
  includeZeroBalances?: boolean;
  groupBy?: 'account' | 'department' | 'project' | 'month' | 'quarter';
  sortBy?: 'name' | 'amount' | 'date';
  sortOrder?: 'asc' | 'desc';
  comparePreviousPeriod?: boolean;
  includePercentages?: boolean;
}

// Report Data
export interface ReportData {
  summary: ReportSummary;
  details: ReportDetail[];
  totals: ReportTotals;
  metadata: ReportMetadata;
}

// Report Summary
export interface ReportSummary {
  totalRevenue?: number;
  totalExpenses?: number;
  netIncome?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  totalEquity?: number;
  grossProfit?: number;
  operatingIncome?: number;
  [key: string]: any;
}

// Report Detail
export interface ReportDetail {
  accountId: string;
  accountName: string;
  accountNumber: string;
  accountType: AccountType;
  currentBalance: number;
  previousBalance?: number;
  variance?: number;
  variancePercentage?: number;
  transactions?: ReportTransaction[];
  [key: string]: any;
}

// Report Transaction
export interface ReportTransaction {
  date: string;
  description: string;
  reference?: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
}

// Report Totals
export interface ReportTotals {
  totalDebits: number;
  totalCredits: number;
  netTotal: number;
  [key: string]: any;
}

// Report Metadata
export interface ReportMetadata {
  accountsIncluded: number;
  transactionsIncluded: number;
  periodDays: number;
  baseCurrency: Currency;
  exchangeRatesUsed?: { [key: string]: number };
  [key: string]: any;
}

// Report Schedule
export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  includeAttachments: boolean;
}

// Cash Flow Statement
export interface CashFlowStatement {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  currency: Currency;
  operatingActivities: CashFlowActivity[];
  investingActivities: CashFlowActivity[];
  financingActivities: CashFlowActivity[];
  netCashFromOperating: number;
  netCashFromInvesting: number;
  netCashFromFinancing: number;
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
  generatedAt: string;
}

// Cash Flow Activity
export interface CashFlowActivity {
  description: string;
  amount: number;
  accountIds: string[];
}

// Aging Report
export interface AgingReport {
  id: string;
  type: 'receivables' | 'payables';
  asOfDate: string;
  currency: Currency;
  summary: AgingSummary;
  details: AgingDetail[];
  generatedAt: string;
}

// Aging Summary
export interface AgingSummary {
  totalAmount: number;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
}

// Aging Detail
export interface AgingDetail {
  id: string;
  name: string;
  totalAmount: number;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
  invoices?: AgingInvoice[];
  bills?: AgingBill[];
}

// Aging Invoice
export interface AgingInvoice {
  invoiceId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  daysOverdue: number;
}

// Aging Bill
export interface AgingBill {
  billId: string;
  billNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  daysOverdue: number;
}

// Financial Analytics
export interface FinancialAnalytics {
  period: string;
  startDate: string;
  endDate: string;
  currency: Currency;
  
  // Profitability Ratios
  grossProfitMargin: number;
  netProfitMargin: number;
  operatingMargin: number;
  returnOnAssets: number;
  returnOnEquity: number;
  
  // Liquidity Ratios
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  workingCapital: number;
  
  // Efficiency Ratios
  assetTurnover: number;
  inventoryTurnover: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  
  // Leverage Ratios
  debtToEquity: number;
  debtToAssets: number;
  equityRatio: number;
  interestCoverage: number;
  
  // Cash Flow Metrics
  operatingCashFlow: number;
  freeCashFlow: number;
  cashFlowToDebt: number;
  
  // Trend Analysis
  revenueGrowth: number;
  expenseGrowth: number;
  profitGrowth: number;
  
  generatedAt: string;
}

// Financial Settings
export interface FinancialSettings {
  baseCurrency: Currency;
  fiscalYearStart: string;
  taxSettings: TaxSettings;
  numberingSettings: NumberingSettings;
  accountSettings: AccountSettings;
  reportSettings: ReportSettings;
  integrationSettings: IntegrationSettings;
  createdAt: string;
  updatedAt: string;
}

// Tax Settings
export interface TaxSettings {
  defaultTaxRateId: string;
  taxNumberFormat: string;
  autoCalculateTax: boolean;
  includeTaxInPrices: boolean;
  taxRoundingMethod: 'round' | 'floor' | 'ceil';
  compoundTaxes: boolean;
}

// Numbering Settings
export interface NumberingSettings {
  journalEntryPrefix: string;
  invoicePrefix: string;
  billPrefix: string;
  paymentPrefix: string;
  creditNotePrefix: string;
  debitNotePrefix: string;
  autoNumbering: boolean;
  padLength: number;
}

// Account Settings
export interface AccountSettings {
  defaultChartOfAccounts: string;
  allowNegativeBalances: boolean;
  requireAccountNumbers: boolean;
  accountNumberFormat: string;
  enableMultiCurrency: boolean;
  defaultPaymentTerms: number;
}

// Report Settings
export interface ReportSettings {
  defaultReportCurrency: Currency;
  includeZeroBalances: boolean;
  showAccountNumbers: boolean;
  dateFormat: string;
  numberFormat: string;
  logoUrl?: string;
  companyInfo: CompanyInfo;
}

// Company Info
export interface CompanyInfo {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  registrationNumber?: string;
  website?: string;
}

// Integration Settings
export interface IntegrationSettings {
  bankFeeds: BankFeedSettings[];
  paymentGateways: PaymentGatewaySettings[];
  ecommerce: EcommerceSettings[];
  accounting: AccountingSettings[];
}

// Bank Feed Settings
export interface BankFeedSettings {
  id: string;
  bankName: string;
  isEnabled: boolean;
  apiKey?: string;
  lastSync?: string;
  syncFrequency: 'manual' | 'daily' | 'weekly';
}

// Payment Gateway Settings
export interface PaymentGatewaySettings {
  id: string;
  provider: string;
  isEnabled: boolean;
  publicKey?: string;
  secretKey?: string;
  webhookUrl?: string;
}

// Ecommerce Settings
export interface EcommerceSettings {
  id: string;
  platform: string;
  isEnabled: boolean;
  storeUrl?: string;
  apiKey?: string;
  lastSync?: string;
}

// Accounting Settings
export interface AccountingSettings {
  id: string;
  software: string;
  isEnabled: boolean;
  apiKey?: string;
  lastSync?: string;
  syncDirection: 'import' | 'export' | 'bidirectional';
}

// Search and Filter Types
export interface AccountSearchCriteria {
  query?: string;
  accountType?: AccountType;
  accountSubtype?: AccountSubtype;
  isActive?: boolean;
  hasTransactions?: boolean;
  balanceMin?: number;
  balanceMax?: number;
  parentAccountId?: string;
  createdAfter?: string;
  createdBefore?: string;
}

export interface TransactionSearchCriteria {
  query?: string;
  accountIds?: string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  transactionType?: TransactionType;
  status?: JournalEntryStatus;
  reference?: string;
  tags?: string[];
  customerId?: string;
  supplierId?: string;
}

export interface PaymentSearchCriteria {
  query?: string;
  type?: 'payment' | 'receipt';
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  paymentMethod?: PaymentMethod;
  status?: PaymentStatus;
  customerId?: string;
  supplierId?: string;
  accountId?: string;
}

// Import/Export Types
export interface AccountImportData {
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  accountSubtype: AccountSubtype;
  parentAccountNumber?: string;
  description?: string;
  openingBalance?: number;
  currency?: Currency;
  isActive?: boolean;
}

export interface TransactionImportData {
  date: string;
  description: string;
  reference?: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  currency?: Currency;
  customerId?: string;
  supplierId?: string;
  notes?: string;
}

export interface InvoiceImportData {
  customerName: string;
  customerEmail?: string;
  invoiceNumber?: string;
  date: string;
  dueDate?: string;
  currency?: Currency;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
  }[];
  notes?: string;
}

export interface BillImportData {
  supplierName: string;
  supplierEmail?: string;
  billNumber?: string;
  supplierInvoiceNumber?: string;
  date: string;
  dueDate?: string;
  currency?: Currency;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
  }[];
  notes?: string;
}
