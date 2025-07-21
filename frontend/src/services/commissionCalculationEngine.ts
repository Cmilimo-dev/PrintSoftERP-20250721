import { FinancialDataIntegrationService } from '@/services/financialDataIntegrationService';
import { EmployeeDataIntegrationService, CommissionStructure, PerformanceMetrics } from '@/services/employeeDataIntegrationService';

export interface CommissionCalculationResult {
  employeeId: string;
  period: string;
  baseCommission: number;
  bonuses: number;
  deductions: number;
  adjustments: number;
  finalCommission: number;
  calculationDetails: {
    salesAmount: number;
    targetAmount: number;
    achievementPercentage: number;
    commissionRate: number;
    tierBreakdown?: TierCommissionBreakdown[];
  };
}

export interface TierCommissionBreakdown {
  tierLevel: number;
  minAmount: number;
  maxAmount: number;
  rate: number;
  applicableAmount: number;
  commissionAmount: number;
}

export interface BulkCommissionCalculation {
  period: string;
  totalEmployees: number;
  totalCommissions: number;
  employeeResults: CommissionCalculationResult[];
  summary: {
    totalSales: number;
    averageCommissionRate: number;
    topPerformers: { employeeId: string; amount: number }[];
  };
}

/**
 * Commission Calculation Engine
 * Advanced calculations and data processing for commission management
 */
export class CommissionCalculationEngine {
  
  /**
   * Calculate comprehensive commission for an employee
   */
  static async calculateCommission(
    employeeId: string, 
    period: string,
    bonuses: number = 0,
    deductions: number = 0,
    adjustments: number = 0
  ): Promise<CommissionCalculationResult> {
    try {
      const employee = await EmployeeDataIntegrationService.getEmployeeById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      if (!employee.commissionEligible || !employee.commissionStructure.isActive) {
        return this.createZeroCommissionResult(employeeId, period);
      }
      
      const financialData = await FinancialDataIntegrationService.getFinancialDataForPeriod(period);
      const performanceMetrics = employee.performanceMetrics!;
      const commissionStructure = employee.commissionStructure;
      
      // Calculate base commission based on structure type
      let baseCommission = 0;
      let tierBreakdown: TierCommissionBreakdown[] | undefined;
      
      switch (commissionStructure.type) {
        case 'fixed-percentage':
          baseCommission = this.calculateFixedPercentageCommission(
            performanceMetrics.currentPeriodSales, 
            commissionStructure.baseRate
          );
          break;
        
        case 'tiered':
          const tieredResult = this.calculateTieredCommission(
            performanceMetrics.currentPeriodSales, 
            commissionStructure
          );
          baseCommission = tieredResult.totalCommission;
          tierBreakdown = tieredResult.breakdown;
          break;
        
        case 'target-based':
          baseCommission = this.calculateTargetBasedCommission(
            performanceMetrics, 
            commissionStructure
          );
          break;
        
        case 'profit-sharing':
          baseCommission = this.calculateProfitSharingCommission(
            financialData.netProfit, 
            commissionStructure.baseRate
          );
          break;
        
        default:
          baseCommission = 0;
      }
      
      // Calculate final commission with adjustments
      const finalCommission = Math.max(0, baseCommission + bonuses - deductions + adjustments);
      
      return {
        employeeId,
        period,
        baseCommission,
        bonuses,
        deductions,
        adjustments,
        finalCommission,
        calculationDetails: {
          salesAmount: performanceMetrics.currentPeriodSales,
          targetAmount: performanceMetrics.targetSales,
          achievementPercentage: performanceMetrics.achievementPercentage,
          commissionRate: commissionStructure.baseRate,
          tierBreakdown
        }
      };
      
    } catch (error) {
      console.error('Error calculating commission:', error);
      return this.createZeroCommissionResult(employeeId, period);
    }
  }
  
  /**
   * Calculate fixed percentage commission
   */
  private static calculateFixedPercentageCommission(salesAmount: number, rate: number): number {
    return (salesAmount * rate) / 100;
  }
  
