// import { supabase } from '@/integrations/supabase/client'; // Temporarily disabled
import {
  UserProfile,
  Role,
  Permission,
  Department,
  CreateUserRequest,
  UpdateUserRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  PERMISSIONS,
  DEFAULT_ROLES,
} from '@/types/userTypes';

// Mock data for development until backend tables are created
const mockUsers: UserProfile[] = [
  {
    id: '1',
    email: 'john.doe@company.com',
    first_name: 'John',
    last_name: 'Doe',
    full_name: 'John Doe',
    role_id: '1',
    department_id: '1',
    status: 'active',
    last_login: '2024-06-28T10:30:00Z',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-06-28T10:30:00Z',
    phone: '+1234567890',
  },
  {
    id: '2',
    email: 'jane.smith@company.com',
    first_name: 'Jane',
    last_name: 'Smith',
    full_name: 'Jane Smith',
    role_id: '2',
    department_id: '2',
    status: 'active',
    last_login: '2024-06-28T14:15:00Z',
    created_at: '2024-02-10T11:30:00Z',
    updated_at: '2024-06-28T14:15:00Z',
    phone: '+1234567891',
  },
  {
    id: '3',
    email: 'mike.johnson@company.com',
    first_name: 'Mike',
    last_name: 'Johnson',
    full_name: 'Mike Johnson',
    role_id: '3',
    department_id: '3',
    status: 'active',
    last_login: '2024-06-27T16:45:00Z',
    created_at: '2024-03-05T10:15:00Z',
    updated_at: '2024-06-27T16:45:00Z',
    phone: '+1234567892',
  },
  {
    id: '4',
    email: 'sarah.wilson@company.com',
    first_name: 'Sarah',
    last_name: 'Wilson',
    full_name: 'Sarah Wilson',
    role_id: '4',
    department_id: '4',
    status: 'inactive',
    last_login: '2024-06-20T12:00:00Z',
    created_at: '2024-04-12T13:20:00Z',
    updated_at: '2024-06-20T12:00:00Z',
    phone: '+1234567893',
  },
];

