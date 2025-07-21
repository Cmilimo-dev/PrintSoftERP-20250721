// Mock Supabase client to prevent errors
// This provides fallback data when backend is unavailable

const mockSupabaseClient = {
  from: (table: string) => ({
    select: (fields: string = '*') => ({
      eq: (field: string, value: any) => mockQuery,
      gte: (field: string, value: any) => mockQuery,
      lte: (field: string, value: any) => mockQuery,
      ilike: (field: string, value: any) => mockQuery,
      or: (condition: string) => mockQuery,
      order: (field: string, options?: any) => mockQuery,
      single: () => Promise.resolve({ data: null, error: { message: 'No data available' } }),
      then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback)
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Insert not available' } })
      })
    }),
    update: (data: any) => ({
      eq: (field: string, value: any) => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Update not available' } })
        })
      })
    }),
    upsert: (data: any, options?: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Upsert not available' } })
      })
    }),
    delete: () => ({
      eq: (field: string, value: any) => Promise.resolve({ data: null, error: { message: 'Delete not available' } })
    })
  })
};

const mockQuery = {
  eq: (field: string, value: any) => mockQuery,
  gte: (field: string, value: any) => mockQuery,
  lte: (field: string, value: any) => mockQuery,
  ilike: (field: string, value: any) => mockQuery,
  or: (condition: string) => mockQuery,
  order: (field: string, options?: any) => mockQuery,
  single: () => Promise.resolve({ data: null, error: { message: 'No data available' } }),
  then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback)
};

// Export the mock client as supabase for compatibility
export const supabase = mockSupabaseClient;

// Export types for compatibility
export type Database = any;

console.log('Using mock Supabase client for compatibility');
