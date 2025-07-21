
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAccountsReceivableAging } from '@/hooks/useFinancial';
import { CreditCard, AlertTriangle, Download, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

const AgingReports: React.FC = () => {
  const { data: agingReport, isLoading } = useAccountsReceivableAging();
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading aging reports...</span>
      </div>
    );
  }

  const totalOutstanding = agingReport?.reduce((sum, item) => sum + item.total, 0) || 0;
  const totalCurrent = agingReport?.reduce((sum, item) => sum + item.current, 0) || 0;
  const totalOverdue = agingReport?.reduce((sum, item) => sum + item.days_30 + item.days_60 + item.days_90 + item.over_90, 0) || 0;
  const customerCount = agingReport?.length || 0;
  const criticalAccounts = agingReport?.filter(item => item.over_90 > 0).length || 0;

  const handleExport = () => {
    // Create CSV content
    const headers = ['Customer', 'Current', '1-30 Days', '31-60 Days', '61-90 Days', 'Over 90 Days', 'Total'];
    const csvContent = [
      headers.join(','),
      ...(agingReport?.map(item => [
        item.customer_name,
        item.current,
        item.days_30,
        item.days_60,
        item.days_90,
        item.over_90,
        item.total
      ].join(',')) || [])
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aging-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={cn(
      "space-y-6",
      isMobile ? "p-2" : ""
    )}>
      {/* Summary Cards */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-2" : "grid-cols-1 md:grid-cols-5"
      )}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All overdue amounts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">KES {totalCurrent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Not yet due</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">KES {totalOverdue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Past due amounts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerCount}</div>
            <p className="text-xs text-muted-foreground">Total accounts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAccounts}</div>
            <p className="text-xs text-muted-foreground">90+ days overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Aging Report */}
      <Card>
        <CardHeader>
          <div className={cn(
            "flex items-center",
            isMobile ? "flex-col space-y-3" : "justify-between"
          )}>
            <div className={isMobile ? "text-center" : ""}>
              <CardTitle className={cn(
                "flex items-center gap-2",
                isMobile ? "text-lg justify-center" : ""
              )}>
                <CreditCard className={cn(
                  isMobile ? "h-4 w-4" : "h-5 w-5"
                )} />
                {isMobile ? "A/R Aging Report" : "Accounts Receivable Aging Report"}
              </CardTitle>
              <div className={cn(
                "text-muted-foreground",
                isMobile ? "text-xs text-center" : "text-sm"
              )}>
                As of {new Date().toLocaleDateString()}
              </div>
            </div>
            <Button 
              onClick={handleExport} 
              variant="outline" 
              size="sm"
              className={isMobile ? "w-full" : ""}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="detailed" className="w-full">
            <TabsList className={cn(
              "w-full",
              isMobile ? "flex justify-start overflow-x-auto gap-1 p-1" : "grid grid-cols-2"
            )}>
              <TabsTrigger 
                value="detailed"
                className={cn(
                  isMobile ? "flex-shrink-0 px-2 py-1 text-xs whitespace-nowrap min-w-0" : ""
                )}
              >
                {isMobile ? "Detailed" : "Detailed View"}
              </TabsTrigger>
              <TabsTrigger 
                value="summary"
                className={cn(
                  isMobile ? "flex-shrink-0 px-2 py-1 text-xs whitespace-nowrap min-w-0" : ""
                )}
              >
                {isMobile ? "Summary" : "Summary View"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="detailed">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-semibold">Customer</th>
                      <th className="text-right p-3 font-semibold">Current</th>
                      <th className="text-right p-3 font-semibold">1-30 Days</th>
                      <th className="text-right p-3 font-semibold">31-60 Days</th>
                      <th className="text-right p-3 font-semibold">61-90 Days</th>
                      <th className="text-right p-3 font-semibold">Over 90 Days</th>
                      <th className="text-right p-3 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agingReport?.map((item) => {
                      const overduePercentage = ((item.days_30 + item.days_60 + item.days_90 + item.over_90) / item.total * 100);
                      return (
                        <tr key={item.customer_id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {item.over_90 > 0 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                              <div>
                                <div className="font-medium">{item.customer_name}</div>
                                {overduePercentage > 50 && (
                                  <div className="text-xs text-red-600">High Risk</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="text-right p-3 text-green-600">KES {item.current.toLocaleString()}</td>
                          <td className="text-right p-3 text-yellow-600">KES {item.days_30.toLocaleString()}</td>
                          <td className="text-right p-3 text-orange-600">KES {item.days_60.toLocaleString()}</td>
                          <td className="text-right p-3 text-red-500">KES {item.days_90.toLocaleString()}</td>
                          <td className="text-right p-3 text-red-600 font-semibold">KES {item.over_90.toLocaleString()}</td>
                          <td className="text-right p-3 font-bold">KES {item.total.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                    {agingReport && agingReport.length > 0 && (
                      <tr className="border-t-2 bg-muted/20 font-bold">
                        <td className="p-3">TOTAL</td>
                        <td className="text-right p-3">KES {totalCurrent.toLocaleString()}</td>
                        <td className="text-right p-3">KES {agingReport.reduce((sum, item) => sum + item.days_30, 0).toLocaleString()}</td>
                        <td className="text-right p-3">KES {agingReport.reduce((sum, item) => sum + item.days_60, 0).toLocaleString()}</td>
                        <td className="text-right p-3">KES {agingReport.reduce((sum, item) => sum + item.days_90, 0).toLocaleString()}</td>
                        <td className="text-right p-3">KES {agingReport.reduce((sum, item) => sum + item.over_90, 0).toLocaleString()}</td>
                        <td className="text-right p-3">KES {totalOutstanding.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {(!agingReport || agingReport.length === 0) && (
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Outstanding Receivables</h3>
                    <p className="text-muted-foreground">All invoices have been paid or no invoices have been issued yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="summary">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Aging Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                        <span className="font-medium">Current (0 days)</span>
                        <span className="font-bold text-green-600">KES {totalCurrent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                        <span className="font-medium">1-30 Days</span>
                        <span className="font-bold text-yellow-600">KES {agingReport?.reduce((sum, item) => sum + item.days_30, 0).toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                        <span className="font-medium">31-60 Days</span>
                        <span className="font-bold text-orange-600">KES {agingReport?.reduce((sum, item) => sum + item.days_60, 0).toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                        <span className="font-medium">61-90 Days</span>
                        <span className="font-bold text-red-500">KES {agingReport?.reduce((sum, item) => sum + item.days_90, 0).toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-100 rounded">
                        <span className="font-medium">Over 90 Days</span>
                        <span className="font-bold text-red-600">KES {agingReport?.reduce((sum, item) => sum + item.over_90, 0).toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Collection Efficiency</div>
                        <div className="text-2xl font-bold text-green-600">
                          {totalOutstanding > 0 ? Math.round((totalCurrent / totalOutstanding) * 100) : 100}%
                        </div>
                        <div className="text-xs text-muted-foreground">Current vs Total</div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">High Risk Accounts</div>
                        <div className="text-2xl font-bold text-red-600">{criticalAccounts}</div>
                        <div className="text-xs text-muted-foreground">90+ days overdue</div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Average Days Outstanding</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {agingReport && agingReport.length > 0 ? Math.round(
                            agingReport.reduce((sum, item) => {
                              const weighted = (item.current * 0) + (item.days_30 * 15) + (item.days_60 * 45) + (item.days_90 * 75) + (item.over_90 * 105);
                              return sum + weighted;
                            }, 0) / totalOutstanding
                          ) : 0} days
                        </div>
                        <div className="text-xs text-muted-foreground">Weighted average</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgingReports;
