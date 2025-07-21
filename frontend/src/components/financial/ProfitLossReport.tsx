import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Download, Printer, TrendingUp, TrendingDown } from 'lucide-react';
import { useFinancialTransactions } from '@/hooks/useFinancial';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

interface ProfitLossData {
  revenue: { [key: string]: number };
  costOfGoodsSold: { [key: string]: number };
  operatingExpenses: { [key: string]: number };
  otherIncome: { [key: string]: number };
  otherExpenses: { [key: string]: number };
}

const ProfitLossReport: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous-period');
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: transactions } = useFinancialTransactions();
  const isMobile = useIsMobile();

  // Mock P&L data - in real app, this would be calculated from transactions
  const profitLossData: ProfitLossData = useMemo(() => {
    return {
      revenue: {
        'Product Sales': 485000,
        'Service Revenue': 125000,
        'Other Revenue': 15000,
      },
      costOfGoodsSold: {
        'Cost of Materials': 195000,
        'Direct Labor': 85000,
        'Manufacturing Overhead': 45000,
      },
      operatingExpenses: {
        'Salaries & Benefits': 125000,
        'Rent & Utilities': 28000,
        'Marketing & Advertising': 18000,
        'Office Supplies': 8500,
        'Professional Services': 12000,
        'Insurance': 7500,
        'Depreciation': 15000,
        'Other Operating Expenses': 9500,
      },
      otherIncome: {
        'Interest Income': 2500,
        'Investment Gains': 8000,
      },
      otherExpenses: {
        'Interest Expense': 12000,
        'Bank Charges': 1200,
      }
    };
  }, [startDate, endDate, transactions]);

  const calculateTotal = (section: { [key: string]: number }) => {
    return Object.values(section).reduce((sum, value) => sum + value, 0);
  };

  const totalRevenue = calculateTotal(profitLossData.revenue);
  const totalCOGS = calculateTotal(profitLossData.costOfGoodsSold);
  const grossProfit = totalRevenue - totalCOGS;
  const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const totalOperatingExpenses = calculateTotal(profitLossData.operatingExpenses);
  const operatingIncome = grossProfit - totalOperatingExpenses;
  const operatingMargin = totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : 0;

  const totalOtherIncome = calculateTotal(profitLossData.otherIncome);
  const totalOtherExpenses = calculateTotal(profitLossData.otherExpenses);
  const netOtherIncome = totalOtherIncome - totalOtherExpenses;

  const netIncome = operatingIncome + netOtherIncome;
  const netMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const { UnifiedDocumentExportService } = await import('@/services/unifiedDocumentExportService');
      
      // Prepare financial report data for P&L
      const reportData = {
        documentNumber: `PL-${new Date().getFullYear()}-${Date.now()}`,
        date: endDate,
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
        currency: 'KES',
        reportType: 'profit-loss',
        reportPeriod: `${new Date(startDate).toLocaleDateString('en-GB')} - ${new Date(endDate).toLocaleDateString('en-GB')}`,
        fromDate: startDate,
        toDate: endDate,
        totalRevenue: totalRevenue,
        totalExpenses: totalCOGS + totalOperatingExpenses + totalOtherExpenses,
        netProfit: netIncome,
        cashFlow: netIncome + totalOtherIncome,
        transactions: [
          // Revenue breakdown
          ...Object.entries(profitLossData.revenue).map(([item, amount]) => ({
            date: endDate,
            description: `Revenue: ${item}`,
            type: 'credit',
            amount: amount
          })),
          // COGS breakdown
          ...Object.entries(profitLossData.costOfGoodsSold).map(([item, amount]) => ({
            date: endDate,
            description: `COGS: ${item}`,
            type: 'debit',
            amount: amount
          })),
          // Operating expenses breakdown
          ...Object.entries(profitLossData.operatingExpenses).map(([item, amount]) => ({
            date: endDate,
            description: `Operating Expense: ${item}`,
            type: 'debit',
            amount: amount
          })),
          // Other income breakdown
          ...Object.entries(profitLossData.otherIncome).map(([item, amount]) => ({
            date: endDate,
            description: `Other Income: ${item}`,
            type: 'credit',
            amount: amount
          })),
          // Other expenses breakdown
          ...Object.entries(profitLossData.otherExpenses).map(([item, amount]) => ({
            date: endDate,
            description: `Other Expense: ${item}`,
            type: 'debit',
            amount: amount
          }))
        ],
        budgetAnalysis: [
          {
            category: 'Total Revenue',
            budgeted: totalRevenue * 1.1,
            actual: totalRevenue,
            variance: totalRevenue * 0.1
          },
          {
            category: 'Cost of Goods Sold',
            budgeted: totalCOGS * 0.9,
            actual: totalCOGS,
            variance: totalCOGS * -0.1
          },
          {
            category: 'Operating Expenses',
            budgeted: totalOperatingExpenses * 0.95,
            actual: totalOperatingExpenses,
            variance: totalOperatingExpenses * -0.05
          },
          {
            category: 'Net Income',
            budgeted: netIncome * 1.15,
            actual: netIncome,
            variance: netIncome * 0.15
          }
        ]
      };

      if (format === 'pdf') {
        await UnifiedDocumentExportService.exportDocument(
          reportData,
          'financial-report',
          {
            format: 'pdf',
            filename: `Profit_Loss_${new Date(startDate).toISOString().split('T')[0]}_to_${new Date(endDate).toISOString().split('T')[0]}`,
            includeLogo: true,
            includeSignature: true,
            colorMode: 'monochrome'
          }
        );
      } else {
        // Export as Excel-compatible CSV with complete P&L structure
        const exportData = {
          title: `Profit & Loss Statement - ${new Date(startDate).toLocaleDateString('en-GB')} to ${new Date(endDate).toLocaleDateString('en-GB')}`,
          data: [
            // Revenue Section with Summary
            { section: 'REVENUE', category: 'TOTAL REVENUE', item: 'Total Revenue', amount: totalRevenue, percentage: '100.00%', margin: '' },
            { section: '', category: '', item: '', amount: '', percentage: '', margin: '' }, // Spacer
            
            // Revenue breakdown
            ...Object.entries(profitLossData.revenue).map(([item, amount]) => ({
              section: 'REVENUE',
              category: 'Revenue Items',
              item: item,
              amount: amount,
              percentage: ((amount / totalRevenue) * 100).toFixed(2) + '%',
              margin: ''
            })),
            { section: '', category: '', item: '', amount: '', percentage: '', margin: '' }, // Spacer
            
            // Cost of Goods Sold Section
            { section: 'COGS', category: 'TOTAL COGS', item: 'Total Cost of Goods Sold', amount: totalCOGS, percentage: ((totalCOGS / totalRevenue) * 100).toFixed(2) + '%', margin: '' },
            { section: '', category: '', item: '', amount: '', percentage: '', margin: '' }, // Spacer
            
            ...Object.entries(profitLossData.costOfGoodsSold).map(([item, amount]) => ({
              section: 'COGS',
              category: 'Cost Items',
              item: item,
              amount: amount,
              percentage: ((amount / totalRevenue) * 100).toFixed(2) + '%',
              margin: ''
            })),
            { section: '', category: '', item: '', amount: '', percentage: '', margin: '' }, // Spacer
            
            // Gross Profit
            { section: 'GROSS PROFIT', category: 'CALCULATION', item: 'Gross Profit (Revenue - COGS)', amount: grossProfit, percentage: ((grossProfit / totalRevenue) * 100).toFixed(2) + '%', margin: grossProfitMargin.toFixed(1) + '%' },
            { section: '', category: '', item: '', amount: '', percentage: '', margin: '' }, // Spacer
            
            // Operating Expenses Section
            { section: 'OPERATING EXPENSES', category: 'TOTAL OPERATING EXPENSES', item: 'Total Operating Expenses', amount: totalOperatingExpenses, percentage: ((totalOperatingExpenses / totalRevenue) * 100).toFixed(2) + '%', margin: '' },
            { section: '', category: '', item: '', amount: '', percentage: '', margin: '' }, // Spacer
            
            ...Object.entries(profitLossData.operatingExpenses).map(([item, amount]) => ({
              section: 'OPERATING EXPENSES',
              category: 'Operating Items',
              item: item,
              amount: amount,
              percentage: ((amount / totalRevenue) * 100).toFixed(2) + '%',
              margin: ''
            })),
            { section: '', category: '', item: '', amount: '', percentage: '', margin: '' }, // Spacer
            
            // Operating Income
            { section: 'OPERATING INCOME', category: 'CALCULATION', item: 'Operating Income (Gross Profit - Operating Expenses)', amount: operatingIncome, percentage: ((operatingIncome / totalRevenue) * 100).toFixed(2) + '%', margin: operatingMargin.toFixed(1) + '%' },
            { section: '', category: '', item: '', amount: '', percentage: '', margin: '' }, // Spacer
            
            // Other Income
            { section: 'OTHER INCOME', category: 'TOTAL OTHER INCOME', item: 'Total Other Income', amount: totalOtherIncome, percentage: ((totalOtherIncome / totalRevenue) * 100).toFixed(2) + '%', margin: '' },
            { section: '', category: '', item: '', amount: '', percentage: '', margin: '' }, // Spacer
            
            ...Object.entries(profitLossData.otherIncome).map(([item, amount]) => ({
              section: 'OTHER INCOME',
              category: 'Other Income Items',
              item: item,
              amount: amount,
              percentage: ((amount / totalRevenue) * 100).toFixed(2) + '%',
              margin: ''
            })),
            { section: '', category: '', item: '', amount: '', percentage: '', margin: '' }, // Spacer
            
            // Other Expenses
            { section: 'OTHER EXPENSES', category: 'TOTAL OTHER EXPENSES', item: 'Total Other Expenses', amount: totalOtherExpenses, percentage: ((totalOtherExpenses / totalRevenue) * 100).toFixed(2) + '%', margin: '' },
            { section: '', category: '', item: '', amount: '', percentage: '', margin: '' }, // Spacer
            
            ...Object.entries(profitLossData.otherExpenses).map(([item, amount]) => ({
              section: 'OTHER EXPENSES',
              category: 'Other Expense Items',
              item: item,
              amount: amount,
              percentage: ((amount / totalRevenue) * 100).toFixed(2) + '%',
              margin: ''
            })),
            { section: '', category: '', item: '', amount: '', percentage: '', margin: '' }, // Spacer
            
            // Net Income (Final Result)
            { section: 'NET INCOME', category: 'FINAL RESULT', item: 'Net Income (Operating Income + Other Income - Other Expenses)', amount: netIncome, percentage: ((netIncome / totalRevenue) * 100).toFixed(2) + '%', margin: netMargin.toFixed(1) + '%' },
            { section: '', category: '', item: '', amount: '', percentage: '', margin: '' }, // Spacer
            
            // Key Metrics Summary
            { section: 'KEY METRICS', category: 'Margins', item: 'Gross Profit Margin', amount: '', percentage: '', margin: grossProfitMargin.toFixed(1) + '%' },
            { section: 'KEY METRICS', category: 'Margins', item: 'Operating Margin', amount: '', percentage: '', margin: operatingMargin.toFixed(1) + '%' },
            { section: 'KEY METRICS', category: 'Margins', item: 'Net Margin', amount: '', percentage: '', margin: netMargin.toFixed(1) + '%' },
            { section: 'KEY METRICS', category: 'Ratios', item: 'Operating Expense Ratio', amount: '', percentage: ((totalOperatingExpenses / totalRevenue) * 100).toFixed(2) + '%', margin: '' }
          ],
          columns: [
            { key: 'section', label: 'Section' },
            { key: 'category', label: 'Category' },
            { key: 'item', label: 'Item' },
            { key: 'amount', label: 'Amount (KES)' },
            { key: 'percentage', label: '% of Revenue' },
            { key: 'margin', label: 'Margin %' }
          ]
        };
        
        const exportSettings = {
          company: reportData.company,
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
          footerText: 'Generated by Business ERP System'
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
      // 1. Fetch fresh data based on startDate, endDate, and reportPeriod
      // 2. Update the state to reflect new data
      // 3. Possibly show success message
      
      console.log('Generating P&L report for:', {
        startDate,
        endDate,
        reportPeriod,
        comparisonPeriod
      });
      
      // Show success message
      alert(`P&L Statement report generated successfully for period ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`);
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div className={cn(
        "flex items-center",
        isMobile ? "flex-col gap-4" : "justify-between"
      )}>
        <h2 className={cn(
          "font-bold",
          isMobile ? "text-xl" : "text-2xl"
        )}>Profit & Loss Statement</h2>
        <div className={cn(
          "gap-2",
          isMobile ? "flex flex-col w-full" : "flex"
        )}>
          <Button 
            variant="outline" 
            onClick={() => handleExport('excel')}
            className={cn(
              isMobile ? "w-full justify-center" : ""
            )}
          >
            <Download className="h-4 w-4 mr-2" />
            {isMobile ? "Excel" : "Export Excel"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('pdf')}
            className={cn(
              isMobile ? "w-full justify-center" : ""
            )}
          >
            <Download className="h-4 w-4 mr-2" />
            {isMobile ? "PDF" : "Export PDF"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className={cn(
              isMobile ? "w-full justify-center" : ""
            )}
          >
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
          <div className={cn(
            "gap-4",
            isMobile ? "grid grid-cols-1" : "grid grid-cols-2 md:grid-cols-4"
          )}>
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Report Period</label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
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

      {/* Profit & Loss Statement */}
      <Card>
        <CardHeader>
          <CardTitle>
            Profit & Loss Statement
            <div className="text-sm font-normal text-muted-foreground">
              {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Revenue Section */}
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-3">REVENUE</h3>
              <div className="space-y-2 ml-4">
                {Object.entries(profitLossData.revenue).map(([item, amount]) => (
                  <div key={item} className="flex justify-between">
                    <span>{item}</span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total Revenue</span>
                  <span>{formatCurrency(totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-3">COST OF GOODS SOLD</h3>
              <div className="space-y-2 ml-4">
                {Object.entries(profitLossData.costOfGoodsSold).map(([item, amount]) => (
                  <div key={item} className="flex justify-between">
                    <span>{item}</span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total Cost of Goods Sold</span>
                  <span>{formatCurrency(totalCOGS)}</span>
                </div>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Gross Profit</span>
                <div className="text-right">
                  <div className="text-lg font-semibold">{formatCurrency(grossProfit)}</div>
                  <div className="text-sm text-muted-foreground">
                    Margin: {formatPercentage(grossProfitMargin)}
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Expenses */}
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-3">OPERATING EXPENSES</h3>
              <div className="space-y-2 ml-4">
                {Object.entries(profitLossData.operatingExpenses).map(([item, amount]) => (
                  <div key={item} className="flex justify-between">
                    <span>{item}</span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total Operating Expenses</span>
                  <span>{formatCurrency(totalOperatingExpenses)}</span>
                </div>
              </div>
            </div>

            {/* Operating Income */}
            <div className={`p-4 rounded-lg ${operatingIncome >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Operating Income</span>
                <div className="text-right">
                  <div className="text-lg font-semibold">{formatCurrency(operatingIncome)}</div>
                  <div className="text-sm text-muted-foreground">
                    Margin: {formatPercentage(operatingMargin)}
                  </div>
                </div>
              </div>
            </div>

            {/* Other Income/Expenses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Other Income</h4>
                <div className="space-y-1 ml-4">
                  {Object.entries(profitLossData.otherIncome).map(([item, amount]) => (
                    <div key={item} className="flex justify-between text-sm">
                      <span>{item}</span>
                      <span>{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Other Income</span>
                    <span>{formatCurrency(totalOtherIncome)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-red-600 mb-2">Other Expenses</h4>
                <div className="space-y-1 ml-4">
                  {Object.entries(profitLossData.otherExpenses).map(([item, amount]) => (
                    <div key={item} className="flex justify-between text-sm">
                      <span>{item}</span>
                      <span>{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Other Expenses</span>
                    <span>{formatCurrency(totalOtherExpenses)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Income */}
            <div className={`p-6 rounded-lg border-2 ${netIncome >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">Net Income</span>
                  {netIncome >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{formatCurrency(netIncome)}</div>
                  <div className="text-sm text-muted-foreground">
                    Net Margin: {formatPercentage(netMargin)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatPercentage(grossProfitMargin)}
              </div>
              <div className="text-sm text-gray-600">Gross Profit Margin</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(operatingMargin)}
              </div>
              <div className="text-sm text-gray-600">Operating Margin</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(netMargin)}
              </div>
              <div className="text-sm text-gray-600">Net Margin</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatPercentage((totalOperatingExpenses / totalRevenue) * 100)}
              </div>
              <div className="text-sm text-gray-600">Operating Expense Ratio</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitLossReport;
