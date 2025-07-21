// Unified number generation service that handles both local and Supabase methods
import LocalNumberGenerationService from './localNumberGenerationService';
import NumberGenerationService from './numberGenerationService';

class UnifiedNumberService {
  // Configuration - set this to true when Supabase table is available
  private static USE_SUPABASE = true;
  
  // Check if Supabase is available and configured
  static async checkSupabaseAvailability(): Promise<boolean> {
    try {
      // Try to generate a test number to see if Supabase works
      await NumberGenerationService.generateDocumentNumber('test');
      this.USE_SUPABASE = true;
      return true;
    } catch (error) {
      console.warn('Supabase number sequences not available, using local fallback');
      this.USE_SUPABASE = false;
      return false;
    }
  }

  // Generate customer number
  static async generateCustomerNumber(): Promise<string> {
    if (this.USE_SUPABASE) {
      try {
        return await NumberGenerationService.generateCustomerNumber();
      } catch (error) {
        console.warn('Supabase failed, falling back to local generation');
        this.USE_SUPABASE = false;
      }
    }
    return LocalNumberGenerationService.generateCustomerNumber();
  }

  // Generate supplier number
  static async generateSupplierNumber(): Promise<string> {
    if (this.USE_SUPABASE) {
      try {
        return await NumberGenerationService.generateSupplierNumber();
      } catch (error) {
        console.warn('Supabase failed, falling back to local generation');
        this.USE_SUPABASE = false;
      }
    }
    return LocalNumberGenerationService.generateSupplierNumber();
  }

  // Generate vendor number
  static async generateVendorNumber(): Promise<string> {
    if (this.USE_SUPABASE) {
      try {
        return await NumberGenerationService.generateVendorNumber();
      } catch (error) {
        console.warn('Supabase failed, falling back to local generation');
        this.USE_SUPABASE = false;
      }
    }
    return LocalNumberGenerationService.generateVendorNumber();
  }

  // Generate product code
  static async generateProductCode(): Promise<string> {
    if (this.USE_SUPABASE) {
      try {
        return await NumberGenerationService.generateProductCode();
      } catch (error) {
        console.warn('Supabase failed, falling back to local generation');
        this.USE_SUPABASE = false;
      }
    }
    return LocalNumberGenerationService.generateProductCode();
  }

  // Generate document number
  static async generateDocumentNumber(documentType: string): Promise<string> {
    if (this.USE_SUPABASE) {
      try {
        return await NumberGenerationService.generateDocumentNumber(documentType);
      } catch (error) {
        console.warn('Supabase failed, falling back to local generation');
        this.USE_SUPABASE = false;
      }
    }
    return LocalNumberGenerationService.generateDocumentNumber(documentType);
  }

  // Synchronous versions that only use local generation
  static generateCustomerNumberSync(): string {
    return LocalNumberGenerationService.generateCustomerNumber();
  }

  static generateSupplierNumberSync(): string {
    return LocalNumberGenerationService.generateSupplierNumber();
  }

  static generateVendorNumberSync(): string {
    return LocalNumberGenerationService.generateVendorNumber();
  }

  static generateProductCodeSync(): string {
    return LocalNumberGenerationService.generateProductCode();
  }

  static generateDocumentNumberSync(documentType: string): string {
    return LocalNumberGenerationService.generateDocumentNumber(documentType);
  }

  // Enable Supabase usage (call this after setting up the database table)
  static enableSupabase(): void {
    this.USE_SUPABASE = true;
  }

  // Force local usage (useful for testing or when Supabase is down)
  static forceLocal(): void {
    this.USE_SUPABASE = false;
  }

  // Get current mode
  static getCurrentMode(): 'supabase' | 'local' {
    return this.USE_SUPABASE ? 'supabase' : 'local';
  }

  // Export local sequences for backup
  static exportLocalSequences(): string {
    return LocalNumberGenerationService.exportSequences();
  }

  // Import local sequences from backup
  static importLocalSequences(data: string): void {
    LocalNumberGenerationService.importSequences(data);
  }

  // Reset local sequences
  static resetLocalSequences(): void {
    LocalNumberGenerationService.resetAllSequences();
  }
}

export default UnifiedNumberService;
