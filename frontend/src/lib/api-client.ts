import { API_BASE_URL } from '@/config/api';

// API Client class to replace Supabase
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('access_token');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async signIn(email: string, password: string) {
    const result = await this.request<{
      user: any;
      access_token: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.token = result.access_token;
    localStorage.setItem('access_token', result.access_token);
    
    return {
      data: {
        user: result.user,
        session: { access_token: result.access_token }
      },
      error: null
    };
  }

  async signUp(email: string, password: string, userData: any = {}) {
    const result = await this.request<{
      user: any;
      access_token: string;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        password, 
        ...userData 
      }),
    });

    this.token = result.access_token;
    localStorage.setItem('access_token', result.access_token);
    
    return {
      data: {
        user: result.user,
        session: { access_token: result.access_token }
      },
      error: null
    };
  }

  async signOut() {
    this.token = null;
    localStorage.removeItem('access_token');
    return { error: null };
  }

  // Generic CRUD methods
  async select<T>(
    table: string,
    options: {
      select?: string;
      where?: Record<string, any>;
      order?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<T[]> {
    const params = new URLSearchParams();
    
    if (options.select) params.append('select', options.select);
    if (options.order) params.append('order', options.order);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());

    // Add where conditions as query parameters
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'string' && value.startsWith('gte.')) {
            params.append(`${key}`, value);
          } else if (typeof value === 'string' && value.startsWith('lte.')) {
            params.append(`${key}`, value);
          } else if (typeof value === 'string' && value.startsWith('eq.')) {
            params.append(`${key}`, value);
          } else {
            params.append(`${key}`, `eq.${value}`);
          }
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/api/${table}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<T[]>(endpoint);
  }

  async insert<T>(table: string, data: any): Promise<T> {
    const result = await this.request<T>(`/api/${table}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  }

  async update<T>(table: string, id: string, data: any): Promise<T> {
    const result = await this.request<T>(`/api/${table}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result;
  }

  async delete(table: string, id: string): Promise<void> {
    await this.request(`/api/${table}/${id}`, {
      method: 'DELETE',
    });
  }

  // Specific methods for common operations
  async from(table: string) {
    return {
      select: (columns?: string) => ({
        eq: (column: string, value: any) => 
          this.select(table, { 
            select: columns, 
            where: { [column]: `eq.${value}` } 
          }),
        gte: (column: string, value: any) => 
          this.select(table, { 
            select: columns, 
            where: { [column]: `gte.${value}` } 
          }),
        lte: (column: string, value: any) => 
          this.select(table, { 
            select: columns, 
            where: { [column]: `lte.${value}` } 
          }),
        order: (column: string, options?: { ascending?: boolean }) => ({
          limit: (count: number) => ({
            offset: (start: number) => 
              this.select(table, {
                select: columns,
                order: `${column}.${options?.ascending ? 'asc' : 'desc'}`,
                limit: count,
                offset: start
              })
          })
        }),
        limit: (count: number) => 
          this.select(table, { select: columns, limit: count }),
        single: () => 
          this.select(table, { select: columns, limit: 1 }).then(results => results[0])
      }),
      insert: (data: any) => ({
        select: () => this.insert(table, data)
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => 
          this.update(table, value, data)
      }),
      delete: () => ({
        eq: (column: string, value: any) => 
          this.delete(table, value)
      })
    };
  }

  // Number generation service
  async generateNumber(documentType: string): Promise<string> {
    const result = await this.request<{ success: boolean, data: { number: string } }>(`/api/number-generation/generate-number/${documentType}`, {
      method: 'POST',
    });
    return result.data?.number || result.number || '';
  }

  // Number generation formats
  async getNumberGenerationFormats(): Promise<any> {
    const response = await this.request<{success: boolean, data: any}>('/api/settings/number-generation/formats', {
      method: 'GET',
    });
    return response.data || {};
  }

  // Number format preview
  async previewNumberFormat(documentType: string, settings: any): Promise<any> {
    const response = await this.request<{success: boolean, data: any}>(`/api/settings/number-generation/preview/${documentType}`, {
      method: 'POST',
      body: JSON.stringify(settings),
    });
    return response.data || {};
  }

  // Update all number formats
  async updateAllNumberFormats(settings: any): Promise<void> {
    await this.request('/api/settings/number-generation/formats/bulk-update', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Number generation settings
  async getNumberGenerationSettings(): Promise<any[]> {
    const response = await this.request<{success: boolean, data: any[]}>('/api/settings/number-generation', {
      method: 'GET',
    });
    return response.data || [];
  }

  async updateNumberGenerationSetting(documentType: string, updates: any): Promise<void> {
    await this.request('/api/settings/number-generation', {
      method: 'POST',
      body: JSON.stringify({
        document_type: documentType,
        ...updates
      }),
    });
  }

  // Health check
  async health() {
    return this.request('/health');
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export for compatibility with existing code
export const supabase = apiClient;
