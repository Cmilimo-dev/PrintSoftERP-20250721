import { supabase } from '@/integrations/supabase/client';

export interface Customer {
  id: string;
  customerNumber: string;
  name: string;
  companyName?: string;
  type: 'individual' | 'business' | 'government' | 'non_profit';
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  website?: string;
  taxId?: string;
  registrationNumber?: string;
  founded?: string;
  employees?: number;
  annualRevenue?: number;
  primaryContact: ContactPerson;
  additionalContacts: ContactPerson[];
  addresses: CustomerAddress[];
  communication: {
    preferredMethod: 'email' | 'phone' | 'sms' | 'mail';
    language: string;
    timezone: string;
    allowMarketing: boolean;
    allowSMS: boolean;
    doNotCall: boolean;
  };
  financial: {
    creditLimit: number;
    creditUsed: number;
    paymentTerms: 'cash' | 'net_15' | 'net_30' | 'net_60' | 'net_90';
    currency: string;
    riskRating: 'low' | 'medium' | 'high' | 'very_high';
    creditScore?: number;
    lastCreditCheck?: string;
  };
  salesInfo: {
    salesRep: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
    accountManager?: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
    territory: string;
    segment: 'prospect' | 'new' | 'active' | 'vip' | 'dormant' | 'lost';
    source: 'website' | 'referral' | 'advertisement' | 'trade_show' | 'cold_call' | 'social_media' | 'other';
    referredBy?: string;
  };
  status: 'prospect' | 'active' | 'inactive' | 'suspended' | 'blacklisted';
  priority: 'low' | 'normal' | 'high' | 'vip';
  tags: string[];
  customFields: Record<string, any>;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  totalOrders: number;
  totalSalesValue: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  lifetimeValue: number;
}

export interface ContactPerson {
  id: string;
  title: 'mr' | 'mrs' | 'ms' | 'dr' | 'prof' | 'other';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile?: string;
  position?: string;
  department?: string;
  role: 'primary' | 'billing' | 'technical' | 'decision_maker' | 'influencer' | 'user';
  isPrimary: boolean;
  birthday?: string;
  notes?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddress {
  id: string;
  type: 'billing' | 'shipping' | 'office' | 'warehouse' | 'other';
  label?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isPrimary: boolean;
  isActive: boolean;
  deliveryInstructions?: string;
  accessCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  leadNumber: string;
  source: 'website' | 'referral' | 'advertisement' | 'trade_show' | 'cold_call' | 'social_media' | 'email_campaign' | 'other';
  campaign?: string;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    position?: string;
  };
  qualification: {
    budget?: number;
    authority: 'decision_maker' | 'influencer' | 'user' | 'unknown';
    need: 'urgent' | 'moderate' | 'future' | 'unknown';
    timeline: 'immediate' | 'within_month' | 'within_quarter' | 'next_year' | 'unknown';
  };
  score: number; // 0-100
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';
  stage: 'awareness' | 'interest' | 'consideration' | 'intent' | 'evaluation' | 'purchase';
  assignedTo: {
    id: string;
    name: string;
    email: string;
  };
  notes?: string;
  tags: string[];
  customFields: Record<string, any>;
  convertedToCustomerId?: string;
  convertedAt?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
}

export interface Opportunity {
  id: string;
  opportunityNumber: string;
  customerId?: string;
  leadId?: string;
  name: string;
  description?: string;
  value: number;
  currency: string;
  probability: number; // 0-100
  stage: 'prospecting' | 'qualification' | 'needs_analysis' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  source: string;
  type: 'new_business' | 'existing_customer' | 'renewal' | 'upsell' | 'cross_sell';
  priority: 'low' | 'medium' | 'high' | 'critical';
  expectedCloseDate: string;
  actualCloseDate?: string;
  salesRep: {
    id: string;
    name: string;
    email: string;
  };
  competitors?: string[];
  products: OpportunityProduct[];
  status: 'open' | 'won' | 'lost' | 'cancelled';
  lostReason?: string;
  winReason?: string;
  notes?: string;
  tags: string[];
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  convertedToOrderId?: string;
}

