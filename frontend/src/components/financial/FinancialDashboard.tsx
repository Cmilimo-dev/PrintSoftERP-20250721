
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard, BookOpen, FileText } from 'lucide-react';
import { DashboardStatsGrid } from '@/components/ui/mobile-dashboard-layout';

interface FinancialDashboardProps {
  totalRevenue: number;
  totalReceivables: number;
  chartOfAccountsCount: number;
  transactionsCount: number;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  totalRevenue,
  totalReceivables,
  chartOfAccountsCount,
  transactionsCount
}) => {
  const stats = [
    {
      title: 'Total Revenue',
      value: `KES ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Accounts Receivable',
      value: `KES ${totalReceivables.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-blue-600',
    },
    {
      title: 'Chart of Accounts',
      value: chartOfAccountsCount,
      icon: BookOpen,
      color: 'text-purple-600',
    },
    {
      title: 'Recent Transactions',
      value: transactionsCount,
      icon: FileText,
      color: 'text-orange-600',
    },
  ];

  return (
    <DashboardStatsGrid columns={4}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </DashboardStatsGrid>
  );
};

export default FinancialDashboard;
