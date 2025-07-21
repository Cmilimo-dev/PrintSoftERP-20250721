import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Truck, Package, Eye, Loader2, UserCheck } from 'lucide-react';
import { AutoNumberingSettings } from '@/modules/system-settings/types/systemSettingsTypes';
// import { unifiedAutoNumberingService } from '@/services/unifiedAutoNumberingService';
import { autoNumberingService } from '@/services/autoNumberingService';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

interface AutoNumberingTabProps {
  autoNumbering: AutoNumberingSettings | undefined;
  onUpdate: (updates: { autoNumbering: AutoNumberingSettings }) => void;
}

const AutoNumberingTab: React.FC<AutoNumberingTabProps> = ({ 
  autoNumbering, 
  onUpdate 
}) => {
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<AutoNumberingSettings | undefined>(autoNumbering);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  
  const entities = ['customers', 'vendors', 'items', 'leads'] as const;

  // Load settings from database on mount
  useEffect(() => {
    loadSettingsFromDatabase();
  }, []);

  // Update previews when settings change
  useEffect(() => {
    if (currentSettings) {
      updatePreviews();
    }
  }, [currentSettings]);

  const loadSettingsFromDatabase = async () => {
    try {
      setLoading(true);
      const localSettings = autoNumberingService.getSettings();
      setCurrentSettings(localSettings);
      onUpdate({ autoNumbering: localSettings });
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: "Error",
        description: "Failed to load auto-numbering settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettingsToDatabase = async (settings: AutoNumberingSettings) => {
    try {
      setSaving(true);
      autoNumberingService.saveSettings(settings);
      
      setCurrentSettings(settings);
      onUpdate({ autoNumbering: settings });
      toast({
        title: "Success",
        description: "Auto-numbering settings saved successfully",
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error",
        description: "Failed to save auto-numbering settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreviews = async () => {
    const newPreviews: Record<string, string> = {};
    
    if (currentSettings) {
      for (const entity of entities) {
        const entitySettings = currentSettings[entity];
        if (entitySettings) {
          const preview = entitySettings.format
            .replace('{prefix}', entitySettings.prefix)
            .replace(/\{number:0+\}/g, (match) => {
              const padLength = match.match(/0+/)?.[0].length || 4;
              return entitySettings.nextNumber.toString().padStart(padLength, '0');
            });
          newPreviews[entity] = preview;
        } else {
          newPreviews[entity] = 'N/A';
        }
      }
    }
    
    setPreviews(newPreviews);
  };

  const mapEntityToSequenceType = (entity: keyof AutoNumberingSettings): 'customer' | 'vendor' | 'product' | null => {
    switch (entity) {
      case 'customers': return 'customer';
      case 'vendors': return 'vendor';
      case 'items': return 'product';
      default: return null;
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'customers':
        return <Users className="h-5 w-5" />;
      case 'vendors':
        return <Truck className="h-5 w-5" />;
      case 'items':
        return <Package className="h-5 w-5" />;
      case 'leads':
        return <UserCheck className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getDefaultAutoNumbering = (): AutoNumberingSettings => ({
    customers: { 
      enabled: true, 
      prefix: 'CUST', 
      startFrom: 10001, 
      increment: 1, 
      nextNumber: 10001, 
      format: '{prefix}-{number:0000}' 
    },
    vendors: { 
      enabled: true, 
      prefix: 'VEN', 
      startFrom: 10001, 
      increment: 1, 
      nextNumber: 10001, 
      format: '{prefix}-{number:0000}' 
    },
    items: { 
      enabled: true, 
      prefix: 'PROD', 
      startFrom: 100001, 
      increment: 1, 
      nextNumber: 100001, 
      format: '{prefix}-{number:00000}' 
    },
    leads: { 
      enabled: true, 
      prefix: 'LEAD', 
      startFrom: 10000, 
      increment: 1, 
      nextNumber: 10000, 
      format: '{prefix}-{number:0000}' 
    }
  });

  const initializeAutoNumbering = async () => {
    const defaultSettings = getDefaultAutoNumbering();
    await saveSettingsToDatabase(defaultSettings);
  };

  const updateEntitySettings = async (entity: keyof AutoNumberingSettings, updates: any) => {
    if (!currentSettings) return;
    
    const updatedSettings = {
      ...currentSettings,
      [entity]: { ...currentSettings[entity], ...updates }
    };
    
    // Save immediately to database
    await saveSettingsToDatabase(updatedSettings);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading auto-numbering settings...</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentSettings) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Auto-numbering settings not available.
          </p>
          {hasPermission('settings.write') && (
            <Button onClick={initializeAutoNumbering} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Initializing...
                </>
              ) : (
                'Initialize Auto-Numbering Settings'
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {saving && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-blue-700">Saving settings...</span>
        </div>
      )}
      
      {entities.map((entity) => (
        <Card key={entity}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getEntityIcon(entity)}
                {entity.charAt(0).toUpperCase() + entity.slice(1)} Auto-Numbering
              </div>
              {previews[entity] && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Next: {previews[entity]}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={currentSettings[entity]?.enabled || false}
                onCheckedChange={(checked) => updateEntitySettings(entity, { 
                  enabled: checked 
                })}
                disabled={saving || !hasPermission('settings.write')}
              />
              <span>Enable auto-numbering for {entity}</span>
            </div>

            {/* Configuration Fields */}
            {currentSettings[entity]?.enabled && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Prefix</Label>
                  <Input
                    value={currentSettings[entity]?.prefix || ''}
                    onChange={(e) => updateEntitySettings(entity, { 
                      prefix: e.target.value 
                    })}
                    disabled={saving || !hasPermission('settings.write')}
                    placeholder="e.g., CUST"
                  />
                </div>
                
                <div>
                  <Label>Next Number</Label>
                  <Input
                    type="number"
                    value={currentSettings[entity]?.nextNumber || 1}
                    onChange={(e) => updateEntitySettings(entity, { 
                      nextNumber: parseInt(e.target.value) || 1 
                    })}
                    disabled={saving || !hasPermission('settings.write')}
                    min="1"
                  />
                </div>
                
                <div>
                  <Label>Format</Label>
                  <Input
                    value={currentSettings[entity]?.format || ''}
                    onChange={(e) => updateEntitySettings(entity, { 
                      format: e.target.value 
                    })}
                    disabled={saving || !hasPermission('settings.write')}
                    placeholder="{prefix}-{number:0000}"
                  />
                </div>
              </div>
            )}
            
            {/* Current Preview */}
            {currentSettings[entity]?.enabled && previews[entity] && (
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Next number will be:</span>
                  <Badge variant="secondary">{previews[entity]}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AutoNumberingTab;
