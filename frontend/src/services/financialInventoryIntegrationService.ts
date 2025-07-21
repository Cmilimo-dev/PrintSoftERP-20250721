import { supabase } from '@/integrations/supabase/client';
import { InventoryService } from './inventoryService';
import { FinancialDatabaseService } from './financialDatabaseService';

export interface InventoryValuation {
  productId: string;
  productName: string;
  currentStock: number;
  unitCost: number;
  totalValue: number;
  lastUpdated: string;
}

export interface CostOfGoodsSold {
  period: {
    startDate: string;
    endDate: string;
  };
  totalCOGS: number;
  breakdown: {
    productId: string;
    productName: string;
    quantitySold: number;
    averageCost: number;
    totalCost: number;
  }[];
}

export interface InventoryFinancialImpact {
  inventoryAssetValue: number;
  cogsPeriod: number;
  inventoryTurnover: number;
  daysInInventory: number;
  writeOffs: number;
  adjustments: number;
}

/**
 * Service to integrate financial module with inventory for cost calculations
 */
export class FinancialInventoryIntegrationService {

  /**
   * Calculate current inventory valuation for balance sheet
   */
  static async calculateInventoryValuation(): Promise<InventoryValuation[]> {
    try {
      const { data: inventoryItems, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products (
            id,
            name,
            sku,
            cost_price
          )
        `)
        .gt('quantity', 0);

      if (error) throw error;

      const valuations: InventoryValuation[] = (inventoryItems || []).map(item => ({
        productId: item.product_id,
        productName: item.products?.name || 'Unknown Product',
        currentStock: item.quantity,
        unitCost: item.products?.cost_price || 0,
        totalValue: item.quantity * (item.products?.cost_price || 0),
        lastUpdated: item.updated_at
      }));

      // Create or update inventory asset account
      await this.updateInventoryAssetAccount(valuations);

      return valuations;
    } catch (error) {
      console.error('Error calculating inventory valuation:', error);
      return [];
    }
  }

  /**
   * Calculate Cost of Goods Sold for a period
   */
  static async calculateCOGS(startDate: string, endDate: string): Promise<CostOfGoodsSold> {
    try {
      // Get all sales transactions in the period that affect inventory
      const { data: salesTransactions, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          transaction_entries (
            *,
            chart_of_accounts (*)
          )
        `)
        .eq('transaction_type', 'sale')
        .eq('affects_inventory', true)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (error) throw error;

      // Get stock movements for the same period
      const { data: stockMovements, error: stockError } = await supabase
        .from('stock_movements')
        .select(`
          *,
          products (
            id,
            name,
            sku,
            cost_price
          )
        `)
        .eq('movement_type', 'out')
        .eq('reference_type', 'sale')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (stockError) throw stockError;

      // Calculate COGS breakdown
      const breakdown = this.calculateCOGSBreakdown(stockMovements || []);
      const totalCOGS = breakdown.reduce((sum, item) => sum + item.totalCost, 0);

      // Record COGS journal entry
      await this.recordCOGSJournalEntry(totalCOGS, startDate, endDate);

      return {
        period: { startDate, endDate },
        totalCOGS,
        breakdown
      };
    } catch (error) {
      console.error('Error calculating COGS:', error);
      return {
        period: { startDate, endDate },
        totalCOGS: 0,
        breakdown: []
      };
    }
  }

  /**
   * Record inventory adjustment in both inventory and financial systems
   */
  static async recordInventoryAdjustment(
    productId: string,
    adjustmentQuantity: number,
    reason: string,
    unitCost?: number
  ): Promise<boolean> {
    try {
      // Get current product info
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*, inventory(*)')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      const currentCost = unitCost || product.cost_price || 0;
      const adjustmentValue = adjustmentQuantity * currentCost;

      // Record stock movement
      await InventoryService.recordStockMovement({
        productId,
        quantity: Math.abs(adjustmentQuantity),
        movementType: adjustmentQuantity > 0 ? 'in' : 'out',
        referenceType: 'adjustment',
        referenceId: `ADJ-${Date.now()}`
      });

      // Update inventory quantity
      const currentQuantity = product.inventory?.[0]?.quantity || 0;
      const newQuantity = currentQuantity + adjustmentQuantity;

      await InventoryService.updateInventory({
        productId,
        quantity: newQuantity,
        movementType: adjustmentQuantity > 0 ? 'in' : 'out',
        referenceType: 'adjustment',
        referenceId: `ADJ-${Date.now()}`
      });

      // Create financial transaction for inventory adjustment
      await this.recordInventoryAdjustmentJournalEntry(
        productId,
        adjustmentValue,
        reason,
        adjustmentQuantity > 0
      );

      return true;
    } catch (error) {
      console.error('Error recording inventory adjustment:', error);
      return false;
    }
  }

