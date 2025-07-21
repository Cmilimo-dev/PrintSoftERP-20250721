import { SystemSettingsService } from '@/modules/system-settings/services/systemSettingsService';
import { AuthorizedSignature, SignatureSettings } from '@/modules/system-settings/types/signatureTypes';

/**
 * Service for managing document signatures
 * Provides easy access to signature settings and authorized signatures
 */
export class SignatureService {
  /**
   * Get signature settings from system settings
   */
  static getSignatureSettings(): SignatureSettings {
    const settings = SystemSettingsService.getSettings();
    return settings.signatures || {
      enabled: false,
      showOnDocuments: false,
      signaturePosition: 'bottom-right',
      showTitle: true,
      showName: true,
      showDate: true,
      customText: 'Authorized by:'
    };
  }

  /**
   * Get all authorized signatures from system settings
   */
  static getAuthorizedSignatures(): AuthorizedSignature[] {
    const settings = SystemSettingsService.getSettings();
    return settings.authorizedSignatures || [];
  }

  /**
   * Get only active authorized signatures
   */
  static getSignatures(): AuthorizedSignature[] {
    return this.getAuthorizedSignatures();
  }

  /**
   * Get the default signature if one exists
   */
  static getDefaultSignature(): AuthorizedSignature | undefined {
    return this.getSignatures().find(signature => signature.isDefault);
  }

  /**
   * Get a specific signature by ID
   */
  static getSignatureById(id: string): AuthorizedSignature | undefined {
    return this.getAuthorizedSignatures().find(signature => signature.id === id);
  }

  /**
   * Check if signatures are enabled globally
   */
  static areSignaturesEnabled(): boolean {
    const settings = this.getSignatureSettings();
    return settings.enabled && settings.showOnDocuments;
  }

  /**
   * Get signature data for document display
   * Returns the signature and settings needed to render a signature on a document
   */
  static getDocumentSignatureData(selectedSignatureId?: string): {
    signature: AuthorizedSignature | null;
    settings: SignatureSettings;
    isEnabled: boolean;
  } {
    const settings = this.getSignatureSettings();
    const signatures = this.getSignatures();

    if (!this.areSignaturesEnabled() || signatures.length === 0) {
      return {
        signature: null,
        settings,
        isEnabled: false
      };
    }

    let signature: AuthorizedSignature | undefined;

    if (selectedSignatureId) {
      // Use selected signature if provided and active
      signature = signatures.find(sig => sig.id === selectedSignatureId);
    }

    // Fall back to default signature if no selection or selected signature not found
    if (!signature) {
      signature = this.getDefaultSignature();
    }

    return {
      signature: signature || null,
      settings,
      isEnabled: !!signature
    };
  }

  /**
   * Format signature display text
   * Generates the formatted text that should appear in a signature block
   */
  static formatSignatureText(signature: AuthorizedSignature, settings: SignatureSettings, date?: string): {
    customText?: string;
    titleLine?: string;
    name?: string;
    title?: string;
    department?: string;
    dateLine?: string;
  } {
    const currentDate = date || new Date().toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return {
      customText: settings.customText || undefined,
      titleLine: settings.showTitle && signature.title ? `${signature.title} Signature` : undefined,
      name: settings.showName ? signature.name : undefined,
      title: settings.showTitle ? signature.title : undefined,
      department: signature.department || undefined,
      dateLine: settings.showDate ? `Date: ${currentDate}` : undefined
    };
  }

  /**
   * Get signature position class for CSS styling
   */
  static getPositionClass(settings?: SignatureSettings): string {
    const signatureSettings = settings || this.getSignatureSettings();
    
    switch (signatureSettings.signaturePosition) {
      case 'bottom-left':
        return 'text-left';
      case 'bottom-center':
        return 'text-center';
      case 'bottom-right':
        return 'text-right';
      default:
        return 'text-right';
    }
  }

  /**
   * Update signature settings
   */
  static updateSignatureSettings(updates: Partial<SignatureSettings>): boolean {
    try {
      const currentSettings = SystemSettingsService.getSettings();
      const updatedSignatureSettings = {
        ...currentSettings.signatures,
        ...updates
      };

      return SystemSettingsService.updateSettings({
        signatures: updatedSignatureSettings
      });
    } catch (error) {
      console.error('Failed to update signature settings:', error);
      return false;
    }
  }

  /**
   * Update authorized signatures list
   */
  static updateAuthorizedSignatures(signatures: AuthorizedSignature[]): boolean {
    try {
      return SystemSettingsService.updateSettings({
        authorizedSignatures: signatures
      });
    } catch (error) {
      console.error('Failed to update authorized signatures:', error);
      return false;
    }
  }

  /**
   * Check if a signature should be displayed on documents
   */
  static shouldShowSignature(showSignatureOnDocument: boolean = true): boolean {
    const settings = this.getSignatureSettings();
    const hasActiveSignatures = this.getSignatures().length > 0;
    
    return settings.enabled && 
           settings.showOnDocuments && 
           showSignatureOnDocument && 
           hasActiveSignatures;
  }
}
