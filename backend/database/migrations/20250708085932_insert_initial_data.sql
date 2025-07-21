-- Insert initial data for departments, roles, and permissions

-- Insert departments
INSERT INTO departments (name, description, is_active) VALUES
('Information Technology', 'IT support and development', true),
('Sales', 'Sales and customer relationship management', true),
('Finance', 'Financial management and accounting', true),
('Operations', 'Operations and logistics management', true)
ON CONFLICT DO NOTHING;

-- Insert permissions
INSERT INTO permissions (name, resource, action, description) VALUES
('Users Read', 'users', 'read', 'View users'),
('Users Write', 'users', 'write', 'Create and edit users'),
('Users Delete', 'users', 'delete', 'Delete users'),
('Roles Read', 'roles', 'read', 'View roles'),
('Roles Write', 'roles', 'write', 'Create and edit roles'),
('Roles Delete', 'roles', 'delete', 'Delete roles'),
('Customers Read', 'customers', 'read', 'View customers'),
('Customers Write', 'customers', 'write', 'Create and edit customers'),
('Customers Delete', 'customers', 'delete', 'Delete customers'),
('Sales Read', 'sales', 'read', 'View sales data'),
('Sales Write', 'sales', 'write', 'Create and edit sales'),
('Sales Delete', 'sales', 'delete', 'Delete sales'),
('Financial Read', 'financial', 'read', 'View financial data'),
('Financial Write', 'financial', 'write', 'Create and edit financial records'),
('Financial Delete', 'financial', 'delete', 'Delete financial records'),
('Inventory Read', 'inventory', 'read', 'View inventory'),
('Inventory Write', 'inventory', 'write', 'Create and edit inventory'),
('Inventory Delete', 'inventory', 'delete', 'Delete inventory records'),
('Reports Read', 'reports', 'read', 'View reports'),
('Reports Write', 'reports', 'write', 'Create and edit reports'),
('Analytics Read', 'analytics', 'read', 'View analytics'),
('Analytics Write', 'analytics', 'write', 'Create and edit analytics'),
('Settings Read', 'settings', 'read', 'View settings'),
('Settings Write', 'settings', 'write', 'Modify settings'),
('System Admin', 'system', 'admin', 'Full system administration')
ON CONFLICT DO NOTHING;

-- Insert roles
INSERT INTO roles (name, description, is_system_role) VALUES
('Super Administrator', 'Full system access with all permissions', true),
('Sales Manager', 'Manage sales operations and customer relationships', true),
('Accountant', 'Manage financial transactions and reporting', true),
('Inventory Clerk', 'Manage inventory and stock operations', true)
ON CONFLICT DO NOTHING;

-- Create role-permission relationships
-- Super Administrator gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Super Administrator'
ON CONFLICT DO NOTHING;

-- Sales Manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Sales Manager'
AND p.resource IN ('sales', 'customers', 'reports')
ON CONFLICT DO NOTHING;

-- Accountant permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Accountant'
AND p.resource IN ('financial', 'reports', 'analytics')
ON CONFLICT DO NOTHING;

-- Inventory Clerk permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Inventory Clerk'
AND p.resource IN ('inventory', 'reports')
AND p.action != 'delete'
ON CONFLICT DO NOTHING;

-- Insert some sample locations
INSERT INTO locations (name, description) VALUES
('Main Warehouse', 'Primary storage facility'),
('Retail Store', 'Customer-facing location'),
('Production Floor', 'Manufacturing area')
ON CONFLICT DO NOTHING;

-- Insert some sample parts
INSERT INTO parts (name, part_number, description) VALUES
('Widget A', 'WID-001', 'Standard widget for general use'),
('Widget B', 'WID-002', 'Premium widget with enhanced features'),
('Component X', 'CMP-001', 'Essential component for assembly')
ON CONFLICT DO NOTHING;
