
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FinancialDatabaseService } from '@/services/financialDatabaseService';
import { ChartOfAccounts, AccountSearchCriteria } from '@/modules/financial/types/financialTypes';
import { useToast } from '@/hooks/use-toast';

export const useChartOfAccounts = () => {
  return useQuery({
    queryKey: ['chart_of_accounts'],
    queryFn: () => FinancialDatabaseService.getAllAccounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useChartOfAccountById = (id: string) => {
  return useQuery({
    queryKey: ['chart_of_accounts', id],
    queryFn: () => FinancialDatabaseService.getAccountById(id),
    enabled: !!id,
  });
};

export const useSearchChartOfAccounts = (criteria: AccountSearchCriteria) => {
  return useQuery({
    queryKey: ['chart_of_accounts', 'search', criteria],
    queryFn: () => FinancialDatabaseService.searchAccounts(criteria),
    enabled: Object.keys(criteria).length > 0,
  });
};

export const useCreateChartOfAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (account: ChartOfAccounts) => {
      return FinancialDatabaseService.saveAccount(account);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart_of_accounts'] });
      toast({
        title: "Success",
        description: "Chart of account created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create account: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateChartOfAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (account: ChartOfAccounts) => {
      return FinancialDatabaseService.saveAccount(account);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart_of_accounts'] });
      toast({
        title: "Success",
        description: "Chart of account updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update account: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteChartOfAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return FinancialDatabaseService.deleteAccount(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart_of_accounts'] });
      toast({
        title: "Success",
        description: "Chart of account deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete account: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
