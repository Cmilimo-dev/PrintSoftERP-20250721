
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrencyRates } from '@/hooks/useFinancial';
import { DollarSign, RefreshCw, TrendingUp } from 'lucide-react';

const CurrencyManager: React.FC = () => {
  const { data: currencyRates, isLoading } = useCurrencyRates();

  if (isLoading) {
    return <div>Loading currency rates...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Multi-Currency Exchange Rates
          </CardTitle>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Rates
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currencyRates?.map((rate) => (
            <div key={rate.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{rate.base_currency}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-bold">{rate.target_currency}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(rate.effective_date).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-lg font-bold">{rate.rate.toFixed(4)}</div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </div>
          ))}
          {(!currencyRates || currencyRates.length === 0) && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">No currency rates available.</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-2">Multi-Currency Features:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Automatic exchange rate updates from central bank</li>
            <li>• Historical rate tracking and reporting</li>
            <li>• Currency conversion in invoices and receipts</li>
            <li>• Foreign exchange gain/loss calculations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencyManager;
