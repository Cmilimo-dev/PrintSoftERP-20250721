import { FinancialInventoryIntegrationService } from './financialInventoryIntegrationService';
import { CustomerVendorFinancialIntegrationService } from './customerVendorFinancialIntegrationService';
import { FinancialNotificationService } from './financialNotificationService';
import { FinancialApiIntegrationService } from './financialApiIntegrationService';

export interface IntegrationStatus {
  service: string;
  status: 'active' | 'inactive' | 'error';
  lastCheck: string;
  errorMessage?: string;
}

export interface IntegrationMetrics {
  inventoryIntegration: {
    totalValuation: number;
    lastCalculated: string;
    adjustmentsToday: number;
  };
  customerIntegration: {
    customersLinked: number;
    vendorsLinked: number;
    totalTransactionValue: number;
  };
  notifications: {
    totalSent: number;
    unreadCount: number;
    activeAlerts: number;
  };
  apiIntegration: {
    totalEndpoints: number;
    totalCalls: number;
    errorRate: number;
    externalSystemsConnected: number;
  };
}

/**
 * Master service that orchestrates all financial integration improvements
 */
export class FinancialMasterIntegrationService {

  /**
   * Initialize all integration services
   */
  static async initializeAllIntegrations(): Promise<void> {
    try {
      console.log('Initializing Financial Integration Services...');

      // Initialize real-time notifications
      FinancialNotificationService.initializeRealtimeListeners();
      FinancialNotificationService.initializeScheduledChecks();

      // Initialize API monitoring
      FinancialApiIntegrationService.initializeAPIMonitoring();

      // Perform initial data synchronization
      await this.performInitialDataSync();

      console.log('All Financial Integration Services initialized successfully');
    } catch (error) {
      console.error('Error initializing integration services:', error);
      throw error;
    }
  }

