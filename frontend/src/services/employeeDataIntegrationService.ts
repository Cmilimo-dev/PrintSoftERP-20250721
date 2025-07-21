import { supabase } from '@/integrations/supabase/client';

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  role: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'terminated';
  commissionEligible: boolean;
  commissionStructure: CommissionStructure;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  bankDetails?: BankDetails;
  taxInformation?: TaxInformation;
  performanceMetrics?: PerformanceMetrics;
}

export interface CommissionStructure {
  id: string;
  name: string;
  type: 'fixed-percentage' | 'tiered' | 'target-based' | 'profit-sharing' | 'custom';
  baseRate: number;
  tiers?: CommissionTier[];
  targetAmount?: number;
  isActive: boolean;
  effectiveDate: string;
  description?: string;
}

export interface CommissionTier {
  id: string;
  minAmount: number;
  maxAmount: number;
  rate: number;
  description?: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  accountType: 'checking' | 'savings';
  accountHolderName: string;
}

export interface TaxInformation {
  taxId: string;
  taxBracket: string;
  allowances: number;
  additionalWithholding?: number;
}

export interface PerformanceMetrics {
  currentPeriodSales: number;
  previousPeriodSales: number;
  ytdSales: number;
  targetSales: number;
  achievementPercentage: number;
  avgDealSize: number;
  dealsCount: number;
  conversionRate: number;
  customerSatisfactionScore?: number;
  lastReviewDate?: string;
  nextReviewDate?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  manager?: Employee;
  commissionRules?: CommissionStructure[];
  isActive: boolean;
}

export interface SalesActivity {
  id: string;
  employeeId: string;
  period: string;
  totalSales: number;
  targetSales: number;
  dealsCount: number;
  newCustomers: number;
  retainedCustomers: number;
  avgDealValue: number;
  conversionRate: number;
  productSales: number;
  serviceSales: number;
  territories?: string[];
}

export interface CommissionHistory {
  id: string;
  employeeId: string;
  period: string;
  baseCommission: number;
  bonuses: number;
  deductions: number;
  adjustments: number;
  finalAmount: number;
  status: 'draft' | 'calculated' | 'approved' | 'paid';
  paymentDate?: string;
  paymentMethod?: string;
  approvedBy?: string;
  notes?: string;
}

/**
 * Employee/HR Data Integration Service
 * Connects commission management with HR systems and employee data
 */
export class EmployeeDataIntegrationService {
  
  /**
   * Get all commission-eligible employees with their structures
   */
  static async getCommissionEligibleEmployees(): Promise<Employee[]> {
    try {
      // Query employee data from HR tables
      const { data: employees, error: employeesError } = await supabase
        .from('employees') // Assuming you have an employees table
        .select(`
          id,
          employee_number,
          first_name,
          last_name,
          email,
          phone,
          department,
          position,
          role,
          hire_date,
          status,
          commission_eligible,
          commission_structure_id,
          manager_id
        `)
        .eq('commission_eligible', true)
        .eq('status', 'active');
      
      if (employeesError) {
        console.warn('Could not fetch employee data:', employeesError);
        return this.getMockEmployees();
      }
      
      // Enrich employee data with commission structures and performance metrics
      const enrichedEmployees = await Promise.all(
        (employees || []).map(async (emp) => {
          const commissionStructure = await this.getEmployeeCommissionStructure(emp.commission_structure_id);
          const performanceMetrics = await this.getEmployeePerformanceMetrics(emp.id);
          const manager = emp.manager_id ? await this.getEmployeeManager(emp.manager_id) : undefined;
          const bankDetails = await this.getEmployeeBankDetails(emp.id);
          const taxInformation = await this.getEmployeeTaxInformation(emp.id);
          
          return {
            id: emp.id,
            employeeNumber: emp.employee_number,
            firstName: emp.first_name,
            lastName: emp.last_name,
            fullName: `${emp.first_name} ${emp.last_name}`,
            email: emp.email,
            phone: emp.phone,
            department: emp.department,
            position: emp.position,
            role: emp.role,
            hireDate: emp.hire_date,
            status: emp.status,
            commissionEligible: emp.commission_eligible,
            commissionStructure,
            manager,
            bankDetails,
            taxInformation,
            performanceMetrics
          } as Employee;
        })
      );
      
      return enrichedEmployees;
      
    } catch (error) {
      console.error('Error fetching commission eligible employees:', error);
      return this.getMockEmployees();
    }
  }
  
