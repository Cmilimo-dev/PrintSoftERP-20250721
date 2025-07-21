-- SQLite-compatible database initialization script for PrintSoft ERP

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS user_subscriptions;
DROP TABLE IF EXISTS subscription_plans;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS companies;

-- Companies Table
CREATE TABLE companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT,
    phone TEXT,
    email TEXT,
    tax_id TEXT,
    website TEXT,
    logo_url TEXT,
    etims_pin TEXT,
    registration_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users and Authentication
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT CHECK(role IN ('admin', 'manager', 'user', 'viewer')) DEFAULT 'user',
    company_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- User Sessions for mobile app
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    device_id TEXT,
    device_type TEXT CHECK(device_type IN ('mobile', 'web', 'tablet')) DEFAULT 'mobile',
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subscription Plans Table
CREATE TABLE subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('trial', 'monthly', 'yearly')) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    duration_days INTEGER NOT NULL,
    max_users INTEGER DEFAULT 1,
    max_companies INTEGER DEFAULT 1,
    features TEXT, -- JSON stored as TEXT in SQLite
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Subscriptions Table
CREATE TABLE user_subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_id TEXT,
    plan_id TEXT NOT NULL,
    admin_token TEXT UNIQUE,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME,
    status TEXT CHECK(status IN ('active', 'inactive', 'cancelled', 'expired')) DEFAULT 'active',
    is_admin BOOLEAN DEFAULT TRUE,
    invited_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    FOREIGN KEY (invited_by) REFERENCES users(id)
);

-- Team Members (for shared subscriptions)
CREATE TABLE team_members (
    id TEXT PRIMARY KEY,
    subscription_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'member')) DEFAULT 'member',
    invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    joined_at DATETIME,
    status TEXT CHECK(status IN ('pending', 'active', 'inactive')) DEFAULT 'pending',
    FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (subscription_id, user_id)
);

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, type, price, duration_days, max_users, max_companies, features) VALUES
('PLAN_TRIAL', '7-Day Free Trial', 'trial', 0.00, 7, 1, 1, '{"features": ["Basic ERP", "Limited Reports", "Email Support"]}'),
('PLAN_MONTHLY', 'Monthly Pro', 'monthly', 29.99, 30, 5, 1, '{"features": ["Full ERP Suite", "Advanced Reports", "Priority Support", "API Access"]}'),
('PLAN_YEARLY', 'Yearly Pro', 'yearly', 299.99, 365, 10, 3, '{"features": ["Full ERP Suite", "Advanced Reports", "Priority Support", "API Access", "Custom Integrations", "Dedicated Support"]}');

-- Insert default company
INSERT INTO companies (id, name, email, phone, created_at) VALUES
('COMP_DEFAULT', 'Default Company', 'admin@example.com', '+1-555-0123', CURRENT_TIMESTAMP);

-- Insert default admin user
INSERT INTO users (id, username, email, password, first_name, last_name, role, company_id, created_at) VALUES
('USER_ADMIN', 'admin', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Admin', 'admin', 'COMP_DEFAULT', CURRENT_TIMESTAMP);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_company ON user_subscriptions(company_id);
CREATE INDEX idx_team_members_subscription ON team_members(subscription_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
