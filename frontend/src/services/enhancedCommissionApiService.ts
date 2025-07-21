import { supabase } from '@/integrations/supabase/client';
import { CommissionCalculationEngine, CommissionCalculationResult, BulkCommissionCalculation } from '@/services/commissionCalculationEngine';
import { FinancialDataIntegrationService } from '@/services/financialDataIntegrationService';
import { EmployeeDataIntegrationService, CommissionHistory } from '@/services/employeeDataIntegrationService';

export interface CommissionRecord {
  id: string;
  commissionNumber: string;
  period: string;
  employeeId: string;
  employee: {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    commissionRate: number;
  };
  salesData: {
    totalSales: number;
    targetSales: number;
    achievementPercentage: number;
  };
  baseAmount: number;
  commissionRate: number;
  totalExpenses: number;
  netProfit: number;
  calculatedCommission: number;
  adjustments: number;
  bonuses: number;
  deductions: number;
  finalCommission: number;
  status: 'draft' | 'calculated' | 'approved' | 'paid' | 'disputed';
  calculatedDate: string;
  approvedBy?: string;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommissionFilters {
  period?: string;
  department?: string;
  status?: 'draft' | 'calculated' | 'approved' | 'paid' | 'disputed';
  employeeId?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface CommissionSummary {
  totalCommissions: number;
  paidCommissions: number;
  pendingCommissions: number;
  avgCommissionRate: number;
  topPerformers: Array<{
    employeeId: string;
    employeeName: string;
    totalCommission: number;
  }>;
  departmentBreakdown: Array<{
    department: string;
    totalCommissions: number;
    employeeCount: number;
    avgCommission: number;
  }>;
}

/**
 * Enhanced Commission API Service
 * Provides comprehensive API operations for commission management
 */
export class EnhancedCommissionApiService {
  
  /**
   * Get all commission records with filtering and pagination
   */
  static async getCommissions(
    filters: CommissionFilters = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ commissions: CommissionRecord[]; total: number; hasMore: boolean }> {
    try {
      let query = supabase
        .from('employee_commissions')
        .select(`
          *,
          employees!inner(
            id,
            first_name,
            last_name,
            email,
            department,
            role,
            commission_structure_id
          )
        `, { count: 'exact' });
      
      // Apply filters
      if (filters.period) {
        query = query.eq('period', filters.period);
      }
      if (filters.department) {
        query = query.eq('employees.department', filters.department);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }
      if (filters.fromDate) {
        query = query.gte('calculated_date', filters.fromDate);
      }
      if (filters.toDate) {
        query = query.lte('calculated_date', filters.toDate);
      }
      if (filters.minAmount) {
        query = query.gte('final_amount', filters.minAmount);
      }
      if (filters.maxAmount) {
        query = query.lte('final_amount', filters.maxAmount);
      }
      
      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query
        .order('calculated_date', { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      const { data: commissions, error, count } = await query;
      
      if (error) {
        console.error('Error fetching commissions:', error);
        return { commissions: [], total: 0, hasMore: false };
      }
      
      // Transform data to CommissionRecord format
      const transformedCommissions: CommissionRecord[] = (commissions || []).map(this.transformCommissionData);
      
      return {
        commissions: transformedCommissions,
        total: count || 0,
        hasMore: (count || 0) > offset + pageSize
      };
      
    } catch (error) {
      console.error('Error in getCommissions:', error);
      return { commissions: [], total: 0, hasMore: false };
    }
  }
  
  /**
   * Get commission by ID
   */
  static async getCommissionById(id: string): Promise<CommissionRecord | null> {
    try {
      const { data: commission, error } = await supabase
        .from('employee_commissions')
        .select(`
          *,
          employees!inner(
            id,
            first_name,
            last_name,
            email,
            department,
            role,
            commission_structure_id
          )
        `)
        .eq('id', id)
        .single();
      
      if (error || !commission) {
        console.error('Error fetching commission by ID:', error);
        return null;
      }
      
      return this.transformCommissionData(commission);
      
    } catch (error) {
      console.error('Error in getCommissionById:', error);
      return null;
    }
  }
  
  /**
   * Create new commission record
   */
  static async createCommission(
    employeeId: string,
    period: string,
    bonuses: number = 0,
    deductions: number = 0,
    adjustments: number = 0,
    notes?: string
  ): Promise<CommissionRecord | null> {
    try {
      // Calculate commission using the calculation engine
      const calculationResult = await CommissionCalculationEngine.calculateCommission(
        employeeId,
        period,
        bonuses,
        deductions,
        adjustments
      );
      
      // Get employee data
      const employee = await EmployeeDataIntegrationService.getEmployeeById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      // Get financial data for the period
      const financialData = await FinancialDataIntegrationService.getFinancialDataForPeriod(period);
      
      // Generate commission number
      const commissionNumber = await this.generateCommissionNumber(period);
      
      // Prepare commission record
      const commissionData = {
        commission_number: commissionNumber,
        period,
        employee_id: employeeId,
        base_amount: calculationResult.calculationDetails.salesAmount,
        commission_rate: calculationResult.calculationDetails.commissionRate,
        total_expenses: financialData.totalExpenses,
        net_profit: financialData.netProfit,
        calculated_commission: calculationResult.baseCommission,
        adjustments: calculationResult.adjustments,
        bonuses: calculationResult.bonuses,
        deductions: calculationResult.deductions,
        final_amount: calculationResult.finalCommission,
        status: 'calculated' as const,
        calculated_date: new Date().toISOString(),
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Insert into database
      const { data: newCommission, error } = await supabase
        .from('employee_commissions')
        .insert(commissionData)
        .select(`
          *,
          employees!inner(
            id,
            first_name,
            last_name,
            email,
            department,
            role,
            commission_structure_id
          )
        `)
        .single();
      
      if (error) {
        console.error('Error creating commission:', error);
        throw new Error('Failed to create commission record');
      }
      
      return this.transformCommissionData(newCommission);
      
    } catch (error) {
      console.error('Error in createCommission:', error);
      return null;
    }
  }
  
  /**
   * Update existing commission record
   */
  static async updateCommission(
    id: string,
    updates: Partial<{
      adjustments: number;
      bonuses: number;
      deductions: number;
      status: 'draft' | 'calculated' | 'approved' | 'paid' | 'disputed';
      notes: string;
      approvedBy: string;
      paidDate: string;
      paymentMethod: string;
    }>
  ): Promise<CommissionRecord | null> {
    try {
      // Get current commission
      const currentCommission = await this.getCommissionById(id);
      if (!currentCommission) {
        throw new Error('Commission not found');
      }
      
      // If adjustments, bonuses, or deductions changed, recalculate final commission
      let finalCommission = currentCommission.finalCommission;
      if (
        updates.adjustments !== undefined ||
        updates.bonuses !== undefined ||
        updates.deductions !== undefined
      ) {
        const newAdjustments = updates.adjustments ?? currentCommission.adjustments;
        const newBonuses = updates.bonuses ?? currentCommission.bonuses;
        const newDeductions = updates.deductions ?? currentCommission.deductions;
        
        finalCommission = Math.max(0, 
          currentCommission.calculatedCommission + newBonuses - newDeductions + newAdjustments
        );
      }
      
      // Prepare update data
      const updateData = {
        ...updates,
        final_amount: finalCommission,
        updated_at: new Date().toISOString(),
        ...(updates.status === 'paid' && !updates.paidDate ? { paid_date: new Date().toISOString() } : {}),
        ...(updates.status === 'approved' && !updates.approvedBy ? { approved_by: 'system' } : {})
      };
      
      // Update in database
      const { data: updatedCommission, error } = await supabase
        .from('employee_commissions')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          employees!inner(
            id,
            first_name,
            last_name,
            email,
            department,
            role,
            commission_structure_id
          )
        `)
        .single();
      
      if (error) {
        console.error('Error updating commission:', error);
        throw new Error('Failed to update commission record');
      }
      
      // Create financial transaction if status changed to paid
      if (updates.status === 'paid' && currentCommission.status !== 'paid') {
        await this.createCommissionPaymentTransaction(updatedCommission);
      }
      
      return this.transformCommissionData(updatedCommission);
      
    } catch (error) {
      console.error('Error in updateCommission:', error);
      return null;
    }
  }
  
  /**
   * Delete commission record
   */
  static async deleteCommission(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employee_commissions')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting commission:', error);
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error('Error in deleteCommission:', error);
      return false;
    }
  }
  
  /**
   * Bulk calculate commissions for a period
   */
  static async bulkCalculateCommissions(period: string): Promise<BulkCommissionCalculation> {
    try {
      const bulkResult = await CommissionCalculationEngine.calculateBulkCommissions(period);
      
      // Save calculated commissions to database
      const savedCommissions = await Promise.all(
        bulkResult.employeeResults.map(async (result) => {
          // Check if commission already exists for this employee and period
          const { data: existing } = await supabase
            .from('employee_commissions')
            .select('id')
            .eq('employee_id', result.employeeId)
            .eq('period', period)
            .single();
          
          if (existing) {
            // Update existing commission
            return this.updateCommission(existing.id, {
              adjustments: result.adjustments,
              bonuses: result.bonuses,
              deductions: result.deductions,
              status: 'calculated'
            });
          } else {
            // Create new commission
            return this.createCommission(
              result.employeeId,
              period,
              result.bonuses,
              result.deductions,
              result.adjustments
            );
          }
        })
      );
      
      return {
        ...bulkResult,
        employeeResults: savedCommissions.filter(c => c !== null) as CommissionCalculationResult[]
      };
      
    } catch (error) {
      console.error('Error in bulkCalculateCommissions:', error);
      throw error;
    }
  }
  
  /**
   * Get commission summary statistics
   */
  static async getCommissionSummary(filters: CommissionFilters = {}): Promise<CommissionSummary> {
    try {
      const { commissions } = await this.getCommissions(filters, 1, 1000); // Get all for summary
      
      // Calculate basic statistics
      const totalCommissions = commissions.reduce((sum, c) => sum + c.finalCommission, 0);
      const paidCommissions = commissions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.finalCommission, 0);
      const pendingCommissions = commissions
        .filter(c => c.status === 'calculated' || c.status === 'approved')
        .reduce((sum, c) => sum + c.finalCommission, 0);
      
      // Calculate average commission rate
      const totalSales = commissions.reduce((sum, c) => sum + c.salesData.totalSales, 0);
      const avgCommissionRate = totalSales > 0 ? (totalCommissions / totalSales) * 100 : 0;
      
      // Top performers
      const topPerformers = commissions
        .sort((a, b) => b.finalCommission - a.finalCommission)
        .slice(0, 5)
        .map(c => ({
          employeeId: c.employeeId,
          employeeName: c.employee.name,
          totalCommission: c.finalCommission
        }));
      
      // Department breakdown
      const departmentMap = new Map<string, { total: number; count: number }>();
      commissions.forEach(c => {
        const dept = c.employee.department;
        const current = departmentMap.get(dept) || { total: 0, count: 0 };
        departmentMap.set(dept, {
          total: current.total + c.finalCommission,
          count: current.count + 1
        });
      });
      
      const departmentBreakdown = Array.from(departmentMap.entries()).map(([dept, data]) => ({
        department: dept,
        totalCommissions: data.total,
        employeeCount: data.count,
        avgCommission: data.count > 0 ? data.total / data.count : 0
      }));
      
      return {
        totalCommissions,
        paidCommissions,
        pendingCommissions,
        avgCommissionRate,
        topPerformers,
        departmentBreakdown
      };
      
    } catch (error) {
      console.error('Error in getCommissionSummary:', error);
      return {
        totalCommissions: 0,
        paidCommissions: 0,
        pendingCommissions: 0,
        avgCommissionRate: 0,
        topPerformers: [],
        departmentBreakdown: []
      };
    }
  }
  
  /**
   * Approve commissions in bulk
   */
  static async bulkApproveCommissions(
    commissionIds: string[],
    approvedBy: string
  ): Promise<{ success: number; failed: number }> {
    try {
      let success = 0;
      let failed = 0;
      
      await Promise.all(
        commissionIds.map(async (id) => {
          try {
            const result = await this.updateCommission(id, {
              status: 'approved',
              approvedBy
            });
            if (result) success++;
            else failed++;
          } catch {
            failed++;
          }
        })
      );
      
      return { success, failed };
      
    } catch (error) {
      console.error('Error in bulkApproveCommissions:', error);
      return { success: 0, failed: commissionIds.length };
    }
  }
  
  /**
   * Process commission payments in bulk
   */
  static async bulkProcessPayments(
    commissionIds: string[],
    paymentMethod: string = 'Bank Transfer'
  ): Promise<{ success: number; failed: number }> {
    try {
      let success = 0;
      let failed = 0;
      
      await Promise.all(
        commissionIds.map(async (id) => {
          try {
            const result = await this.updateCommission(id, {
              status: 'paid',
              paymentMethod,
              paidDate: new Date().toISOString()
            });
            if (result) success++;
            else failed++;
          } catch {
            failed++;
          }
        })
      );
      
      return { success, failed };
      
    } catch (error) {
      console.error('Error in bulkProcessPayments:', error);
      return { success: 0, failed: commissionIds.length };
    }
  }
  
  /**
   * Generate commission number
   */
  private static async generateCommissionNumber(period: string): Promise<string> {
    try {
      // Get count of commissions for this period
      const { count } = await supabase
        .from('employee_commissions')
        .select('*', { count: 'exact', head: true })
        .eq('period', period);
      
      const sequence = (count || 0) + 1;
      return `COM-${period}-${sequence.toString().padStart(3, '0')}`;
      
    } catch (error) {
      console.error('Error generating commission number:', error);
      return `COM-${period}-${Date.now()}`;
    }
  }
  
  /**
   * Transform database commission data to CommissionRecord format
   */
  private static transformCommissionData(data: any): CommissionRecord {
    const employee = data.employees;
    
    return {
      id: data.id,
      commissionNumber: data.commission_number,
      period: data.period,
      employeeId: data.employee_id,
      employee: {
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        email: employee.email,
        department: employee.department,
        role: employee.role,
        commissionRate: data.commission_rate
      },
      salesData: {
        totalSales: data.base_amount,
        targetSales: 0, // Would be fetched from sales targets
        achievementPercentage: 0 // Would be calculated
      },
      baseAmount: data.base_amount,
      commissionRate: data.commission_rate,
      totalExpenses: data.total_expenses,
      netProfit: data.net_profit,
      calculatedCommission: data.calculated_commission,
      adjustments: data.adjustments || 0,
      bonuses: data.bonuses || 0,
      deductions: data.deductions || 0,
      finalCommission: data.final_amount,
      status: data.status,
      calculatedDate: data.calculated_date,
      approvedBy: data.approved_by,
      paidDate: data.paid_date,
      paymentMethod: data.payment_method,
      notes: data.notes,
      attachments: data.attachments || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
  
  /**
   * Create financial transaction for commission payment
   */
  private static async createCommissionPaymentTransaction(commission: any): Promise<void> {
    try {
      await FinancialDataIntegrationService.createCommissionTransaction(
        commission.id,
        commission.employee_id,
        commission.final_amount,
        commission.period,
        `Commission payment for ${commission.period}`
      );
    } catch (error) {
      console.error('Error creating commission payment transaction:', error);
      // Don't throw error as commission update should still succeed
    }
  }
}
