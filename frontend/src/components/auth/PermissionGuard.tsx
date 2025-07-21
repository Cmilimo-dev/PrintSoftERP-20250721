import React, { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showFallback?: boolean;
  role?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback,
  showFallback = true,
  role,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, userRole, loading } = usePermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-muted-foreground">Loading permissions...</div>
      </div>
    );
  }

  // Check role-based access
  if (role && userRole?.name !== role) {
    if (!showFallback) return null;
    
    return fallback || (
      <Alert className="m-4">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Access denied. Required role: {role}
        </AlertDescription>
      </Alert>
    );
  }

  // Check permission-based access
  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  if (!hasAccess) {
    if (!showFallback) return null;
    
    return fallback || (
      <Alert className="m-4">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

// Convenient wrapper components for common use cases
export const AdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard role="Administrator" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const SuperAdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard role="Super Administrator" fallback={fallback}>
    {children}
  </PermissionGuard>
);

// Permission-specific guards
export const UserManagementGuard: React.FC<{ children: ReactNode; action?: 'read' | 'write' | 'delete' }> = ({ 
  children, 
  action = 'read' 
}) => (
  <PermissionGuard permission={`users.${action}`}>
    {children}
  </PermissionGuard>
);

export const RoleManagementGuard: React.FC<{ children: ReactNode; action?: 'read' | 'write' | 'delete' }> = ({ 
  children, 
  action = 'read' 
}) => (
  <PermissionGuard permission={`roles.${action}`}>
    {children}
  </PermissionGuard>
);

export const CustomerManagementGuard: React.FC<{ children: ReactNode; action?: 'read' | 'write' | 'delete' }> = ({ 
  children, 
  action = 'read' 
}) => (
  <PermissionGuard permission={`customers.${action}`}>
    {children}
  </PermissionGuard>
);

export const SalesManagementGuard: React.FC<{ children: ReactNode; action?: 'read' | 'write' | 'delete' }> = ({ 
  children, 
  action = 'read' 
}) => (
  <PermissionGuard permission={`sales.${action}`}>
    {children}
  </PermissionGuard>
);

export const FinancialManagementGuard: React.FC<{ children: ReactNode; action?: 'read' | 'write' | 'delete' }> = ({ 
  children, 
  action = 'read' 
}) => (
  <PermissionGuard permission={`financial.${action}`}>
    {children}
  </PermissionGuard>
);

export const InventoryManagementGuard: React.FC<{ children: ReactNode; action?: 'read' | 'write' | 'delete' }> = ({ 
  children, 
  action = 'read' 
}) => (
  <PermissionGuard permission={`inventory.${action}`}>
    {children}
  </PermissionGuard>
);

export const ReportsGuard: React.FC<{ children: ReactNode; action?: 'read' | 'write' }> = ({ 
  children, 
  action = 'read' 
}) => (
  <PermissionGuard permission={`reports.${action}`}>
    {children}
  </PermissionGuard>
);

export const AnalyticsGuard: React.FC<{ children: ReactNode; action?: 'read' | 'write' }> = ({ 
  children, 
  action = 'read' 
}) => (
  <PermissionGuard permission={`analytics.${action}`}>
    {children}
  </PermissionGuard>
);

export const SettingsGuard: React.FC<{ children: ReactNode; action?: 'read' | 'write' }> = ({ 
  children, 
  action = 'read' 
}) => (
  <PermissionGuard permission={`settings.${action}`}>
    {children}
  </PermissionGuard>
);
