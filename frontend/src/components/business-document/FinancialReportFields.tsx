
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { FinancialReport } from '@/types/businessDocuments';

interface FinancialReportFieldsProps {
  formData: FinancialReport;
  onUpdate: (updates: Partial<FinancialReport>) => void;
}

const FinancialReportFields: React.FC<FinancialReportFieldsProps> = ({ formData, onUpdate }) => {
  const addTransaction = () => {
    const newTransaction = {
      date: new Date().toISOString().split('T')[0],
      description: '',
      type: 'credit' as const,
      amount: 0
    };
    onUpdate({ 
      transactions: [...(formData.transactions || []), newTransaction] 
    });
  };

  const updateTransaction = (index: number, field: string, value: any) => {
    const transactions = [...(formData.transactions || [])];
    transactions[index] = { ...transactions[index], [field]: value };
    onUpdate({ transactions });
  };

  const removeTransaction = (index: number) => {
    const transactions = formData.transactions?.filter((_, i) => i !== index) || [];
    onUpdate({ transactions });
  };

  const addBudgetItem = () => {
    const newItem = {
      category: '',
      budgeted: 0,
      actual: 0,
      variance: 0
    };
    onUpdate({ 
      budgetAnalysis: [...(formData.budgetAnalysis || []), newItem] 
    });
  };

  const updateBudgetItem = (index: number, field: string, value: any) => {
    const budgetAnalysis = [...(formData.budgetAnalysis || [])];
    budgetAnalysis[index] = { ...budgetAnalysis[index], [field]: value };
    if (field === 'budgeted' || field === 'actual') {
      budgetAnalysis[index].variance = budgetAnalysis[index].actual - budgetAnalysis[index].budgeted;
    }
    onUpdate({ budgetAnalysis });
  };

  const removeBudgetItem = (index: number) => {
    const budgetAnalysis = formData.budgetAnalysis?.filter((_, i) => i !== index) || [];
    onUpdate({ budgetAnalysis });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Period & Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={formData.reportType} onValueChange={(value) => onUpdate({ reportType: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="periodStart">Period Start</Label>
              <Input
                id="periodStart"
                type="date"
                value={formData.periodStart}
                onChange={(e) => onUpdate({ periodStart: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="periodEnd">Period End</Label>
              <Input
                id="periodEnd"
                type="date"
                value={formData.periodEnd}
                onChange={(e) => onUpdate({ periodEnd: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="totalRevenue">Total Revenue</Label>
              <Input
                id="totalRevenue"
                type="number"
                step="0.01"
                value={formData.totalRevenue}
                onChange={(e) => onUpdate({ totalRevenue: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="totalExpenses">Total Expenses</Label>
              <Input
                id="totalExpenses"
                type="number"
                step="0.01"
                value={formData.totalExpenses}
                onChange={(e) => onUpdate({ totalExpenses: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="netProfit">Net Profit</Label>
              <Input
                id="netProfit"
                type="number"
                step="0.01"
                value={formData.netProfit}
                onChange={(e) => onUpdate({ netProfit: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="cashFlow">Cash Flow</Label>
              <Input
                id="cashFlow"
                type="number"
                step="0.01"
                value={formData.cashFlow}
                onChange={(e) => onUpdate({ cashFlow: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Transactions</CardTitle>
            <Button type="button" onClick={addTransaction} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.transactions?.map((transaction, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 items-end">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={transaction.date}
                    onChange={(e) => updateTransaction(index, 'date', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={transaction.description}
                    onChange={(e) => updateTransaction(index, 'description', e.target.value)}
                    placeholder="Transaction description"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={transaction.type} onValueChange={(value) => updateTransaction(index, 'type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="debit">Debit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={transaction.amount}
                    onChange={(e) => updateTransaction(index, 'amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeTransaction(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Budget Analysis</CardTitle>
            <Button type="button" onClick={addBudgetItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.budgetAnalysis?.map((item, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 items-end">
                <div>
                  <Label>Category</Label>
                  <Input
                    value={item.category}
                    onChange={(e) => updateBudgetItem(index, 'category', e.target.value)}
                    placeholder="Budget category"
                  />
                </div>
                <div>
                  <Label>Budgeted</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.budgeted}
                    onChange={(e) => updateBudgetItem(index, 'budgeted', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Actual</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.actual}
                    onChange={(e) => updateBudgetItem(index, 'actual', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Variance</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.variance}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeBudgetItem(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReportFields;
