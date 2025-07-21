package com.printsoft.erp.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "company_settings")
data class CompanySettings(
    @PrimaryKey val id: String = "company_default",
    val name: String,
    val address: String,
    val city: String,
    val state: String,
    val zip: String,
    val country: String,
    val phone: String,
    val email: String,
    @SerializedName("tax_id") val taxId: String,
    val logo: String? = null,
    val website: String? = null,
    @SerializedName("etims_pin") val etimsPin: String? = null,
    @SerializedName("registration_number") val registrationNumber: String? = null,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "company_display_settings")
data class CompanyDisplaySettings(
    @PrimaryKey val id: String = "display_default",
    @SerializedName("logo_position") val logoPosition: String = "left-logo-with-name", // 'only-logo' | 'left-logo-with-name' | 'top-logo-with-name' | 'no-logo'
    @SerializedName("show_company_name") val showCompanyName: Boolean = true,
    @SerializedName("show_address") val showAddress: Boolean = true,
    @SerializedName("show_contact_info") val showContactInfo: Boolean = true,
    @SerializedName("show_registration_details") val showRegistrationDetails: Boolean = true,
    @SerializedName("custom_logo_width") val customLogoWidth: Int = 100,
    @SerializedName("custom_logo_height") val customLogoHeight: Int = 50,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "document_settings")
data class DocumentSettings(
    @PrimaryKey val id: String,
    @SerializedName("document_type") val documentType: String, // 'invoice', 'purchase-order', 'quote', etc.
    val prefix: String,
    @SerializedName("next_number") val nextNumber: Int,
    @SerializedName("number_length") val numberLength: Int,
    @SerializedName("reset_period") val resetPeriod: String = "yearly", // 'never' | 'yearly' | 'monthly'
    val format: String, // e.g., "{prefix}-{year}-{number:0000}"
    val enabled: Boolean = true,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "etims_settings")
data class EtimsSettings(
    @PrimaryKey val id: String = "etims_default",
    val enabled: Boolean = false,
    val pin: String = "0000",
    @SerializedName("api_url") val apiUrl: String = "",
    val environment: String = "sandbox", // 'sandbox' | 'production'
    @SerializedName("auto_submit") val autoSubmit: Boolean = false,
    @SerializedName("certificate_path") val certificatePath: String? = null,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "tax_settings")
data class TaxSettings(
    @PrimaryKey val id: String = "tax_default",
    val type: String = "exclusive", // 'inclusive' | 'exclusive' | 'per_item' | 'overall'
    @SerializedName("default_rate") val defaultRate: Double = 10.0,
    @SerializedName("custom_rates") val customRates: String? = null, // JSON string of custom rates
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "auto_numbering_settings")
data class AutoNumberingSettings(
    @PrimaryKey val id: String,
    val entity: String, // 'customers' | 'vendors' | 'items'
    val enabled: Boolean = true,
    val prefix: String,
    @SerializedName("next_number") val nextNumber: Int,
    val format: String, // e.g., "{prefix}-{number:0000}"
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "system_settings")
data class SystemSettings(
    @PrimaryKey val id: String = "system_default",
    val currency: String = "USD",
    @SerializedName("default_language") val defaultLanguage: String = "en",
    @SerializedName("date_format") val dateFormat: String = "yyyy-MM-dd",
    @SerializedName("time_format") val timeFormat: String = "HH:mm:ss",
    @SerializedName("fiscal_year_start") val fiscalYearStart: String = "01-01", // MM-dd
    @SerializedName("backup_enabled") val backupEnabled: Boolean = true,
    @SerializedName("backup_frequency") val backupFrequency: String = "daily", // 'daily' | 'weekly' | 'monthly'
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "user_roles")
data class UserRole(
    @PrimaryKey val id: String,
    val name: String,
    val description: String,
    val permissions: String, // JSON string of permissions
    @SerializedName("is_system_role") val isSystemRole: Boolean = false,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

@Entity(tableName = "permissions")
data class Permission(
    @PrimaryKey val id: String,
    val name: String,
    val resource: String,
    val action: String,
    val description: String? = null
)

@Entity(tableName = "user_profiles")
data class UserProfile(
    @PrimaryKey val id: String,
    val email: String,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    @SerializedName("full_name") val fullName: String? = null,
    @SerializedName("role_id") val roleId: String,
    @SerializedName("department_id") val departmentId: String? = null,
    val status: String = "active", // 'active' | 'inactive' | 'pending'
    @SerializedName("last_login") val lastLogin: String? = null,
    @SerializedName("avatar_url") val avatarUrl: String? = null,
    val phone: String? = null,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

// Note: Department is defined in HRModels.kt

// Constants for permissions
object PermissionConstants {
    // User management
    const val USERS_READ = "users.read"
    const val USERS_WRITE = "users.write"
    const val USERS_DELETE = "users.delete"
    
    // Role management
    const val ROLES_READ = "roles.read"
    const val ROLES_WRITE = "roles.write"
    const val ROLES_DELETE = "roles.delete"
    
    // Customer management
    const val CUSTOMERS_READ = "customers.read"
    const val CUSTOMERS_WRITE = "customers.write"
    const val CUSTOMERS_DELETE = "customers.delete"
    
    // Sales management
    const val SALES_READ = "sales.read"
    const val SALES_WRITE = "sales.write"
    const val SALES_DELETE = "sales.delete"
    
    // Financial management
    const val FINANCIAL_READ = "financial.read"
    const val FINANCIAL_WRITE = "financial.write"
    const val FINANCIAL_DELETE = "financial.delete"
    
    // Inventory management
    const val INVENTORY_READ = "inventory.read"
    const val INVENTORY_WRITE = "inventory.write"
    const val INVENTORY_DELETE = "inventory.delete"
    
    // Logistics management
    const val LOGISTICS_READ = "logistics.read"
    const val LOGISTICS_WRITE = "logistics.write"
    const val LOGISTICS_DELETE = "logistics.delete"
    
    // Reports and analytics
    const val REPORTS_READ = "reports.read"
    const val REPORTS_WRITE = "reports.write"
    const val ANALYTICS_READ = "analytics.read"
    const val ANALYTICS_WRITE = "analytics.write"
    
    // System settings
    const val SETTINGS_READ = "settings.read"
    const val SETTINGS_WRITE = "settings.write"
    
    // System administration
    const val SYSTEM_ADMIN = "system.admin"
}

// Default roles
object DefaultRoles {
    const val SUPER_ADMIN = "super_admin"
    const val ADMIN = "admin"
    const val SALES_MANAGER = "sales_manager"
    const val ACCOUNTANT = "accountant"
    const val INVENTORY_CLERK = "inventory_clerk"
    const val USER = "user"
}

// DTOs for API communication
data class CreateUserRequest(
    val email: String,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    @SerializedName("role_id") val roleId: String,
    @SerializedName("department_id") val departmentId: String? = null,
    val phone: String? = null,
    @SerializedName("send_invitation") val sendInvitation: Boolean? = false
)

data class UpdateUserRequest(
    @SerializedName("first_name") val firstName: String? = null,
    @SerializedName("last_name") val lastName: String? = null,
    @SerializedName("role_id") val roleId: String? = null,
    @SerializedName("department_id") val departmentId: String? = null,
    val status: String? = null,
    val phone: String? = null
)

data class CreateRoleRequest(
    val name: String,
    val description: String,
    @SerializedName("permission_ids") val permissionIds: List<String>
)

data class CreateDepartmentRequest(
    val name: String,
    val description: String? = null,
    @SerializedName("parent_id") val parentId: String? = null,
    @SerializedName("manager_id") val managerId: String? = null
)
