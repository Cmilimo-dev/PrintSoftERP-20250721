
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_number?: string;
  status?: 'active' | 'inactive';
  credit_limit?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  customer_type?: 'individual' | 'company';
  payment_terms?: number;
  preferred_currency?: string;
  // Additional fields for compatibility
  first_name?: string;
  last_name?: string;
  company_name?: string;
  postal_code?: string;
  state?: string;
  tax_id?: string;
}

export interface Supplier {
  id: string;
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string; // Maps to zip in vendors table
  country?: string;
  tax_number?: string;
  status?: 'active' | 'inactive' | 'suspended';
  payment_terms?: number;
  created_at: string;
  updated_at: string;
  vendor_number?: string; // Actual database field name
  preferred_currency?: string;
  notes?: string;
  // Legacy fields for compatibility
  supplier_code?: string; // Maps to vendor_number
  supplier_type?: 'individual' | 'company';
  credit_limit?: number;
  first_name?: string;
  last_name?: string;
  postal_code?: string; // Maps to zip
  is_active?: boolean;
}

export interface Lead {
  id: string;
  lead_number: string;
  company_name: string;
  contact_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  status: 'new' | 'qualified' | 'contacted' | 'converted' | 'lost';
  lead_status?: string;
  source: string;
  score?: number;
  priority?: 'low' | 'medium' | 'high';
  estimated_value?: number;
  expected_close_date?: string;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}