  /**
   * Calculate inventory financial impact metrics
   */
  static async calculateInventoryFinancialImpact(
    startDate: string,
    endDate: string
  ): Promise<InventoryFinancialImpact> {
    try {
      // Get current inventory value
      const valuations = await this.calculateInventoryValuation();
      const inventoryAssetValue = valuations.reduce((sum, val) => sum + val.totalValue, 0);

      // Get COGS for the period
      const cogs = await this.calculateCOGS(startDate, endDate);

      // Calculate inventory turnover (COGS / Average Inventory)
      const averageInventory = inventoryAssetValue; // Simplified - should use beginning and ending inventory
      const inventoryTurnover = averageInventory > 0 ? cogs.totalCOGS / averageInventory : 0;
      const daysInInventory = inventoryTurnover > 0 ? 365 / inventoryTurnover : 0;

      // Get write-offs and adjustments
      const { data: adjustments } = await supabase
        .from('stock_movements')
        .select('quantity, unit_cost')
        .eq('movement_type', 'adjustment')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const writeOffs = (adjustments || [])
        .filter(adj => adj.quantity < 0)
        .reduce((sum, adj) => sum + Math.abs(adj.quantity * (adj.unit_cost || 0)), 0);

      const positiveAdjustments = (adjustments || [])
        .filter(adj => adj.quantity > 0)
        .reduce((sum, adj) => sum + (adj.quantity * (adj.unit_cost || 0)), 0);

      return {
        inventoryAssetValue,
        cogsPeriod: cogs.totalCOGS,
        inventoryTurnover,
        daysInInventory,
        writeOffs,
        adjustments: positiveAdjustments
      };
    } catch (error) {
      console.error('Error calculating inventory financial impact:', error);
      return {
        inventoryAssetValue: 0,
        cogsPeriod: 0,
        inventoryTurnover: 0,
        daysInInventory: 0,
        writeOffs: 0,
        adjustments: 0
      };
    }
  }

