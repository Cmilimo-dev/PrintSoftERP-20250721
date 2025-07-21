import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DocumentServiceSettings from './DocumentServiceSettings';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Building2, 
  Hash, 
  FileText, 
  CreditCard,
  RotateCcw,
  PenTool,
  Globe,
  QrCode,
  Brush
} from 'lucide-react';
import { SystemSettingsService } from '@/modules/system-settings/services/systemSettingsService';
import { SettingsBridgeService } from '@/services/settingsBridgeService';
import { SystemSettings, CompanyInfo, TaxConfig, DocumentDefaults, IntegrationSettings, DocumentLayoutSettings } from '@/modules/system-settings/types/systemSettingsTypes';
import CompanyDisplayTab from './tabs/CompanyDisplayTab';
import PaymentSettingsTab from './tabs/PaymentSettingsTab';
import DocumentLayoutTab from './tabs/DocumentLayoutTab';
import NumberGenerationSettingsTab from './tabs/NumberGenerationSettingsTab';
import SKUConfigurationTab from './tabs/SKUConfigurationTab';
import AutoNumberingTab from './tabs/AutoNumberingTab';
import { AuthorizedSignatureSettings } from '@/modules/system-settings/components/AuthorizedSignatureSettings';
import { usePermissions } from '@/hooks/usePermissions';
import { SettingsGuard } from '@/components/auth/PermissionGuard';
import DocumentCustomizationSettings from './DocumentCustomizationSettings';

interface SystemSettingsManagerProps {
  activeSubTab?: string | null;
  onSubTabChange?: (tab: string | null) => void;
}

