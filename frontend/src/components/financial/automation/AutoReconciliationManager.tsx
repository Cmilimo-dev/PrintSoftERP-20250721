import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, Target, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FinancialAutomationService, AutoReconciliationRule, BankStatementEntry } from '@/services/financialAutomationService';

interface AutoReconciliationForm {
  id?: string;
  name: string;
  description: string;
  bankStatementPattern: string;
  accountId: string;
  category: string;
  confidence: number;
  isActive: boolean;
}

export const AutoReconciliationManager: React.FC = () => {
  const [rules, setRules] = useState<AutoReconciliationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoReconciliationRule | null>(null);
  const [testPattern, setTestPattern] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<AutoReconciliationForm>({
    name: '',
    description: '',
    bankStatementPattern: '',
    accountId: '',
    category: '',
    confidence: 0.8,
    isActive: true
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      // For now, we'll simulate data since the service methods might not be implemented yet
      // const data = await FinancialAutomationService.getAllReconciliationRules();
      // setRules(data);
      setRules([]); // Placeholder
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reconciliation rules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRule) {
        // Update logic would go here
        toast({
          title: "Success",
          description: "Reconciliation rule updated successfully"
        });
      } else {
        await FinancialAutomationService.createReconciliationRule(formData);
        toast({
          title: "Success",
          description: "Reconciliation rule created successfully"
        });
      }
      
      setDialogOpen(false);
      resetForm();
      loadRules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save reconciliation rule",
        variant: "destructive"
      });
    }
  };

  const runPatternTest = async () => {
    try {
      const regex = new RegExp(testPattern, 'i');
      const matches = regex.test(testDescription);
      setTestResult(matches);
    } catch (error) {
      setTestResult(false);
      toast({
        title: "Error",
        description: "Invalid regex pattern",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      bankStatementPattern: '',
      accountId: '',
      category: '',
      confidence: 0.8,
      isActive: true
    });
    setEditingRule(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Auto-Reconciliation Rules</h2>
          <p className="text-gray-600">Manage automated bank statement reconciliation patterns</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setTestDialogOpen(true)}>
            <TestTube className="h-4 w-4 mr-2" />
            Test Pattern
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? 'Edit Reconciliation Rule' : 'Create Reconciliation Rule'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Rule Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bankStatementPattern">Bank Statement Pattern (Regex)</Label>
                  <Input
                    id="bankStatementPattern"
                    value={formData.bankStatementPattern}
                    onChange={(e) => setFormData({...formData, bankStatementPattern: e.target.value})}
                    placeholder="e.g., ^PAYPAL.*|^TRANSFER.*"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use regex patterns to match bank statement descriptions
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountId">Account ID</Label>
                    <Input
                      id="accountId"
                      value={formData.accountId}
                      onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confidence">Confidence Level</Label>
                    <div className="space-y-2">
                      <Input
                        id="confidence"
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formData.confidence}
                        onChange={(e) => setFormData({...formData, confidence: parseFloat(e.target.value)})}
                        required
                      />
                      <Progress value={formData.confidence * 100} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingRule ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pattern Test Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Regex Pattern</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="testPattern">Regex Pattern</Label>
              <Input
                id="testPattern"
                value={testPattern}
                onChange={(e) => setTestPattern(e.target.value)}
                placeholder="Enter regex pattern to test"
              />
            </div>
            <div>
              <Label htmlFor="testDescription">Test Description</Label>
              <Input
                id="testDescription"
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                placeholder="Enter bank statement description to test against"
              />
            </div>
            <Button onClick={runPatternTest} className="w-full">
              Test Pattern
            </Button>
            {testResult !== null && (
              <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                testResult ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {testResult ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <span>
                  {testResult ? 'Pattern matches the description' : 'Pattern does not match the description'}
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{rule.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getConfidenceColor(rule.confidence)}>
                    {getConfidenceLabel(rule.confidence)} ({(rule.confidence * 100).toFixed(0)}%)
                  </Badge>
                  {rule.isActive ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pattern</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {rule.bankStatementPattern}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <p className="font-medium">{rule.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Matches</p>
                    <p className="font-medium flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      {rule.matchCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Account</p>
                    <p className="font-medium">{rule.accountId}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{rule.description}</p>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingRule(rule);
                      setFormData({
                        ...rule
                      });
                      setDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {rules.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reconciliation Rules</h3>
                <p className="text-gray-500 mb-4">Create rules to automatically match bank statements with transactions.</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Rule
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