  /**
   * Calculate tiered commission with detailed breakdown
   */
  private static calculateTieredCommission(
    salesAmount: number, 
    structure: CommissionStructure
  ): { totalCommission: number; breakdown: TierCommissionBreakdown[] } {
    if (!structure.tiers || structure.tiers.length === 0) {
      return { totalCommission: 0, breakdown: [] };
    }
    
    let totalCommission = 0;
    const breakdown: TierCommissionBreakdown[] = [];
    let remainingSales = salesAmount;
    
    for (let i = 0; i < structure.tiers.length; i++) {
      const tier = structure.tiers[i];
      const tierStart = tier.minAmount;
      const tierEnd = tier.maxAmount;
      
      if (remainingSales <= 0 || salesAmount <= tierStart) {
        break;
      }
      
      const applicableAmount = Math.min(
        Math.max(0, salesAmount - tierStart),
        tierEnd - tierStart,
        remainingSales
      );
      
      if (applicableAmount > 0) {
        const tierCommission = (applicableAmount * tier.rate) / 100;
        totalCommission += tierCommission;
        
        breakdown.push({
          tierLevel: i + 1,
          minAmount: tierStart,
          maxAmount: tierEnd,
          rate: tier.rate,
          applicableAmount,
          commissionAmount: tierCommission
        });
        
        remainingSales -= applicableAmount;
      }
    }
    
    return { totalCommission, breakdown };
  }
  
  /**
   * Calculate target-based commission
   */
  private static calculateTargetBasedCommission(
    metrics: PerformanceMetrics, 
    structure: CommissionStructure
  ): number {
    if (metrics.targetSales <= 0) return 0;
    
    const achievementRatio = metrics.currentPeriodSales / metrics.targetSales;
    
    if (achievementRatio >= 1.0) {
      // Base commission for meeting target
      let commission = (metrics.targetSales * structure.baseRate) / 100;
      
      // Bonus for exceeding target
      if (achievementRatio > 1.0) {
        const excessSales = metrics.currentPeriodSales - metrics.targetSales;
        const bonusRate = structure.baseRate * 1.5; // 1.5x rate for excess
        commission += (excessSales * bonusRate) / 100;
      }
      
      return commission;
    } else {
      // Partial commission based on achievement
      const partialRate = structure.baseRate * achievementRatio;
      return (metrics.currentPeriodSales * partialRate) / 100;
    }
  }
  
  /**
   * Calculate profit-sharing commission
   */
  private static calculateProfitSharingCommission(netProfit: number, sharePercentage: number): number {
    return Math.max(0, (netProfit * sharePercentage) / 100);
  }
  
  /**
   * Calculate commissions for all eligible employees in bulk
   */
  static async calculateBulkCommissions(period: string): Promise<BulkCommissionCalculation> {
    try {
      const employees = await EmployeeDataIntegrationService.getCommissionEligibleEmployees();
      
      const employeeResults = await Promise.all(
        employees.map(emp => this.calculateCommission(emp.id, period))
      );
      
      // Calculate summary statistics
      const totalCommissions = employeeResults.reduce((sum, result) => sum + result.finalCommission, 0);
      const totalSales = employeeResults.reduce((sum, result) => sum + result.calculationDetails.salesAmount, 0);
      const averageCommissionRate = totalSales > 0 ? (totalCommissions / totalSales) * 100 : 0;
      
      // Top performers
      const topPerformers = employeeResults
        .sort((a, b) => b.finalCommission - a.finalCommission)
        .slice(0, 5)
        .map(result => ({
          employeeId: result.employeeId,
          amount: result.finalCommission
        }));
      
      return {
        period,
        totalEmployees: employees.length,
        totalCommissions,
        employeeResults,
        summary: {
          totalSales,
          averageCommissionRate,
          topPerformers
        }
      };
      
    } catch (error) {
      console.error('Error calculating bulk commissions:', error);
      return {
        period,
        totalEmployees: 0,
        totalCommissions: 0,
        employeeResults: [],
        summary: {
          totalSales: 0,
          averageCommissionRate: 0,
          topPerformers: []
        }
      };
    }
  }
  
