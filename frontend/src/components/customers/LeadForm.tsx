
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Lead } from '@/types/customers';

interface LeadFormProps {
  onSubmit?: (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => void | Promise<void>;
  lead?: Lead;
  onCancel?: () => void;
}

const LeadForm: React.FC<LeadFormProps> = ({ onSubmit, lead, onCancel }) => {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<Omit<Lead, 'id' | 'created_at' | 'updated_at'>>({
    defaultValues: lead ? {
      contact_person: lead.contact_person || lead.contact_name || '',
      company_name: lead.company_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      lead_source: lead.lead_source || lead.source || '',
      estimated_value: lead.estimated_value || 0,
      lead_status: lead.lead_status || lead.status || 'new',
      priority: lead.priority || 'medium',
      notes: lead.notes || '',
    } : {}
  });

  const onFormSubmit = async (data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const leadData = {
        ...data,
        lead_status: data.lead_status || 'new' as const,
        priority: data.priority || 'medium' as const,
        estimated_value: data.estimated_value || 0,
      };
      
      await onSubmit?.(leadData);
      reset();
    } catch (error) {
      console.error('Lead form submission error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lead ? 'Edit Lead' : 'Add New Lead'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_person">Contact Person *</Label>
              <Input
                id="contact_person"
                {...register('contact_person', { required: 'Contact person is required' })}
                placeholder="Enter contact person name"
              />
              {errors.contact_person && <span className="text-destructive text-sm">{errors.contact_person.message}</span>}
            </div>
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                {...register('company_name')}
                placeholder="Enter company name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lead_source">Lead Source</Label>
              <Input
                id="lead_source"
                {...register('lead_source')}
                placeholder="e.g., Website, Referral, Cold Call"
              />
            </div>
            <div>
              <Label htmlFor="estimated_value">Estimated Value</Label>
              <Input
                id="estimated_value"
                type="number"
                step="0.01"
                {...register('estimated_value', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lead_status">Status</Label>
              <Select onValueChange={(value) => setValue('lead_status', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select onValueChange={(value) => setValue('priority', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Enter additional notes about this lead"
            />
          </div>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="w-full md:w-auto">
              {lead ? 'Update Lead' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeadForm;
