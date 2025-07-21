-- Additional tables for subscription management
-- This extends the existing schema.sql

-- Subscription Plans Table
CREATE TABLE subscription_plans (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
type TEXT CHECK(type IN ('trial', 'monthly', 'yearly')) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    duration_days INT NOT NULL,
    max_users INT DEFAULT 1,
    max_companies INT DEFAULT 1,
    features JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Subscriptions Table
CREATE TABLE user_subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    company_id VARCHAR(36),
    plan_id VARCHAR(36) NOT NULL,
    admin_token VARCHAR(255) UNIQUE,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
status TEXT CHECK(status IN ('active', 'inactive', 'cancelled', 'expired')) DEFAULT 'active',
    is_admin BOOLEAN DEFAULT TRUE,
    invited_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    FOREIGN KEY (invited_by) REFERENCES users(id)
);

-- Update users table to include company relationship
ALTER TABLE users ADD COLUMN company_id VARCHAR(36);
ALTER TABLE users ADD FOREIGN KEY (company_id) REFERENCES companies(id);

-- Team Members (for shared subscriptions)
CREATE TABLE team_members (
    id VARCHAR(36) PRIMARY KEY,
    subscription_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
role TEXT CHECK(role IN ('admin', 'member')) DEFAULT 'member',
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    joined_at TIMESTAMP NULL,
status TEXT CHECK(status IN ('pending', 'active', 'inactive')) DEFAULT 'pending',
    FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subscription_user (subscription_id, user_id)
);

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, type, price, duration_days, max_users, max_companies, features) VALUES
('PLAN_TRIAL', '7-Day Free Trial', 'trial', 0.00, 7, 1, 1, '{"features": ["Basic ERP", "Limited Reports", "Email Support"]}'),
('PLAN_MONTHLY', 'Monthly Pro', 'monthly', 29.99, 30, 5, 1, '{"features": ["Full ERP Suite", "Advanced Reports", "Priority Support", "API Access"]}'),
('PLAN_YEARLY', 'Yearly Pro', 'yearly', 299.99, 365, 10, 3, '{"features": ["Full ERP Suite", "Advanced Reports", "Priority Support", "API Access", "Custom Integrations", "Dedicated Support"]}');

-- Add indexes for performance
CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_company ON user_subscriptions(company_id);
CREATE INDEX idx_user_subscriptions_admin_token ON user_subscriptions(admin_token);
CREATE INDEX idx_team_members_subscription ON team_members(subscription_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