  /**
   * Calculate commission projections based on current performance
   */
  static async calculateProjectedCommissions(
    employeeId: string,
    currentPeriod: string,
    projectedSales: number
  ): Promise<CommissionCalculationResult> {
    try {
      const employee = await EmployeeDataIntegrationService.getEmployeeById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      // Create mock performance metrics with projected sales
      const projectedMetrics: PerformanceMetrics = {
        ...employee.performanceMetrics!,
        currentPeriodSales: projectedSales,
        achievementPercentage: employee.performanceMetrics!.targetSales > 0 ? 
          (projectedSales / employee.performanceMetrics!.targetSales) * 100 : 0
      };
      
      // Calculate commission using projected metrics
      const commissionStructure = employee.commissionStructure;
      let baseCommission = 0;
      let tierBreakdown: TierCommissionBreakdown[] | undefined;
      
      switch (commissionStructure.type) {
        case 'fixed-percentage':
          baseCommission = this.calculateFixedPercentageCommission(projectedSales, commissionStructure.baseRate);
          break;
        
        case 'tiered':
          const tieredResult = this.calculateTieredCommission(projectedSales, commissionStructure);
          baseCommission = tieredResult.totalCommission;
          tierBreakdown = tieredResult.breakdown;
          break;
        
        case 'target-based':
          baseCommission = this.calculateTargetBasedCommission(projectedMetrics, commissionStructure);
          break;
        
        case 'profit-sharing':
          const financialData = await FinancialDataIntegrationService.getFinancialDataForPeriod(currentPeriod);
          baseCommission = this.calculateProfitSharingCommission(financialData.netProfit, commissionStructure.baseRate);
          break;
      }
      
      return {
        employeeId,
        period: currentPeriod + '-projected',
        baseCommission,
        bonuses: 0,
        deductions: 0,
        adjustments: 0,
        finalCommission: baseCommission,
        calculationDetails: {
          salesAmount: projectedSales,
          targetAmount: projectedMetrics.targetSales,
          achievementPercentage: projectedMetrics.achievementPercentage,
          commissionRate: commissionStructure.baseRate,
          tierBreakdown
        }
      };
      
    } catch (error) {
      console.error('Error calculating projected commissions:', error);
      return this.createZeroCommissionResult(employeeId, currentPeriod + '-projected');
    }
  }
  
  /**
   * Validate commission calculation rules
   */
  static validateCommissionStructure(structure: CommissionStructure): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!structure.name || structure.name.trim() === '') {
      errors.push('Commission structure name is required');
    }
    
    if (structure.baseRate < 0 || structure.baseRate > 100) {
      errors.push('Base rate must be between 0 and 100');
    }
    
    if (structure.type === 'tiered' && (!structure.tiers || structure.tiers.length === 0)) {
      errors.push('Tiered commission structure must have at least one tier');
    }
    
    if (structure.tiers) {
      structure.tiers.forEach((tier, index) => {
        if (tier.minAmount < 0) {
          errors.push(`Tier ${index + 1}: Minimum amount cannot be negative`);
        }
        if (tier.maxAmount <= tier.minAmount) {
          errors.push(`Tier ${index + 1}: Maximum amount must be greater than minimum amount`);
        }
        if (tier.rate < 0 || tier.rate > 100) {
          errors.push(`Tier ${index + 1}: Rate must be between 0 and 100`);
        }
      });
      
      // Check for overlapping or gaps in tiers
      for (let i = 1; i < structure.tiers.length; i++) {
        if (structure.tiers[i].minAmount !== structure.tiers[i - 1].maxAmount) {
          errors.push(`Gap or overlap detected between tier ${i} and tier ${i + 1}`);
        }
      }
    }
    
    if (structure.type === 'target-based' && (!structure.targetAmount || structure.targetAmount <= 0)) {
      errors.push('Target-based commission structure must have a positive target amount');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Create a zero commission result for error cases
   */
  private static createZeroCommissionResult(employeeId: string, period: string): CommissionCalculationResult {
    return {
      employeeId,
      period,
      baseCommission: 0,
      bonuses: 0,
      deductions: 0,
      adjustments: 0,
      finalCommission: 0,
      calculationDetails: {
        salesAmount: 0,
        targetAmount: 0,
        achievementPercentage: 0,
        commissionRate: 0
      }
    };
  }
}
