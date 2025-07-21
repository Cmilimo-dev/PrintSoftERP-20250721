import { useState, useEffect } from 'react';
import { SystemSettingsService } from '@/modules/system-settings/services/systemSettingsService';
import { SystemSettings, CompanyInfo, TaxConfig, DocumentDefaults, IntegrationSettings } from '@/modules/system-settings/types/systemSettingsTypes';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const currentSettings = SystemSettingsService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = (updates: Partial<SystemSettings>) => {
    if (!settings) return;
    
    try {
      setSaveStatus('saving');
      const success = SystemSettingsService.updateSettings(updates);
      
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

  const updateDocumentDefaults = (updates: Partial<DocumentDefaults>) => {
    if (!settings) return;
    const updatedDocumentDefaults = { ...settings.documentDefaults, ...updates };
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

  return {
    // State
    settings,
    loading,
    saveStatus,
    
    // Actions
    loadSettings,
    saveSettings,
    updateCompanyInfo,
    updateTaxConfig,
    updateDocumentDefaults,
    updateIntegrations,
    resetToDefaults,
  };
};
