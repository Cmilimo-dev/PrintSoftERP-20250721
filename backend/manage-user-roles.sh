#!/bin/bash

# PrintSoftERP User Role Management Script

DB_PATH="./printsoft.db"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Help function
show_help() {
    echo -e "${BLUE}PrintSoftERP User Role Management${NC}"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  list-users           List all users with their roles"
    echo "  list-roles           List all available roles"
    echo "  set-role             Set a user's role"
    echo "  create-admin         Create a new admin user"
    echo "  show-permissions     Show permissions for a role"
    echo ""
    echo "Examples:"
    echo "  $0 list-users"
    echo "  $0 set-role admin@printsoft.com 'Super Administrator'"
    echo "  $0 create-admin newadmin@printsoft.com 'New Admin' 'Admin'"
    echo ""
}

# List all users
list_users() {
    echo -e "${BLUE}📋 Current Users and Roles:${NC}"
    echo ""
    sqlite3 $DB_PATH "SELECT email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC;" | while IFS='|' read -r email first_name last_name role created_at; do
        echo -e "${GREEN}👤 $first_name $last_name${NC}"
        echo -e "   📧 Email: $email"
        echo -e "   🔐 Role: $role"
        echo -e "   📅 Created: $created_at"
        echo ""
    done
}

# List all roles
list_roles() {
    echo -e "${BLUE}🛡️  Available Roles:${NC}"
    echo ""
    sqlite3 $DB_PATH "SELECT name, description, permissions FROM roles ORDER BY name;" | while IFS='|' read -r name description permissions; do
        echo -e "${GREEN}🔐 $name${NC}"
        echo -e "   📝 Description: $description"
        echo -e "   🔑 Permissions: $permissions"
        echo ""
    done
}

# Set user role
set_role() {
    local email=$1
    local role=$2
    
    if [ -z "$email" ] || [ -z "$role" ]; then
        echo -e "${RED}❌ Error: Please provide both email and role${NC}"
        echo "Usage: $0 set-role <email> <role>"
        return 1
    fi
    
    # Check if user exists
    user_exists=$(sqlite3 $DB_PATH "SELECT COUNT(*) FROM users WHERE email = '$email';")
    if [ "$user_exists" -eq 0 ]; then
        echo -e "${RED}❌ Error: User with email '$email' not found${NC}"
        return 1
    fi
    
    # Check if role exists
    role_exists=$(sqlite3 $DB_PATH "SELECT COUNT(*) FROM roles WHERE name = '$role';")
    if [ "$role_exists" -eq 0 ]; then
        echo -e "${RED}❌ Error: Role '$role' not found${NC}"
        echo ""
        echo "Available roles:"
        sqlite3 $DB_PATH "SELECT name FROM roles ORDER BY name;" | while read -r available_role; do
            echo "  - $available_role"
        done
        return 1
    fi
    
    # Update user role
    sqlite3 $DB_PATH "UPDATE users SET role = '$role', updated_at = datetime('now') WHERE email = '$email';"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully updated role for $email to '$role'${NC}"
        
        # Show updated user info
        echo ""
        echo -e "${BLUE}Updated user info:${NC}"
        sqlite3 $DB_PATH "SELECT email, first_name, last_name, role FROM users WHERE email = '$email';" | while IFS='|' read -r email first_name last_name role; do
            echo -e "${GREEN}👤 $first_name $last_name${NC}"
            echo -e "   📧 Email: $email"
            echo -e "   🔐 Role: $role"
        done
    else
        echo -e "${RED}❌ Error: Failed to update user role${NC}"
    fi
}

# Create admin user
create_admin() {
    local email=$1
    local name=$2
    local role=$3
    
    if [ -z "$email" ] || [ -z "$name" ] || [ -z "$role" ]; then
        echo -e "${RED}❌ Error: Please provide email, name, and role${NC}"
        echo "Usage: $0 create-admin <email> <'Full Name'> <role>"
        return 1
    fi
    
    # Check if user already exists
    user_exists=$(sqlite3 $DB_PATH "SELECT COUNT(*) FROM users WHERE email = '$email';")
    if [ "$user_exists" -gt 0 ]; then
        echo -e "${RED}❌ Error: User with email '$email' already exists${NC}"
        return 1
    fi
    
    # Generate UUID and hash password
    user_id=$(uuidgen | tr '[:upper:]' '[:lower:]')
    # Default password: 'admin123' - user should change this
    password_hash='$2b$10$GLKXCDst/SpDC.bGfMS7TuW7P90JvVUoHcLoxSUFGmkLe2hKlDC8q'
    
    # Split name into first and last name
    first_name=$(echo "$name" | cut -d' ' -f1)
    last_name=$(echo "$name" | cut -d' ' -f2-)
    
    # Insert user
    sqlite3 $DB_PATH "INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at, updated_at) VALUES ('$user_id', '$email', '$password_hash', '$first_name', '$last_name', '$role', datetime('now'), datetime('now'));"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully created admin user:${NC}"
        echo -e "${GREEN}👤 Name: $name${NC}"
        echo -e "   📧 Email: $email"
        echo -e "   🔐 Role: $role"
        echo -e "   🔑 Default Password: ${YELLOW}admin123${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Important: The user should change their password on first login!${NC}"
    else
        echo -e "${RED}❌ Error: Failed to create admin user${NC}"
    fi
}

# Show permissions for a role
show_permissions() {
    local role=$1
    
    if [ -z "$role" ]; then
        echo -e "${RED}❌ Error: Please provide a role name${NC}"
        echo "Usage: $0 show-permissions <role>"
        return 1
    fi
    
    # Check if role exists and get permissions
    role_info=$(sqlite3 $DB_PATH "SELECT name, description, permissions FROM roles WHERE name = '$role';")
    
    if [ -z "$role_info" ]; then
        echo -e "${RED}❌ Error: Role '$role' not found${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🔐 Role: $role${NC}"
    echo "$role_info" | while IFS='|' read -r name description permissions; do
        echo -e "${GREEN}📝 Description: $description${NC}"
        echo -e "${GREEN}🔑 Permissions: $permissions${NC}"
    done
}

# Main script logic
case $1 in
    list-users)
        list_users
        ;;
    list-roles)
        list_roles
        ;;
    set-role)
        set_role "$2" "$3"
        ;;
    create-admin)
        create_admin "$2" "$3" "$4"
        ;;
    show-permissions)
        show_permissions "$2"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Error: Invalid command${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
