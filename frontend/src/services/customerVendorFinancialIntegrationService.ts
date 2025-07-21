import { supabase } from '@/integrations/supabase/client';
import { CustomerDataIntegrationService } from './customerDataIntegrationService';
import { FinancialDatabaseService } from './financialDatabaseService';

/**
 * Service to integrate customer and vendor management with financial transactions
 */
export class CustomerVendorFinancialIntegrationService {

  /**
   * Link customers to their financial transactions and balance
   */
  static async getCustomerFinancialOverview(customerId: string) {
    try {
      const customer = await CustomerDataIntegrationService.getCustomerById(customerId);
      if (!customer) throw new Error('Customer not found');

      const { data: transactions, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('customer_id', customerId);

      if (error) throw error;

      const totalTransactions = transactions.length;
      const totalAmount = transactions.reduce((sum, tx) => sum + tx.total_amount, 0);

      return {
        customer,
        transactions,
        totalTransactions,
        totalAmount
      };
    } catch (error) {
      console.error('Error getting customer financial overview:', error);
      return null;
    }
  }

  /**
   * Link vendors to their financial transactions and balance
   */
  static async getVendorFinancialOverview(vendorId: string) {
    try {
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();
      if (vendorError || !vendor) throw new Error('Vendor not found');

      const { data: transactions, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('vendor_id', vendorId);

      if (error) throw error;

      const totalTransactions = transactions.length;
      const totalAmount = transactions.reduce((sum, tx) => sum + tx.total_amount, 0);

      return {
        vendor,
        transactions,
        totalTransactions,
        totalAmount
      };
    } catch (error) {
      console.error('Error getting vendor financial overview:', error);
      return null;
    }
  }

  /**
   * Trigger notifications when financial events occur
   */
  static async notifyFinancialEvent(customerId: string, event: string) {
    try {
      const customer = await CustomerDataIntegrationService.getCustomerById(customerId);
      if (!customer) throw new Error('Customer not found');

      // You can implement a real notification system
      console.log(`Notify ${customer.name} of ${event}`);
    } catch (error) {
      console.error('Error notifying financial event:', error);
    }
  }
}
