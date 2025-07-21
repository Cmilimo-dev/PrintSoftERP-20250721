
import React from 'react';
import { FinancialReport } from '@/types/businessDocuments';

interface FinancialReportSectionProps {
  document: FinancialReport;
  currencySymbol: string;
}

const FinancialReportSection: React.FC<FinancialReportSectionProps> = ({ document, currencySymbol }) => {
  return (
    <div className="financial-report-section relative z-10">
      {/* Report Header */}
      <div className="report-header mb-6">
        <div className="text-lg font-bold border-b-2 border-gray-800 pb-2">Financial Summary</div>
        <div className="mt-2 text-sm">
          <div><strong>Report Period:</strong> {document.reportType.charAt(0).toUpperCase() + document.reportType.slice(1)}</div>
          <div><strong>Generated:</strong> {new Date().toLocaleDateString('en-GB')}</div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="financial-summary mb-6">
        <div className="text-lg font-bold mb-4 border-b border-gray-400 pb-1">Financial Summary</div>
        <div className="grid grid-cols-4 gap-4">
          <div className="summary-card border border-gray-300 p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">TOTAL REVENUE</div>
            <div className="text-2xl font-bold text-blue-600">{currencySymbol} {document.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="summary-card border border-gray-300 p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">TOTAL EXPENSES</div>
            <div className="text-2xl font-bold text-red-600">{currencySymbol} {document.totalExpenses.toLocaleString()}</div>
          </div>
          <div className="summary-card border border-gray-300 p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">NET PROFIT</div>
            <div className="text-2xl font-bold text-green-600">{currencySymbol} {document.netProfit.toLocaleString()}</div>
          </div>
          <div className="summary-card border border-gray-300 p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">CASH FLOW</div>
            <div className="text-2xl font-bold text-blue-600">{currencySymbol} {document.cashFlow.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {document.transactions && document.transactions.length > 0 && (
        <div className="transactions-section mb-6">
          <div className="text-lg font-bold mb-4 border-b border-gray-400 pb-1">Recent Transactions</div>
          <table className="w-full border-collapse border border-gray-800">
            <thead>
              <tr>
                <th className="bg-gray-700 text-white p-2 text-left text-xs font-bold border border-gray-800">Date</th>
                <th className="bg-gray-700 text-white p-2 text-left text-xs font-bold border border-gray-800">Description</th>
                <th className="bg-gray-700 text-white p-2 text-left text-xs font-bold border border-gray-800">Type</th>
                <th className="bg-gray-700 text-white p-2 text-left text-xs font-bold border border-gray-800">Amount</th>
              </tr>
            </thead>
            <tbody>
              {document.transactions.map((transaction, index) => (
                <tr key={index} className={index % 2 === 1 ? 'bg-gray-100' : ''}>
                  <td className="text-xs p-2 border border-gray-300">{new Date(transaction.date).toLocaleDateString('en-GB')}</td>
                  <td className="text-xs p-2 border border-gray-300">{transaction.description}</td>
                  <td className="text-xs p-2 border border-gray-300 capitalize">
                    <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="text-xs p-2 border border-gray-300 text-right">
                    <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                      {currencySymbol} {transaction.amount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Budget Analysis */}
      {document.budgetAnalysis && document.budgetAnalysis.length > 0 && (
        <div className="budget-analysis-section mb-6">
          <div className="text-lg font-bold mb-4 border-b border-gray-400 pb-1">Budget Analysis</div>
          <table className="w-full border-collapse border border-gray-800">
            <thead>
              <tr>
                <th className="bg-gray-700 text-white p-2 text-left text-xs font-bold border border-gray-800">Category</th>
                <th className="bg-gray-700 text-white p-2 text-left text-xs font-bold border border-gray-800">Budgeted</th>
                <th className="bg-gray-700 text-white p-2 text-left text-xs font-bold border border-gray-800">Actual</th>
                <th className="bg-gray-700 text-white p-2 text-left text-xs font-bold border border-gray-800">Variance</th>
              </tr>
            </thead>
            <tbody>
              {document.budgetAnalysis.map((item, index) => (
                <tr key={index} className={index % 2 === 1 ? 'bg-gray-100' : ''}>
                  <td className="text-xs p-2 border border-gray-300 font-semibold">{item.category}</td>
                  <td className="text-xs p-2 border border-gray-300 text-right">{currencySymbol} {item.budgeted.toLocaleString()}</td>
                  <td className="text-xs p-2 border border-gray-300 text-right">{currencySymbol} {item.actual.toLocaleString()}</td>
                  <td className="text-xs p-2 border border-gray-300 text-right">
                    <span className={item.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {currencySymbol} {item.variance.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FinancialReportSection;
