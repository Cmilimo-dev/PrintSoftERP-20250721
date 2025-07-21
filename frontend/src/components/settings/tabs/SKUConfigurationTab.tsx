import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Hash, 
  BarChart3, 
  Settings,
  RefreshCw,
  Eye,
  Package
} from 'lucide-react';
import { SKUGenerationService, SKUGenerationConfig } from '@/services/skuGenerationService';
import { useToast } from '@/hooks/use-toast';

const SKUConfigurationTab: React.FC = () => {
  const [config, setConfig] = useState<SKUGenerationConfig | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
    loadStats();
  }, []);

  useEffect(() => {
    if (config) {
      updatePreview();
    }
  }, [config]);

  const loadConfig = () => {
    try {
      const currentConfig = SKUGenerationService.getConfig();
      setConfig(currentConfig);
    } catch (error) {
      console.error('Failed to load SKU config:', error);
      toast({
        title: "Error",
        description: "Failed to load SKU configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = () => {
    try {
      const currentStats = SKUGenerationService.getStats();
      setStats(currentStats);
    } catch (error) {
      console.error('Failed to load SKU stats:', error);
    }
  };

  const updatePreview = () => {
    if (config) {
      try {
        const previewSKU = SKUGenerationService.previewSKU('CAT');
        setPreview(previewSKU);
      } catch (error) {
        console.error('Failed to generate preview:', error);
        setPreview('ERROR');
      }
    }
  };

  const updateConfig = (updates: Partial<SKUGenerationConfig>) => {
    if (!config) return;

    const updatedConfig = { ...config, ...updates };
    setConfig(updatedConfig);
    
    try {
      const success = SKUGenerationService.updateConfig(updates);
      if (success) {
        toast({
          title: "Success",
          description: "SKU configuration updated successfully"
        });
        loadStats(); // Refresh stats
      } else {
        toast({
          title: "Error",
          description: "Failed to update SKU configuration",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      toast({
        title: "Error",
        description: "Failed to update SKU configuration",
        variant: "destructive"
      });
    }
  };

  const resetCounters = (resetType: 'yearly' | 'monthly') => {
    try {
      const success = SKUGenerationService.resetCounters(resetType);
      if (success) {
        toast({
          title: "Success",
          description: `${resetType === 'yearly' ? 'Yearly' : 'Monthly'} counters reset successfully`
        });
        loadStats(); // Refresh stats
      } else {
        toast({
          title: "Error",
          description: "Failed to reset counters",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to reset counters:', error);
      toast({
        title: "Error",
        description: "Failed to reset counters",
        variant: "destructive"
      });
    }
  };

  if (loading || !config) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Loading SKU configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            SKU Auto-Generation Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => updateConfig({ enabled: checked })}
            />
            <span>Enable SKU Auto-Generation</span>
          </div>

          {config.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SKU Prefix</Label>
                  <Input
                    value={config.prefix}
                    onChange={(e) => updateConfig({ prefix: e.target.value.toUpperCase() })}
                    placeholder="ITEM"
                  />
                </div>
                <div>
                  <Label>Separator</Label>
                  <Select 
                    value={config.separator || 'none'} 
                    onValueChange={(value) => updateConfig({ separator: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">Dash (-)</SelectItem>
                      <SelectItem value="_">Underscore (_)</SelectItem>
                      <SelectItem value=".">Dot (.)</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Number Length</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={config.numberLength}
                    onChange={(e) => updateConfig({ numberLength: parseInt(e.target.value) || 4 })}
                  />
                </div>
                <div>
                  <Label>Category Prefix</Label>
                  <Input
                    value={config.categoryPrefix || ''}
                    onChange={(e) => updateConfig({ categoryPrefix: e.target.value })}
                    placeholder="Optional category prefix"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.includeYear}
                    onCheckedChange={(checked) => updateConfig({ includeYear: checked })}
                  />
                  <span>Include Year</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.includeMonth}
                    onCheckedChange={(checked) => updateConfig({ includeMonth: checked })}
                  />
                  <span>Include Month</span>
                </div>
              </div>

              <div>
                <Label>SKU Format</Label>
                <Input
                  value={config.format}
                  onChange={(e) => updateConfig({ format: e.target.value })}
                  placeholder="{prefix}{separator}{year}{separator}{number}"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Available variables: {'{prefix}'}, {'{category}'}, {'{year}'}, {'{month}'}, {'{number}'}, {'{separator}'}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {config.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              SKU Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <span className="font-mono text-lg">{preview}</span>
                <Badge variant="secondary">Next SKU</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This is how the next generated SKU will look
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Generation Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.totalGenerated}</div>
                <div className="text-sm text-muted-foreground">Total Generated</div>
              </div>
              <div className="text-center p-4 bg-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.currentYear}</div>
                <div className="text-sm text-muted-foreground">This Year</div>
              </div>
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.currentMonth}</div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Active Patterns</Label>
              <div className="space-y-2">
                {stats.patterns.length > 0 ? (
                  stats.patterns.map((pattern: string, index: number) => (
                    <Badge key={index} variant="outline" className="mr-2">
                      {pattern}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No patterns generated yet</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetCounters('monthly')}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Monthly Counters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetCounters('yearly')}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Yearly Counters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SKUConfigurationTab;
