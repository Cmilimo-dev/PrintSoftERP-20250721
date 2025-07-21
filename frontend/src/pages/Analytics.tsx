import React, { useState, Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MobileDashboardLayout,
  DashboardStatsGrid,
  DashboardHeader
} from '@/components/ui/mobile-dashboard-layout';

// Lazy load heavy components
const AnalyticsDashboard = lazy(() => import('@/components/analytics/AnalyticsDashboard'));
const ReportBuilder = lazy(() => import('@/components/analytics/ReportBuilder'));
const InventoryAlerts = lazy(() => import('@/components/shared/InventoryAlerts'));
import { ReportConfig } from '@/types/analytics';
import { 
  BarChart3, 
  FileText, 
  Bell, 
  Settings,
  TrendingUp,
  Users,
  Package,
  DollarSign
} from 'lucide-react';

const Analytics: React.FC = () => {
  const [savedReports, setSavedReports] = useState<ReportConfig[]>([]);

  const handleSaveReport = (report: ReportConfig) => {
    setSavedReports(prev => [...prev, report]);
    // In a real app, this would save to backend
    console.log('Saved report:', report);
  };

  const handleGenerateReport = (report: ReportConfig) => {
    // In a real app, this would generate and download the report
    console.log('Generating report:', report);
    alert(`Generating ${report.format.toUpperCase()} report: ${report.name}`);
  };

  const quickStats = [
    {
      title: 'Total Revenue',
      value: 'KES 2,450,000',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'Active Customers',
      value: '1,247',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Inventory Value',
      value: 'KES 890,000',
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: Package,
    },
    {
      title: 'Monthly Growth',
      value: '18.7%',
      change: '+3.4%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
  ];

  return (
    <MobileDashboardLayout className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <DashboardHeader
        title="Analytics & Reporting"
        subtitle="Comprehensive business insights and custom reports"
      />

      {/* Quick Stats Overview */}
      <DashboardStatsGrid columns={4}>
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`flex items-center text-xs ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{stat.change} from last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </DashboardStatsGrid>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Report Builder
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts & Monitoring
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Saved Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Suspense fallback={
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
              <Skeleton className="h-64" />
            </div>
          }>
            <AnalyticsDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Suspense fallback={
            <div className="space-y-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-64" />
            </div>
          }>
            <ReportBuilder 
              onSaveReport={handleSaveReport}
              onGenerateReport={handleGenerateReport}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<Skeleton className="h-64" />}>
              <InventoryAlerts />
            </Suspense>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Revenue Target</p>
                      <p className="text-sm text-muted-foreground">98% of monthly target achieved</p>
                    </div>
                    <Badge variant="secondary">On Track</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Customer Acquisition</p>
                      <p className="text-sm text-muted-foreground">15% above target this month</p>
                    </div>
                    <Badge variant="default">Excellent</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Overdue Invoices</p>
                      <p className="text-sm text-muted-foreground">12 invoices overdue by 30+ days</p>
                    </div>
                    <Badge variant="destructive">Action Required</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Report Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {savedReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No saved reports yet</p>
                  <p className="text-sm mt-1">Create custom reports using the Report Builder</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{report.name}</h3>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{report.type}</Badge>
                          <Badge variant="secondary">{report.format.toUpperCase()}</Badge>
                          {report.schedule?.enabled && (
                            <Badge variant="default">Scheduled</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGenerateReport(report)}
                          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MobileDashboardLayout>
  );
};

export default Analytics;