  /**
   * Update inventory levels when financial transactions occur
   */
  static async processFinancialTransactionInventoryImpact(
    transactionId: string
  ): Promise<void> {
    try {
      // Get transaction details
      const { data: transaction, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          transaction_entries (
            *,
            chart_of_accounts (*)
          )
        `)
        .eq('id', transactionId)
        .single();

      if (error || !transaction) return;

      // Only process transactions that affect inventory
      if (!transaction.affects_inventory) return;

      // Handle different transaction types
      switch (transaction.transaction_type) {
        case 'sale':
          await this.processSaleInventoryImpact(transaction);
          break;
        case 'purchase':
          await this.processPurchaseInventoryImpact(transaction);
          break;
        case 'adjustment':
          // Already handled in recordInventoryAdjustment
          break;
      }
    } catch (error) {
      console.error('Error processing financial transaction inventory impact:', error);
    }
  }

  // Private helper methods

  private static async updateInventoryAssetAccount(valuations: InventoryValuation[]): Promise<void> {
    try {
      const totalValue = valuations.reduce((sum, val) => sum + val.totalValue, 0);

      // Find or create inventory asset account
      let inventoryAccount = await FinancialDatabaseService.getAccountByNumber('1300');
      
      if (!inventoryAccount) {
        // Create inventory account if it doesn't exist
        inventoryAccount = await FinancialDatabaseService.saveAccount({
          id: '',
          accountNumber: '1300',
          accountName: 'Inventory',
          accountType: 'asset',
          accountSubtype: 'current_asset',
          description: 'Current inventory asset value',
          isActive: true,
          isSystemAccount: false,
          currency: 'KES',
          openingBalance: 0,
          currentBalance: totalValue,
          debitBalance: totalValue,
          creditBalance: 0,
          lastTransactionDate: new Date().toISOString(),
          tags: ['inventory', 'asset'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        // Update existing account balance
        inventoryAccount.currentBalance = totalValue;
        inventoryAccount.debitBalance = totalValue;
        inventoryAccount.updatedAt = new Date().toISOString();
        await FinancialDatabaseService.saveAccount(inventoryAccount);
      }
    } catch (error) {
      console.error('Error updating inventory asset account:', error);
    }
  }

  private static calculateCOGSBreakdown(stockMovements: any[]): CostOfGoodsSold['breakdown'] {
    const productMap = new Map();

    stockMovements.forEach(movement => {
      const productId = movement.product_id;
      const key = productId;

      if (!productMap.has(key)) {
        productMap.set(key, {
          productId,
          productName: movement.products?.name || 'Unknown Product',
          quantitySold: 0,
          totalCost: 0,
          costs: []
        });
      }

      const entry = productMap.get(key);
      entry.quantitySold += movement.quantity;
      const cost = movement.unit_cost || movement.products?.cost_price || 0;
      entry.totalCost += movement.quantity * cost;
      entry.costs.push(cost);
    });

    return Array.from(productMap.values()).map(entry => ({
      productId: entry.productId,
      productName: entry.productName,
      quantitySold: entry.quantitySold,
      averageCost: entry.costs.length > 0 ? 
        entry.costs.reduce((sum: number, cost: number) => sum + cost, 0) / entry.costs.length : 0,
      totalCost: entry.totalCost
    }));
  }

  private static async recordCOGSJournalEntry(
    cogsAmount: number,
    startDate: string,
    endDate: string
  ): Promise<void> {
    try {
      if (cogsAmount <= 0) return;

      // Create journal entry for COGS
      const transaction = {
        transaction_number: `COGS-${new Date().getFullYear()}-${Date.now()}`,
        transaction_date: new Date().toISOString(),
        transaction_type: 'adjustment' as const,
        description: `Cost of Goods Sold for period ${startDate} to ${endDate}`,
        total_amount: cogsAmount,
        currency: 'KES',
        status: 'completed' as const,
        affects_inventory: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await FinancialDatabaseService.saveTransaction(transaction);
    } catch (error) {
      console.error('Error recording COGS journal entry:', error);
    }
  }

  private static async recordInventoryAdjustmentJournalEntry(
    productId: string,
    adjustmentValue: number,
    reason: string,
    isIncrease: boolean
  ): Promise<void> {
    try {
      const transaction = {
        transaction_number: `INVADJ-${Date.now()}`,
        transaction_date: new Date().toISOString(),
        transaction_type: 'adjustment' as const,
        description: `Inventory adjustment for product ${productId}: ${reason}`,
        total_amount: Math.abs(adjustmentValue),
        currency: 'KES',
        status: 'completed' as const,
        affects_inventory: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await FinancialDatabaseService.saveTransaction(transaction);
    } catch (error) {
      console.error('Error recording inventory adjustment journal entry:', error);
    }
  }

  private static async processSaleInventoryImpact(transaction: any): Promise<void> {
    // This would typically be called when a sale is recorded
    // to automatically reduce inventory and record COGS
    try {
      // Implementation would depend on how sales orders link to products
      console.log('Processing sale inventory impact for transaction:', transaction.id);
    } catch (error) {
      console.error('Error processing sale inventory impact:', error);
    }
  }

  private static async processPurchaseInventoryImpact(transaction: any): Promise<void> {
    // This would typically be called when a purchase is recorded
    // to automatically increase inventory
    try {
      // Implementation would depend on how purchase orders link to products
      console.log('Processing purchase inventory impact for transaction:', transaction.id);
    } catch (error) {
      console.error('Error processing purchase inventory impact:', error);
    }
  }
}
