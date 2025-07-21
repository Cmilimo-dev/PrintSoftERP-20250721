
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinancialTransactions } from '@/hooks/useFinancial';
import { FileText, Calendar, DollarSign, Download, Printer } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

const GeneralLedger: React.FC = () => {
  const { data: transactions, isLoading } = useFinancialTransactions();
  const isMobile = useIsMobile();

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const { UnifiedDocumentExportService } = await import('@/services/unifiedDocumentExportService');
      
      const exportData = {
        title: `General Ledger - ${new Date().toLocaleDateString('en-GB')}`,
        data: transactions?.map(transaction => ({
          transactionNumber: transaction.transaction_number || 'N/A',
          date: new Date(transaction.transaction_date).toLocaleDateString('en-GB'),
          description: transaction.description,
          reference: transaction.reference_number || 'N/A',
          totalAmount: transaction.total_amount,
          createdBy: transaction.created_by || 'System',
          entries: transaction.transaction_entries?.map(entry => `${entry.chart_of_accounts?.account_name || 'Unknown'}: DR ${entry.debit_amount || 0} CR ${entry.credit_amount || 0}`).join('; ') || 'No entries'
        })) || [],
        columns: [
          { key: 'transactionNumber', label: 'Transaction #' },
          { key: 'date', label: 'Date' },
          { key: 'description', label: 'Description' },
          { key: 'reference', label: 'Reference' },
          { key: 'totalAmount', label: 'Total Amount (KES)' },
          { key: 'entries', label: 'Journal Entries' },
          { key: 'createdBy', label: 'Created By' }
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
        footerText: `General Ledger | Total Transactions: ${transactions?.length || 0} | Generated: ${new Date().toLocaleString()}`
      };
      
      await UnifiedDocumentExportService.exportListData(exportData, format, exportSettings);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div>Loading general ledger...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header with Export/Print buttons */}
      <div className={cn(
        "flex items-center",
        isMobile ? "flex-col gap-4" : "justify-between"
      )}>
        <div className={cn(
          "flex items-center gap-2",
          isMobile ? "flex-col text-center" : ""
        )}>
          <FileText className={cn(
            isMobile ? "h-4 w-4" : "h-5 w-5"
          )} />
          <h2 className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>General Ledger</h2>
        </div>
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

      <Card>
        <CardHeader>
          <CardTitle className={cn(
            "flex items-center gap-2",
            isMobile ? "text-lg" : ""
          )}>
            <FileText className={cn(
              isMobile ? "h-4 w-4" : "h-5 w-5"
            )} />
            Transaction Details
          </CardTitle>
        </CardHeader>
      <CardContent>
        <div className={cn(
          "space-y-4",
          isMobile ? "space-y-3" : ""
        )}>
          {transactions?.map((transaction) => (
            <div key={transaction.id} className={cn(
              "border rounded-lg",
              isMobile ? "p-3" : "p-4"
            )}>
              <div className={cn(
                "flex mb-3",
                isMobile ? "flex-col space-y-2" : "justify-between items-start"
              )}>
                <div>
                  <div className={cn(
                    "font-semibold",
                    isMobile ? "text-sm" : ""
                  )}>{transaction.description}</div>
                  <div className={cn(
                    "text-muted-foreground flex items-center gap-2",
                    isMobile ? "text-xs flex-col items-start gap-1" : "text-sm"
                  )}>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </div>
                    {transaction.reference_number && (
                      <span className={isMobile ? "text-xs" : "ml-2"}>
                        Ref: {transaction.reference_number}
                      </span>
                    )}
                  </div>
                </div>
                <div className={cn(
                  "flex items-center gap-2 font-bold",
                  isMobile ? "text-base justify-start" : "text-lg"
                )}>
                  <DollarSign className="h-4 w-4" />
                  KES {transaction.total_amount.toLocaleString()}
                </div>
              </div>
              
              {/* Transaction Entries */}
              <div className={cn(
                "mt-4 space-y-2",
                isMobile ? "mt-3" : ""
              )}>
                <div className={cn(
                  "font-medium text-muted-foreground",
                  isMobile ? "text-xs" : "text-sm"
                )}>Journal Entries:</div>
                {transaction.transaction_entries?.map((entry) => (
                  <div key={entry.id} className={cn(
                    "text-sm p-2 bg-gray-50 rounded",
                    isMobile ? "space-y-1" : "grid grid-cols-4 gap-4"
                  )}>
                    {isMobile ? (
                      <>
                        <div className="font-medium text-xs">
                          {entry.chart_of_accounts?.account_name || 'Unknown Account'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.description}
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>
                            {entry.debit_amount > 0 && `DR ${entry.debit_amount.toLocaleString()}`}
                          </span>
                          <span>
                            {entry.credit_amount > 0 && `CR ${entry.credit_amount.toLocaleString()}`}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>{entry.chart_of_accounts?.account_name || 'Unknown Account'}</div>
                        <div>{entry.description}</div>
                        <div className="text-right">
                          {entry.debit_amount > 0 && `DR ${entry.debit_amount.toLocaleString()}`}
                        </div>
                        <div className="text-right">
                          {entry.credit_amount > 0 && `CR ${entry.credit_amount.toLocaleString()}`}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {(!transactions || transactions.length === 0) && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">No transactions found in the general ledger.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default GeneralLedger;
