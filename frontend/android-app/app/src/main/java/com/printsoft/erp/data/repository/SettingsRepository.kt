package com.printsoft.erp.data.repository

import com.printsoft.erp.data.api.ERPApiService
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

// TODO: Implement Settings DAOs and re-enable this repository
// Temporarily disabled due to missing DAO classes
/*
@Singleton
class SettingsRepository @Inject constructor(
    private val apiService: ERPApiService,
    //private val companySettingsDao: CompanySettingsDao,
    //private val displaySettingsDao: CompanyDisplaySettingsDao,
    //private val documentSettingsDao: DocumentSettingsDao,
    //private val etimsSettingsDao: EtimsSettingsDao,
    //private val taxSettingsDao: TaxSettingsDao,
    //private val autoNumberingSettingsDao: AutoNumberingSettingsDao,
    //private val systemSettingsDao: SystemSettingsDao,
    //private val userProfileDao: UserProfileDao,
    //private val userRoleDao: UserRoleDao,
    //private val permissionDao: PermissionDao
) {

    // Temporarily commented out methods due to missing DAOs
    /*
    fun getCompanySettings(): Flow<CompanySettings> = companySettingsDao.getCompanySettings()

    fun getDisplaySettings(): Flow<CompanyDisplaySettings> = displaySettingsDao.getDisplaySettings()

    fun getDocumentSettings(): Flow<List<DocumentSettings>> = documentSettingsDao.getAllDocumentSettings()

    fun getEtimsSettings(): Flow<EtimsSettings> = etimsSettingsDao.getEtimsSettings()

    fun getTaxSettings(): Flow<TaxSettings> = taxSettingsDao.getTaxSettings()

    fun getAutoNumberingSettings(): Flow<List<AutoNumberingSettings>> = autoNumberingSettingsDao.getAllAutoNumberingSettings()

    fun getSystemSettings(): Flow<SystemSettings> = systemSettingsDao.getSystemSettings()

    fun getUserProfile(userId: String): Flow<UserProfile> = userProfileDao.getUserProfile(userId)

    fun getUserRoles(): Flow<List<UserRole>> = userRoleDao.getAllRoles()

    fun getPermissions(): Flow<List<Permission>> = permissionDao.getAllPermissions()

    suspend fun updateCompanySettings(settings: CompanySettings) {
        companySettingsDao.updateCompanySettings(settings)
        apiService.updateCompanySettings(settings)
    }

    suspend fun updateDisplaySettings(settings: CompanyDisplaySettings) {
        displaySettingsDao.updateDisplaySettings(settings)
        apiService.updateDisplaySettings(settings)
    }

    suspend fun updateDocumentSettings(settings: DocumentSettings) {
        documentSettingsDao.updateDocumentSettings(settings)
        apiService.updateDocumentSettings(settings)
    }

    suspend fun updateEtimsSettings(settings: EtimsSettings) {
        etimsSettingsDao.updateEtimsSettings(settings)
        apiService.updateEtimsSettings(settings)
    }

    suspend fun updateTaxSettings(settings: TaxSettings) {
        taxSettingsDao.updateTaxSettings(settings)
        apiService.updateTaxSettings(settings)
    }

    suspend fun updateAutoNumberingSettings(settings: AutoNumberingSettings) {
        autoNumberingSettingsDao.updateAutoNumberingSettings(settings)
        apiService.updateAutoNumberingSettings(settings)
    }

    suspend fun updateSystemSettings(settings: SystemSettings) {
        systemSettingsDao.updateSystemSettings(settings)
        apiService.updateSystemSettings(settings)
    }

    suspend fun updateUserProfile(profile: UserProfile) {
        userProfileDao.updateUserProfile(profile)
        apiService.updateUserProfile(profile)
    }

    suspend fun updateUserRole(role: UserRole) {
        userRoleDao.updateUserRole(role)
        apiService.updateUserRole(role)
    }

    suspend fun updatePermission(permission: Permission) {
        permissionDao.updatePermission(permission)
        apiService.updatePermission(permission)
    }
    */
}
*/