export interface OpportunityProduct {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  notes?: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'demo' | 'proposal' | 'quote' | 'order' | 'support';
  subtype?: string;
  subject: string;
  description?: string;
  relatedTo: {
    type: 'customer' | 'lead' | 'opportunity' | 'contact';
    id: string;
    name: string;
  };
  assignedTo: {
    id: string;
    name: string;
    email: string;
  };
  participants?: Array<{
    id: string;
    name: string;
    email: string;
    type: 'internal' | 'external';
  }>;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: string;
  startTime?: string;
  endTime?: string;
  duration?: number; // minutes
  location?: string;
  meetingLink?: string;
  outcome?: string;
  nextAction?: string;
  attachments?: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  completedAt?: string;
  completedBy?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customer?: Customer;
  contactId?: string;
  contact?: ContactPerson;
  subject: string;
  description: string;
  type: 'question' | 'bug' | 'feature_request' | 'complaint' | 'compliment' | 'other';
  category: string;
  subcategory?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'critical';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'waiting_vendor' | 'resolved' | 'closed';
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    team: string;
  };
  channel: 'email' | 'phone' | 'chat' | 'portal' | 'social_media' | 'walk_in';
  source: string;
  tags: string[];
  customFields: Record<string, any>;
  slaTarget?: string;
  slaBreached: boolean;
  resolutionTime?: number; // minutes
  satisfactionRating?: number; // 1-5
  satisfactionComment?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  firstResponseAt?: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorType: 'customer' | 'agent' | 'system';
  content: string;
  isInternal: boolean;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: 'email' | 'sms' | 'social_media' | 'direct_mail' | 'telemarketing' | 'event' | 'webinar' | 'other';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  objective: 'awareness' | 'lead_generation' | 'customer_acquisition' | 'retention' | 'upsell' | 'cross_sell';
  budget: number;
  actualCost: number;
  currency: string;
  startDate: string;
  endDate: string;
  targetAudience: {
    segments: string[];
    criteria: Record<string, any>;
    estimatedReach: number;
  };
  content: {
    subject?: string;
    message: string;
    attachments?: string[];
    landingPageUrl?: string;
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    responded: number;
    converted: number;
    unsubscribed: number;
    bounced: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  launchedAt?: string;
  completedAt?: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  criteria: {
    demographics?: Record<string, any>;
    behavioral?: Record<string, any>;
    transactional?: Record<string, any>;
    geographic?: Record<string, any>;
  };
  customerCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CRMDashboardMetrics {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  customerGrowthRate: number;
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  leadConversionRate: number;
  totalOpportunities: number;
  openOpportunities: number;
  opportunitiesValue: number;
  averageDealSize: number;
  winRate: number;
  salesCycleLength: number;
  totalRevenue: number;
  customerLifetimeValue: number;
  customerRetentionRate: number;
  churnRate: number;
  totalActivities: number;
  overdueActivities: number;
  openTickets: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalValue: number;
    lastOrderDate: string;
  }>;
  salesByRep: Array<{
    repId: string;
    repName: string;
    revenue: number;
    deals: number;
    winRate: number;
  }>;
  leadSources: Array<{
    source: string;
    count: number;
    conversionRate: number;
  }>;
  recentActivities: Activity[];
  upcomingActivities: Activity[];
}

export interface CRMAnalytics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
  customers: {
    new: number;
    lost: number;
    reactivated: number;
    growthRate: number;
  };
  leads: {
    generated: number;
    qualified: number;
    converted: number;
    conversionRate: number;
  };
  opportunities: {
    created: number;
    won: number;
    lost: number;
    value: number;
    averageSize: number;
    winRate: number;
  };
  sales: {
    revenue: number;
    deals: number;
    averageDealSize: number;
    cycleLength: number;
  };
  support: {
    tickets: number;
    resolved: number;
    averageResolutionTime: number;
    satisfaction: number;
  };
  channels: {
    performance: Array<{
      channel: string;
      leads: number;
      conversions: number;
      revenue: number;
      roi: number;
    }>;
  };
}

/**
 * Customer Data Integration Service
 * Comprehensive CRM management with customers, leads, opportunities, and support
 */
export class CustomerDataIntegrationService {

