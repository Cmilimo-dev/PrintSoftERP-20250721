import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Hash, Save, RotateCcw, AlertCircle, CheckCircle2, Eye, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api-client';

interface NumberGenerationSetting {
  id: string;
  document_type: string;
  prefix: string;
  suffix: string;
  next_number: number;
  number_length: number;
  separator: string;
  format: string;
  auto_increment: boolean;
  reset_frequency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NumberFormat {
  name: string;
  description: string;
  example: string;
}

const EnhancedNumberGenerationSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<NumberGenerationSetting[]>([]);
  const [formats, setFormats] = useState<Record<string, NumberFormat>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>('');
  const [previewSettings, setPreviewSettings] = useState<any>({});

  // Load settings and formats from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load formats
        const formatData = await apiClient.getNumberGenerationFormats();
        setFormats(formatData);
        
        // Load settings
        const settingsData = await apiClient.getNumberGenerationSettings();
        // Ensure settingsData is an array
        const dataArray = Array.isArray(settingsData) ? settingsData : [];
        const processedData = dataArray.map(setting => ({
          ...setting,
          separator: setting.separator === '' ? 'none' : setting.separator
        }));
        setSettings(processedData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load number generation settings');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Format document type name for display
  const formatDocumentTypeName = (docType: string) => {
    return docType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  // Generate preview number based on current format
  const generatePreview = (setting: NumberGenerationSetting) => {
    const paddedNumber = setting.next_number.toString().padStart(setting.number_length, '0');
    const separator = setting.separator === 'none' ? '' : setting.separator;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timestamp = Date.now();
    
    switch (setting.format) {
      case 'prefix-timestamp':
        return `${setting.prefix}${separator}${timestamp}`;
      case 'prefix-sequential':
        return `${setting.prefix}${separator}${paddedNumber}`;
      case 'prefix-year-sequential':
        return `${setting.prefix}${separator}${year}${separator}${paddedNumber}`;
      case 'prefix-yearmonth-sequential':
        return `${setting.prefix}${separator}${year}${month}${separator}${paddedNumber}`;
      case 'prefix-date-sequential':
        return `${setting.prefix}${separator}${year}${month}${day}${separator}${paddedNumber}`;
      case 'year-prefix-sequential':
        return `${year}${separator}${setting.prefix}${separator}${paddedNumber}`;
      case 'date-prefix-sequential':
        return `${year}${month}${day}${separator}${setting.prefix}${separator}${paddedNumber}`;
      case 'sequential-only':
        return paddedNumber;
      default:
        return `${setting.prefix}${separator}${paddedNumber}`;
    }
  };

  // Preview format changes
  const previewFormatChange = async (documentType: string, newFormat: any) => {
    try {
      const response = await apiClient.previewNumberFormat(documentType, newFormat);
      setPreviewSettings(response);
      setPreviewType(documentType);
    } catch (err) {
      console.error('Error previewing format:', err);
      setError('Failed to preview format');
    }
  };

  // Update a setting
  const updateSetting = async (documentType: string, updates: Partial<NumberGenerationSetting>) => {
    try {
      setSaving(documentType);
      setError(null);
      setSuccess(null);

      // Convert 'none' separator to empty string for backend
      const backendUpdates = { ...updates };
      if (backendUpdates.separator === 'none') {
        backendUpdates.separator = '';
      }

      await apiClient.updateNumberGenerationSetting(documentType, backendUpdates);
      
      // Update local state
      setSettings(prev => 
        prev.map(setting => 
          setting.document_type === documentType 
            ? { ...setting, ...updates }
            : setting
        )
      );
      
      setSuccess(`${formatDocumentTypeName(documentType)} settings updated successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating setting:', err);
      setError(`Failed to update ${formatDocumentTypeName(documentType)} settings`);
    } finally {
      setSaving(null);
    }
  };

  // Bulk update all formats
  const updateAllFormats = async (format: string, separator: string, number_length: number) => {
    try {
      setSaving('all');
      setError(null);
      setSuccess(null);

      await apiClient.updateAllNumberFormats({ format, separator, number_length });
      
      // Update local state
      setSettings(prev => 
        prev.map(setting => ({
          ...setting,
          format,
          separator: separator === '' ? 'none' : separator,
          number_length
        }))
      );
      
      setSuccess('All document formats updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating all formats:', err);
      setError('Failed to update all formats');
    } finally {
      setSaving(null);
    }
  };

  // Reset setting to default
  const resetSetting = async (documentType: string) => {
    const defaultSettings = {
      next_number: 1,
      number_length: 6,
      separator: '-',
      format: 'prefix-sequential',
      auto_increment: true,
      reset_frequency: 'never',
      is_active: true
    };

    await updateSetting(documentType, defaultSettings);
  };

  // Test number generation
  const testNumberGeneration = async (documentType: string) => {
    try {
      const generatedNumber = await apiClient.generateNumber(documentType);
      setSuccess(`Test number generated: ${generatedNumber}`);
    } catch (err) {
      console.error('Error generating test number:', err);
      setError('Failed to generate test number');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Number Generation Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Enhanced Number Generation Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure automatic number generation for documents and records with advanced format options.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Global Format Settings */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Global Format Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label>Default Format</Label>
              <Select
                onValueChange={(value) => {
                  const separator = '-';
                  const number_length = 6;
                  updateAllFormats(value, separator, number_length);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(formats).map(([key, format]) => (
                    <SelectItem key={key} value={key}>
                      {format.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Default Separator</Label>
              <Select
                onValueChange={(value) => {
                  const format = 'prefix-sequential';
                  const number_length = 6;
                  updateAllFormats(format, value, number_length);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select separator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">Dash (-)</SelectItem>
                  <SelectItem value="_">Underscore (_)</SelectItem>
                  <SelectItem value=".">Dot (.)</SelectItem>
                  <SelectItem value="/">Slash (/)</SelectItem>
                  <SelectItem value="">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Default Number Length</Label>
              <Input
                type="number"
                placeholder="6"
                min="1"
                max="12"
                onChange={(e) => {
                  const format = 'prefix-sequential';
                  const separator = '-';
                  const number_length = parseInt(e.target.value) || 6;
                  updateAllFormats(format, separator, number_length);
                }}
              />
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Available formats: {Object.entries(formats).map(([key, format]) => format.example).join(', ')}
            </p>
          </div>
        </Card>

        {/* Individual Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Individual Document Settings</h3>
          
          {settings.map((setting) => (
            <Card key={setting.document_type} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">
                    {formatDocumentTypeName(setting.document_type)}
                  </h4>
                  <Badge variant={setting.is_active ? "default" : "secondary"}>
                    {setting.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNumberGeneration(setting.document_type)}
                  >
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetSetting(setting.document_type)}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Prefix</Label>
                  <Input
                    value={setting.prefix}
                    onChange={(e) => updateSetting(setting.document_type, { prefix: e.target.value })}
                    placeholder="e.g., PAY"
                  />
                </div>

                <div>
                  <Label>Next Number</Label>
                  <Input
                    type="number"
                    value={setting.next_number}
                    onChange={(e) => updateSetting(setting.document_type, { next_number: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div>
                  <Label>Number Length</Label>
                  <Input
                    type="number"
                    value={setting.number_length}
                    onChange={(e) => updateSetting(setting.document_type, { number_length: parseInt(e.target.value) || 6 })}
                    min="1"
                    max="12"
                  />
                </div>

                <div>
                  <Label>Separator</Label>
                  <Select
                    value={setting.separator}
                    onValueChange={(value) => updateSetting(setting.document_type, { separator: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">Dash (-)</SelectItem>
                      <SelectItem value="_">Underscore (_)</SelectItem>
                      <SelectItem value=".">Dot (.)</SelectItem>
                      <SelectItem value="/">Slash (/)</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Format</Label>
                  <Select
                    value={setting.format}
                    onValueChange={(value) => {
                      updateSetting(setting.document_type, { format: value });
                      previewFormatChange(setting.document_type, { format: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(formats).map(([key, format]) => (
                        <SelectItem key={key} value={key}>
                          {format.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Reset Frequency</Label>
                  <Select
                    value={setting.reset_frequency}
                    onValueChange={(value) => updateSetting(setting.document_type, { reset_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`auto-increment-${setting.document_type}`}
                    checked={setting.auto_increment}
                    onCheckedChange={(checked) => updateSetting(setting.document_type, { auto_increment: checked })}
                  />
                  <Label htmlFor={`auto-increment-${setting.document_type}`}>
                    Auto Increment
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`active-${setting.document_type}`}
                    checked={setting.is_active}
                    onCheckedChange={(checked) => updateSetting(setting.document_type, { is_active: checked })}
                  />
                  <Label htmlFor={`active-${setting.document_type}`}>
                    Active
                  </Label>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Preview */}
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Preview:</span>
                  <span className="text-sm font-mono bg-background px-2 py-1 rounded">
                    {generatePreview(setting)}
                  </span>
                </div>
                {previewType === setting.document_type && previewSettings.preview && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Live Preview:</span>
                      <span className="text-xs font-mono bg-green-100 px-2 py-1 rounded">
                        {previewSettings.preview}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {saving === setting.document_type && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Saving...
                </div>
              )}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedNumberGenerationSettingsTab;
