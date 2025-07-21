
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { Customer, Supplier } from '@/types/customers';

import { API_BASE_URL } from '@/config/api';

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('access_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || errorData.message || 'Request failed');
  }

  return response.json();
};

export const customers = {
  getAll: () => apiRequest('/rest/v1/customers?order=created_at.desc'),
  create: (customerData: any) => apiRequest('/rest/v1/customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  }),
  update: (id: string, customerData: any) => apiRequest(`/rest/v1/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(customerData),
  }),
  delete: (id: string) => apiRequest(`/rest/v1/customers/${id}`, {
    method: 'DELETE',
  }),
};

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching customers...');
      const data = await customers.getAll();
      
      console.log('Customers fetched:', data);
      
      // Transform database data to match Customer interface
      return data.map((customer: any) => ({
        ...customer,
        customer_type: (customer.company_name ? 'company' : 'individual') as const,
        payment_terms: customer.payment_terms || 30,
        preferred_currency: customer.preferred_currency || 'KES',
        credit_limit: customer.credit_limit || 0,
        status: customer.status || 'active',
        first_name: customer.first_name || undefined,
        last_name: customer.last_name || undefined,
      })) as Customer[];
    },
  });
};

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      // Use vendors table instead of suppliers
      const data = await apiRequest('/rest/v1/vendors?order=name.asc');
      
      // Transform vendors data to match Supplier interface
      return data.map((vendor: any) => ({
        ...vendor,
        company_name: vendor.name,
        supplier_code: vendor.vendor_number || vendor.id, // Use vendor_number from database
        vendor_number: vendor.vendor_number,
        supplier_type: vendor.supplier_type || 'company' as const,
        credit_limit: vendor.credit_limit || 0,
        preferred_currency: vendor.preferred_currency || 'USD', // Match database default
        status: vendor.status || 'active',
        payment_terms: vendor.payment_terms || 30,
      })) as Supplier[];
    },
  });
};

export const useLeads = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const data = await apiRequest('/rest/v1/leads?order=created_at.desc');
      
      // Transform leads data to match Lead interface
      return data.map((lead: any) => ({
        ...lead,
        contact_person: lead.contact_name,
        contact_name: lead.contact_name,
        lead_status: lead.status,
        lead_source: lead.source || lead.lead_source,
        priority: lead.priority || 'medium' as const,
        estimated_value: lead.estimated_value || 0,
      }));
    },
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  return useMutation({
    mutationFn: async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
      if (!hasPermission('customers.write')) {
        throw new Error('You do not have permission to create customers');
      }
      console.log('Creating customer with data:', customer);
      
      // Generate customer number with fallback
      let customerNumber = customer.customer_number;
      if (!customerNumber) {
        try {
          const NumberGenerationService = (await import('../services/NumberGenerationService')).default;
          customerNumber = await NumberGenerationService.generateCustomerNumber();
        } catch (error) {
          console.warn('Database numbering failed, using fallback:', error);
          // Use localStorage-based fallback numbering
          const { FallbackNumberingService } = await import('../services/fallbackNumberingService');
          customerNumber = FallbackNumberingService.generateCustomerNumber();
        }
      }
      
      // Map Customer interface to database schema
      // Combine first_name and last_name into name field, or use company_name
      const name = customer.company_name || 
                   (customer.first_name && customer.last_name ? 
                    `${customer.first_name} ${customer.last_name}` : 
                    customer.first_name || customer.last_name || customer.name || 'Unnamed Customer');
      
      const customerData = {
        customer_number: customerNumber,
        first_name: customer.first_name || null,
        last_name: customer.last_name || null,
        company_name: customer.company_name || null,
        customer_type: customer.customer_type || (customer.company_name ? 'company' : 'individual'),
        email: customer.email || null,
        phone: customer.phone || null,
        mobile: customer.mobile || null,
        fax: customer.fax || null,
        website: customer.website || null,
        address_line1: customer.address_line1 || customer.address || null,
        address_line2: customer.address_line2 || null,
        city: customer.city || null,
        state: customer.state || null,
        postal_code: customer.postal_code || null,
        country: customer.country || 'Kenya',
        tax_id: customer.tax_id || null,
        vat_number: customer.vat_number || null,
        credit_limit: customer.credit_limit || 0,
        payment_terms: customer.payment_terms || 30,
        preferred_currency: customer.preferred_currency || 'KES',
        preferred_payment_method: customer.preferred_payment_method || null,
        discount_percentage: customer.discount_percentage || 0,
        price_list_id: customer.price_list_id || null,
        territory: customer.territory || null,
        sales_rep_id: customer.sales_rep_id || null,
        customer_group: customer.customer_group || null,
        industry: customer.industry || null,
        lead_source: customer.lead_source || null,
        tags: customer.tags || null,
        status: customer.status || 'active',
        notes: customer.notes || null,
        internal_notes: customer.internal_notes || null,
        created_by: customer.created_by || null,
      };

      console.log('Processed customer data:', customerData);
      console.log('About to call API to create customer');

      const data = await apiRequest('/rest/v1/customers', {
        method: 'POST',
        body: JSON.stringify(customerData),
      });

      console.log('API response - data:', data);
      
      if (!data) {
        throw new Error('Failed to create customer - no data returned');
      }
      
      console.log('Customer created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Customer creation success callback triggered:', data);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
    },
    onError: (error) => {
      console.error('Customer creation failed:', error);
      toast({
        title: "Error",
        description: `Failed to create customer: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  return useMutation({
    mutationFn: async ({ id, ...customerData }: { id: string } & Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
      if (!hasPermission('customers.write')) {
        throw new Error('You do not have permission to update customers');
      }
      console.log('Updating customer with data:', customerData);
      
      // Map Customer interface to database schema
      const name = customerData.company_name || 
                   (customerData.first_name && customerData.last_name ? 
                    `${customerData.first_name} ${customerData.last_name}` : 
                    customerData.first_name || customerData.last_name || customerData.name || 'Unnamed Customer');
      
      const updateData = {
        customer_number: customerData.customer_number || null,
        first_name: customerData.first_name || null,
        last_name: customerData.last_name || null,
        company_name: customerData.company_name || null,
        customer_type: customerData.customer_type || (customerData.company_name ? 'company' : 'individual'),
        email: customerData.email || null,
        phone: customerData.phone || null,
        mobile: customerData.mobile || null,
        fax: customerData.fax || null,
        website: customerData.website || null,
        address_line1: customerData.address_line1 || customerData.address || null,
        address_line2: customerData.address_line2 || null,
        city: customerData.city || null,
        state: customerData.state || null,
        postal_code: customerData.postal_code || null,
        country: customerData.country || 'Kenya',
        tax_id: customerData.tax_id || null,
        vat_number: customerData.vat_number || null,
        credit_limit: customerData.credit_limit || 0,
        payment_terms: customerData.payment_terms || 30,
        preferred_currency: customerData.preferred_currency || 'KES',
        preferred_payment_method: customerData.preferred_payment_method || null,
        discount_percentage: customerData.discount_percentage || 0,
        price_list_id: customerData.price_list_id || null,
        territory: customerData.territory || null,
        sales_rep_id: customerData.sales_rep_id || null,
        customer_group: customerData.customer_group || null,
        industry: customerData.industry || null,
        lead_source: customerData.lead_source || null,
        tags: customerData.tags || null,
        status: customerData.status || 'active',
        notes: customerData.notes || null,
        internal_notes: customerData.internal_notes || null,
        updated_by: customerData.updated_by || null,
      };

      console.log('Processed update data:', updateData);

      const data = await apiRequest(`/rest/v1/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      console.log('Customer updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Customer update success callback triggered:', data);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
    },
    onError: (error) => {
      console.error('Customer update failed:', error);
      toast({
        title: "Error",
        description: `Failed to update customer: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  return useMutation({
    mutationFn: async (customerId: string) => {
      if (!hasPermission('customers.delete')) {
        throw new Error('You do not have permission to delete customers');
      }
      console.log('Deleting customer with ID:', customerId);
      
      // Let the backend handle all cascade checks
      try {
        await apiRequest(`/rest/v1/customers/${customerId}`, {
          method: 'DELETE',
        });
        console.log('Customer deleted successfully');
        return customerId;
      } catch (error: any) {
        console.error('Customer deletion failed:', error);
        // Re-throw with the backend's error message
        throw new Error(error.message || 'Failed to delete customer');
      }
    },
    onSuccess: (customerId) => {
      console.log('Customer deletion success callback triggered for ID:', customerId);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Customer deletion failed:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete customer',
        variant: "destructive",
      });
    },
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  return useMutation({
    mutationFn: async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
      if (!hasPermission('suppliers.write')) {
        throw new Error('You do not have permission to create suppliers');
      }
      // Use supplier_code from form (already generated) or generate new one as fallback
      let vendorNumber = supplier.supplier_code;
      if (!vendorNumber) {
        try {
          const NumberGenerationService = (await import('../services/NumberGenerationService')).default;
          vendorNumber = await NumberGenerationService.generateVendorNumber();
        } catch (error) {
          console.warn('Database numbering failed, using fallback:', error);
          // Use localStorage-based fallback numbering
          const { FallbackNumberingService } = await import('../services/fallbackNumberingService');
          vendorNumber = FallbackNumberingService.generateVendorNumber();
        }
      }
      
      // Create in vendors table - map to actual database columns
      const vendorData = {
        name: supplier.company_name || supplier.name || 'Unnamed Vendor',
        company_name: supplier.company_name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        city: supplier.city,
        state: supplier.state,
        zip: supplier.postal_code, // Map postal_code to zip
        country: supplier.country || 'USA', // Default to USA to match table default
        tax_number: supplier.tax_number,
        status: supplier.status || 'active',
        payment_terms: supplier.payment_terms || 30,
        vendor_number: vendorNumber, // Use vendor_number not supplier_code
        preferred_currency: supplier.preferred_currency || 'USD', // Default to USD to match table default
        notes: supplier.notes,
      };

      const data = await apiRequest('/rest/v1/vendors', {
        method: 'POST',
        body: JSON.stringify(vendorData),
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Success",
        description: "Supplier created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create supplier: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  return useMutation({
    mutationFn: async ({ id, supplier }: { id: string; supplier: Partial<Supplier> }) => {
      if (!hasPermission('suppliers.write')) {
        throw new Error('You do not have permission to update suppliers');
      }
      
      // Map supplier fields to vendor database columns
      const vendorData = {
        name: supplier.company_name || supplier.name,
        company_name: supplier.company_name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        city: supplier.city,
        state: supplier.state,
        zip: supplier.postal_code,
        country: supplier.country,
        tax_number: supplier.tax_number,
        status: supplier.status,
        payment_terms: supplier.payment_terms,
        vendor_number: supplier.vendor_number || supplier.supplier_code,
        preferred_currency: supplier.preferred_currency,
        notes: supplier.notes,
      };

      // Only include fields that are not undefined
      const cleanedData = Object.entries(vendorData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      const data = await apiRequest(`/rest/v1/vendors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(cleanedData),
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Success",
        description: "Supplier updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update supplier: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  return useMutation({
    mutationFn: async (supplierId: string) => {
      if (!hasPermission('suppliers.delete')) {
        throw new Error('You do not have permission to delete suppliers');
      }
      console.log('Deleting supplier with ID:', supplierId);
      
      // Try to check if supplier/vendor has any purchase orders (if endpoint exists)
      try {
        const purchaseOrders = await apiRequest(`/rest/v1/purchase-orders?vendor_id=${supplierId}&limit=1`);
        
        if (purchaseOrders && purchaseOrders.length > 0) {
          throw new Error('Cannot delete supplier with existing purchase orders');
        }
      } catch (error: any) {
        console.warn('Could not check purchase orders (endpoint may not exist):', error.message);
        // If endpoint doesn't exist (404), continue with deletion
        // If it's a different error, we should still allow deletion rather than blocking it
        if (error.message && !error.message.includes('Request failed')) {
          throw error;
        }
      }
      
      // Try to check for products from this vendor (if endpoint exists)
      try {
        const products = await apiRequest(`/rest/v1/products?vendor_id=${supplierId}&limit=1`);
        
        if (products && products.length > 0) {
          throw new Error('Cannot delete supplier with existing products');
        }
      } catch (error: any) {
        console.warn('Could not check products (endpoint may not exist):', error.message);
        // If endpoint doesn't exist (404), continue with deletion
        // If it's a different error, we should still allow deletion rather than blocking it
        if (error.message && !error.message.includes('Request failed')) {
          throw error;
        }
      }

      // Proceed with deletion
      await apiRequest(`/rest/v1/vendors/${supplierId}`, {
        method: 'DELETE',
      });
      
      console.log('Supplier deleted successfully');
      return supplierId;
    },
    onSuccess: (supplierId) => {
      console.log('Supplier deletion success callback triggered for ID:', supplierId);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Supplier deletion failed:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete supplier',
        variant: "destructive",
      });
    },
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  return useMutation({
    mutationFn: async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
      if (!hasPermission('leads.write')) {
        throw new Error('You do not have permission to create leads');
      }
      // Generate lead number with fallback
      let leadNumber = lead.lead_number;
      if (!leadNumber) {
        try {
          const NumberGenerationService = (await import('../services/NumberGenerationService')).default;
          leadNumber = await NumberGenerationService.generateLeadNumber();
        } catch (error) {
          console.warn('Database numbering failed, using fallback:', error);
          // Use localStorage-based fallback numbering
          const { FallbackNumberingService } = await import('../services/fallbackNumberingService');
          leadNumber = FallbackNumberingService.generateLeadNumber();
        }
      }
      
      // Map form fields to database columns
      const leadData = {
        lead_number: leadNumber,
        contact_name: lead.contact_person || lead.contact_name,
        company_name: lead.company_name,
        email: lead.email,
        phone: lead.phone,
        source: lead.lead_source || lead.source,
        lead_source: lead.lead_source || lead.source,
        status: lead.lead_status || lead.status || 'new',
        priority: lead.priority || 'medium',
        estimated_value: lead.estimated_value || 0,
        notes: lead.notes,
        score: lead.score || 0,
      };

      console.log('Creating lead with data:', leadData);

      const data = await apiRequest('/rest/v1/leads', {
        method: 'POST',
        body: JSON.stringify(leadData),
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