  /**
   * Get customers with filtering and pagination
   */
  static async getCustomers(
    filters: {
      status?: string;
      segment?: string;
      salesRep?: string;
      territory?: string;
      type?: string;
      search?: string;
    } = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ customers: Customer[]; total: number; hasMore: boolean }> {
    try {
      let query = supabase
        .from('customers')
        .select(`
          *,
          customer_contacts(*),
          customer_addresses(*),
          sales_reps:employees!sales_rep_id(id, first_name, last_name, email, phone),
          account_managers:employees!account_manager_id(id, first_name, last_name, email, phone)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.segment) {
        query = query.eq('segment', filters.segment);
      }
      if (filters.salesRep) {
        query = query.eq('sales_rep_id', filters.salesRep);
      }
      if (filters.territory) {
        query = query.eq('territory', filters.territory);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,customer_number.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query
        .order('name', { ascending: true })
        .range(offset, offset + pageSize - 1);

      const { data: customers, error, count } = await query;

      if (error) {
        console.error('Error fetching customers:', error);
        return { customers: [], total: 0, hasMore: false };
      }

      const transformedCustomers: Customer[] = (customers || []).map(this.transformCustomerData);

      return {
        customers: transformedCustomers,
        total: count || 0,
        hasMore: (count || 0) > offset + pageSize
      };

    } catch (error) {
      console.error('Error in getCustomers:', error);
      return { customers: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get customer by ID
   */
  static async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .select(`
          *,
          customer_contacts(*),
          customer_addresses(*),
          sales_reps:employees!sales_rep_id(id, first_name, last_name, email, phone),
          account_managers:employees!account_manager_id(id, first_name, last_name, email, phone)
        `)
        .eq('id', id)
        .single();

      if (error || !customer) {
        console.error('Error fetching customer by ID:', error);
        return null;
      }

      return this.transformCustomerData(customer);

    } catch (error) {
      console.error('Error in getCustomerById:', error);
      return null;
    }
  }

  /**
   * Create new customer
   */
  static async createCustomer(customerData: Omit<Customer, 'id' | 'customerNumber' | 'createdAt' | 'updatedAt'>): Promise<Customer | null> {
    try {
      const customerNumber = await this.generateCustomerNumber();

      const newCustomerData = {
        customer_number: customerNumber,
        name: customerData.name,
        company_name: customerData.companyName,
        type: customerData.type,
        industry: customerData.industry,
        size: customerData.size,
        website: customerData.website,
        tax_id: customerData.taxId,
        registration_number: customerData.registrationNumber,
        founded: customerData.founded,
        employees: customerData.employees,
        annual_revenue: customerData.annualRevenue,
        communication: customerData.communication,
        financial: customerData.financial,
        sales_rep_id: customerData.salesInfo.salesRep.id,
        account_manager_id: customerData.salesInfo.accountManager?.id,
        territory: customerData.salesInfo.territory,
        segment: customerData.salesInfo.segment,
        source: customerData.salesInfo.source,
        referred_by: customerData.salesInfo.referredBy,
        status: customerData.status,
        priority: customerData.priority,
        tags: customerData.tags,
        custom_fields: customerData.customFields,
        social_media: customerData.socialMedia,
        created_by: customerData.createdBy,
        next_follow_up_date: customerData.nextFollowUpDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert(newCustomerData)
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        throw new Error('Failed to create customer');
      }

      // Create primary contact
      if (customerData.primaryContact) {
        await this.createCustomerContact(newCustomer.id, customerData.primaryContact);
      }

      // Create additional contacts
      if (customerData.additionalContacts && customerData.additionalContacts.length > 0) {
        for (const contact of customerData.additionalContacts) {
          await this.createCustomerContact(newCustomer.id, contact);
        }
      }

      // Create addresses
      if (customerData.addresses && customerData.addresses.length > 0) {
        for (const address of customerData.addresses) {
          await this.createCustomerAddress(newCustomer.id, address);
        }
      }

      return await this.getCustomerById(newCustomer.id);

    } catch (error) {
      console.error('Error in createCustomer:', error);
      return null;
    }
  }

  /**
   * Get leads with filtering and pagination
   */
  static async getLeads(
    filters: {
      status?: string;
      stage?: string;
      assignedTo?: string;
      source?: string;
      search?: string;
    } = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ leads: Lead[]; total: number; hasMore: boolean }> {
    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          assigned_users:employees!assigned_to(id, first_name, last_name, email)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.stage) {
        query = query.eq('stage', filters.stage);
      }
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters.source) {
        query = query.eq('source', filters.source);
      }
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,company.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data: leads, error, count } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        return { leads: [], total: 0, hasMore: false };
      }

      const transformedLeads: Lead[] = (leads || []).map(this.transformLeadData);

      return {
        leads: transformedLeads,
        total: count || 0,
        hasMore: (count || 0) > offset + pageSize
      };

    } catch (error) {
      console.error('Error in getLeads:', error);
      return { leads: [], total: 0, hasMore: false };
    }
  }

  /**
   * Create new lead
   */
  static async createLead(leadData: Omit<Lead, 'id' | 'leadNumber' | 'createdAt' | 'updatedAt'>): Promise<Lead | null> {
    try {
      const leadNumber = await this.generateLeadNumber();

      const newLeadData = {
        lead_number: leadNumber,
        source: leadData.source,
        campaign: leadData.campaign,
        first_name: leadData.contact.firstName,
        last_name: leadData.contact.lastName,
        email: leadData.contact.email,
        phone: leadData.contact.phone,
        company: leadData.contact.company,
        position: leadData.contact.position,
        qualification: leadData.qualification,
        score: leadData.score,
        status: leadData.status,
        stage: leadData.stage,
        assigned_to: leadData.assignedTo.id,
        notes: leadData.notes,
        tags: leadData.tags,
        custom_fields: leadData.customFields,
        next_follow_up_date: leadData.nextFollowUpDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newLead, error } = await supabase
        .from('leads')
        .insert(newLeadData)
        .select()
        .single();

      if (error) {
        console.error('Error creating lead:', error);
        throw new Error('Failed to create lead');
      }

      return await this.getLeadById(newLead.id);

    } catch (error) {
      console.error('Error in createLead:', error);
      return null;
    }
  }

  /**
   * Convert lead to customer
   */
  static async convertLeadToCustomer(leadId: string, customerData: Partial<Customer>): Promise<Customer | null> {
    try {
      const lead = await this.getLeadById(leadId);
      if (!lead) {
        throw new Error('Lead not found');
      }

      // Create customer from lead
      const newCustomerData: Omit<Customer, 'id' | 'customerNumber' | 'createdAt' | 'updatedAt'> = {
        name: `${lead.contact.firstName} ${lead.contact.lastName}`,
        companyName: lead.contact.company,
        type: lead.contact.company ? 'business' : 'individual',
        primaryContact: {
          id: '', // Will be generated
          title: 'mr',
          firstName: lead.contact.firstName,
          lastName: lead.contact.lastName,
          email: lead.contact.email,
          phone: lead.contact.phone || '',
          position: lead.contact.position,
          role: 'primary',
          isPrimary: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        additionalContacts: [],
        addresses: [],
        communication: {
          preferredMethod: 'email',
          language: 'en',
          timezone: 'UTC',
          allowMarketing: true,
          allowSMS: false,
          doNotCall: false
        },
        financial: {
          creditLimit: 0,
          creditUsed: 0,
          paymentTerms: 'net_30',
          currency: 'KES',
          riskRating: 'low'
        },
        salesInfo: {
          salesRep: lead.assignedTo,
          territory: '',
          segment: 'new',
          source: lead.source,
          referredBy: ''
        },
        status: 'active',
        priority: 'normal',
        tags: lead.tags,
        customFields: lead.customFields,
        createdBy: '',
        totalOrders: 0,
        totalSalesValue: 0,
        averageOrderValue: 0,
        lifetimeValue: 0,
        ...customerData
      };

      const customer = await this.createCustomer(newCustomerData);

      if (customer) {
        // Update lead status to converted
        await supabase
          .from('leads')
          .update({
            status: 'converted',
            converted_to_customer_id: customer.id,
            converted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', leadId);
      }

      return customer;

    } catch (error) {
      console.error('Error in convertLeadToCustomer:', error);
      return null;
    }
  }

  /**
   * Get opportunities with filtering and pagination
   */
  static async getOpportunities(
    filters: {
      customerId?: string;
      stage?: string;
      salesRep?: string;
      status?: string;
      search?: string;
    } = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ opportunities: Opportunity[]; total: number; hasMore: boolean }> {
    try {
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          customers(id, name, company_name),
          leads(id, first_name, last_name, company),
          opportunity_products(*),
          sales_reps:employees!sales_rep_id(id, first_name, last_name, email)
        `, { count: 'exact' });

      // Apply filters
      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters.stage) {
        query = query.eq('stage', filters.stage);
      }
      if (filters.salesRep) {
        query = query.eq('sales_rep_id', filters.salesRep);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data: opportunities, error, count } = await query;

      if (error) {
        console.error('Error fetching opportunities:', error);
        return { opportunities: [], total: 0, hasMore: false };
      }

      const transformedOpportunities: Opportunity[] = (opportunities || []).map(this.transformOpportunityData);

      return {
        opportunities: transformedOpportunities,
        total: count || 0,
        hasMore: (count || 0) > offset + pageSize
      };

    } catch (error) {
      console.error('Error in getOpportunities:', error);
      return { opportunities: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get activities with filtering and pagination
   */
  static async getActivities(
    filters: {
      relatedTo?: string;
      type?: string;
      assignedTo?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ activities: Activity[]; total: number; hasMore: boolean }> {
    try {
      let query = supabase
        .from('activities')
        .select(`
          *,
          assigned_users:employees!assigned_to(id, first_name, last_name, email),
          activity_participants(*)
        `, { count: 'exact' });

      // Apply filters
      if (filters.relatedTo) {
        query = query.eq('related_to_id', filters.relatedTo);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.dateFrom) {
        query = query.gte('scheduled_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('scheduled_at', filters.dateTo);
      }

      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query
        .order('scheduled_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data: activities, error, count } = await query;

      if (error) {
        console.error('Error fetching activities:', error);
        return { activities: [], total: 0, hasMore: false };
      }

      const transformedActivities: Activity[] = (activities || []).map(this.transformActivityData);

      return {
        activities: transformedActivities,
        total: count || 0,
        hasMore: (count || 0) > offset + pageSize
      };

    } catch (error) {
      console.error('Error in getActivities:', error);
      return { activities: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get support tickets with filtering and pagination
   */
  static async getSupportTickets(
    filters: {
      customerId?: string;
      status?: string;
      priority?: string;
      assignedTo?: string;
      type?: string;
      search?: string;
    } = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ tickets: SupportTicket[]; total: number; hasMore: boolean }> {
    try {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          customers(id, name, company_name),
          customer_contacts(id, first_name, last_name, email),
          assigned_agents:employees!assigned_to(id, first_name, last_name, email, team)
        `, { count: 'exact' });

      // Apply filters
      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data: tickets, error, count } = await query;

      if (error) {
        console.error('Error fetching support tickets:', error);
        return { tickets: [], total: 0, hasMore: false };
      }

      const transformedTickets: SupportTicket[] = (tickets || []).map(this.transformSupportTicketData);

      return {
        tickets: transformedTickets,
        total: count || 0,
        hasMore: (count || 0) > offset + pageSize
      };

    } catch (error) {
      console.error('Error in getSupportTickets:', error);
      return { tickets: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get CRM dashboard metrics
   */
  static async getCRMDashboardMetrics(period: string = 'month'): Promise<CRMDashboardMetrics> {
    try {
      const currentDate = new Date();
      let startDate: Date;
      let previousStartDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          previousStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
          break;
        case 'quarter':
          const quarter = Math.floor(currentDate.getMonth() / 3);
          startDate = new Date(currentDate.getFullYear(), quarter * 3, 1);
          previousStartDate = new Date(currentDate.getFullYear(), (quarter - 1) * 3, 1);
          break;
        default:
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          previousStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      }

      // Get customer metrics
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      const { count: newCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      const { count: activeCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get lead metrics
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      const { count: newLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      const { count: qualifiedLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'qualified');

      // Get opportunity metrics
      const { count: totalOpportunities } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true });

      const { count: openOpportunities } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      const { data: opportunityValues } = await supabase
        .from('opportunities')
        .select('value')
        .eq('status', 'open');

      const opportunitiesValue = opportunityValues?.reduce((sum, opp) => sum + (opp.value || 0), 0) || 0;

      // Get activity metrics
      const { count: totalActivities } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      const { count: overdueActivities } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .lt('scheduled_at', new Date().toISOString())
        .neq('status', 'completed');

      // Get support metrics
      const { count: openTickets } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']);

      // Get recent activities
      const { data: recentActivitiesData } = await supabase
        .from('activities')
        .select(`
          *,
          assigned_users:employees!assigned_to(id, first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const recentActivities = (recentActivitiesData || []).map(this.transformActivityData);

      // Get upcoming activities
      const { data: upcomingActivitiesData } = await supabase
        .from('activities')
        .select(`
          *,
          assigned_users:employees!assigned_to(id, first_name, last_name, email)
        `)
        .gte('scheduled_at', new Date().toISOString())
        .eq('status', 'planned')
        .order('scheduled_at', { ascending: true })
        .limit(5);

      const upcomingActivities = (upcomingActivitiesData || []).map(this.transformActivityData);

      return {
        totalCustomers: totalCustomers || 0,
        newCustomers: newCustomers || 0,
        activeCustomers: activeCustomers || 0,
        customerGrowthRate: 0, // Would require previous period calculation
        totalLeads: totalLeads || 0,
        newLeads: newLeads || 0,
        qualifiedLeads: qualifiedLeads || 0,
        leadConversionRate: 0, // Would require conversion calculation
        totalOpportunities: totalOpportunities || 0,
        openOpportunities: openOpportunities || 0,
        opportunitiesValue,
        averageDealSize: openOpportunities > 0 ? opportunitiesValue / openOpportunities : 0,
        winRate: 0, // Would require won/lost calculation
        salesCycleLength: 0, // Would require cycle time calculation
        totalRevenue: 0, // Would require sales order integration
        customerLifetimeValue: 0, // Would require historical calculation
        customerRetentionRate: 0, // Would require retention calculation
        churnRate: 0, // Would require churn calculation
        totalActivities: totalActivities || 0,
        overdueActivities: overdueActivities || 0,
        openTickets: openTickets || 0,
        averageResponseTime: 0, // Would require response time calculation
        customerSatisfaction: 0, // Would require satisfaction score calculation
        topCustomers: [], // Would require revenue calculation
        salesByRep: [], // Would require sales rep aggregation
        leadSources: [], // Would require source aggregation
        recentActivities,
        upcomingActivities
      };

    } catch (error) {
      console.error('Error getting CRM dashboard metrics:', error);
      return {
        totalCustomers: 0,
        newCustomers: 0,
        activeCustomers: 0,
        customerGrowthRate: 0,
        totalLeads: 0,
        newLeads: 0,
        qualifiedLeads: 0,
        leadConversionRate: 0,
        totalOpportunities: 0,
        openOpportunities: 0,
        opportunitiesValue: 0,
        averageDealSize: 0,
        winRate: 0,
        salesCycleLength: 0,
        totalRevenue: 0,
        customerLifetimeValue: 0,
        customerRetentionRate: 0,
        churnRate: 0,
        totalActivities: 0,
        overdueActivities: 0,
        openTickets: 0,
        averageResponseTime: 0,
        customerSatisfaction: 0,
        topCustomers: [],
        salesByRep: [],
        leadSources: [],
        recentActivities: [],
        upcomingActivities: []
      };
    }
  }

  // Helper methods

  /**
   * Get lead by ID
   */
  private static async getLeadById(id: string): Promise<Lead | null> {
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .select(`
          *,
          assigned_users:employees!assigned_to(id, first_name, last_name, email)
        `)
        .eq('id', id)
        .single();

      if (error || !lead) {
        console.error('Error fetching lead by ID:', error);
        return null;
      }

      return this.transformLeadData(lead);

    } catch (error) {
      console.error('Error in getLeadById:', error);
      return null;
    }
  }

  /**
   * Create customer contact
   */
  private static async createCustomerContact(customerId: string, contact: Omit<ContactPerson, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const contactData = {
        customer_id: customerId,
        title: contact.title,
        first_name: contact.firstName,
        last_name: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        mobile: contact.mobile,
        position: contact.position,
        department: contact.department,
        role: contact.role,
        is_primary: contact.isPrimary,
        birthday: contact.birthday,
        notes: contact.notes,
        social_media: contact.socialMedia,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await supabase
        .from('customer_contacts')
        .insert(contactData);

    } catch (error) {
      console.error('Error creating customer contact:', error);
    }
  }

  /**
   * Create customer address
   */
  private static async createCustomerAddress(customerId: string, address: Omit<CustomerAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const addressData = {
        customer_id: customerId,
        type: address.type,
        label: address.label,
        street: address.street,
        street2: address.street2,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country,
        coordinates: address.coordinates,
        is_primary: address.isPrimary,
        is_active: address.isActive,
        delivery_instructions: address.deliveryInstructions,
        access_code: address.accessCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await supabase
        .from('customer_addresses')
        .insert(addressData);

    } catch (error) {
      console.error('Error creating customer address:', error);
    }
  }

  /**
   * Generate customer number
   */
  private static async generateCustomerNumber(): Promise<string> {
    try {
      const { count } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      const sequence = (count || 0) + 1;
      return `CUST-${new Date().getFullYear()}-${sequence.toString().padStart(6, '0')}`;

    } catch (error) {
      console.error('Error generating customer number:', error);
      return `CUST-${Date.now()}`;
    }
  }

  /**
   * Generate lead number
   */
  private static async generateLeadNumber(): Promise<string> {
    try {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      const sequence = (count || 0) + 1;
      return `LEAD-${new Date().getFullYear()}-${sequence.toString().padStart(6, '0')}`;

    } catch (error) {
      console.error('Error generating lead number:', error);
      return `LEAD-${Date.now()}`;
    }
  }

  // Data transformation methods

  private static transformCustomerData(data: any): Customer {
    const primaryContact = (data.customer_contacts || []).find((c: any) => c.is_primary) || 
                          (data.customer_contacts && data.customer_contacts[0]);
    
    const additionalContacts = (data.customer_contacts || []).filter((c: any) => !c.is_primary);

    return {
      id: data.id,
      customerNumber: data.customer_number,
      name: data.name,
      companyName: data.company_name,
      type: data.type,
      industry: data.industry,
      size: data.size,
      website: data.website,
      taxId: data.tax_id,
      registrationNumber: data.registration_number,
      founded: data.founded,
      employees: data.employees,
      annualRevenue: data.annual_revenue,
      primaryContact: primaryContact ? this.transformContactData(primaryContact) : {
        id: '',
        title: 'mr',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'primary',
        isPrimary: true,
        createdAt: '',
        updatedAt: ''
      },
      additionalContacts: additionalContacts.map(this.transformContactData),
      addresses: (data.customer_addresses || []).map(this.transformAddressData),
      communication: data.communication || {
        preferredMethod: 'email',
        language: 'en',
        timezone: 'UTC',
        allowMarketing: true,
        allowSMS: false,
        doNotCall: false
      },
      financial: data.financial || {
        creditLimit: 0,
        creditUsed: 0,
        paymentTerms: 'net_30',
        currency: 'KES',
        riskRating: 'low'
      },
      salesInfo: {
        salesRep: {
          id: data.sales_reps?.id || data.sales_rep_id || '',
          name: data.sales_reps ? `${data.sales_reps.first_name} ${data.sales_reps.last_name}` : '',
          email: data.sales_reps?.email || '',
          phone: data.sales_reps?.phone
        },
        accountManager: data.account_managers ? {
          id: data.account_managers.id,
          name: `${data.account_managers.first_name} ${data.account_managers.last_name}`,
          email: data.account_managers.email,
          phone: data.account_managers.phone
        } : undefined,
        territory: data.territory || '',
        segment: data.segment || 'new',
        source: data.source || 'website',
        referredBy: data.referred_by
      },
      status: data.status,
      priority: data.priority,
      tags: data.tags || [],
      customFields: data.custom_fields || {},
      socialMedia: data.social_media,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      lastContactDate: data.last_contact_date,
      nextFollowUpDate: data.next_follow_up_date,
      totalOrders: data.total_orders || 0,
      totalSalesValue: data.total_sales_value || 0,
      averageOrderValue: data.average_order_value || 0,
      lastOrderDate: data.last_order_date,
      lifetimeValue: data.lifetime_value || 0
    };
  }

  private static transformContactData(data: any): ContactPerson {
    return {
      id: data.id,
      title: data.title,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      mobile: data.mobile,
      position: data.position,
      department: data.department,
      role: data.role,
      isPrimary: data.is_primary,
      birthday: data.birthday,
      notes: data.notes,
      socialMedia: data.social_media,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private static transformAddressData(data: any): CustomerAddress {
    return {
      id: data.id,
      type: data.type,
      label: data.label,
      street: data.street,
      street2: data.street2,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: data.country,
      coordinates: data.coordinates,
      isPrimary: data.is_primary,
      isActive: data.is_active,
      deliveryInstructions: data.delivery_instructions,
      accessCode: data.access_code,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private static transformLeadData(data: any): Lead {
    return {
      id: data.id,
      leadNumber: data.lead_number,
      source: data.source,
      campaign: data.campaign,
      contact: {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        position: data.position
      },
      qualification: data.qualification || {
        authority: 'unknown',
        need: 'unknown',
        timeline: 'unknown'
      },
      score: data.score || 0,
      status: data.status,
      stage: data.stage,
      assignedTo: {
        id: data.assigned_users?.id || data.assigned_to,
        name: data.assigned_users ? `${data.assigned_users.first_name} ${data.assigned_users.last_name}` : '',
        email: data.assigned_users?.email || ''
      },
      notes: data.notes,
      tags: data.tags || [],
      customFields: data.custom_fields || {},
      convertedToCustomerId: data.converted_to_customer_id,
      convertedAt: data.converted_at,
      lostReason: data.lost_reason,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastContactDate: data.last_contact_date,
      nextFollowUpDate: data.next_follow_up_date
    };
  }

  private static transformOpportunityData(data: any): Opportunity {
    return {
      id: data.id,
      opportunityNumber: data.opportunity_number,
      customerId: data.customer_id,
      leadId: data.lead_id,
      name: data.name,
      description: data.description,
      value: data.value || 0,
      currency: data.currency || 'KES',
      probability: data.probability || 0,
      stage: data.stage,
      source: data.source,
      type: data.type,
      priority: data.priority,
      expectedCloseDate: data.expected_close_date,
      actualCloseDate: data.actual_close_date,
      salesRep: {
        id: data.sales_reps?.id || data.sales_rep_id,
        name: data.sales_reps ? `${data.sales_reps.first_name} ${data.sales_reps.last_name}` : '',
        email: data.sales_reps?.email || ''
      },
      competitors: data.competitors || [],
      products: (data.opportunity_products || []).map((p: any) => ({
        id: p.id,
        productId: p.product_id,
        productName: p.product_name,
        quantity: p.quantity,
        unitPrice: p.unit_price,
        discount: p.discount,
        total: p.total,
        notes: p.notes
      })),
      status: data.status,
      lostReason: data.lost_reason,
      winReason: data.win_reason,
      notes: data.notes,
      tags: data.tags || [],
      customFields: data.custom_fields || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      convertedToOrderId: data.converted_to_order_id
    };
  }

  private static transformActivityData(data: any): Activity {
    return {
      id: data.id,
      type: data.type,
      subtype: data.subtype,
      subject: data.subject,
      description: data.description,
      relatedTo: {
        type: data.related_to_type,
        id: data.related_to_id,
        name: data.related_to_name
      },
      assignedTo: {
        id: data.assigned_users?.id || data.assigned_to,
        name: data.assigned_users ? `${data.assigned_users.first_name} ${data.assigned_users.last_name}` : '',
        email: data.assigned_users?.email || ''
      },
      participants: (data.activity_participants || []).map((p: any) => ({
        id: p.participant_id,
        name: p.participant_name,
        email: p.participant_email,
        type: p.participant_type
      })),
      status: data.status,
      priority: data.priority,
      scheduledAt: data.scheduled_at,
      startTime: data.start_time,
      endTime: data.end_time,
      duration: data.duration,
      location: data.location,
      meetingLink: data.meeting_link,
      outcome: data.outcome,
      nextAction: data.next_action,
      attachments: data.attachments || [],
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      completedAt: data.completed_at,
      completedBy: data.completed_by
    };
  }

  private static transformSupportTicketData(data: any): SupportTicket {
    return {
      id: data.id,
      ticketNumber: data.ticket_number,
      customerId: data.customer_id,
      customer: data.customers ? {
        id: data.customers.id,
        name: data.customers.name,
        companyName: data.customers.company_name
      } as any : undefined,
      contactId: data.contact_id,
      contact: data.customer_contacts ? this.transformContactData(data.customer_contacts) : undefined,
      subject: data.subject,
      description: data.description,
      type: data.type,
      category: data.category,
      subcategory: data.subcategory,
      priority: data.priority,
      status: data.status,
      assignedTo: data.assigned_agents ? {
        id: data.assigned_agents.id,
        name: `${data.assigned_agents.first_name} ${data.assigned_agents.last_name}`,
        email: data.assigned_agents.email,
        team: data.assigned_agents.team
      } : undefined,
      channel: data.channel,
      source: data.source,
      tags: data.tags || [],
      customFields: data.custom_fields || {},
      slaTarget: data.sla_target,
      slaBreached: data.sla_breached || false,
      resolutionTime: data.resolution_time,
      satisfactionRating: data.satisfaction_rating,
      satisfactionComment: data.satisfaction_comment,
      attachments: data.attachments || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      resolvedAt: data.resolved_at,
      closedAt: data.closed_at,
      firstResponseAt: data.first_response_at
    };
  }
}
