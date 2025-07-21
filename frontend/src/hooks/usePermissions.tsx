import { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserManagementService } from '@/services/userManagementService';
import { Permission, Role, UserProfile, PermissionKey, PERMISSIONS } from '@/types/userTypes';

interface PermissionContextType {
  permissions: Permission[];
  userProfile: UserProfile | null;
  userRole: Role | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserPermissions = async () => {
    if (!user) {
      setPermissions([]);
      setUserProfile(null);
      setUserRole(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Create user profile from backend user data
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        first_name: user.first_name || 'User',
        last_name: user.last_name || '',
        full_name: `${user.first_name || 'User'} ${user.last_name || ''}`,
        role_id: user.role === 'Super Administrator' ? '1' : '2', // Map role to ID
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setUserProfile(userProfile);
      
      // Create role based on user's role
      const isAdminRole = user.role === 'admin' || user.role === 'super_admin';
      const role: Role = {
        id: isAdminRole ? '1' : '2',
        name: user.role || 'user',
        description: isAdminRole ? 'Administrator with all permissions' : 'Regular user',
        permissions: isAdminRole ? [{ id: '*', name: 'All Permissions', resource: '*', action: '*', description: 'All permissions' }] : [],
        is_system_role: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setUserRole(role);
      setPermissions(role.permissions);
      
    } catch (error) {
      console.error('Error loading user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserPermissions();
  }, [user]);

  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false;
    
    // Admin has all permissions
    if (userRole?.name === 'admin' || userRole?.name === 'super_admin' || userRole?.name === 'Super Administrator') return true;
    
    // Check for wildcard permissions
    if (permissions.some(p => p.resource === '*' && p.action === '*')) return true;
    
    // Check if user has the specific permission
    return permissions.some(p => `${p.resource}.${p.action}` === permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => hasPermission(permission));
  };

  const isAdmin = userRole?.name === 'admin' || userRole?.name === 'super_admin' || userRole?.name === 'Administrator' || userRole?.name === 'Super Administrator';
  const isSuperAdmin = userRole?.name === 'admin' || userRole?.name === 'super_admin' || userRole?.name === 'Super Administrator';

  const refreshPermissions = async () => {
    await loadUserPermissions();
  };

  const contextValue: PermissionContextType = {
    permissions,
    userProfile,
    userRole,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isSuperAdmin,
    refreshPermissions,
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

// Convenience hooks for common permission checks
export const useCanManageUsers = () => {
  const { hasPermission } = usePermissions();
  return {
    canView: hasPermission(PERMISSIONS.USERS_READ),
    canCreate: hasPermission(PERMISSIONS.USERS_WRITE),
    canEdit: hasPermission(PERMISSIONS.USERS_WRITE),
    canDelete: hasPermission(PERMISSIONS.USERS_DELETE),
  };
};

export const useCanManageRoles = () => {
  const { hasPermission } = usePermissions();
  return {
    canView: hasPermission(PERMISSIONS.ROLES_READ),
    canCreate: hasPermission(PERMISSIONS.ROLES_WRITE),
    canEdit: hasPermission(PERMISSIONS.ROLES_WRITE),
    canDelete: hasPermission(PERMISSIONS.ROLES_DELETE),
  };
};

export const useCanManageCustomers = () => {
  const { hasPermission } = usePermissions();
  return {
    canView: hasPermission(PERMISSIONS.CUSTOMERS_READ),
    canCreate: hasPermission(PERMISSIONS.CUSTOMERS_WRITE),
    canEdit: hasPermission(PERMISSIONS.CUSTOMERS_WRITE),
    canDelete: hasPermission(PERMISSIONS.CUSTOMERS_DELETE),
  };
};

export const useCanManageSales = () => {
  const { hasPermission } = usePermissions();
  return {
    canView: hasPermission(PERMISSIONS.SALES_READ),
    canCreate: hasPermission(PERMISSIONS.SALES_WRITE),
    canEdit: hasPermission(PERMISSIONS.SALES_WRITE),
    canDelete: hasPermission(PERMISSIONS.SALES_DELETE),
  };
};

export const useCanManageFinancial = () => {
  const { hasPermission } = usePermissions();
  return {
    canView: hasPermission(PERMISSIONS.FINANCIAL_READ),
    canCreate: hasPermission(PERMISSIONS.FINANCIAL_WRITE),
    canEdit: hasPermission(PERMISSIONS.FINANCIAL_WRITE),
    canDelete: hasPermission(PERMISSIONS.FINANCIAL_DELETE),
  };
};

export const useCanManageInventory = () => {
  const { hasPermission } = usePermissions();
  return {
    canView: hasPermission(PERMISSIONS.INVENTORY_READ),
    canCreate: hasPermission(PERMISSIONS.INVENTORY_WRITE),
    canEdit: hasPermission(PERMISSIONS.INVENTORY_WRITE),
    canDelete: hasPermission(PERMISSIONS.INVENTORY_DELETE),
  };
};

export const useCanViewReports = () => {
  const { hasPermission } = usePermissions();
  return {
    canView: hasPermission(PERMISSIONS.REPORTS_READ),
    canCreate: hasPermission(PERMISSIONS.REPORTS_WRITE),
  };
};

export const useCanViewAnalytics = () => {
  const { hasPermission } = usePermissions();
  return {
    canView: hasPermission(PERMISSIONS.ANALYTICS_READ),
    canCreate: hasPermission(PERMISSIONS.ANALYTICS_WRITE),
  };
};

export const useCanManageSettings = () => {
  const { hasPermission } = usePermissions();
  return {
    canView: hasPermission(PERMISSIONS.SETTINGS_READ),
    canEdit: hasPermission(PERMISSIONS.SETTINGS_WRITE),
  };
};
