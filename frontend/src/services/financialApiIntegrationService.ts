import { supabase } from '@/integrations/supabase/client';
import { FinancialDatabaseService } from './financialDatabaseService';
import { FinancialInventoryIntegrationService } from './financialInventoryIntegrationService';
import { CustomerVendorFinancialIntegrationService } from './customerVendorFinancialIntegrationService';

export interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  authentication: 'api_key' | 'bearer_token' | 'basic_auth' | 'none';
  rateLimit: {
    requests: number;
    period: 'minute' | 'hour' | 'day';
  };
  isActive: boolean;
  lastUsed?: string;
  totalCalls: number;
  errorCount: number;
}

export interface ExternalSystemConfig {
  id: string;
  name: string;
  type: 'accounting' | 'erp' | 'banking' | 'payment_gateway' | 'reporting' | 'tax_authority';
  baseUrl: string;
  authentication: {
    type: 'api_key' | 'oauth2' | 'basic_auth';
    credentials: Record<string, string>;
  };
  endpoints: {
    syncCustomers?: string;
    syncVendors?: string;
    syncTransactions?: string;
    syncChartOfAccounts?: string;
    exportReports?: string;
  };
  syncConfig: {
    enabled: boolean;
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    lastSync?: string;
    nextSync?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for external system integration via API endpoints
 */
export class FinancialApiIntegrationService {

  // API Endpoint Management

  /**
   * Get all available API endpoints
   */
  static getAvailableEndpoints(): APIEndpoint[] {
    return [
      {
        id: 'chart-of-accounts',
        name: 'Chart of Accounts',
        method: 'GET',
        path: '/api/financial/chart-of-accounts',
        description: 'Retrieve all chart of accounts',
        authentication: 'api_key',
        rateLimit: { requests: 100, period: 'hour' },
        isActive: true,
        totalCalls: 0,
        errorCount: 0
      },
      {
        id: 'create-account',
        name: 'Create Account',
        method: 'POST',
        path: '/api/financial/chart-of-accounts',
        description: 'Create new chart of account',
        authentication: 'api_key',
        rateLimit: { requests: 50, period: 'hour' },
        isActive: true,
        totalCalls: 0,
        errorCount: 0
      },
      {
        id: 'financial-transactions',
        name: 'Financial Transactions',
        method: 'GET',
        path: '/api/financial/transactions',
        description: 'Retrieve financial transactions with filters',
        authentication: 'api_key',
        rateLimit: { requests: 200, period: 'hour' },
        isActive: true,
        totalCalls: 0,
        errorCount: 0
      },
      {
        id: 'create-transaction',
        name: 'Create Transaction',
        method: 'POST',
        path: '/api/financial/transactions',
        description: 'Create new financial transaction',
        authentication: 'api_key',
        rateLimit: { requests: 100, period: 'hour' },
        isActive: true,
        totalCalls: 0,
        errorCount: 0
      },
      {
        id: 'financial-analytics',
        name: 'Financial Analytics',
        method: 'GET',
        path: '/api/financial/analytics',
        description: 'Get financial analytics and KPIs',
        authentication: 'api_key',
        rateLimit: { requests: 50, period: 'hour' },
        isActive: true,
        totalCalls: 0,
        errorCount: 0
      },
      {
        id: 'inventory-valuation',
        name: 'Inventory Valuation',
        method: 'GET',
        path: '/api/financial/inventory-valuation',
        description: 'Get current inventory valuation',
        authentication: 'api_key',
        rateLimit: { requests: 20, period: 'hour' },
        isActive: true,
        totalCalls: 0,
        errorCount: 0
      },
      {
        id: 'customer-financial-overview',
        name: 'Customer Financial Overview',
        method: 'GET',
        path: '/api/financial/customers/{customerId}/overview',
        description: 'Get financial overview for a specific customer',
        authentication: 'api_key',
        rateLimit: { requests: 100, period: 'hour' },
        isActive: true,
        totalCalls: 0,
        errorCount: 0
      },
      {
        id: 'reports-export',
        name: 'Export Financial Reports',
        method: 'POST',
        path: '/api/financial/reports/export',
        description: 'Export financial reports in various formats',
        authentication: 'api_key',
        rateLimit: { requests: 10, period: 'hour' },
        isActive: true,
        totalCalls: 0,
        errorCount: 0
      }
    ];
  }

  // API Handler Functions

  /**
   * Handle Chart of Accounts API requests
   */
  static async handleChartOfAccountsAPI(
    method: string,
    params?: any,
    body?: any
  ): Promise<{ data: any; status: number; message?: string }> {
    try {
      switch (method) {
        case 'GET':
          const accounts = await FinancialDatabaseService.getAllAccounts();
          return {
            data: accounts,
            status: 200
          };

        case 'POST':
          if (!body) {
            return { data: null, status: 400, message: 'Request body required' };
          }
          const newAccount = await FinancialDatabaseService.saveAccount(body);
          return {
            data: newAccount,
            status: 201
          };

        default:
          return { data: null, status: 405, message: 'Method not allowed' };
      }
    } catch (error) {
      console.error('Error handling Chart of Accounts API:', error);
      return { data: null, status: 500, message: 'Internal server error' };
    }
  }

  /**
   * Handle Financial Transactions API requests
   */
  static async handleTransactionsAPI(
    method: string,
    params?: any,
    body?: any
  ): Promise<{ data: any; status: number; message?: string }> {
    try {
      switch (method) {
        case 'GET':
          const { page = 1, limit = 50, search, filters } = params || {};
          const transactions = await FinancialDatabaseService.getPaginatedTransactions(
            page,
            limit,
            search,
            filters
          );
          return {
            data: transactions,
            status: 200
          };

        case 'POST':
          if (!body) {
            return { data: null, status: 400, message: 'Request body required' };
          }
          const newTransaction = await FinancialDatabaseService.saveTransaction(body);
          return {
            data: newTransaction,
            status: 201
          };

        default:
          return { data: null, status: 405, message: 'Method not allowed' };
      }
    } catch (error) {
      console.error('Error handling Transactions API:', error);
      return { data: null, status: 500, message: 'Internal server error' };
    }
  }

  /**
   * Handle Financial Analytics API requests
   */
  static async handleAnalyticsAPI(
    params?: any
  ): Promise<{ data: any; status: number; message?: string }> {
    try {
      const { startDate, endDate } = params || {};
      
      if (!startDate || !endDate) {
        return { 
          data: null, 
          status: 400, 
          message: 'Start date and end date are required' 
        };
      }

      const analytics = await FinancialDatabaseService.calculateFinancialAnalytics(
        startDate,
        endDate
      );

      return {
        data: analytics,
        status: 200
      };
    } catch (error) {
      console.error('Error handling Analytics API:', error);
      return { data: null, status: 500, message: 'Internal server error' };
    }
  }

  /**
   * Handle Inventory Valuation API requests
   */
  static async handleInventoryValuationAPI(): Promise<{ data: any; status: number; message?: string }> {
    try {
      const valuation = await FinancialInventoryIntegrationService.calculateInventoryValuation();
      
      return {
        data: {
          valuations: valuation,
          totalValue: valuation.reduce((sum, item) => sum + item.totalValue, 0),
          timestamp: new Date().toISOString()
        },
        status: 200
      };
    } catch (error) {
      console.error('Error handling Inventory Valuation API:', error);
      return { data: null, status: 500, message: 'Internal server error' };
    }
  }

  /**
   * Handle Customer Financial Overview API requests
   */
  static async handleCustomerFinancialOverviewAPI(
    customerId: string
  ): Promise<{ data: any; status: number; message?: string }> {
    try {
      if (!customerId) {
        return { data: null, status: 400, message: 'Customer ID is required' };
      }

      const overview = await CustomerVendorFinancialIntegrationService.getCustomerFinancialOverview(customerId);
      
      if (!overview) {
        return { data: null, status: 404, message: 'Customer not found' };
      }

      return {
        data: overview,
        status: 200
      };
    } catch (error) {
      console.error('Error handling Customer Financial Overview API:', error);
      return { data: null, status: 500, message: 'Internal server error' };
    }
  }

  /**
   * Handle Reports Export API requests
   */
  static async handleReportsExportAPI(
    body: any
  ): Promise<{ data: any; status: number; message?: string }> {
    try {
      const { reportType, format, startDate, endDate, filters } = body || {};

      if (!reportType || !format || !startDate || !endDate) {
        return {
          data: null,
          status: 400,
          message: 'Report type, format, start date, and end date are required'
        };
      }

      // Generate report based on type
      let reportData;
      switch (reportType) {
        case 'financial_statements':
          reportData = await this.generateFinancialStatementsReport(startDate, endDate, filters);
          break;
        case 'chart_of_accounts':
          reportData = await FinancialDatabaseService.getAllAccounts();
          break;
        case 'transaction_listing':
          reportData = await FinancialDatabaseService.getAllTransactions();
          break;
        default:
          return { data: null, status: 400, message: 'Invalid report type' };
      }

      // Format the data according to requested format
      const formattedData = await this.formatReportData(reportData, format);

      return {
        data: {
          reportType,
          format,
          period: { startDate, endDate },
          data: formattedData,
          generatedAt: new Date().toISOString()
        },
        status: 200
      };
    } catch (error) {
      console.error('Error handling Reports Export API:', error);
      return { data: null, status: 500, message: 'Internal server error' };
    }
  }

  // External System Integration

  /**
   * Sync data with external accounting system
   */
  static async syncWithExternalSystem(
    systemConfig: ExternalSystemConfig,
    dataType: 'customers' | 'vendors' | 'transactions' | 'accounts'
  ): Promise<{ success: boolean; message: string; syncedCount?: number }> {
    try {
      if (!systemConfig.isActive || !systemConfig.syncConfig.enabled) {
        return { success: false, message: 'System or sync is disabled' };
      }

      let syncedCount = 0;

      switch (dataType) {
        case 'customers':
          syncedCount = await this.syncCustomersWithExternalSystem(systemConfig);
          break;
        case 'vendors':
          syncedCount = await this.syncVendorsWithExternalSystem(systemConfig);
          break;
        case 'transactions':
          syncedCount = await this.syncTransactionsWithExternalSystem(systemConfig);
          break;
        case 'accounts':
          syncedCount = await this.syncAccountsWithExternalSystem(systemConfig);
          break;
        default:
          return { success: false, message: 'Invalid data type' };
      }

      // Update last sync timestamp
      await this.updateLastSyncTimestamp(systemConfig.id, dataType);

      return {
        success: true,
        message: `Successfully synced ${syncedCount} ${dataType}`,
        syncedCount
      };
    } catch (error) {
      console.error('Error syncing with external system:', error);
      return { success: false, message: 'Sync failed' };
    }
  }

  /**
   * Get external system configurations
   */
  static async getExternalSystemConfigs(): Promise<ExternalSystemConfig[]> {
    try {
      const { data, error } = await supabase
        .from('external_system_configs')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      return (data || []).map(this.transformExternalSystemConfig);
    } catch (error) {
      console.error('Error getting external system configs:', error);
      return [];
    }
  }

  /**
   * Test connection to external system
   */
  static async testExternalSystemConnection(
    systemConfig: ExternalSystemConfig
  ): Promise<{ success: boolean; message: string; responseTime?: number }> {
    try {
      const startTime = Date.now();
      
      // Make a test request to the external system
      const response = await fetch(`${systemConfig.baseUrl}/health`, {
        method: 'GET',
        headers: this.buildAuthHeaders(systemConfig.authentication),
        timeout: 5000 // 5 second timeout
      } as any);

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          success: true,
          message: 'Connection successful',
          responseTime
        };
      } else {
        return {
          success: false,
          message: `Connection failed: ${response.status} ${response.statusText}`
        };
      }
    } catch (error) {
      console.error('Error testing external system connection:', error);
      return {
        success: false,
        message: 'Connection failed: Network error'
      };
    }
  }