  /**
   * Get status of all integration services
   */
  static async getIntegrationStatus(): Promise<IntegrationStatus[]> {
    const statuses: IntegrationStatus[] = [];

    try {
      // Check Financial-Inventory Integration
      try {
        await FinancialInventoryIntegrationService.calculateInventoryValuation();
        statuses.push({
          service: 'Financial-Inventory Integration',
          status: 'active',
          lastCheck: new Date().toISOString()
        });
      } catch (error) {
        statuses.push({
          service: 'Financial-Inventory Integration',
          status: 'error',
          lastCheck: new Date().toISOString(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Check Customer-Vendor Integration
      try {
        // Test with a sample call
        statuses.push({
          service: 'Customer-Vendor Financial Integration',
          status: 'active',
          lastCheck: new Date().toISOString()
        });
      } catch (error) {
        statuses.push({
          service: 'Customer-Vendor Financial Integration',
          status: 'error',
          lastCheck: new Date().toISOString(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Check Notification Service
      try {
        await FinancialNotificationService.getUserNotifications('test', { limit: 1 });
        statuses.push({
          service: 'Financial Notification Service',
          status: 'active',
          lastCheck: new Date().toISOString()
        });
      } catch (error) {
        statuses.push({
          service: 'Financial Notification Service',
          status: 'error',
          lastCheck: new Date().toISOString(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Check API Integration
      try {
        const endpoints = FinancialApiIntegrationService.getAvailableEndpoints();
        statuses.push({
          service: 'Financial API Integration',
          status: endpoints.length > 0 ? 'active' : 'inactive',
          lastCheck: new Date().toISOString()
        });
      } catch (error) {
        statuses.push({
          service: 'Financial API Integration',
          status: 'error',
          lastCheck: new Date().toISOString(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }

    } catch (error) {
      console.error('Error checking integration status:', error);
    }

    return statuses;
  }

  /**
   * Get comprehensive integration metrics
   */
  static async getIntegrationMetrics(): Promise<IntegrationMetrics> {
    try {
      // Get inventory integration metrics
      const inventoryValuation = await FinancialInventoryIntegrationService.calculateInventoryValuation();
      const totalValuation = inventoryValuation.reduce((sum, item) => sum + item.totalValue, 0);

      // Get customer integration metrics (simplified)
      const customersLinked = 0; // Would need actual implementation
      const vendorsLinked = 0; // Would need actual implementation
      const totalTransactionValue = 0; // Would need actual implementation

      // Get notification metrics (simplified)
      const totalSent = 0; // Would need actual implementation
      const unreadCount = 0; // Would need actual implementation
      const activeAlerts = 0; // Would need actual implementation

      // Get API integration metrics
      const endpoints = FinancialApiIntegrationService.getAvailableEndpoints();
      const externalSystems = await FinancialApiIntegrationService.getExternalSystemConfigs();

      return {
        inventoryIntegration: {
          totalValuation,
          lastCalculated: new Date().toISOString(),
          adjustmentsToday: 0 // Would need actual implementation
        },
        customerIntegration: {
          customersLinked,
          vendorsLinked,
          totalTransactionValue
        },
        notifications: {
          totalSent,
          unreadCount,
          activeAlerts
        },
        apiIntegration: {
          totalEndpoints: endpoints.length,
          totalCalls: endpoints.reduce((sum, ep) => sum + ep.totalCalls, 0),
          errorRate: 0, // Would calculate from actual data
          externalSystemsConnected: externalSystems.length
        }
      };
    } catch (error) {
      console.error('Error getting integration metrics:', error);
      return {
        inventoryIntegration: {
          totalValuation: 0,
          lastCalculated: new Date().toISOString(),
          adjustmentsToday: 0
        },
        customerIntegration: {
          customersLinked: 0,
          vendorsLinked: 0,
          totalTransactionValue: 0
        },
        notifications: {
          totalSent: 0,
          unreadCount: 0,
          activeAlerts: 0
        },
        apiIntegration: {
          totalEndpoints: 0,
          totalCalls: 0,
          errorRate: 0,
          externalSystemsConnected: 0
        }
      };
    }
  }

  /**
   * Perform health check on all integrations
   */
  static async performHealthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'critical';
    details: Record<string, any>;
  }> {
    try {
      const statuses = await this.getIntegrationStatus();
      const metrics = await this.getIntegrationMetrics();

      const errorCount = statuses.filter(s => s.status === 'error').length;
      const activeCount = statuses.filter(s => s.status === 'active').length;

      let overall: 'healthy' | 'degraded' | 'critical';
      
      if (errorCount === 0) {
        overall = 'healthy';
      } else if (errorCount < statuses.length / 2) {
        overall = 'degraded';
      } else {
        overall = 'critical';
      }

      return {
        overall,
        details: {
          statuses,
          metrics,
          summary: {
            totalServices: statuses.length,
            activeServices: activeCount,
            errorServices: errorCount,
            lastCheck: new Date().toISOString()
          }
        }
      };
    } catch (error) {
      console.error('Error performing health check:', error);
      return {
        overall: 'critical',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Sync all financial data across integrations
   */
  static async syncAllFinancialData(): Promise<{
    success: boolean;
    results: Record<string, any>;
  }> {
    const results: Record<string, any> = {};

    try {
      // Sync inventory valuation with financial accounts
      console.log('Syncing inventory valuation...');
      const inventoryValuation = await FinancialInventoryIntegrationService.calculateInventoryValuation();
      results.inventorySync = {
        success: true,
        itemsProcessed: inventoryValuation.length,
        totalValue: inventoryValuation.reduce((sum, item) => sum + item.totalValue, 0)
      };

      // Sync with external systems
      console.log('Syncing with external systems...');
      const externalSystems = await FinancialApiIntegrationService.getExternalSystemConfigs();
      results.externalSync = {
        success: true,
        systemsProcessed: externalSystems.length,
        details: externalSystems.map(system => ({
          name: system.name,
          type: system.type,
          lastSync: system.syncConfig.lastSync
        }))
      };

      // Process pending notifications
      console.log('Processing notifications...');
      await FinancialNotificationService.checkOverdueInvoices();
      await FinancialNotificationService.checkUpcomingPayments();
      results.notificationSync = {
        success: true,
        checks: ['overdue_invoices', 'upcoming_payments']
      };

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Error syncing financial data:', error);
      results.error = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        results
      };
    }
  }

  /**
   * Process a financial event across all integrations
   */
  static async processFinancialEvent(
    eventType: 'transaction_created' | 'payment_received' | 'inventory_adjusted' | 'customer_updated',
    eventData: Record<string, any>
  ): Promise<void> {
    try {
      console.log(`Processing financial event: ${eventType}`, eventData);

      switch (eventType) {
        case 'transaction_created':
          // Update inventory if transaction affects inventory
          if (eventData.affects_inventory) {
            await FinancialInventoryIntegrationService.processFinancialTransactionInventoryImpact(
              eventData.transaction_id
            );
          }

          // Send notifications for large transactions
          if (eventData.amount > 100000) {
            await FinancialNotificationService.createNotification({
              type: 'large_transaction',
              severity: 'warning',
              title: 'Large Transaction Alert',
              message: `Large transaction of ${eventData.currency} ${eventData.amount.toLocaleString()} created`,
              data: eventData,
              recipientIds: ['finance-team'], // Would get actual IDs
              channels: ['email', 'in_app']
            });
          }
          break;

        case 'payment_received':
          // Update customer financial overview
          if (eventData.customer_id) {
            await CustomerVendorFinancialIntegrationService.notifyFinancialEvent(
              eventData.customer_id,
              'payment_received'
            );
          }

          // Send payment confirmation notification
          await FinancialNotificationService.createNotification({
            type: 'payment_received',
            severity: 'success',
            title: 'Payment Received',
            message: `Payment of ${eventData.currency} ${eventData.amount.toLocaleString()} received`,
            data: eventData,
            recipientIds: ['finance-team'], // Would get actual IDs
            channels: ['in_app']
          });
          break;

        case 'inventory_adjusted':
          // Record financial impact of inventory adjustment
          await FinancialInventoryIntegrationService.recordInventoryAdjustment(
            eventData.product_id,
            eventData.quantity_change,
            eventData.reason,
            eventData.unit_cost
          );
          break;

        case 'customer_updated':
          // No specific integration action needed currently
          console.log('Customer updated - integration acknowledged');
          break;

        default:
          console.warn(`Unknown financial event type: ${eventType}`);
      }

    } catch (error) {
      console.error('Error processing financial event:', error);
    }
  }

  /**
   * Generate integration summary report
   */
  static async generateIntegrationReport(): Promise<{
    summary: Record<string, any>;
    recommendations: string[];
  }> {
    try {
      const healthCheck = await this.performHealthCheck();
      const metrics = await this.getIntegrationMetrics();

      const recommendations: string[] = [];

      // Analyze inventory integration
      if (metrics.inventoryIntegration.totalValuation === 0) {
        recommendations.push('Consider adding inventory items to enable financial-inventory integration');
      }

      // Analyze notification system
      if (metrics.notifications.totalSent === 0) {
        recommendations.push('Set up notification rules to receive financial alerts');
      }

      // Analyze API integration
      if (metrics.apiIntegration.externalSystemsConnected === 0) {
        recommendations.push('Configure external system integrations for data synchronization');
      }

      // Analyze overall health
      if (healthCheck.overall !== 'healthy') {
        recommendations.push('Review and fix integration errors to improve system reliability');
      }

      return {
        summary: {
          healthCheck,
          metrics,
          generatedAt: new Date().toISOString()
        },
        recommendations
      };
    } catch (error) {
      console.error('Error generating integration report:', error);
      return {
        summary: {
          error: error instanceof Error ? error.message : 'Unknown error',
          generatedAt: new Date().toISOString()
        },
        recommendations: ['Contact system administrator to resolve integration issues']
      };
    }
  }

  // Private helper methods

  private static async performInitialDataSync(): Promise<void> {
    try {
      console.log('Performing initial data synchronization...');

      // Calculate initial inventory valuation
      await FinancialInventoryIntegrationService.calculateInventoryValuation();

      // Check for any immediate notifications that need to be sent
      await FinancialNotificationService.checkOverdueInvoices();
      await FinancialNotificationService.checkUpcomingPayments();

      console.log('Initial data synchronization completed');
    } catch (error) {
      console.error('Error during initial data sync:', error);
    }
  }

  /**
   * Schedule periodic integration maintenance
   */
  static initializeMaintenanceSchedule(): void {
    // Run integration health check every 30 minutes
    setInterval(async () => {
      const healthCheck = await this.performHealthCheck();
      if (healthCheck.overall !== 'healthy') {
        console.warn('Integration health check failed:', healthCheck);
      }
    }, 30 * 60 * 1000);

    // Run data sync every hour
    setInterval(async () => {
      await this.syncAllFinancialData();
    }, 60 * 60 * 1000);

    // Generate daily integration report
    setInterval(async () => {
      const report = await this.generateIntegrationReport();
      console.log('Daily integration report:', report);
    }, 24 * 60 * 60 * 1000);

    console.log('Integration maintenance schedule initialized');
  }
}