const mockPermissions: Permission[] = [
  { id: '1', name: 'Users Read', resource: 'users', action: 'read', description: 'View users' },
  { id: '2', name: 'Users Write', resource: 'users', action: 'write', description: 'Create and edit users' },
  { id: '3', name: 'Users Delete', resource: 'users', action: 'delete', description: 'Delete users' },
  { id: '4', name: 'Roles Read', resource: 'roles', action: 'read', description: 'View roles' },
  { id: '5', name: 'Roles Write', resource: 'roles', action: 'write', description: 'Create and edit roles' },
  { id: '6', name: 'Roles Delete', resource: 'roles', action: 'delete', description: 'Delete roles' },
  { id: '7', name: 'Customers Read', resource: 'customers', action: 'read', description: 'View customers' },
  { id: '8', name: 'Customers Write', resource: 'customers', action: 'write', description: 'Create and edit customers' },
  { id: '9', name: 'Customers Delete', resource: 'customers', action: 'delete', description: 'Delete customers' },
  { id: '10', name: 'Sales Read', resource: 'sales', action: 'read', description: 'View sales data' },
  { id: '11', name: 'Sales Write', resource: 'sales', action: 'write', description: 'Create and edit sales' },
  { id: '12', name: 'Sales Delete', resource: 'sales', action: 'delete', description: 'Delete sales' },
  { id: '13', name: 'Financial Read', resource: 'financial', action: 'read', description: 'View financial data' },
  { id: '14', name: 'Financial Write', resource: 'financial', action: 'write', description: 'Create and edit financial records' },
  { id: '15', name: 'Financial Delete', resource: 'financial', action: 'delete', description: 'Delete financial records' },
  { id: '16', name: 'Inventory Read', resource: 'inventory', action: 'read', description: 'View inventory' },
  { id: '17', name: 'Inventory Write', resource: 'inventory', action: 'write', description: 'Create and edit inventory' },
  { id: '18', name: 'Inventory Delete', resource: 'inventory', action: 'delete', description: 'Delete inventory records' },
  { id: '19', name: 'Reports Read', resource: 'reports', action: 'read', description: 'View reports' },
  { id: '20', name: 'Reports Write', resource: 'reports', action: 'write', description: 'Create and edit reports' },
  { id: '21', name: 'Analytics Read', resource: 'analytics', action: 'read', description: 'View analytics' },
  { id: '22', name: 'Analytics Write', resource: 'analytics', action: 'write', description: 'Create and edit analytics' },
  { id: '23', name: 'Settings Read', resource: 'settings', action: 'read', description: 'View settings' },
  { id: '24', name: 'Settings Write', resource: 'settings', action: 'write', description: 'Modify settings' },
  { id: '25', name: 'System Admin', resource: 'system', action: 'admin', description: 'Full system administration' },
];

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: mockPermissions,
    is_system_role: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Sales Manager',
    description: 'Manage sales operations and customer relationships',
    permissions: mockPermissions.filter(p => 
      ['sales', 'customers', 'reports'].includes(p.resource) || 
      (p.resource === 'users' && p.action === 'read')
    ),
    is_system_role: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Accountant',
    description: 'Manage financial transactions and reporting',
    permissions: mockPermissions.filter(p => 
      ['financial', 'reports', 'analytics'].includes(p.resource)
    ),
    is_system_role: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Inventory Clerk',
    description: 'Manage inventory and stock operations',
    permissions: mockPermissions.filter(p => 
      ['inventory', 'reports'].includes(p.resource) && p.action !== 'delete'
    ),
    is_system_role: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Information Technology',
    description: 'IT support and development',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Sales',
    description: 'Sales and customer relationship management',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Finance',
    description: 'Financial management and accounting',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Operations',
    description: 'Operations and logistics management',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export class UserManagementService {
  // User management methods
  static async getUsers(): Promise<UserProfile[]> {
    try {
      // TODO: Replace with API call to backend once user endpoints are implemented
      // For now, return mock data
      console.log('Using mock users data');
      return mockUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      return mockUsers;
    }
  }

  static async getUserById(id: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          roles:role_id(id, name, description),
          departments:department_id(id, name)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        // Fallback to mock data
        return mockUsers.find(user => user.id === id) || null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      // Fallback to mock data
      return mockUsers.find(user => user.id === id) || null;
    }
  }

  static async createUser(userData: CreateUserRequest): Promise<UserProfile> {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        email_confirm: true,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name,
        }
      });
      
      if (authError || !authData.user) {
        console.error('Auth user creation error:', authError);
        // Fallback to mock creation
        const newUser: UserProfile = {
          id: Math.random().toString(36).substr(2, 9),
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          full_name: `${userData.first_name} ${userData.last_name}`,
          role_id: userData.role_id,
          department_id: userData.department_id,
          status: 'pending',
          phone: userData.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockUsers.push(newUser);
        return newUser;
      }
      
      // Create or update the user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: authData.user.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role_id: userData.role_id,
          department_id: userData.department_id,
          phone: userData.phone,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Profile creation error:', error);
        throw error;
      }
      
      if (userData.send_invitation) {
        // TODO: Send invitation email via Supabase
        console.log('Invitation email would be sent to:', userData.email);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(id: string, userData: UpdateUserRequest): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(userData)
        .eq('id', id)
        .select(`
          *,
          roles:role_id(id, name, description),
          departments:department_id(id, name)
        `)
        .single();
      
      if (error) {
        console.error('Supabase update error:', error);
        // Fallback to mock update
        const userIndex = mockUsers.findIndex(user => user.id === id);
        if (userIndex === -1) {
          throw new Error('User not found');
        }
        const updatedUser = {
          ...mockUsers[userIndex],
          ...userData,
          updated_at: new Date().toISOString(),
        };
        if (userData.first_name || userData.last_name) {
          updatedUser.full_name = `${updatedUser.first_name} ${updatedUser.last_name}`;
        }
        mockUsers[userIndex] = updatedUser;
        return updatedUser;
      }
      
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      // Delete from user_profiles (auth user will be cascade deleted)
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Supabase delete error:', error);
        // Fallback to mock delete
        const userIndex = mockUsers.findIndex(user => user.id === id);
        if (userIndex === -1) {
          throw new Error('User not found');
        }
        mockUsers.splice(userIndex, 1);
        return;
      }
      
      // Also delete the auth user
      await supabase.auth.admin.deleteUser(id);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Role management methods
  static async getRoles(): Promise<Role[]> {
    try {
      // TODO: Replace with API call to backend once role endpoints are implemented
      // For now, return mock data
      console.log('Using mock roles data');
      return mockRoles;
    } catch (error) {
      console.error('Error fetching roles:', error);
      return mockRoles;
    }
  }

  static async getRoleById(id: string): Promise<Role | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockRoles.find(role => role.id === id) || null;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  static async createRole(roleData: CreateRoleRequest): Promise<Role> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const permissions = mockPermissions.filter(p => 
        roleData.permission_ids.includes(p.id)
      );
      
      const newRole: Role = {
        id: Math.random().toString(36).substr(2, 9),
        name: roleData.name,
        description: roleData.description,
        permissions,
        is_system_role: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      mockRoles.push(newRole);
      return newRole;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  static async updateRole(id: string, roleData: UpdateRoleRequest): Promise<Role> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const roleIndex = mockRoles.findIndex(role => role.id === id);
      if (roleIndex === -1) {
        throw new Error('Role not found');
      }

      const currentRole = mockRoles[roleIndex];
      let permissions = currentRole.permissions;

      if (roleData.permission_ids) {
        permissions = mockPermissions.filter(p => 
          roleData.permission_ids!.includes(p.id)
        );
      }

      const updatedRole = {
        ...currentRole,
        name: roleData.name || currentRole.name,
        description: roleData.description || currentRole.description,
        permissions,
        updated_at: new Date().toISOString(),
      };

      mockRoles[roleIndex] = updatedRole;
      return updatedRole;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  static async deleteRole(id: string): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const roleIndex = mockRoles.findIndex(role => role.id === id);
      if (roleIndex === -1) {
        throw new Error('Role not found');
      }

      const role = mockRoles[roleIndex];
      if (role.is_system_role) {
        throw new Error('Cannot delete system role');
      }

      mockRoles.splice(roleIndex, 1);
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  // Permission management methods
  static async getPermissions(): Promise<Permission[]> {
    try {
      // TODO: Replace with API call to backend once permission endpoints are implemented
      // For now, return mock data
      console.log('Using mock permissions data');
      return mockPermissions;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return mockPermissions;
    }
  }

  // Department management methods
  static async getDepartments(): Promise<Department[]> {
    try {
      // TODO: Replace with API call to backend once department endpoints are implemented
      // For now, return mock data
      console.log('Using mock departments data');
      return mockDepartments;
    } catch (error) {
      console.error('Error fetching departments:', error);
      return mockDepartments;
    }
  }

  static async createDepartment(departmentData: CreateDepartmentRequest): Promise<Department> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: departmentData.name,
          description: departmentData.description,
          parent_id: departmentData.parent_id || null,
          manager_id: departmentData.manager_id || null,
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase department creation error:', error);
        // Fallback to mock
        const newDepartment: Department = {
          id: Math.random().toString(36).substr(2, 9),
          name: departmentData.name,
          description: departmentData.description,
          parent_id: departmentData.parent_id,
          manager_id: departmentData.manager_id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockDepartments.push(newDepartment);
        return newDepartment;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }

  static async updateDepartment(id: string, departmentData: UpdateDepartmentRequest): Promise<Department> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .update(departmentData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase department update error:', error);
        // Fallback to mock
        const departmentIndex = mockDepartments.findIndex(dept => dept.id === id);
        if (departmentIndex === -1) {
          throw new Error('Department not found');
        }
        const updatedDepartment = {
          ...mockDepartments[departmentIndex],
          ...departmentData,
          updated_at: new Date().toISOString(),
        };
        mockDepartments[departmentIndex] = updatedDepartment;
        return updatedDepartment;
      }
      
      return data;
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  }

  static async deleteDepartment(id: string): Promise<void> {
    try {
      // Check if department has users first
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('department_id', id);
      
      if (users && users.length > 0) {
        throw new Error('Cannot delete department with active users');
      }
      
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Supabase department delete error:', error);
        // Fallback to mock
        const departmentIndex = mockDepartments.findIndex(dept => dept.id === id);
        if (departmentIndex === -1) {
          throw new Error('Department not found');
        }
        const hasUsers = mockUsers.some(user => user.department_id === id);
        if (hasUsers) {
          throw new Error('Cannot delete department with active users');
        }
        mockDepartments.splice(departmentIndex, 1);
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  }
}
