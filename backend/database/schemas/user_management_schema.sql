-- User Management Schema for PrintSoftERP
-- This script sets up the user management tables and relationships

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET row_security = on;

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    manager_id UUID, -- Will reference user_profiles(id) after user_profiles is created
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource, action)
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    full_name VARCHAR(511) GENERATED ALWAYS AS (COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) STORED,
    phone VARCHAR(20),
    avatar_url TEXT,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- Create user_roles table (for users with multiple roles)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES user_profiles(id),
    PRIMARY KEY (user_id, role_id)
);

-- Add foreign key constraint for department manager after user_profiles exists
ALTER TABLE departments 
ADD CONSTRAINT fk_departments_manager 
FOREIGN KEY (manager_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department_id ON user_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON departments(parent_id);
CREATE INDEX IF NOT EXISTS idx_departments_manager_id ON departments(manager_id);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default permissions
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
    ('Logistics Read', 'logistics', 'read', 'View logistics data'),
    ('Logistics Write', 'logistics', 'write', 'Create and edit logistics'),
    ('Logistics Delete', 'logistics', 'delete', 'Delete logistics records'),
    ('Reports Read', 'reports', 'read', 'View reports'),
    ('Reports Write', 'reports', 'write', 'Create and edit reports'),
    ('Analytics Read', 'analytics', 'read', 'View analytics'),
    ('Analytics Write', 'analytics', 'write', 'Create and edit analytics'),
    ('Settings Read', 'settings', 'read', 'View settings'),
    ('Settings Write', 'settings', 'write', 'Modify settings'),
    ('System Admin', 'system', 'admin', 'Full system administration')
ON CONFLICT (resource, action) DO NOTHING;

-- Insert default roles
INSERT INTO roles (name, description, is_system_role) VALUES
    ('Super Administrator', 'Full system access with all permissions', true),
    ('Administrator', 'Administrative access with most permissions', true),
    ('Sales Manager', 'Manage sales operations and customer relationships', true),
    ('Accountant', 'Manage financial transactions and reporting', true),
    ('Inventory Clerk', 'Manage inventory and stock operations', true),
    ('User', 'Basic user with limited permissions', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default departments
INSERT INTO departments (name, description, is_active) VALUES
    ('Information Technology', 'IT support and development', true),
    ('Sales', 'Sales and customer relationship management', true),
    ('Finance', 'Financial management and accounting', true),
    ('Operations', 'Operations and logistics management', true),
    ('Human Resources', 'Human resources and personnel management', true),
    ('Marketing', 'Marketing and business development', true)
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Super Administrator gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Super Administrator'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Administrator gets most permissions (exclude system admin)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Administrator' AND p.name != 'System Admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Sales Manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Sales Manager' 
AND p.resource IN ('sales', 'customers', 'reports')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Accountant permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Accountant' 
AND p.resource IN ('financial', 'reports', 'analytics')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Inventory Clerk permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Inventory Clerk' 
AND p.resource IN ('inventory', 'logistics', 'reports')
AND p.action != 'delete'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- User permissions (basic read access)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'User' 
AND p.action = 'read'
AND p.resource IN ('customers', 'inventory', 'reports')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can manage all users
CREATE POLICY "Admins can manage users" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() 
            AND r.name IN ('Super Administrator', 'Administrator')
        )
    );

-- Everyone can read departments (for dropdowns)
CREATE POLICY "Everyone can read departments" ON departments
    FOR SELECT USING (true);

-- Only admins can manage departments
CREATE POLICY "Admins can manage departments" ON departments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() 
            AND r.name IN ('Super Administrator', 'Administrator')
        )
    );

-- Everyone can read roles and permissions (for UI)
CREATE POLICY "Everyone can read roles" ON roles
    FOR SELECT USING (true);

CREATE POLICY "Everyone can read permissions" ON permissions
    FOR SELECT USING (true);

CREATE POLICY "Everyone can read role_permissions" ON role_permissions
    FOR SELECT USING (true);

-- Only super admins can manage roles
CREATE POLICY "Super admins can manage roles" ON roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() 
            AND r.name = 'Super Administrator'
        )
    );

CREATE POLICY "Super admins can manage role_permissions" ON role_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() 
            AND r.name = 'Super Administrator'
        )
    );

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
BEGIN
    -- Get the default "User" role
    SELECT id INTO default_role_id FROM roles WHERE name = 'User' LIMIT 1;
    
    -- Create profile for new user
    INSERT INTO user_profiles (
        id, 
        first_name, 
        last_name, 
        role_id,
        status
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        default_role_id,
        'pending'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_id UUID)
RETURNS TABLE (
    permission_name TEXT,
    resource TEXT,
    action TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.name, p.resource, p.action
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    JOIN roles r ON rp.role_id = r.id
    JOIN user_profiles up ON r.id = up.role_id
    WHERE up.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
