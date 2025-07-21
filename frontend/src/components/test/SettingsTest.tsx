import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SettingsBridgeService } from '@/services/settingsBridgeService';
import { useSettings, useUpdateSettings } from '@/hooks/useBackendData';

export const SettingsTest: React.FC = () => {
  const [testKey, setTestKey] = useState('test_setting');
  const [testValue, setTestValue] = useState('Hello from backend!');
  const [loading, setLoading] = useState(false);
  
  // Backend hooks
  const { data: settings, isLoading, error } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const handleSaveSetting = async () => {
    setLoading(true);
    try {
      await SettingsBridgeService.saveSettings({ [testKey]: testValue });
      toast.success('Setting saved successfully!');
    } catch (error) {
      toast.error('Failed to save setting');
      console.error('Error saving setting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSettings = async () => {
    setLoading(true);
    try {
      const loadedSettings = await SettingsBridgeService.loadSettings();
      console.log('Loaded settings:', loadedSettings);
      toast.success('Settings loaded successfully!');
    } catch (error) {
      toast.error('Failed to load settings');
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForceSyncToBackend = async () => {
    setLoading(true);
    try {
      const success = await SettingsBridgeService.forceSyncToBackend();
      if (success) {
        toast.success('Settings synced to backend successfully!');
      } else {
        toast.error('Failed to sync settings to backend');
      }
    } catch (error) {
      toast.error('Failed to sync settings');
      console.error('Error syncing settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      const isAvailable = await SettingsBridgeService.isSyncEnabled();
      toast.success(`Backend ${isAvailable ? 'is' : 'is not'} available`);
    } catch (error) {
      toast.error('Failed to test backend connection');
      console.error('Error testing backend:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings Backend Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testKey">Test Key</Label>
              <Input
                id="testKey"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                placeholder="Enter test key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testValue">Test Value</Label>
              <Input
                id="testValue"
                value={testValue}
                onChange={(e) => setTestValue(e.target.value)}
                placeholder="Enter test value"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleSaveSetting} 
              disabled={loading}
            >
              Save Setting
            </Button>
            <Button 
              onClick={handleLoadSettings} 
              variant="outline"
              disabled={loading}
            >
              Load Settings
            </Button>
            <Button 
              onClick={handleForceSyncToBackend} 
              variant="outline"
              disabled={loading}
            >
              Force Sync to Backend
            </Button>
            <Button 
              onClick={testBackendConnection} 
              variant="outline"
              disabled={loading}
            >
              Test Backend Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backend Settings Data</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading settings from backend...</p>
          ) : error ? (
            <p className="text-red-500">Error loading settings: {error.message}</p>
          ) : settings && settings.length > 0 ? (
            <div className="space-y-2">
              <p className="font-medium">Found {settings.length} settings in backend:</p>
              <div className="max-h-60 overflow-y-auto">
                {settings.map((setting: any, index: number) => (
                  <div key={index} className="p-2 border rounded text-sm">
                    <strong>{setting.key}:</strong> {JSON.stringify(setting.value)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No settings found in backend</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
