import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const PermissionTest: React.FC = () => {
  const { 
    userProfile, 
    userRole, 
    permissions, 
    hasPermission, 
    isAdmin, 
    isSuperAdmin,
    loading 
  } = usePermissions();

  const testPermissions = [
    'settings.read',
    'settings.write',
    'users.read',
    'users.write',
    'customers.read',
    'customers.write',
    'financial.read',
    'financial.write',
    'sales.read',
    'sales.write',
    'inventory.read',
    'inventory.write',
    'reports.read',
    'reports.write',
    'analytics.read',
    'analytics.write'
  ];

  if (loading) {
    return <div>Loading permissions...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Permission Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">User Information</h3>
            <p><strong>Email:</strong> {userProfile?.email}</p>
            <p><strong>Name:</strong> {userProfile?.first_name} {userProfile?.last_name}</p>
            <p><strong>Role:</strong> {userRole?.name}</p>
            <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
            <p><strong>Is Super Admin:</strong> {isSuperAdmin ? 'Yes' : 'No'}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Permissions ({permissions.length})</h3>
            <div className="flex flex-wrap gap-2">
              {permissions.map((perm) => (
                <Badge key={perm.id} variant="secondary">
                  {perm.resource}.{perm.action}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Permission Tests</h3>
            <div className="grid grid-cols-2 gap-2">
              {testPermissions.map((permission) => (
                <div key={permission} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{permission}</span>
                  <Badge variant={hasPermission(permission) ? "default" : "destructive"}>
                    {hasPermission(permission) ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <Button onClick={() => {
              console.log('User Profile:', userProfile);
              console.log('User Role:', userRole);
              console.log('Permissions:', permissions);
              console.log('Settings.read test:', hasPermission('settings.read'));
              console.log('Settings.write test:', hasPermission('settings.write'));
            }}>
              Log Debug Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