  /**
   * Get employee by ID with full details
   */
  static async getEmployeeById(employeeId: string): Promise<Employee | null> {
    try {
      const { data: employee, error } = await supabase
        .from('employees')
        .select(`
          id,
          employee_number,
          first_name,
          last_name,
          email,
          phone,
          department,
          position,
          role,
          hire_date,
          status,
          commission_eligible,
          commission_structure_id,
          manager_id
        `)
        .eq('id', employeeId)
        .single();
      
      if (error || !employee) {
        console.warn('Could not fetch employee:', error);
        return null;
      }
      
      // Enrich with additional data
      const commissionStructure = await this.getEmployeeCommissionStructure(employee.commission_structure_id);
      const performanceMetrics = await this.getEmployeePerformanceMetrics(employee.id);
      const manager = employee.manager_id ? await this.getEmployeeManager(employee.manager_id) : undefined;
      const bankDetails = await this.getEmployeeBankDetails(employee.id);
      const taxInformation = await this.getEmployeeTaxInformation(employee.id);
      
      return {
        id: employee.id,
        employeeNumber: employee.employee_number,
        firstName: employee.first_name,
        lastName: employee.last_name,
        fullName: `${employee.first_name} ${employee.last_name}`,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        position: employee.position,
        role: employee.role,
        hireDate: employee.hire_date,
        status: employee.status,
        commissionEligible: employee.commission_eligible,
        commissionStructure,
        manager,
        bankDetails,
        taxInformation,
        performanceMetrics
      };
      
    } catch (error) {
      console.error('Error fetching employee by ID:', error);
      return null;
    }
  }
  
  /**
   * Get employee commission structure
   */
  static async getEmployeeCommissionStructure(structureId: string): Promise<CommissionStructure> {
    try {
      const { data: structure, error } = await supabase
        .from('commission_structures')
        .select(`
          id,
          name,
          type,
          base_rate,
          target_amount,
          is_active,
          effective_date,
          description
        `)
        .eq('id', structureId)
        .single();
      
      if (error || !structure) {
        return this.getDefaultCommissionStructure();
      }
      
      // Get tiers if it's a tiered structure
      const tiers = structure.type === 'tiered' ? 
        await this.getCommissionTiers(structureId) : [];
      
      return {
        id: structure.id,
        name: structure.name,
        type: structure.type,
        baseRate: structure.base_rate,
        tiers,
        targetAmount: structure.target_amount,
        isActive: structure.is_active,
        effectiveDate: structure.effective_date,
        description: structure.description
      };
      
    } catch (error) {
      console.error('Error fetching commission structure:', error);
      return this.getDefaultCommissionStructure();
    }
  }
  
  /**
   * Get commission tiers for a structure
   */
  private static async getCommissionTiers(structureId: string): Promise<CommissionTier[]> {
    try {
      const { data: tiers, error } = await supabase
        .from('commission_tiers')
        .select(`
          id,
          min_amount,
          max_amount,
          rate,
          description
        `)
        .eq('commission_structure_id', structureId)
        .order('min_amount');
      
      if (error || !tiers) {
        return [];
      }
      
      return tiers.map(tier => ({
        id: tier.id,
        minAmount: tier.min_amount,
        maxAmount: tier.max_amount,
        rate: tier.rate,
        description: tier.description
      }));
      
    } catch (error) {
      console.error('Error fetching commission tiers:', error);
      return [];
    }
  }
  