  // Private Helper Methods

  private static async generateFinancialStatementsReport(
    startDate: string,
    endDate: string,
    filters?: any
  ) {
    // Generate comprehensive financial statements
    const analytics = await FinancialDatabaseService.calculateFinancialAnalytics(startDate, endDate);
    const accounts = await FinancialDatabaseService.getAllAccounts();
    
    return {
      analytics,
      accounts,
      period: { startDate, endDate }
    };
  }

  private static async formatReportData(data: any, format: string) {
    switch (format.toLowerCase()) {
      case 'json':
        return data;
      case 'csv':
        return this.convertToCSV(data);
      case 'xml':
        return this.convertToXML(data);
      default:
        return data;
    }
  }

  private static convertToCSV(data: any): string {
    // Simple CSV conversion - in production, use a proper CSV library
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {});
      const csvHeaders = headers.join(',');
      const csvRows = data.map(row => 
        headers.map(header => row[header] || '').join(',')
      );
      return [csvHeaders, ...csvRows].join('\n');
    }
    return JSON.stringify(data);
  }

  private static convertToXML(data: any): string {
    // Simple XML conversion - in production, use a proper XML library
    function objectToXML(obj: any, rootName = 'root'): string {
      let xml = `<${rootName}>`;
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          xml += objectToXML(value, key);
        } else {
          xml += `<${key}>${value}</${key}>`;
        }
      }
      xml += `</${rootName}>`;
      return xml;
    }
    return objectToXML(data, 'financialData');
  }

  private static async syncCustomersWithExternalSystem(systemConfig: ExternalSystemConfig): Promise<number> {
    // Implementation would depend on external system API
    console.log('Syncing customers with', systemConfig.name);
    return 0; // Placeholder
  }

  private static async syncVendorsWithExternalSystem(systemConfig: ExternalSystemConfig): Promise<number> {
    // Implementation would depend on external system API
    console.log('Syncing vendors with', systemConfig.name);
    return 0; // Placeholder
  }

  private static async syncTransactionsWithExternalSystem(systemConfig: ExternalSystemConfig): Promise<number> {
    // Implementation would depend on external system API
    console.log('Syncing transactions with', systemConfig.name);
    return 0; // Placeholder
  }

  private static async syncAccountsWithExternalSystem(systemConfig: ExternalSystemConfig): Promise<number> {
    // Implementation would depend on external system API
    console.log('Syncing accounts with', systemConfig.name);
    return 0; // Placeholder
  }

  private static async updateLastSyncTimestamp(systemId: string, dataType: string): Promise<void> {
    try {
      await supabase
        .from('external_system_syncs')
        .upsert({
          system_id: systemId,
          data_type: dataType,
          last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating last sync timestamp:', error);
    }
  }

  private static buildAuthHeaders(authentication: ExternalSystemConfig['authentication']): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    switch (authentication.type) {
      case 'api_key':
        headers['X-API-Key'] = authentication.credentials.apiKey;
        break;
      case 'basic_auth':
        const credentials = btoa(`${authentication.credentials.username}:${authentication.credentials.password}`);
        headers['Authorization'] = `Basic ${credentials}`;
        break;
      case 'oauth2':
        headers['Authorization'] = `Bearer ${authentication.credentials.accessToken}`;
        break;
    }

    return headers;
  }

  private static transformExternalSystemConfig(data: any): ExternalSystemConfig {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      baseUrl: data.base_url,
      authentication: data.authentication,
      endpoints: data.endpoints,
      syncConfig: data.sync_config,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  /**
   * Initialize API rate limiting and monitoring
   */
  static initializeAPIMonitoring() {
    // Implementation would include rate limiting, monitoring, and logging
    console.log('API monitoring initialized');
  }
}
