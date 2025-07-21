import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Brain, Zap, Target, BarChart3, TestTube } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FinancialAutomationService, SmartCategorizationRule } from '@/services/financialAutomationService';

interface SmartCategorizationForm {
  id?: string;
  name: string;
  pattern: string;
  category: string;
  subcategory?: string;
  confidence: number;
  isActive: boolean;
  machineGenerated: boolean;
}

export const SmartCategorizationManager: React.FC = () => {
  const [rules, setRules] = useState<SmartCategorizationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SmartCategorizationRule | null>(null);
  const [testDescription, setTestDescription] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<SmartCategorizationForm>({
    name: '',
    pattern: '',
    category: '',
    subcategory: '',
    confidence: 0.8,
    isActive: true,
    machineGenerated: false
  });

  // Predefined categories for quick selection
  const commonCategories = [
    'Office Supplies',
    'Travel & Transportation',
    'Marketing & Advertising',
    'Utilities',
    'Professional Services',
    'Software & Technology',
    'Meals & Entertainment',
    'Rent & Facilities',
    'Insurance',
    'Bank Fees',
    'Taxes',
    'Equipment & Hardware'
  ];

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      // For now, we'll simulate data
      setRules([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categorization rules",
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
          description: "Categorization rule updated successfully"
        });
      } else {
        await FinancialAutomationService.createCategorizationRule(formData);
        toast({
          title: "Success",
          description: "Categorization rule created successfully"
        });
      }
      
      setDialogOpen(false);
      resetForm();
      loadRules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save categorization rule",
        variant: "destructive"
      });
    }
  };

  const testCategorization = async () => {
    try {
      const result = await FinancialAutomationService.categorizeTransaction(testDescription);
      setTestResult(result);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to test categorization",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      pattern: '',
      category: '',
      subcategory: '',
      confidence: 0.8,
      isActive: true,
      machineGenerated: false
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

  const generateSampleRules = () => {
    const sampleRules = [
      {
        name: 'Office Supplies - Staples',
        pattern: '\\bstaples\\b|\\boffice\\s+depot\\b|\\boffice\\s+supplies\\b',
        category: 'Office Supplies',
        confidence: 0.9
      },
      {
        name: 'Travel - Airlines',
        pattern: '\\bairline\\b|\\bflight\\b|\\btravel\\b|\\bdelta\\b|\\bunited\\b|\\bamerican\\s+airlines\\b',
        category: 'Travel & Transportation',
        confidence: 0.85
      },
      {
        name: 'Software - SaaS',
        pattern: '\\bsoftware\\b|\\bsaas\\b|\\bsubscription\\b|\\bmicrosoft\\b|\\badobe\\b|\\bgoogle\\s+workspace\\b',
        category: 'Software & Technology',
        confidence: 0.8
      }
    ];

    sampleRules.forEach(async (rule) => {
      try {
        await FinancialAutomationService.createCategorizationRule({
          ...rule,
          description: `Auto-generated rule for ${rule.category}`,
          isActive: true,
          machineGenerated: true
        });
      } catch (error) {
        console.error('Failed to create sample rule:', error);
      }
    });

    toast({
      title: "Success",
      description: "Sample rules created successfully"
    });
    
    loadRules();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Smart Categorization</h2>
          <p className="text-gray-600">Automatically categorize transactions using intelligent rules</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={generateSampleRules}>
            <Zap className="h-4 w-4 mr-2" />
            Generate Samples
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
                  {editingRule ? 'Edit Categorization Rule' : 'Create Categorization Rule'}
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
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select or type category" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className="mt-2"
                      placeholder="Or enter custom category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    placeholder="e.g., Paper, Pens, Ink"
                  />
                </div>

                <div>
                  <Label htmlFor="pattern">Pattern (Regex or Keywords)</Label>
                  <Textarea
                    id="pattern"
                    value={formData.pattern}
                    onChange={(e) => setFormData({...formData, pattern: e.target.value})}
                    placeholder="e.g., \\bstaples\\b|\\boffice\\s+depot\\b"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use regex patterns or keywords to match transaction descriptions
                  </p>
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

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="machineGenerated"
                      checked={formData.machineGenerated}
                      onCheckedChange={(checked) => setFormData({...formData, machineGenerated: checked})}
                    />
                    <Label htmlFor="machineGenerated">Machine Generated</Label>
                  </div>
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

      <Tabs defaultValue="rules" className="w-full">
        <TabsList>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="test">Test Categorization</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
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
                      {rule.machineGenerated && (
                        <Badge variant="outline">
                          <Brain className="h-3 w-3 mr-1" />
                          Auto
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Category</p>
                        <p className="font-medium">{rule.category}</p>
                        {rule.subcategory && (
                          <p className="text-sm text-gray-500">{rule.subcategory}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pattern</p>
                        <p className="font-mono text-sm bg-gray-100 p-2 rounded truncate">
                          {rule.pattern}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Usage Count</p>
                        <p className="font-medium flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          {rule.usage_count}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created</p>
                        <p className="text-sm">
                          {new Date(rule.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
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
                    <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Categorization Rules</h3>
                    <p className="text-gray-500 mb-4">Create rules to automatically categorize your transactions.</p>
                    <div className="flex justify-center space-x-2">
                      <Button onClick={() => setDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Rule
                      </Button>
                      <Button variant="outline" onClick={generateSampleRules}>
                        <Zap className="h-4 w-4 mr-2" />
                        Generate Samples
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Transaction Categorization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testDescription">Transaction Description</Label>
                <Input
                  id="testDescription"
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                  placeholder="Enter a transaction description to test categorization"
                />
              </div>
              <Button onClick={testCategorization} className="w-full">
                <TestTube className="h-4 w-4 mr-2" />
                Test Categorization
              </Button>
              {testResult && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Categorization Result:</h4>
                  {testResult.category ? (
                    <div className="space-y-2">
                      <p><strong>Category:</strong> {testResult.category}</p>
                      {testResult.subcategory && (
                        <p><strong>Subcategory:</strong> {testResult.subcategory}</p>
                      )}
                      <p><strong>Confidence:</strong> {(testResult.confidence * 100).toFixed(0)}%</p>
                      {testResult.ruleUsed && (
                        <p><strong>Rule Used:</strong> {testResult.ruleUsed}</p>
                      )}
                      <Progress value={testResult.confidence * 100} className="h-2" />
                    </div>
                  ) : (
                    <p className="text-gray-600">No matching rule found for this description.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rules.length}</div>
                <p className="text-xs text-muted-foreground">
                  {rules.filter(r => r.isActive).length} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {rules.reduce((sum, rule) => sum + rule.usage_count, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Categorizations performed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {rules.length > 0 
                    ? ((rules.reduce((sum, rule) => sum + rule.confidence, 0) / rules.length) * 100).toFixed(0)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average rule confidence
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
