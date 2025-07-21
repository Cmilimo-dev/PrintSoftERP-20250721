
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useChartOfAccounts, useCreateChartOfAccount } from '@/hooks/useFinancial';
import { Plus, BookOpen } from 'lucide-react';
import { ChartOfAccount } from '@/types/financial';

const ChartOfAccountsList: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    account_type: 'asset' as const,
    parent_account_id: '',
    is_active: true
  });

  const { data: accounts, isLoading } = useChartOfAccounts();
  const createAccount = useCreateChartOfAccount();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAccount.mutate({
      ...formData,
      parent_account_id: formData.parent_account_id || undefined
    });
    setIsDialogOpen(false);
    setFormData({
      account_code: '',
      account_name: '',
      account_type: 'asset',
      parent_account_id: '',
      is_active: true
    });
  };

  const accountTypeColors = {
    asset: 'bg-blue-100 text-blue-800',
    liability: 'bg-red-100 text-red-800',
    equity: 'bg-purple-100 text-purple-800',
    revenue: 'bg-green-100 text-green-800',
    expense: 'bg-orange-100 text-orange-800'
  };

  if (isLoading) {
    return <div>Loading chart of accounts...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Chart of Accounts
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="sm:inline">Add Account</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="account_code">Account Code</Label>
                  <Input
                    id="account_code"
                    value={formData.account_code}
                    onChange={(e) => setFormData({...formData, account_code: e.target.value})}
                    placeholder="e.g., 1000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="account_name">Account Name</Label>
                  <Input
                    id="account_name"
                    value={formData.account_name}
                    onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                    placeholder="e.g., Cash in Bank"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="account_type">Account Type</Label>
                  <Select value={formData.account_type} onValueChange={(value: any) => setFormData({...formData, account_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asset">Asset</SelectItem>
                      <SelectItem value="liability">Liability</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Create Account</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {accounts?.map((account) => (
            <div key={account.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg space-y-2 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="font-mono text-sm font-bold">{(account.account_code && typeof account.account_code === 'string') ? account.account_code : 'N/A'}</div>
                <div>
                  <div className="font-medium">{(account.account_name && typeof account.account_name === 'string') ? account.account_name : 'Unnamed Account'}</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${accountTypeColors[account.account_type as keyof typeof accountTypeColors] || 'bg-gray-100 text-gray-800'}`}>
                      {account.account_type && typeof account.account_type === 'string' ? (account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)) : 'Unknown'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${account.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(!accounts || accounts.length === 0) && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">No accounts found. Create your first account to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartOfAccountsList;
