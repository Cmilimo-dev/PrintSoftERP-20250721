
import { BaseDocument } from '@/types/businessDocuments';

export const generateFinancialReportContent = (document: BaseDocument, currencySymbol: string) => {
  const report = document as any;
  
  return `
    <!-- Financial Summary Cards -->
    <div style="margin: 20px 0;">
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
        <div style="border: 2px solid #0369a1; padding: 15px; text-align: center; background-color: #f0f9ff;">
          <div style="font-size: 12px; color: #0369a1; margin-bottom: 5px; font-weight: bold;">TOTAL REVENUE</div>
          <div style="font-size: 20px; font-weight: bold; color: #059669;">${currencySymbol} ${report.totalRevenue?.toLocaleString() || '0'}</div>
        </div>
        <div style="border: 2px solid #dc2626; padding: 15px; text-align: center; background-color: #fef2f2;">
          <div style="font-size: 12px; color: #dc2626; margin-bottom: 5px; font-weight: bold;">TOTAL EXPENSES</div>
          <div style="font-size: 20px; font-weight: bold; color: #dc2626;">${currencySymbol} ${report.totalExpenses?.toLocaleString() || '0'}</div>
        </div>
        <div style="border: 2px solid #059669; padding: 15px; text-align: center; background-color: #f0fdf4;">
          <div style="font-size: 12px; color: #059669; margin-bottom: 5px; font-weight: bold;">NET PROFIT</div>
          <div style="font-size: 20px; font-weight: bold; color: #059669;">${currencySymbol} ${report.netProfit?.toLocaleString() || '0'}</div>
        </div>
        <div style="border: 2px solid #2563eb; padding: 15px; text-align: center; background-color: #eff6ff;">
          <div style="font-size: 12px; color: #2563eb; margin-bottom: 5px; font-weight: bold;">CASH FLOW</div>
          <div style="font-size: 20px; font-weight: bold; color: #2563eb;">${currencySymbol} ${report.cashFlow?.toLocaleString() || '0'}</div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    ${report.transactions && report.transactions.length > 0 ? `
      <div style="margin: 30px 0;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #2d3748; border-bottom: 2px solid #2d3748; padding-bottom: 8px;">Recent Transactions</div>
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #2d3748;">
          <thead>
            <tr>
              <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: left; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Date</th>
              <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: left; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Description</th>
              <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: left; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Type</th>
              <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: right; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${report.transactions.map((transaction: any, index: number) => `
              <tr style="${index % 2 === 1 ? 'background-color: #f7fafc;' : ''}">
                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px;">${new Date(transaction.date).toLocaleDateString('en-GB')}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px;">${transaction.description}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px;">
                  <span style="color: ${transaction.type === 'credit' ? '#059669' : '#dc2626'}; font-weight: bold; text-transform: capitalize;">
                    ${transaction.type}
                  </span>
                </td>
                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px; text-align: right;">
                  <span style="color: ${transaction.type === 'credit' ? '#059669' : '#dc2626'}; font-weight: bold;">
                    ${currencySymbol} ${transaction.amount.toLocaleString()}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}

    <!-- Budget Analysis -->
    ${report.budgetAnalysis && report.budgetAnalysis.length > 0 ? `
      <div style="margin: 30px 0;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #2d3748; border-bottom: 2px solid #2d3748; padding-bottom: 8px;">Budget Analysis</div>
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #2d3748;">
          <thead>
            <tr>
              <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: left; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Category</th>
              <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: right; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Budgeted</th>
              <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: right; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Actual</th>
              <th style="background-color: #4a5568; color: white; padding: 10px 8px; text-align: right; font-size: 11px; font-weight: bold; border: 1px solid #2d3748;">Variance</th>
            </tr>
          </thead>
          <tbody>
            ${report.budgetAnalysis.map((item: any, index: number) => `
              <tr style="${index % 2 === 1 ? 'background-color: #f7fafc;' : ''}">
                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px; font-weight: bold;">${item.category}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px; text-align: right;">${currencySymbol} ${item.budgeted.toLocaleString()}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px; text-align: right;">${currencySymbol} ${item.actual.toLocaleString()}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 10px; text-align: right;">
                  <span style="color: ${item.variance >= 0 ? '#059669' : '#dc2626'}; font-weight: bold;">
                    ${currencySymbol} ${item.variance.toLocaleString()}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}
  `;
};