const SystemSettingsManager: React.FC<SystemSettingsManagerProps> = ({ 
  activeSubTab, 
  onSubTabChange 
}) => {
  const { hasPermission } = usePermissions();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);


  const loadSettings = async () => {
    try {
      setLoading(true);
      const currentSettings = await SettingsBridgeService.loadSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updates: Partial<SystemSettings>) => {
    if (!settings) return;
    
    try {
      setSaveStatus('saving');
      const success = await SettingsBridgeService.saveSettings(updates);
      
      if (success) {
        const updatedSettings = { ...settings, ...updates };
        setSettings(updatedSettings);
        setSaveStatus('saved');
        
        // Reset save status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
    }
  };

  const updateCompanyInfo = (updates: Partial<CompanyInfo>) => {
    if (!settings) return;
    const updatedCompanyInfo = { ...settings.companyInfo, ...updates };
    saveSettings({ companyInfo: updatedCompanyInfo });
  };

  const updateTaxConfig = (updates: Partial<TaxConfig>) => {
    if (!settings) return;
    const updatedTaxConfig = { ...settings.tax, ...updates };
    saveSettings({ tax: updatedTaxConfig });
  };

  const updateDocumentDefaults = (documentType: keyof DocumentDefaults, updates: any) => {
    if (!settings) return;
    const updatedDocumentDefaults = {
      ...settings.documentDefaults,
      [documentType]: { ...settings.documentDefaults[documentType], ...updates }
    };
    saveSettings({ documentDefaults: updatedDocumentDefaults });
  };

  const updateIntegrations = (updates: Partial<IntegrationSettings>) => {
    if (!settings) return;
    const updatedIntegrations = { ...settings.integrations, ...updates };
    saveSettings({ integrations: updatedIntegrations });
  };

  const resetToDefaults = () => {
    try {
      const success = SystemSettingsService.resetSettings();
      if (success) {
        loadSettings();
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to reset settings:', error);
      setSaveStatus('error');
    }
  };

  const getSaveStatusBadge = () => {
    switch (saveStatus) {
      case 'saving':
        return <Badge variant="outline">Saving...</Badge>;
      case 'saved':
        return <Badge variant="secondary">Saved</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p>Loading system settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load system settings</p>
          <Button onClick={loadSettings} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Render content based on activeSubTab
  const renderSelectedContent = () => {
    if (!activeSubTab) return null;

    switch (activeSubTab) {
      case 'company':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                <h1 className="text-xl sm:text-2xl font-bold">Company Settings</h1>
              </div>
              <div className="flex items-center gap-2">
                {getSaveStatusBadge()}
                {hasPermission('settings.write') && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={resetToDefaults} variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Reset to Defaults</span>
                        <span className="sm:hidden">Reset</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reset all settings to their default values</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            
            <Tabs defaultValue="info" className="w-full">
              <div className="relative overflow-hidden">
                <TabsList className="inline-flex w-auto min-w-full justify-start overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide gap-1 p-1">
                  <TabsTrigger value="info" className="px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">Company Info</TabsTrigger>
                  <TabsTrigger value="display" className="px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">Display Settings</TabsTrigger>
                </TabsList>
              </div>

              	<SettingsGuard action="read">
                <TabsContent value="info" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={settings.companyInfo.companyName}
                          onChange={(e) => updateCompanyInfo({ companyName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="taxId">Tax ID</Label>
                        <Input
                          id="taxId"
                          value={settings.companyInfo.taxId}
                          onChange={(e) => updateCompanyInfo({ taxId: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={settings.companyInfo.address}
                        onChange={(e) => updateCompanyInfo({ address: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={settings.companyInfo.city}
                          onChange={(e) => updateCompanyInfo({ city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={settings.companyInfo.state}
                          onChange={(e) => updateCompanyInfo({ state: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          value={settings.companyInfo.zip}
                          onChange={(e) => updateCompanyInfo({ zip: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={settings.companyInfo.phone}
                          onChange={(e) => updateCompanyInfo({ phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={settings.companyInfo.email}
                          onChange={(e) => updateCompanyInfo({ email: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              	</TabsContent>
              </SettingsGuard>

              	<SettingsGuard action="read">
                <TabsContent value="display" className="space-y-4 mt-6">
                <CompanyDisplayTab
                  companyDisplay={settings.companyDisplay}
                  onUpdate={(updates) => saveSettings(updates)}
                />
              	</TabsContent>
              </SettingsGuard>
            </Tabs>
          </div>
        );
        
      case 'tax':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Hash className="h-6 w-6" />
                <h1 className="text-xl sm:text-2xl font-bold">Tax Configuration</h1>
              </div>
              <div className="flex items-center gap-2">
                {getSaveStatusBadge()}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={resetToDefaults} variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Reset to Defaults</span>
                      <span className="sm:hidden">Reset</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset all settings to their default values</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Tax Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                    <Input
                      id="defaultTaxRate"
                      type="number"
                      step="0.01"
                      value={settings.tax.defaultRate * 100}
                      onChange={(e) => updateTaxConfig({ defaultRate: parseFloat(e.target.value) / 100 })}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={settings.tax.inclusive}
                      onCheckedChange={(checked) => updateTaxConfig({ inclusive: checked })}
                    />
                    <Label>VAT Inclusive Pricing</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'layout':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                <h1 className="text-xl sm:text-2xl font-bold">Layout Settings</h1>
              </div>
              <div className="flex items-center gap-2">
                {getSaveStatusBadge()}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={resetToDefaults} variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Reset to Defaults</span>
                      <span className="sm:hidden">Reset</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset all settings to their default values</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            <Tabs defaultValue="documents" className="w-full">
              <div className="relative overflow-hidden">
                <TabsList className="inline-flex w-auto min-w-full justify-start overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide gap-1 p-1">
                  <TabsTrigger value="documents" className="px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
                    <span className="hidden sm:inline">Document Numbers</span>
                    <span className="sm:hidden">Numbers</span>
                  </TabsTrigger>
                  <TabsTrigger value="autonumbering" className="px-2 py-2 text-sm whitespace-nowrap flex-shrink-0">
                    <span className="hidden sm:inline">Entity Numbers</span>
                    <span className="sm:hidden">Entities</span>
                  </TabsTrigger>
                  <TabsTrigger value="layout" className="px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
                    <span className="hidden sm:inline">Layout Design</span>
                    <span className="sm:hidden">Layout</span>
                  </TabsTrigger>
                  <TabsTrigger value="sku" className="px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
                    <span className="hidden sm:inline">SKU Generation</span>
                    <span className="sm:hidden">SKU</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="documents" className="space-y-4 mt-6">
                <NumberGenerationSettingsTab />
              </TabsContent>

              	<SettingsGuard action="read">
                <TabsContent value="autonumbering" className="space-y-4 mt-6">
                <AutoNumberingTab
                  autoNumbering={settings.autoNumbering}
                  onUpdate={(updates) => saveSettings(updates)}
                />
              	</TabsContent>
              </SettingsGuard>

              	<SettingsGuard action="read">
                <TabsContent value="layout" className="space-y-4 mt-6">
                <DocumentLayoutTab
                  documentLayout={settings.documentLayout}
                  onUpdate={(updates) => {
                    if (settings.documentLayout) {
                      saveSettings({ documentLayout: { ...settings.documentLayout, ...updates } });
                    }
                  }}
                />
              	</TabsContent>
              </SettingsGuard>

              	<SettingsGuard action="read">
                <TabsContent value="sku" className="space-y-4 mt-6">
                <SKUConfigurationTab />
              	</TabsContent>
              </SettingsGuard>
            </Tabs>
          </div>
        );
        
      case 'documents':
        return (
          <DocumentServiceSettings 
            onSave={(documentSettings) => {
              // Handle document settings save
              console.log('Document settings saved:', documentSettings);
              setSaveStatus('saved');
              setTimeout(() => setSaveStatus('idle'), 2000);
            }}
            onReset={() => {
              // Handle document settings reset
              console.log('Document settings reset');
              resetToDefaults();
            }}
          />
        );

      case 'customization':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Brush className="h-6 w-6" />
                <h1 className="text-xl sm:text-2xl font-bold">Document Customization</h1>
              </div>
              <div className="flex items-center gap-2">
                {getSaveStatusBadge()}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={resetToDefaults} variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Reset to Defaults</span>
                      <span className="sm:hidden">Reset</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset all settings to their default values</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            <DocumentCustomizationSettings
              onSave={(customizationSettings) => {
                // Handle customization settings save
                console.log('Customization settings saved:', customizationSettings);
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
              }}
              onReset={() => {
                // Handle customization settings reset
                console.log('Customization settings reset');
                resetToDefaults();
              }}
            />
          </div>
        );
        
      case 'payments':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                <h1 className="text-xl sm:text-2xl font-bold">Payment Settings</h1>
              </div>
              <div className="flex items-center gap-2">
                {getSaveStatusBadge()}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={resetToDefaults} variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Reset to Defaults</span>
                      <span className="sm:hidden">Reset</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset all settings to their default values</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            <PaymentSettingsTab
              integrations={settings.integrations}
              onUpdate={(updates) => {
                const updatedIntegrations = { ...settings.integrations, ...updates };
                saveSettings({ integrations: updatedIntegrations });
              }}
            />
          </div>
        );
        
      case 'signatures':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <PenTool className="h-6 w-6" />
                <h1 className="text-xl sm:text-2xl font-bold">Signature Settings</h1>
              </div>
              <div className="flex items-center gap-2">
                {getSaveStatusBadge()}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={resetToDefaults} variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Reset to Defaults</span>
                      <span className="sm:hidden">Reset</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset all settings to their default values</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            <AuthorizedSignatureSettings
              signatures={settings.authorizedSignatures || []}
              signatureSettings={settings.signatures || {
                enabled: false,
                showOnDocuments: false,
                signaturePosition: 'bottom-right',
                showTitle: true,
                showName: true,
                showDate: true,
                customText: 'Authorized by:'
              }}
              onUpdate={(signatures, signatureSettings) => {
                saveSettings({ 
                  authorizedSignatures: signatures,
                  signatures: signatureSettings
                });
              }}
            />
          </div>
        );
        
      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Globe className="h-6 w-6" />
                <h1 className="text-xl sm:text-2xl font-bold">Integration Settings</h1>
              </div>
              <div className="flex items-center gap-2">
                {getSaveStatusBadge()}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={resetToDefaults} variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Reset to Defaults</span>
                      <span className="sm:hidden">Reset</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset all settings to their default values</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  eTIMS Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.integrations.etims.enabled}
                    onCheckedChange={(checked) => updateIntegrations({
                      etims: { ...settings.integrations.etims, enabled: checked }
                    })}
                  />
                  <span>Enable eTIMS Integration</span>
                </div>

                {settings.integrations.etims.enabled && (
                  <React.Fragment>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>eTIMS PIN</Label>
                        <Input
                          value={settings.integrations.etims.pin}
                          onChange={(e) => updateIntegrations({
                            etims: { ...settings.integrations.etims, pin: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label>Environment</Label>
                        <Select 
                          value={settings.integrations.etims.sandboxMode ? 'sandbox' : 'production'} 
                          onValueChange={(value) => updateIntegrations({
                            etims: { ...settings.integrations.etims, sandboxMode: value === 'sandbox' }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sandbox">Sandbox</SelectItem>
                            <SelectItem value="production">Production</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>API URL</Label>
                      <Input
                        value={settings.integrations.etims.apiUrl}
                        onChange={(e) => updateIntegrations({
                          etims: { ...settings.integrations.etims, apiUrl: e.target.value }
                        })}
                        placeholder="https://etims-api-url.com"
                      />
                    </div>
                  </React.Fragment>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      {renderSelectedContent()}
    </TooltipProvider>
  );
};

export default SystemSettingsManager;
