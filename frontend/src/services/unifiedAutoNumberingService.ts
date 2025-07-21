import { supabase } from '@/integrations/supabase/client';
import { AutoNumberingSettings } from '@/modules/system-settings/types/systemSettingsTypes';

export interface NumberSequence {
  id: string;
  sequence_type: 'customer' | 'supplier' | 'product' | 'vendor';
  document_type?: string;
  prefix: string;
  current_number: number;
  format: string;
  reset_annually?: boolean;
  reset_monthly?: boolean;
  fiscal_year_start?: string;
  created_at: string;
  updated_at: string;
}

export class UnifiedAutoNumberingService {
  private static instance: UnifiedAutoNumberingService;
  
  private constructor() {}

  public static getInstance(): UnifiedAutoNumberingService {
    if (!UnifiedAutoNumberingService.instance) {
      UnifiedAutoNumberingService.instance = new UnifiedAutoNumberingService();
    }
    return UnifiedAutoNumberingService.instance;
  }

  /**
   * Load auto-numbering settings from the database sequences
   */
  async loadSettings(): Promise<AutoNumberingSettings> {
    try {
      const { data: sequences, error } = await supabase
        .from('number_sequences')
        .select('*')
        .is('document_type', null) // Only get entity sequences, not document sequences
        .in('sequence_type', ['customer', 'supplier', 'product', 'vendor']);

      if (error) {
        console.error('Error loading sequences:', error);
        console.log('Falling back to default settings due to database error');
        return this.getDefaultSettings();
      }

      // Convert database sequences to UI settings format
      const settings: AutoNumberingSettings = {
        customers: this.getDefaultEntitySettings('CUST', 1001),
        vendors: this.getDefaultEntitySettings('VEND', 2001),
        items: this.getDefaultEntitySettings('ITEM', 10001)
      };

      // Map database sequences to settings
      sequences?.forEach(seq => {
        const entityKey = this.mapSequenceTypeToEntityKey(seq.sequence_type);
        if (entityKey && settings[entityKey]) {
          settings[entityKey] = {
            enabled: true, // Always enabled since we don't have is_active column
            prefix: seq.prefix,
            startFrom: seq.current_number,
            increment: 1, // Always 1 for now
            nextNumber: seq.current_number,
            format: this.convertDatabaseFormatToUIFormat(seq.format)
          };
        }
      });

      return settings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Save auto-numbering settings to the database sequences
   */
  async saveSettings(settings: AutoNumberingSettings): Promise<boolean> {
    try {
      // Convert UI settings to database sequences
      const updates = [];

      for (const [entityKey, entitySettings] of Object.entries(settings)) {
        const sequenceType = this.mapEntityKeyToSequenceType(entityKey as keyof AutoNumberingSettings);
        if (!sequenceType || !entitySettings) continue;

        const sequenceData = {
          sequence_type: sequenceType,
          document_type: null,
          prefix: entitySettings.prefix,
          current_number: entitySettings.nextNumber,
          format: this.convertUIFormatToDatabaseFormat(entitySettings.format),
          reset_annually: false,
          reset_monthly: false
        };

        // Check if sequence exists
        const { data: existing } = await supabase
          .from('number_sequences')
          .select('id')
          .eq('sequence_type', sequenceType)
          .is('document_type', null)
          .single();

        if (existing) {
          // Update existing sequence
          const { error } = await supabase
            .from('number_sequences')
            .update(sequenceData)
            .eq('id', existing.id);

          if (error) {
            console.error(`Error updating ${sequenceType} sequence:`, error);
            throw error;
          }
        } else {
          // Create new sequence
          const { error } = await supabase
            .from('number_sequences')
            .insert([sequenceData])
            .select('id')
            .single();

          if (error) {
            console.error(`Error creating ${sequenceType} sequence:`, error);
            throw error;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }

  /**
   * Initialize default sequences if they don't exist
   */
  async initializeDefaultSequences(): Promise<void> {
    try {
      const defaultSettings = this.getDefaultSettings();
      
      for (const [entityKey, entitySettings] of Object.entries(defaultSettings)) {
        const sequenceType = this.mapEntityKeyToSequenceType(entityKey as keyof AutoNumberingSettings);
        if (!sequenceType || !entitySettings) continue;

        // Check if sequence already exists
        const { data: existing } = await supabase
          .from('number_sequences')
          .select('id')
          .eq('sequence_type', sequenceType)
          .is('document_type', null)
          .single();

        if (!existing) {
          // Create default sequence
          const sequenceData = {
            sequence_type: sequenceType,
            document_type: null,
            prefix: entitySettings.prefix,
            current_number: entitySettings.startFrom,
            format: this.convertUIFormatToDatabaseFormat(entitySettings.format),
            reset_annually: false,
            reset_monthly: false
          };

          const { error } = await supabase
            .from('number_sequences')
            .insert([sequenceData])
            .select('id')
            .single();

          if (error && !error.message?.includes('duplicate key')) {
            console.error(`Error creating default ${sequenceType} sequence:`, error);
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize default sequences:', error);
      throw error;
    }
  }

  /**
   * Generate next number for an entity type
   */
  async generateNumber(entityType: 'customer' | 'supplier' | 'product' | 'vendor'): Promise<string> {
    try {
      // Get the sequence for this entity type
      const { data: sequence, error } = await supabase
        .from('number_sequences')
        .select('*')
        .eq('sequence_type', entityType)
        .is('document_type', null)
        .single();

      if (error || !sequence) {
        console.warn(`No sequence found for ${entityType}, creating default`);
        await this.initializeDefaultSequences();
        
        // Try again after initialization
        const { data: newSequence, error: retryError } = await supabase
          .from('number_sequences')
          .select('*')
          .eq('sequence_type', entityType)
          .is('document_type', null)
          .single();

        if (retryError || !newSequence) {
          throw new Error(`Failed to get sequence for ${entityType}`);
        }
        
        return this.formatNumber(newSequence, newSequence.current_number);
      }

      // Auto-numbering is always enabled since we don't have is_active column

      // Generate the formatted number
      const formattedNumber = this.formatNumber(sequence, sequence.current_number);

      // Increment the sequence
      const { error: updateError } = await supabase
        .from('number_sequences')
        .update({ 
          current_number: sequence.current_number + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', sequence.id);

      if (updateError) {
        console.error(`Error updating ${entityType} sequence:`, updateError);
        throw updateError;
      }

      return formattedNumber;
    } catch (error) {
      console.error(`Failed to generate ${entityType} number:`, error);
      // Return fallback number
      const timestamp = Date.now();
      const prefix = entityType.toUpperCase().slice(0, 4);
      return `${prefix}-${timestamp}`;
    }
  }

  /**
   * Preview next number without incrementing
   */
  async previewNextNumber(entityType: 'customer' | 'supplier' | 'product' | 'vendor'): Promise<string> {
    try {
      const { data: sequence, error } = await supabase
        .from('number_sequences')
        .select('*')
        .eq('sequence_type', entityType)
        .is('document_type', null)
        .single();

      if (error || !sequence) {
        const defaults = this.getDefaultSettings();
        const entityKey = this.mapSequenceTypeToEntityKey(entityType);
        if (entityKey && defaults[entityKey]) {
          return this.formatNumberFromUIFormat(defaults[entityKey].format, defaults[entityKey].nextNumber, defaults[entityKey].prefix);
        }
        return 'N/A';
      }

      return this.formatNumber(sequence, sequence.current_number);
    } catch (error) {
      console.error(`Failed to preview ${entityType} number:`, error);
      return 'N/A';
    }
  }

  // Helper methods

  private getDefaultSettings(): AutoNumberingSettings {
    return {
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
      }
    };
  }

  private getDefaultEntitySettings(prefix: string, startFrom: number) {
    const padLength = startFrom >= 100000 ? 5 : 4;
    return {
      enabled: true,
      prefix,
      startFrom,
      increment: 1,
      nextNumber: startFrom,
      format: `{prefix}-{number:${padLength === 5 ? '00000' : '0000'}}`
    };
  }

  private mapSequenceTypeToEntityKey(sequenceType: string): keyof AutoNumberingSettings | null {
    switch (sequenceType) {
      case 'customer': return 'customers';
      case 'supplier': return 'vendors'; // Map supplier to vendors in UI
      case 'vendor': return 'vendors';
      case 'product': return 'items';
      default: return null;
    }
  }

  private mapEntityKeyToSequenceType(entityKey: keyof AutoNumberingSettings): string | null {
    switch (entityKey) {
      case 'customers': return 'customer';
      case 'vendors': return 'vendor'; // UI vendors maps to database vendor
      case 'items': return 'product';
      default: return null;
    }
  }

  private convertUIFormatToDatabaseFormat(uiFormat: string): string {
    // Convert {prefix}-{number:0000} to PREFIX-{####}
    return uiFormat.replace(/\{number:0+\}/g, (match) => {
      const padLength = match.match(/0+/)?.[0].length || 4;
      return '{' + '#'.repeat(padLength) + '}';
    });
  }

  private convertDatabaseFormatToUIFormat(dbFormat: string): string {
    // Convert PREFIX-{####} to {prefix}-{number:0000}
    return dbFormat.replace(/\{#+\}/g, (match) => {
      const hashLength = match.length - 2; // Remove { and }
      return '{number:' + '0'.repeat(hashLength) + '}';
    });
  }

  private formatNumber(sequence: NumberSequence, number: number): string {
    // Use the database format directly
    let formatted = sequence.format;
    
    // Replace prefix (handle both cases)
    formatted = formatted.replace(sequence.prefix, sequence.prefix);
    
    // Replace number placeholders
    const hashMatch = formatted.match(/\{(#+)\}/);
    if (hashMatch) {
      const hashCount = hashMatch[1].length;
      const paddedNumber = number.toString().padStart(hashCount, '0');
      formatted = formatted.replace(/\{#+\}/, paddedNumber);
    }
    
    return formatted;
  }

  private formatNumberFromUIFormat(format: string, number: number, prefix: string): string {
    return format
      .replace('{prefix}', prefix)
      .replace(/\{number:0+\}/g, (match) => {
        const padLength = match.match(/0+/)?.[0].length || 4;
        return number.toString().padStart(padLength, '0');
      });
  }
}

export const unifiedAutoNumberingService = UnifiedAutoNumberingService.getInstance();
