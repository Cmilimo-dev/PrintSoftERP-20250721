import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Download, Printer, TrendingUp, DollarSign } from 'lucide-react';
import { useChartOfAccounts, useFinancialTransactions } from '@/hooks/useFinancial';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

interface BalanceSheetData {
  assets: {
    currentAssets: { [key: string]: number };
    fixedAssets: { [key: string]: number };
  };
  liabilities: {
    currentLiabilities: { [key: string]: number };
    longTermLiabilities: { [key: string]: number };
  };
  equity: { [key: string]: number };
}

const BalanceSheetReport: React.FC = () => {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [comparisonPeriod, setComparisonPeriod] = useState('previous-year');
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: accounts } = useChartOfAccounts();
  const { data: transactions } = useFinancialTransactions();
  const isMobile = useIsMobile();

  // Mock balance sheet data - in real app, this would be calculated from transactions
  const balanceSheetData: BalanceSheetData = useMemo(() => {
    return {
      assets: {
        currentAssets: {
          'Cash and Cash Equivalents': 125000,
          'Accounts Receivable': 87500,
          'Inventory': 145000,
          'Prepaid Expenses': 12500,
        },
        fixedAssets: {
          'Property, Plant & Equipment': 450000,
          'Less: Accumulated Depreciation': -125000,
          'Intangible Assets': 75000,
        }
      },
      liabilities: {
        currentLiabilities: {
          'Accounts Payable': 67500,
          'Accrued Liabilities': 23000,
          'Short-term Debt': 45000,
          'Current Portion of Long-term Debt': 25000,
        },
        longTermLiabilities: {
          'Long-term Debt': 185000,
          'Deferred Tax Liabilities': 15000,
        }
      },
      equity: {
        'Share Capital': 200000,
        'Retained Earnings': 210000,
        'Other Comprehensive Income': 15000,
      }
    };
  }, [reportDate, transactions]);

  const calculateTotal = (section: { [key: string]: number }) => {
    return Object.values(section).reduce((sum, value) => sum + value, 0);
  };

  const totalCurrentAssets = calculateTotal(balanceSheetData.assets.currentAssets);
  const totalFixedAssets = calculateTotal(balanceSheetData.assets.fixedAssets);
  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalCurrentLiabilities = calculateTotal(balanceSheetData.liabilities.currentLiabilities);
  const totalLongTermLiabilities = calculateTotal(balanceSheetData.liabilities.longTermLiabilities);
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalEquity = calculateTotal(balanceSheetData.equity);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const { UnifiedDocumentExportService } = await import('@/services/unifiedDocumentExportService');
      
      if (format === 'pdf') {
        // Export as styled PDF with Balance Sheet layout
        const exportData = {
          title: `Balance Sheet - As of ${new Date(reportDate).toLocaleDateString('en-GB')}`,
          data: [
            // Summary Totals First
            { category: 'ASSETS SUMMARY', item: 'Current Assets Total', amount: totalCurrentAssets, type: 'Asset Total' },
            { category: 'ASSETS SUMMARY', item: 'Fixed Assets Total', amount: totalFixedAssets, type: 'Asset Total' },
            { category: 'ASSETS SUMMARY', item: 'TOTAL ASSETS', amount: totalAssets, type: 'GRAND TOTAL' },
            { category: '', item: '', amount: '', type: '' }, // Spacer
            
            // Current Assets
            ...Object.entries(balanceSheetData.assets.currentAssets).map(([item, amount]) => ({
              category: 'Current Assets',
              item: item,
              amount: amount,
              type: 'Asset'
            })),
            
            // Fixed Assets  
            ...Object.entries(balanceSheetData.assets.fixedAssets).map(([item, amount]) => ({
              category: 'Fixed Assets',
              item: item,
              amount: amount,
              type: 'Asset'
            })),
            
            { category: '', item: '', amount: '', type: '' }, // Spacer
            
            // Liabilities Summary
            { category: 'LIABILITIES SUMMARY', item: 'Current Liabilities Total', amount: totalCurrentLiabilities, type: 'Liability Total' },
            { category: 'LIABILITIES SUMMARY', item: 'Long-term Liabilities Total', amount: totalLongTermLiabilities, type: 'Liability Total' },
            { category: 'LIABILITIES SUMMARY', item: 'TOTAL LIABILITIES', amount: totalLiabilities, type: 'GRAND TOTAL' },
            { category: '', item: '', amount: '', type: '' }, // Spacer
            
            // Current Liabilities
            ...Object.entries(balanceSheetData.liabilities.currentLiabilities).map(([item, amount]) => ({
              category: 'Current Liabilities',
              item: item,
              amount: amount,
              type: 'Liability'
            })),
            
            // Long-term Liabilities
            ...Object.entries(balanceSheetData.liabilities.longTermLiabilities).map(([item, amount]) => ({
              category: 'Long-term Liabilities',
              item: item,
              amount: amount,
              type: 'Liability'
            })),
            
            { category: '', item: '', amount: '', type: '' }, // Spacer
            
            // Equity Summary
            { category: 'EQUITY SUMMARY', item: 'TOTAL EQUITY', amount: totalEquity, type: 'GRAND TOTAL' },
            { category: '', item: '', amount: '', type: '' }, // Spacer
            
            // Equity Details
            ...Object.entries(balanceSheetData.equity).map(([item, amount]) => ({
              category: 'Shareholder\'s Equity',
              item: item,
              amount: amount,
              type: 'Equity'
            })),
            
            { category: '', item: '', amount: '', type: '' }, // Spacer
            
            // Balance Check
            { category: 'BALANCE VERIFICATION', item: 'Total Assets', amount: totalAssets, type: 'Verification' },
            { category: 'BALANCE VERIFICATION', item: 'Total Liabilities + Equity', amount: totalLiabilitiesAndEquity, type: 'Verification' },
            { category: 'BALANCE VERIFICATION', item: 'Balance Status', amount: totalAssets === totalLiabilitiesAndEquity ? 'BALANCED ✓' : `NOT BALANCED (Diff: KES ${Math.abs(totalAssets - totalLiabilitiesAndEquity).toLocaleString()})`, type: 'Status' }
          ],
          columns: [
            { key: 'category', label: 'Category' },
            { key: 'item', label: 'Account/Item' },
            { key: 'type', label: 'Type' },
            { key: 'amount', label: 'Amount (KES)' }
          ]
        };
        
        const exportSettings = {
          company: {
            name: 'Business ERP Company',
            address: '123 Business Street',
            city: 'Nairobi',
            state: 'Nairobi County',
            zip: '00100',
            country: 'Kenya',
            phone: '+254 700 123 456',
            email: 'info@businesserp.co.ke',
            website: 'www.businesserp.co.ke',
            taxId: 'P051234567M'
          },
          logo: { url: '', maxWidth: 100, maxHeight: 50 },
          typography: {
            documentTitleFont: 'Tahoma',
            bodyFont: 'Trebuchet MS',
            documentTitleSize: 24,
            bodyFontSize: 12,
            headingColor: '#2b6cb0',
            bodyColor: '#2d3748',
            accentColor: '#3182ce'
          },
          includeFooter: true,
          footerText: `Balance Sheet as of ${new Date(reportDate).toLocaleDateString('en-GB')} | Total Assets: KES ${totalAssets.toLocaleString()} | Generated: ${new Date().toLocaleString()}`
        };
        
        await UnifiedDocumentExportService.exportListData(exportData, 'pdf', exportSettings);
      } else {
        // Export as Excel-compatible CSV with Balance Sheet structure
        const exportData = {
          title: `Balance Sheet - As of ${new Date(reportDate).toLocaleDateString('en-GB')}`,
          data: [
            // Assets Section
            { section: 'ASSETS', category: 'Current Assets', item: 'Cash and Cash Equivalents', amount: balanceSheetData.assets.currentAssets['Cash and Cash Equivalents'], percentage: ((balanceSheetData.assets.currentAssets['Cash and Cash Equivalents'] / totalAssets) * 100).toFixed(2) + '%' },
            { section: 'ASSETS', category: 'Current Assets', item: 'Accounts Receivable', amount: balanceSheetData.assets.currentAssets['Accounts Receivable'], percentage: ((balanceSheetData.assets.currentAssets['Accounts Receivable'] / totalAssets) * 100).toFixed(2) + '%' },
            { section: 'ASSETS', category: 'Current Assets', item: 'Inventory', amount: balanceSheetData.assets.currentAssets['Inventory'], percentage: ((balanceSheetData.assets.currentAssets['Inventory'] / totalAssets) * 100).toFixed(2) + '%' },
            { section: 'ASSETS', category: 'Current Assets', item: 'Prepaid Expenses', amount: balanceSheetData.assets.currentAssets['Prepaid Expenses'], percentage: ((balanceSheetData.assets.currentAssets['Prepaid Expenses'] / totalAssets) * 100).toFixed(2) + '%' },
            { section: 'ASSETS', category: 'SUBTOTAL', item: 'Total Current Assets', amount: totalCurrentAssets, percentage: ((totalCurrentAssets / totalAssets) * 100).toFixed(2) + '%' },
            
            ...Object.entries(balanceSheetData.assets.fixedAssets).map(([item, amount]) => ({
              section: 'ASSETS',
              category: 'Fixed Assets',
              item: item,
              amount: amount,
              percentage: ((amount / totalAssets) * 100).toFixed(2) + '%'
            })),
            { section: 'ASSETS', category: 'SUBTOTAL', item: 'Total Fixed Assets', amount: totalFixedAssets, percentage: ((totalFixedAssets / totalAssets) * 100).toFixed(2) + '%' },
            { section: 'ASSETS', category: 'TOTAL', item: 'TOTAL ASSETS', amount: totalAssets, percentage: '100.00%' },
            
            // Separator
            { section: '', category: '', item: '', amount: '', percentage: '' },
            
            // Liabilities Section
            ...Object.entries(balanceSheetData.liabilities.currentLiabilities).map(([item, amount]) => ({
              section: 'LIABILITIES',
              category: 'Current Liabilities',
              item: item,
              amount: amount,
              percentage: ((amount / totalAssets) * 100).toFixed(2) + '%'
            })),
            { section: 'LIABILITIES', category: 'SUBTOTAL', item: 'Total Current Liabilities', amount: totalCurrentLiabilities, percentage: ((totalCurrentLiabilities / totalAssets) * 100).toFixed(2) + '%' },
            
            ...Object.entries(balanceSheetData.liabilities.longTermLiabilities).map(([item, amount]) => ({
              section: 'LIABILITIES',
              category: 'Long-term Liabilities',
              item: item,
              amount: amount,
              percentage: ((amount / totalAssets) * 100).toFixed(2) + '%'
            })),
            { section: 'LIABILITIES', category: 'SUBTOTAL', item: 'Total Long-term Liabilities', amount: totalLongTermLiabilities, percentage: ((totalLongTermLiabilities / totalAssets) * 100).toFixed(2) + '%' },
            { section: 'LIABILITIES', category: 'TOTAL', item: 'TOTAL LIABILITIES', amount: totalLiabilities, percentage: ((totalLiabilities / totalAssets) * 100).toFixed(2) + '%' },
            
            // Separator
            { section: '', category: '', item: '', amount: '', percentage: '' },
            
            // Equity Section
            ...Object.entries(balanceSheetData.equity).map(([item, amount]) => ({
              section: 'EQUITY',
              category: 'Shareholder\'s Equity',
              item: item,
              amount: amount,
              percentage: ((amount / totalAssets) * 100).toFixed(2) + '%'
            })),
            { section: 'EQUITY', category: 'TOTAL', item: 'TOTAL EQUITY', amount: totalEquity, percentage: ((totalEquity / totalAssets) * 100).toFixed(2) + '%' },
            
            // Separator
            { section: '', category: '', item: '', amount: '', percentage: '' },
            
            // Balance Verification
            { section: 'VERIFICATION', category: 'Balance Check', item: 'Total Liabilities + Equity', amount: totalLiabilitiesAndEquity, percentage: ((totalLiabilitiesAndEquity / totalAssets) * 100).toFixed(2) + '%' },
            { section: 'VERIFICATION', category: 'Balance Check', item: 'Balance Status', amount: totalAssets === totalLiabilitiesAndEquity ? 'BALANCED ✓' : 'NOT BALANCED ✗', percentage: totalAssets === totalLiabilitiesAndEquity ? 'OK' : `Difference: ${Math.abs(totalAssets - totalLiabilitiesAndEquity).toLocaleString()}` }
          ],
          columns: [
            { key: 'section', label: 'Section' },
            { key: 'category', label: 'Category' },
            { key: 'item', label: 'Account/Item' },
            { key: 'amount', label: 'Amount (KES)' },
            { key: 'percentage', label: '% of Total Assets' }
          ]
        };
        
        const exportSettings = {
          company: {
            name: 'Business ERP Company',
            address: '123 Business Street',
            city: 'Nairobi',
            state: 'Nairobi County',
            zip: '00100',
            country: 'Kenya',
            phone: '+254 700 123 456',
            email: 'info@businesserp.co.ke',
            website: 'www.businesserp.co.ke',
            taxId: 'P051234567M'
          },
          logo: { url: '', maxWidth: 100, maxHeight: 50 },
          typography: {
            documentTitleFont: 'Tahoma',
            bodyFont: 'Trebuchet MS',
            documentTitleSize: 24,
            bodyFontSize: 12,
            headingColor: '#2b6cb0',
            bodyColor: '#2d3748',
            accentColor: '#3182ce'
          },
          includeFooter: true,
          footerText: `Balance Sheet as of ${new Date(reportDate).toLocaleDateString('en-GB')} | Generated: ${new Date().toLocaleString()}`
        };
        
        await UnifiedDocumentExportService.exportListData(exportData, 'excel', exportSettings);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Simulate report generation with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, this would:
      // 1. Fetch fresh data based on reportDate and comparisonPeriod
      // 2. Update the state to reflect new data
      // 3. Possibly show success message
      
      console.log('Generating balance sheet report for:', {
        reportDate,
        comparisonPeriod
      });
      
      // Show success message
      alert(`Balance Sheet report generated successfully for ${new Date(reportDate).toLocaleDateString()}`);
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={isMobile ? "flex flex-col gap-4" : "flex justify-between items-center"}>
        <h2 className={isMobile ? "text-xl font-bold" : "text-2xl font-bold"}>Balance Sheet Report</h2>
        <div className={isMobile ? "flex flex-col gap-2" : "flex gap-2"}>
          <Button variant="outline" onClick={() => handleExport('excel')} className={isMobile ? "w-full justify-center" : ""}>
            <Download className="h-4 w-4 mr-2" />
            {isMobile ? "Excel" : "Export Excel"}
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')} className={isMobile ? "w-full justify-center" : ""}>
            <Download className="h-4 w-4 mr-2" />
            {isMobile ? "PDF" : "Export PDF"}
          </Button>
          <Button variant="outline" onClick={handlePrint} className={isMobile ? "w-full justify-center" : ""}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Report Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={isMobile ? "grid grid-cols-1 gap-4" : "grid grid-cols-3 gap-4"}>
            <div>
              <label className="text-sm font-medium">As of Date</label>
              <Input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Comparison Period</label>
              <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous-month">Previous Month</SelectItem>
                  <SelectItem value="previous-quarter">Previous Quarter</SelectItem>
                  <SelectItem value="previous-year">Previous Year</SelectItem>
                  <SelectItem value="none">No Comparison</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                className="w-full" 
                onClick={handleGenerateReport}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Sheet */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet as of {new Date(reportDate).toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assets */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-600">ASSETS</h3>
              
              {/* Current Assets */}
              <div>
                <h4 className="font-medium mb-2">Current Assets</h4>
                <div className="space-y-1 ml-4">
                  {Object.entries(balanceSheetData.assets.currentAssets).map(([item, amount]) => (
                    <div key={item} className="flex justify-between text-sm">
                      <span>{item}</span>
                      <span>KES {amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Current Assets</span>
                    <span>KES {totalCurrentAssets.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Fixed Assets */}
              <div>
                <h4 className="font-medium mb-2">Fixed Assets</h4>
                <div className="space-y-1 ml-4">
                  {Object.entries(balanceSheetData.assets.fixedAssets).map(([item, amount]) => (
                    <div key={item} className="flex justify-between text-sm">
                      <span>{item}</span>
                      <span className={amount < 0 ? 'text-red-600' : ''}>
                        KES {amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Fixed Assets</span>
                    <span>KES {totalFixedAssets.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg border-t-2 pt-2">
                <span>TOTAL ASSETS</span>
                <span>KES {totalAssets.toLocaleString()}</span>
              </div>
            </div>

            {/* Liabilities and Equity */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-600">LIABILITIES & EQUITY</h3>
              
              {/* Current Liabilities */}
              <div>
                <h4 className="font-medium mb-2">Current Liabilities</h4>
                <div className="space-y-1 ml-4">
                  {Object.entries(balanceSheetData.liabilities.currentLiabilities).map(([item, amount]) => (
                    <div key={item} className="flex justify-between text-sm">
                      <span>{item}</span>
                      <span>KES {amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Current Liabilities</span>
                    <span>KES {totalCurrentLiabilities.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Long-term Liabilities */}
              <div>
                <h4 className="font-medium mb-2">Long-term Liabilities</h4>
                <div className="space-y-1 ml-4">
                  {Object.entries(balanceSheetData.liabilities.longTermLiabilities).map(([item, amount]) => (
                    <div key={item} className="flex justify-between text-sm">
                      <span>{item}</span>
                      <span>KES {amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Long-term Liabilities</span>
                    <span>KES {totalLongTermLiabilities.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between font-medium border-t pt-2">
                <span>Total Liabilities</span>
                <span>KES {totalLiabilities.toLocaleString()}</span>
              </div>

              {/* Equity */}
              <div>
                <h4 className="font-medium mb-2">Shareholder's Equity</h4>
                <div className="space-y-1 ml-4">
                  {Object.entries(balanceSheetData.equity).map(([item, amount]) => (
                    <div key={item} className="flex justify-between text-sm">
                      <span>{item}</span>
                      <span>KES {amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Equity</span>
                    <span>KES {totalEquity.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg border-t-2 pt-2">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span>KES {totalLiabilitiesAndEquity.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Balance Check */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Balance Check:</span>
              <span className={totalAssets === totalLiabilitiesAndEquity ? 'text-green-600' : 'text-red-600'}>
                {totalAssets === totalLiabilitiesAndEquity ? '✓ Balanced' : '✗ Not Balanced'}
              </span>
            </div>
            {totalAssets !== totalLiabilitiesAndEquity && (
              <div className="text-sm text-red-600 mt-1">
                Difference: KES {Math.abs(totalAssets - totalLiabilitiesAndEquity).toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Ratios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Financial Ratios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(totalCurrentAssets / totalCurrentLiabilities).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Current Ratio</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {((totalCurrentAssets - 145000) / totalCurrentLiabilities).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Quick Ratio</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(totalLiabilities / totalAssets * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Debt to Assets</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {(totalEquity / totalAssets * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Equity Ratio</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceSheetReport;
