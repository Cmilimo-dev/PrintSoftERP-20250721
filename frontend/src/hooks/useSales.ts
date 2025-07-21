import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SalesOrder, Quotation, Invoice } from '@/types/sales';
import { useToast } from '@/hooks/use-toast';

export const useSalesOrders = () => {
  return useQuery({
    queryKey: ['sales_orders'],
    queryFn: async () => {
      console.log('Fetching sales orders...');
      const { data, error } = await supabase
        .from('sales_orders')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            company_name,
            customer_type,
            email,
            phone,
            address,
            city,
            state,
            postal_code
          ),
          sales_order_items (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            products (
              name,
              sku,
              description
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching sales orders:', error);
        throw error;
      }
      console.log('Sales orders fetched:', data);
      return data;
    },
  });
};

export const useQuotations = () => {
  return useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      console.log('Fetching quotations...');
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            company_name,
            customer_type,
            email,
            phone,
            address,
            city,
            state,
            postal_code
          ),
          quotation_items (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            description,
            products (
              name,
              sku,
              description
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching quotations:', error);
        throw error;
      }
      console.log('Quotations fetched:', data);
      return data;
    },
  });
};

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      console.log('Fetching invoices...');
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            company_name,
            customer_type,
            email,
            phone,
            address,
            city,
            state,
            postal_code
          ),
          sales_orders (
            order_number
          ),
          invoice_items (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            description,
            products (
              name,
              sku,
              description
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }
      console.log('Invoices fetched:', data);
      return data;
    },
  });
};

export const useDeliveryNotes = () => {
  return useQuery({
    queryKey: ['delivery_notes'],
    queryFn: async () => {
      console.log('Fetching delivery notes...');
      const { data, error } = await supabase
        .from('delivery_notes')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            company_name,
            customer_type,
            email,
            phone,
            address,
            city,
            state,
            postal_code
          ),
          sales_orders (
            order_number,
            sales_order_items (
              id,
              product_id,
              quantity,
              unit_price,
              total_price,
              products (
                name,
                sku,
                description
              )
            )
          ),
          delivery_note_items (
            id,
            product_id,
            quantity,
            description,
            products (
              name,
              sku,
              description
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching delivery notes:', error);
        throw error;
      }
      console.log('Delivery notes fetched:', data);
      return data;
    },
  });
};

export const useCreateSalesOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (salesOrder: Omit<SalesOrder, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating sales order:', salesOrder);
      const { data, error } = await supabase
        .from('sales_orders')
        .insert([salesOrder as any])
        .select()
        .single();

      if (error) {
        console.error('Error creating sales order:', error);
        throw error;
      }
      console.log('Sales order created:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Sales order creation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['sales_orders'] });
      toast({
        title: "Success",
        description: "Sales order created successfully",
      });
    },
    onError: (error) => {
      console.error('Sales order creation failed:', error);
      toast({
        title: "Error",
        description: `Failed to create sales order: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quotation: Omit<Quotation, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating quotation:', quotation);
      const { data, error } = await supabase
        .from('quotations')
        .insert([quotation as any])
        .select()
        .single();

      if (error) {
        console.error('Error creating quotation:', error);
        throw error;
      }
      console.log('Quotation created:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Quotation creation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({
        title: "Success",
        description: "Quotation created successfully",
      });
    },
    onError: (error) => {
      console.error('Quotation creation failed:', error);
      toast({
        title: "Error",
        description: `Failed to create quotation: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating invoice:', invoice);
      const { data, error } = await supabase
        .from('invoices')
        .insert([invoice as any])
        .select()
        .single();

      if (error) {
        console.error('Error creating invoice:', error);
        throw error;
      }
      console.log('Invoice created:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Invoice creation successful:', data);
      // Invalidate both invoices and sales orders to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales_orders'] });
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
    },
    onError: (error) => {
      console.error('Invoice creation failed:', error);
      toast({
        title: "Error",
        description: `Failed to create invoice: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useCreateDeliveryNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (deliveryNote: any) => {
      console.log('Creating delivery note:', deliveryNote);
      const { data, error } = await supabase
        .from('delivery_notes')
        .insert([deliveryNote])
        .select()
        .single();

      if (error) {
        console.error('Error creating delivery note:', error);
        throw error;
      }
      console.log('Delivery note created:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Delivery note creation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['delivery_notes'] });
      toast({
        title: "Success",
        description: "Delivery note created successfully",
      });
    },
    onError: (error) => {
      console.error('Delivery note creation failed:', error);
      toast({
        title: "Error",
        description: `Failed to create delivery note: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
