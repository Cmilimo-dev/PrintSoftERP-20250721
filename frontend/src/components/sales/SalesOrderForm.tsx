
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateSalesOrder } from '@/hooks/useSales';
import { useCustomers } from '@/hooks/useCustomers';

interface SalesOrderFormProps {
  onSave?: () => void;
  onCancel?: () => void;
}

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ onSave, onCancel }) => {
  const form = useForm({
    defaultValues: {
      order_number: `SO-${Date.now()}`,
      customer_id: '',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      status: 'draft' as const,
      subtotal: '0',
      tax_amount: '0',
      total_amount: '0',
      notes: '',
    }
  });
  
  const createSalesOrder = useCreateSalesOrder();
  const { data: customers } = useCustomers();

  const handleSubmit = (values: any) => {
    console.log('Submitting sales order with values:', values);
    
    const salesOrderData = {
      order_number: values.order_number,
      customer_id: values.customer_id,
      order_date: values.order_date,
      expected_delivery_date: values.expected_delivery_date || null,
      status: values.status || 'draft',
      subtotal: parseFloat(values.subtotal) || 0,
      tax_amount: parseFloat(values.tax_amount) || 0,
      total_amount: parseFloat(values.total_amount) || 0,
      notes: values.notes || '',
    };

    console.log('Sales order data to be saved:', salesOrderData);

    createSalesOrder.mutate(salesOrderData, {
      onSuccess: (data) => {
        console.log('Sales order created successfully:', data);
        form.reset();
        onSave?.();
      },
      onError: (error) => {
        console.error('Error creating sales order:', error);
      }
    });
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  const getCustomerDisplayName = (customer: any) => {
    if (customer.customer_type === 'company') {
      return customer.company_name || 'Company';
    }
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Individual';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Sales Order</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="order_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Number</FormLabel>
                    <FormControl>
                      <Input placeholder="SO-001" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {getCustomerDisplayName(customer)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_delivery_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtotal</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="total_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={createSalesOrder.isPending}>
                {createSalesOrder.isPending ? 'Creating...' : 'Save Sales Order'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SalesOrderForm;
