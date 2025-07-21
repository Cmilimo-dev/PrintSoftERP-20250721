import { SystemSettingsService } from '@/modules/system-settings/services/systemSettingsService';
import { settings } from '@/lib/api';

/**
 * Bridge service that synchronizes settings between localStorage and backend
 */
export class SettingsBridgeService {
  private static readonly SYNC_ENABLED_KEY = 'settings_sync_enabled';
  
  /**
   * Check if backend sync is enabled and available
   */
  static async isSyncEnabled(): Promise<boolean> {
    try {
      // TODO: Enable once backend settings endpoints are implemented
      // For now, disable backend sync to avoid errors
      return false;
      
      // Check if we have a valid auth token
      const token = localStorage.getItem('access_token');
      if (!token) {
        return false;
      }
      
      // Test backend connection
      await settings.getAll();
      return true;
    } catch (error) {
      console.log('Backend sync not available, falling back to localStorage');
      return false;
    }
  }
  
  /**
   * Load settings from backend or localStorage
   */
  static async loadSettings() {
    const syncEnabled = await this.isSyncEnabled();
    
    if (syncEnabled) {
      try {
        // Load from backend
        const backendSettings = await settings.getAll();
        
        // Convert backend format to frontend format
        const systemSettings = this.convertBackendToFrontend(backendSettings);
        
        // Update localStorage with backend data
        SystemSettingsService.updateSettings(systemSettings);
        
        return systemSettings;
      } catch (error) {
        console.error('Failed to load from backend, using localStorage:', error);
        return SystemSettingsService.getSettings();
      }
    } else {
      // Use localStorage
      return SystemSettingsService.getSettings();
    }
  }
  
  /**
   * Save settings to both backend and localStorage
   */
  static async saveSettings(updates: any) {
    // Always update localStorage first
    const success = SystemSettingsService.updateSettings(updates);
    
    if (!success) {
      throw new Error('Failed to update localStorage');
    }
    
    // Try to sync with backend if available
    try {
      const syncEnabled = await this.isSyncEnabled();
      
      if (syncEnabled) {
        // Convert to backend format and save
        await this.syncToBackend(updates);
      }
    } catch (error) {
      console.warn('Failed to sync to backend, localStorage updated:', error);
    }
    
    return success;
  }
  
  /**
   * Convert backend settings array to frontend SystemSettings object
   */
  private static convertBackendToFrontend(backendSettings: any[]): any {
    const converted: any = {};
    
    backendSettings.forEach(setting => {
      try {
        const value = typeof setting.value === 'string' 
          ? JSON.parse(setting.value) 
          : setting.value;
        
        converted[setting.key] = value;
      } catch (error) {
        console.warn(`Failed to parse setting ${setting.key}:`, error);
      }
    });
    
    // If we have converted settings, merge with defaults
    if (Object.keys(converted).length > 0) {
      const defaults = SystemSettingsService.getSettings();
      return { ...defaults, ...converted };
    }
    
    // Return defaults if no backend settings
    return SystemSettingsService.getSettings();
  }
  
  /**
   * Sync current settings to backend
   */
  private static async syncToBackend(settingsUpdates: any) {
    try {
      // Flatten the settings object and save each key-value pair
      const flattenedSettings = this.flattenSettings(settingsUpdates);
      
      for (const [key, value] of Object.entries(flattenedSettings)) {
        await settings.update(key, value, 'system');
      }
    } catch (error) {
      console.error('Error syncing to backend:', error);
      throw error;
    }
  }
  
  /**
   * Flatten nested settings object for backend storage
   */
  private static flattenSettings(obj: any, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively flatten objects
        Object.assign(flattened, this.flattenSettings(value, newKey));
      } else {
        // Store primitive values and arrays as-is
        flattened[newKey] = value;
      }
    }
    
    return flattened;
  }
  
  /**
   * Force sync all localStorage settings to backend
   */
  static async forceSyncToBackend() {
    try {
      const localSettings = SystemSettingsService.getSettings();
      await this.syncToBackend(localSettings);
      console.log('✅ Settings synced to backend');
      return true;
    } catch (error) {
      console.error('❌ Failed to sync settings to backend:', error);
      return false;
    }
  }
}
