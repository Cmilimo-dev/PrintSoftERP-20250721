import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

// Types
export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  hire_date: string;
  salary?: number;
  status: 'active' | 'inactive' | 'on_leave';
  manager_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  leave_type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity';
  start_date: string;
  end_date: string;
  days_requested: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  pay_period_start: string;
  pay_period_end: string;
  base_salary: number;
  overtime_hours?: number;
  overtime_rate?: number;
  bonuses?: number;
  deductions?: number;
  gross_pay: number;
  tax_deductions: number;
  net_pay: number;
  status: 'draft' | 'processed' | 'paid';
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceReview {
  id: string;
  employee_id: string;
  review_period: string;
  overall_rating: number;
  technical_skills: number;
  communication: number;
  teamwork: number;
  leadership: number;
  problem_solving: number;
  goals: string;
  achievements: string;
  areas_for_improvement: string;
  next_period_goals: string;
  reviewer_comments: string;
  review_date: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  created_at: string;
  updated_at: string;
}

// Employee Hooks
export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      try {
        const data = await apiClient.select<Employee>('employees', {
          order: 'created_at.desc'
        });
        return data;
      } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }
    },
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      try {
        const data = await apiClient.select<Employee>('employees', {
          where: { id },
          limit: 1
        });
        return data[0];
      } catch (error) {
        console.error('Error fetching employee:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const data = await apiClient.insert<Employee>('employees', employee);
        return data;
      } catch (error) {
        console.error('Error creating employee:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Success',
        description: 'Employee created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create employee',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...employee }: Partial<Employee> & { id: string }) => {
      try {
        const data = await apiClient.update<Employee>('employees', id, employee);
        return data;
      } catch (error) {
        console.error('Error updating employee:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Success',
        description: 'Employee updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update employee',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await apiClient.delete('employees', id);
      } catch (error) {
        console.error('Error deleting employee:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete employee',
        variant: 'destructive',
      });
    },
  });
};

// Leave Request Hooks
export const useLeaveRequests = () => {
  return useQuery({
    queryKey: ['leave-requests'],
    queryFn: async () => {
      try {
        const data = await apiClient.select<LeaveRequest>('leave_requests', {
          order: 'created_at.desc'
        });
        return data;
      } catch (error) {
        console.error('Error fetching leave requests:', error);
        throw error;
      }
    },
  });
};

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (leaveRequest: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const data = await apiClient.insert<LeaveRequest>('leave_requests', leaveRequest);
        return data;
      } catch (error) {
        console.error('Error creating leave request:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast({
        title: 'Success',
        description: 'Leave request submitted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit leave request',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...leaveRequest }: Partial<LeaveRequest> & { id: string }) => {
      try {
        const data = await apiClient.update<LeaveRequest>('leave_requests', id, leaveRequest);
        return data;
      } catch (error) {
        console.error('Error updating leave request:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast({
        title: 'Success',
        description: 'Leave request updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update leave request',
        variant: 'destructive',
      });
    },
  });
};

// Payroll Hooks
export const usePayrollRecords = () => {
  return useQuery({
    queryKey: ['payroll-records'],
    queryFn: async () => {
      try {
        const data = await apiClient.select<PayrollRecord>('payroll_records', {
          order: 'pay_period_start.desc'
        });
        return data;
      } catch (error) {
        console.error('Error fetching payroll records:', error);
        throw error;
      }
    },
  });
};

export const useCreatePayrollRecord = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payrollRecord: Omit<PayrollRecord, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const data = await apiClient.insert<PayrollRecord>('payroll_records', payrollRecord);
        return data;
      } catch (error) {
        console.error('Error creating payroll record:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-records'] });
      toast({
        title: 'Success',
        description: 'Payroll record created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create payroll record',
        variant: 'destructive',
      });
    },
  });
};

// Performance Review Hooks
export const usePerformanceReviews = () => {
  return useQuery({
    queryKey: ['performance-reviews'],
    queryFn: async () => {
      try {
        const data = await apiClient.select<PerformanceReview>('performance_reviews', {
          order: 'review_date.desc'
        });
        return data;
      } catch (error) {
        console.error('Error fetching performance reviews:', error);
        throw error;
      }
    },
  });
};

export const useCreatePerformanceReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (review: Omit<PerformanceReview, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const data = await apiClient.insert<PerformanceReview>('performance_reviews', review);
        return data;
      } catch (error) {
        console.error('Error creating performance review:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      toast({
        title: 'Success',
        description: 'Performance review submitted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit performance review',
        variant: 'destructive',
      });
    },
  });
};

// Department Hooks
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      try {
        const data = await apiClient.select<Department>('departments', {
          order: 'name.asc'
        });
        return data;
      } catch (error) {
        console.error('Error fetching departments:', error);
        throw error;
      }
    },
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (department: Omit<Department, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const data = await apiClient.insert<Department>('departments', department);
        return data;
      } catch (error) {
        console.error('Error creating department:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: 'Success',
        description: 'Department created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create department',
        variant: 'destructive',
      });
    },
  });
};

// HR Statistics Hook
export const useHRStats = () => {
  const { data: employees } = useEmployees();
  const { data: leaveRequests } = useLeaveRequests();
  const { data: payrollRecords } = usePayrollRecords();

  return useQuery({
    queryKey: ['hr-stats', employees?.length, leaveRequests?.length, payrollRecords?.length],
    queryFn: async () => {
      const totalEmployees = employees?.length || 0;
      const activeEmployees = employees?.filter(emp => emp.status === 'active').length || 0;
      const onLeave = employees?.filter(emp => emp.status === 'on_leave').length || 0;
      const pendingLeaveRequests = leaveRequests?.filter(req => req.status === 'pending').length || 0;
      
      // Calculate new hires (employees hired in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newHires = employees?.filter(emp => new Date(emp.hire_date) >= thirtyDaysAgo).length || 0;
      
      // Calculate upcoming birthdays (mock data for now)
      const upcomingBirthdays = 4; // This would be calculated from employee birth dates
      
      return {
        totalEmployees,
        activeEmployees,
        onLeave,
        newHires,
        pendingRequests: pendingLeaveRequests,
        upcomingBirthdays,
      };
    },
    enabled: !!employees && !!leaveRequests,
  });
};