  /**
   * Get employee performance metrics
   */
  static async getEmployeePerformanceMetrics(employeeId: string): Promise<PerformanceMetrics> {
    try {
      // Get current and previous period sales data
      const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
      const previousMonth = new Date();
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const previousPeriod = previousMonth.toISOString().slice(0, 7);
      
      const currentPeriodSales = await this.getEmployeeSalesForPeriod(employeeId, currentPeriod);
      const previousPeriodSales = await this.getEmployeeSalesForPeriod(employeeId, previousPeriod);
      const ytdSales = await this.getEmployeeYTDSales(employeeId);
      
      // Get sales target
      const targetSales = await this.getEmployeeSalesTarget(employeeId, currentPeriod);
      
      // Calculate metrics
      const achievementPercentage = targetSales > 0 ? (currentPeriodSales.totalSales / targetSales) * 100 : 0;
      const avgDealSize = currentPeriodSales.dealsCount > 0 ? 
        currentPeriodSales.totalSales / currentPeriodSales.dealsCount : 0;
      
      return {
        currentPeriodSales: currentPeriodSales.totalSales,
        previousPeriodSales: previousPeriodSales.totalSales,
        ytdSales,
        targetSales,
        achievementPercentage,
        avgDealSize,
        dealsCount: currentPeriodSales.dealsCount,
        conversionRate: currentPeriodSales.conversionRate
      };
      
    } catch (error) {
      console.error('Error fetching employee performance metrics:', error);
      return {
        currentPeriodSales: 0,
        previousPeriodSales: 0,
        ytdSales: 0,
        targetSales: 0,
        achievementPercentage: 0,
        avgDealSize: 0,
        dealsCount: 0,
        conversionRate: 0
      };
    }
  }
  
  /**
   * Get employee sales for a specific period
   */
  private static async getEmployeeSalesForPeriod(
    employeeId: string, 
    period: string
  ): Promise<{ totalSales: number; dealsCount: number; conversionRate: number }> {
    try {
      // Query sales data from invoices, sales orders, etc.
      const { data: salesData, error } = await supabase
        .from('sales_orders') // or invoices
        .select('total, status')
        .eq('sales_person_id', employeeId)
        .gte('created_at', period + '-01')
        .lt('created_at', period + '-32'); // Next month
      
      if (error) {
        return { totalSales: 0, dealsCount: 0, conversionRate: 0 };
      }
      
      const completedSales = salesData?.filter(sale => sale.status === 'completed') || [];
      const totalSales = completedSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const dealsCount = completedSales.length;
      
      // Calculate conversion rate (simplified)
      const totalOpportunities = salesData?.length || 0;
      const conversionRate = totalOpportunities > 0 ? (dealsCount / totalOpportunities) * 100 : 0;
      
      return {
        totalSales,
        dealsCount,
        conversionRate
      };
      
    } catch (error) {
      console.error('Error fetching employee sales for period:', error);
      return { totalSales: 0, dealsCount: 0, conversionRate: 0 };
    }
  }
  
  /**
   * Get employee YTD sales
   */
  private static async getEmployeeYTDSales(employeeId: string): Promise<number> {
    try {
      const yearStart = new Date().getFullYear() + '-01-01';
      
      const { data: salesData, error } = await supabase
        .from('sales_orders')
        .select('total')
        .eq('sales_person_id', employeeId)
        .eq('status', 'completed')
        .gte('created_at', yearStart);
      
      if (error) {
        return 0;
      }
      
      return salesData?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0;
      
    } catch (error) {
      console.error('Error fetching employee YTD sales:', error);
      return 0;
    }
  }
  
  /**
   * Get employee sales target for a period
   */
  private static async getEmployeeSalesTarget(employeeId: string, period: string): Promise<number> {
    try {
      const { data: target, error } = await supabase
        .from('sales_targets')
        .select('target_amount')
        .eq('employee_id', employeeId)
        .eq('period', period)
        .single();
      
      if (error || !target) {
        // Return default target based on role/department
        return 100000; // Default target
      }
      
      return target.target_amount;
      
    } catch (error) {
      console.error('Error fetching employee sales target:', error);
      return 100000; // Default target
    }
  }
  
