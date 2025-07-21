import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialAnalytics } from '@/modules/financial/types/financialTypes';
import { TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';

interface FinancialChartsProps {
  analytics: FinancialAnalytics;
  className?: string;
}

interface SimpleChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title: string;
  type: 'bar' | 'pie';
}

const SimpleChart: React.FC<SimpleChartProps> = ({ data, title, type }) => {
  const maxValue = Math.max(...data.map(d => Math.abs(d.value)));
  
  if (type === 'bar') {
    return (
      <div className="space-y-3">
        <h4 className="font-medium text-sm">{title}</h4>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-xs text-right">{item.label}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                <div
                  className={`h-3 rounded-full ${item.color || 'bg-blue-500'}`}
                  style={{
                    width: `${maxValue > 0 ? Math.abs(item.value / maxValue) * 100 : 0}%`
                  }}
                />
              </div>
              <div className="w-16 text-xs text-right">
                {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
                {typeof item.value === 'number' && item.value !== 0 && '%'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Simple pie chart representation
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div
              className={`w-3 h-3 rounded-full ${item.color || 'bg-blue-500'}`}
            />
            <div className="flex-1">{item.label}</div>
            <div className="font-medium">
              {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
              {typeof item.value === 'number' && item.value !== 0 && '%'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FinancialCharts: React.FC<FinancialChartsProps> = ({ analytics, className }) => {
  const profitabilityData = [
    {
      label: 'Gross Profit',
      value: analytics.grossProfitMargin,
      color: 'bg-green-500'
    },
    {
      label: 'Net Profit',
      value: analytics.netProfitMargin,
      color: 'bg-blue-500'
    },
    {
      label: 'Operating',
      value: analytics.operatingMargin,
      color: 'bg-purple-500'
    }
  ];

  const liquidityData = [
    {
      label: 'Current Ratio',
      value: analytics.currentRatio,
      color: 'bg-cyan-500'
    },
    {
      label: 'Quick Ratio',
      value: analytics.quickRatio,
      color: 'bg-teal-500'
    },
    {
      label: 'Cash Ratio',
      value: analytics.cashRatio,
      color: 'bg-indigo-500'
    }
  ];

  const leverageData = [
    {
      label: 'Debt to Equity',
      value: analytics.debtToEquity,
      color: 'bg-red-500'
    },
    {
      label: 'Debt to Assets',
      value: analytics.debtToAssets,
      color: 'bg-orange-500'
    },
    {
      label: 'Equity Ratio',
      value: analytics.equityRatio,
      color: 'bg-green-500'
    }
  ];

  const efficiencyData = [
    {
      label: 'Asset Turnover',
      value: analytics.assetTurnover,
      color: 'bg-purple-500'
    },
    {
      label: 'ROA',
      value: analytics.returnOnAssets,
      color: 'bg-blue-500'
    },
    {
      label: 'ROE',
      value: analytics.returnOnEquity,
      color: 'bg-green-500'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {/* Profitability Ratios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Profitability Ratios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleChart
            data={profitabilityData}
            title="Profit Margins (%)"
            type="bar"
          />
        </CardContent>
      </Card>

      {/* Liquidity Ratios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            Liquidity Ratios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleChart
            data={liquidityData}
            title="Liquidity Indicators"
            type="bar"
          />
        </CardContent>
      </Card>

      {/* Leverage Ratios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="h-4 w-4 text-red-600" />
            Leverage Ratios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleChart
            data={leverageData}
            title="Debt & Equity Structure"
            type="pie"
          />
        </CardContent>
      </Card>

      {/* Efficiency Ratios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChart className="h-4 w-4 text-purple-600" />
            Efficiency Ratios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleChart
            data={efficiencyData}
            title="Return & Efficiency"
            type="bar"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialCharts;
