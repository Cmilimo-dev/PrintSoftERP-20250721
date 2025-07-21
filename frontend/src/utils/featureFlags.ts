import { supabase } from '@/integrations/supabase/client';

interface FeatureFlags {
  hasInventoryManagement: boolean;
  hasAdvancedInventory: boolean;
  hasVendorManagement: boolean;
  hasPaymentReceipts: boolean;
  hasProductCategories: boolean;
  hasStockMovements: boolean;
}

class FeatureFlagService {
  private static flags: FeatureFlags | null = null;
  private static initialized = false;

  static async initializeFeatureFlags(): Promise<FeatureFlags> {
    if (this.initialized && this.flags) {
      return this.flags;
    }

    const flags: FeatureFlags = {
      hasInventoryManagement: false,
      hasAdvancedInventory: false,
      hasVendorManagement: false,
      hasPaymentReceipts: false,
      hasProductCategories: false,
      hasStockMovements: false
    };

    try {
      // Check for products/parts table
      const { error: partsError } = await supabase
        .from('parts')
        .select('id')
        .limit(1);
      flags.hasInventoryManagement = !partsError;

      // Check for product categories
      const { error: categoriesError } = await supabase
        .from('product_categories')
        .select('id')
        .limit(1);
      flags.hasProductCategories = !categoriesError;

      // Check for stock movements
      const { error: movementsError } = await supabase
        .from('stock_movements')
        .select('id')
        .limit(1);
      flags.hasStockMovements = !movementsError;

      // Check for vendors
      const { error: vendorsError } = await supabase
        .from('vendors')
        .select('id')
        .limit(1);
      flags.hasVendorManagement = !vendorsError;

      // Check for payment receipts
      const { error: receiptsError } = await supabase
        .from('payment_receipts')
        .select('id')
        .limit(1);
      flags.hasPaymentReceipts = !receiptsError;

      // Advanced inventory requires multiple tables
      flags.hasAdvancedInventory = flags.hasInventoryManagement && 
                                  flags.hasProductCategories && 
                                  flags.hasStockMovements;

    } catch (error) {
      console.log('Error checking feature flags:', error);
    }

    this.flags = flags;
    this.initialized = true;
    return flags;
  }

  static getFlags(): FeatureFlags | null {
    return this.flags;
  }

  static async hasFeature(feature: keyof FeatureFlags): Promise<boolean> {
    if (!this.initialized) {
      await this.initializeFeatureFlags();
    }
    return this.flags?.[feature] || false;
  }

  static reset() {
    this.flags = null;
    this.initialized = false;
  }
}

export { FeatureFlagService, type FeatureFlags };
