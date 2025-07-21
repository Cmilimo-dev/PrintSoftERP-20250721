import React, { useState, useEffect } from 'react';
import { Activity, Brain, Shield, Zap, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
// import { FinancialAutomationService } from '@/services/financialAutomationService';

interface AutomationStats {
  recurringTransactions: {
    total: number;
    active: number;
    dueToday: number;
    overdue: number;
  };
  reconciliation: {
    totalRules: number;
    activeRules: number;
    recentMatches: number;
    avgConfidence: number;
  };
  categorization: {
    totalRules: number;
    activeRules: number;
    recentUsage: number;
    avgConfidence: number;
  };
  insights: {
    totalInsights: number;
    newAnomalies: number;
    recommendations: number;
  };
}

export const FinancialAutomationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AutomationStats>({
    recurringTransactions: { total: 0, active: 0, dueToday: 0, overdue: 0 },
    reconciliation: { totalRules: 0, activeRules: 0, recentMatches: 0, avgConfidence: 0 },
    categorization: { totalRules: 0, activeRules: 0, recentUsage: 0, avgConfidence: 0 },
    insights: { totalInsights: 0, newAnomalies: 0, recommendations: 0 }
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // For now, we'll use sample data
      setStats({
        recurringTransactions: { total: 12, active: 10, dueToday: 3, overdue: 1 },
        reconciliation: { totalRules: 8, activeRules: 7, recentMatches: 45, avgConfidence: 0.85 },
        categorization: { totalRules: 15, activeRules: 13, recentUsage: 127, avgConfidence: 0.78 },
        insights: { totalInsights: 23, newAnomalies: 2, recommendations: 5 }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load automation statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runAutomaticProcesses = async () => {
    try {
      toast({
        title: "Processing",
        description: "Running automated financial processes..."
      });

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Automated processes completed successfully"
      });
      
      loadStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to run automated processes",
        variant: "destructive"
      });
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'default' | 'success' | 'warning' | 'danger';
  }> = ({ title, value, subtitle, icon, trend, color = 'default' }) => {
    const colorClasses = {
      default: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      danger: 'text-red-600'
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={colorClasses[color]}>{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground flex items-center">
              {trend && (
                <TrendingUp className={`h-3 w-3 mr-1 ${
                  trend === 'up' ? 'text-green-500' : 
                  trend === 'down' ? 'text-red-500' : 'text-gray-500'
                }`} />
              )}
              {subtitle}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Automation</h1>
          <p className="text-gray-600">Streamline your financial processes with intelligent automation</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadStats}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh Stats
          </Button>
          <Button onClick={runAutomaticProcesses}>
            <Zap className="h-4 w-4 mr-2" />
            Run Automation
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Transactions</TabsTrigger>
          <TabsTrigger value="reconciliation">Auto-Reconciliation</TabsTrigger>
          <TabsTrigger value="categorization">Smart Categorization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Recurring Transactions"
              value={stats.recurringTransactions.active}
              subtitle={`${stats.recurringTransactions.total} total, ${stats.recurringTransactions.dueToday} due today`}
              icon={<Clock className="h-4 w-4" />}
              color={stats.recurringTransactions.overdue > 0 ? 'warning' : 'success'}
            />
            <StatCard
              title="Reconciliation Rules"
              value={stats.reconciliation.activeRules}
              subtitle={`${(stats.reconciliation.avgConfidence * 100).toFixed(0)}% avg confidence`}
              icon={<Shield className="h-4 w-4" />}
              color="default"
            />
            <StatCard
              title="Categorization Rules"
              value={stats.categorization.activeRules}
              subtitle={`${stats.categorization.recentUsage} recent categorizations`}
              icon={<Brain className="h-4 w-4" />}
              color="success"
            />
            <StatCard
              title="Insights Generated"
              value={stats.insights.totalInsights}
              subtitle={`${stats.insights.newAnomalies} new anomalies`}
              icon={<TrendingUp className="h-4 w-4" />}
              color={stats.insights.newAnomalies > 0 ? 'warning' : 'default'}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Attention Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.recurringTransactions.overdue > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900">Overdue Transactions</p>
                      <p className="text-sm text-red-700">
                        {stats.recurringTransactions.overdue} recurring transaction(s) are overdue
                      </p>
                    </div>
                    <Badge variant="destructive">{stats.recurringTransactions.overdue}</Badge>
                  </div>
                )}
                
                {stats.recurringTransactions.dueToday > 0 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-900">Due Today</p>
                      <p className="text-sm text-yellow-700">
                        {stats.recurringTransactions.dueToday} transaction(s) due today
                      </p>
                    </div>
                    <Badge variant="outline">{stats.recurringTransactions.dueToday}</Badge>
                  </div>
                )}
                
                {stats.insights.newAnomalies > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">New Anomalies</p>
                      <p className="text-sm text-blue-700">
                        {stats.insights.newAnomalies} potential anomalies detected
                      </p>
                    </div>
                    <Badge variant="outline">{stats.insights.newAnomalies}</Badge>
                  </div>
                )}

                {stats.recurringTransactions.overdue === 0 && 
                 stats.recurringTransactions.dueToday === 0 && 
                 stats.insights.newAnomalies === 0 && (
                  <div className="flex items-center justify-center p-8 text-green-600">
                    <CheckCircle className="h-8 w-8 mr-2" />
                    <span className="text-lg font-medium">All systems running smoothly!</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automation Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Reconciliation Accuracy</span>
                    <span>{(stats.reconciliation.avgConfidence * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={stats.reconciliation.avgConfidence * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Categorization Accuracy</span>
                    <span>{(stats.categorization.avgConfidence * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={stats.categorization.avgConfidence * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Active Automation Rules</span>
                    <span>
                      {stats.reconciliation.activeRules + stats.categorization.activeRules}/
                      {stats.reconciliation.totalRules + stats.categorization.totalRules}
                    </span>
                  </div>
                  <Progress 
                    value={
                      ((stats.reconciliation.activeRules + stats.categorization.activeRules) /
                      (stats.reconciliation.totalRules + stats.categorization.totalRules)) * 100
                    } 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Automation Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Auto-executed recurring transaction: Monthly Rent</span>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Categorized 15 transactions automatically</span>
                  </div>
                  <span className="text-xs text-gray-500">4 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Reconciled 8 bank statements</span>
                  </div>
                  <span className="text-xs text-gray-500">6 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Generated weekly financial insights</span>
                  </div>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Transactions Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Recurring Transactions</h3>
                <p className="text-muted-foreground">Manage automated recurring transactions and schedules.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Reconciliation Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Bank Reconciliation</h3>
                <p className="text-muted-foreground">Automated bank statement reconciliation and matching.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorization">
          <Card>
            <CardHeader>
              <CardTitle>Smart Categorization Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI Categorization</h3>
                <p className="text-muted-foreground">Intelligent transaction categorization using machine learning.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialAutomationDashboard;