  /**
   * Get employee manager information
   */
  private static async getEmployeeManager(managerId: string): Promise<{ id: string; name: string; email: string } | undefined> {
    try {
      const { data: manager, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email')
        .eq('id', managerId)
        .single();
      
      if (error || !manager) {
        return undefined;
      }
      
      return {
        id: manager.id,
        name: `${manager.first_name} ${manager.last_name}`,
        email: manager.email
      };
      
    } catch (error) {
      console.error('Error fetching employee manager:', error);
      return undefined;
    }
  }
  
  /**
   * Get employee bank details
   */
  private static async getEmployeeBankDetails(employeeId: string): Promise<BankDetails | undefined> {
    try {
      const { data: bankDetails, error } = await supabase
        .from('employee_bank_details')
        .select(`
          bank_name,
          account_number,
          routing_number,
          swift_code,
          account_type,
          account_holder_name
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true)
        .single();
      
      if (error || !bankDetails) {
        return undefined;
      }
      
      return {
        bankName: bankDetails.bank_name,
        accountNumber: bankDetails.account_number,
        routingNumber: bankDetails.routing_number,
        swiftCode: bankDetails.swift_code,
        accountType: bankDetails.account_type,
        accountHolderName: bankDetails.account_holder_name
      };
      
    } catch (error) {
      console.error('Error fetching employee bank details:', error);
      return undefined;
    }
  }
  
  /**
   * Get employee tax information
   */
  private static async getEmployeeTaxInformation(employeeId: string): Promise<TaxInformation | undefined> {
    try {
      const { data: taxInfo, error } = await supabase
        .from('employee_tax_information')
        .select(`
          tax_id,
          tax_bracket,
          allowances,
          additional_withholding
        `)
        .eq('employee_id', employeeId)
        .single();
      
      if (error || !taxInfo) {
        return undefined;
      }
      
      return {
        taxId: taxInfo.tax_id,
        taxBracket: taxInfo.tax_bracket,
        allowances: taxInfo.allowances,
        additionalWithholding: taxInfo.additional_withholding
      };
      
    } catch (error) {
      console.error('Error fetching employee tax information:', error);
      return undefined;
    }
  }
  
  /**
   * Get departments with commission rules
   */
  static async getDepartments(): Promise<Department[]> {
    try {
      const { data: departments, error } = await supabase
        .from('departments')
        .select(`
          id,
          name,
          code,
          description,
          manager_id,
          is_active
        `)
        .eq('is_active', true);
      
      if (error) {
        console.warn('Could not fetch departments:', error);
        return this.getMockDepartments();
      }
      
      // Enrich with managers and commission rules
      const enrichedDepartments = await Promise.all(
        (departments || []).map(async (dept) => {
          const manager = dept.manager_id ? await this.getEmployeeById(dept.manager_id) : undefined;
          const commissionRules = await this.getDepartmentCommissionRules(dept.id);
          
          return {
            id: dept.id,
            name: dept.name,
            code: dept.code,
            description: dept.description,
            manager,
            commissionRules,
            isActive: dept.is_active
          };
        })
      );
      
      return enrichedDepartments;
      
    } catch (error) {
      console.error('Error fetching departments:', error);
      return this.getMockDepartments();
    }
  }
  
  /**
   * Get commission rules for a department
   */
  private static async getDepartmentCommissionRules(departmentId: string): Promise<CommissionStructure[]> {
    try {
      const { data: rules, error } = await supabase
        .from('commission_structures')
        .select(`
          id,
          name,
          type,
          base_rate,
          target_amount,
          is_active,
          effective_date,
          description
        `)
        .eq('department_id', departmentId)
        .eq('is_active', true);
      
      if (error || !rules) {
        return [];
      }
      
      return rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        type: rule.type,
        baseRate: rule.base_rate,
        targetAmount: rule.target_amount,
        isActive: rule.is_active,
        effectiveDate: rule.effective_date,
        description: rule.description
      }));
      
    } catch (error) {
      console.error('Error fetching department commission rules:', error);
      return [];
    }
  }
  
  /**
   * Get employee commission history
   */
  static async getEmployeeCommissionHistory(employeeId: string): Promise<CommissionHistory[]> {
    try {
      const { data: history, error } = await supabase
        .from('employee_commissions')
        .select(`
          id,
          employee_id,
          period,
          base_commission,
          bonuses,
          deductions,
          adjustments,
          final_amount,
          status,
          payment_date,
          payment_method,
          approved_by,
          notes
        `)
        .eq('employee_id', employeeId)
        .order('period', { ascending: false });
      
      if (error) {
        console.warn('Could not fetch commission history:', error);
        return [];
      }
      
      return (history || []).map(record => ({
        id: record.id,
        employeeId: record.employee_id,
        period: record.period,
        baseCommission: record.base_commission,
        bonuses: record.bonuses,
        deductions: record.deductions,
        adjustments: record.adjustments,
        finalAmount: record.final_amount,
        status: record.status,
        paymentDate: record.payment_date,
        paymentMethod: record.payment_method,
        approvedBy: record.approved_by,
        notes: record.notes
      }));
      
    } catch (error) {
      console.error('Error fetching employee commission history:', error);
      return [];
    }
  }
  
  /**
   * Update employee commission structure
   */
  static async updateEmployeeCommissionStructure(
    employeeId: string, 
    structureId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ commission_structure_id: structureId })
        .eq('id', employeeId);
      
      if (error) {
        console.error('Error updating employee commission structure:', error);
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error('Error updating employee commission structure:', error);
      return false;
    }
  }
  
  // Mock data methods for fallback scenarios
  
  private static getMockEmployees(): Employee[] {
    return [
      {
        id: '1',
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        email: 'john.doe@company.com',
        phone: '+1-555-0101',
        department: 'Sales',
        position: 'Senior Sales Manager',
        role: 'Sales Manager',
        hireDate: '2022-01-15',
        status: 'active',
        commissionEligible: true,
        commissionStructure: this.getDefaultCommissionStructure(),
        performanceMetrics: {
          currentPeriodSales: 125000,
          previousPeriodSales: 110000,
          ytdSales: 650000,
          targetSales: 100000,
          achievementPercentage: 125,
          avgDealSize: 25000,
          dealsCount: 5,
          conversionRate: 75
        }
      },
      {
        id: '2',
        employeeNumber: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        fullName: 'Jane Smith',
        email: 'jane.smith@company.com',
        phone: '+1-555-0102',
        department: 'Sales',
        position: 'Sales Director',
        role: 'Sales Director',
        hireDate: '2021-06-10',
        status: 'active',
        commissionEligible: true,
        commissionStructure: this.getDefaultCommissionStructure(),
        performanceMetrics: {
          currentPeriodSales: 95000,
          previousPeriodSales: 105000,
          ytdSales: 580000,
          targetSales: 120000,
          achievementPercentage: 79.2,
          avgDealSize: 19000,
          dealsCount: 5,
          conversionRate: 68
        }
      }
    ];
  }
  
  private static getDefaultCommissionStructure(): CommissionStructure {
    return {
      id: 'default',
      name: 'Standard Sales Commission',
      type: 'fixed-percentage',
      baseRate: 3.0,
      isActive: true,
      effectiveDate: '2024-01-01',
      description: 'Standard 3% commission on sales'
    };
  }
  
  private static getMockDepartments(): Department[] {
    return [
      {
        id: '1',
        name: 'Sales',
        code: 'SALES',
        description: 'Sales Department',
        isActive: true
      },
      {
        id: '2',
        name: 'Marketing',
        code: 'MKT',
        description: 'Marketing Department',
        isActive: true
      }
    ];
  }
}
