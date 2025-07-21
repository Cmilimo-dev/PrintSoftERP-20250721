export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role_id: string;
  department_id?: string;
  status: 'active' | 'inactive' | 'pending';
  last_login?: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  phone?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  manager_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
}

// Permission constants
export const PERMISSIONS = {
  // User management
  USERS_READ: 'users.read',
  USERS_WRITE: 'users.write',
  USERS_DELETE: 'users.delete',
  
  // Role management
  ROLES_READ: 'roles.read',
  ROLES_WRITE: 'roles.write',
  ROLES_DELETE: 'roles.delete',
  
  // Customer management
  CUSTOMERS_READ: 'customers.read',
  CUSTOMERS_WRITE: 'customers.write',
  CUSTOMERS_DELETE: 'customers.delete',
  
  // Sales management
  SALES_READ: 'sales.read',
  SALES_WRITE: 'sales.write',
  SALES_DELETE: 'sales.delete',
  
  // Financial management
  FINANCIAL_READ: 'financial.read',
  FINANCIAL_WRITE: 'financial.write',
  FINANCIAL_DELETE: 'financial.delete',
  
  // Inventory management
  INVENTORY_READ: 'inventory.read',
  INVENTORY_WRITE: 'inventory.write',
  INVENTORY_DELETE: 'inventory.delete',
  
  // Logistics management
  LOGISTICS_READ: 'logistics.read',
  LOGISTICS_WRITE: 'logistics.write',
  LOGISTICS_DELETE: 'logistics.delete',
  
  // Reports and analytics
  REPORTS_READ: 'reports.read',
  REPORTS_WRITE: 'reports.write',
  ANALYTICS_READ: 'analytics.read',
  ANALYTICS_WRITE: 'analytics.write',
  
  // System settings
  SETTINGS_READ: 'settings.read',
  SETTINGS_WRITE: 'settings.write',
  
  // System administration
  SYSTEM_ADMIN: 'system.admin',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Default roles
export const DEFAULT_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SALES_MANAGER: 'sales_manager',
  ACCOUNTANT: 'accountant',
  INVENTORY_CLERK: 'inventory_clerk',
  USER: 'user',
} as const;

export interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  role_id: string;
  department_id?: string;
  phone?: string;
  send_invitation?: boolean;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  role_id?: string;
  department_id?: string;
  status?: 'active' | 'inactive' | 'pending';
  phone?: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permission_ids: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permission_ids?: string[];
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  parent_id?: string;
  manager_id?: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  parent_id?: string;
  manager_id?: string;
  is_active?: boolean;
}
