package com.printsoft.erp.ui.viewmodel

// TODO: Implement Settings DAOs and repository, then re-enable this ViewModel
// Temporarily disabled due to missing SettingsRepository
/*
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.printsoft.erp.data.model.*
import com.printsoft.erp.data.repository.SettingsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsRepository: SettingsRepository
) : ViewModel() {

    private val _companySettings = MutableStateFlow<CompanySettings?>(null)
    val companySettings: StateFlow<CompanySettings?> = _companySettings.asStateFlow()

    private val _displaySettings = MutableStateFlow<CompanyDisplaySettings?>(null)
    val displaySettings: StateFlow<CompanyDisplaySettings?> = _displaySettings.asStateFlow()

    private val _documentSettings = MutableStateFlow<List<DocumentSettings>>(emptyList())
    val documentSettings: StateFlow<List<DocumentSettings>> = _documentSettings.asStateFlow()

    private val _etimsSettings = MutableStateFlow<EtimsSettings?>(null)
    val etimsSettings: StateFlow<EtimsSettings?> = _etimsSettings.asStateFlow()

    private val _taxSettings = MutableStateFlow<TaxSettings?>(null)
    val taxSettings: StateFlow<TaxSettings?> = _taxSettings.asStateFlow()

    private val _autoNumberingSettings = MutableStateFlow<List<AutoNumberingSettings>>(emptyList())
    val autoNumberingSettings: StateFlow<List<AutoNumberingSettings>> = _autoNumberingSettings.asStateFlow()

    private val _systemSettings = MutableStateFlow<SystemSettings?>(null)
    val systemSettings: StateFlow<SystemSettings?> = _systemSettings.asStateFlow()

    private val _userProfile = MutableStateFlow<UserProfile?>(null)
    val userProfile: StateFlow<UserProfile?> = _userProfile.asStateFlow()

    private val _userRoles = MutableStateFlow<List<UserRole>>(emptyList())
    val userRoles: StateFlow<List<UserRole>> = _userRoles.asStateFlow()

    private val _permissions = MutableStateFlow<List<Permission>>(emptyList())
    val permissions: StateFlow<List<Permission>> = _permissions.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        loadAllSettings()
    }

    fun loadAllSettings() {
        viewModelScope.launch {
            _loading.value = true
            try {
                settingsRepository.getCompanySettings().collect {
                    _companySettings.value = it
                }
                settingsRepository.getDisplaySettings().collect {
                    _displaySettings.value = it
                }
                settingsRepository.getDocumentSettings().collect {
                    _documentSettings.value = it
                }
                settingsRepository.getEtimsSettings().collect {
                    _etimsSettings.value = it
                }
                settingsRepository.getTaxSettings().collect {
                    _taxSettings.value = it
                }
                settingsRepository.getAutoNumberingSettings().collect {
                    _autoNumberingSettings.value = it
                }
                settingsRepository.getSystemSettings().collect {
                    _systemSettings.value = it
                }
                settingsRepository.getUserRoles().collect {
                    _userRoles.value = it
                }
                settingsRepository.getPermissions().collect {
                    _permissions.value = it
                }
                _loading.value = false
            } catch (e: Exception) {
                _loading.value = false
                _error.value = e.message
            }
        }
    }

    fun loadUserProfile(userId: String) {
        viewModelScope.launch {
            try {
                settingsRepository.getUserProfile(userId).collect {
                    _userProfile.value = it
                }
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }

    fun updateCompanySettings(settings: CompanySettings) {
        viewModelScope.launch {
            try {
                _loading.value = true
                settingsRepository.updateCompanySettings(settings)
                _companySettings.value = settings
                _loading.value = false
            } catch (e: Exception) {
                _loading.value = false
                _error.value = e.message
            }
        }
    }

    fun updateDisplaySettings(settings: CompanyDisplaySettings) {
        viewModelScope.launch {
            try {
                _loading.value = true
                settingsRepository.updateDisplaySettings(settings)
                _displaySettings.value = settings
                _loading.value = false
            } catch (e: Exception) {
                _loading.value = false
                _error.value = e.message
            }
        }
    }

    fun updateDocumentSettings(settings: DocumentSettings) {
        viewModelScope.launch {
            try {
                _loading.value = true
                settingsRepository.updateDocumentSettings(settings)
                val updatedList = _documentSettings.value.map {
                    if (it.id == settings.id) settings else it
                }
                _documentSettings.value = updatedList
                _loading.value = false
            } catch (e: Exception) {
                _loading.value = false
                _error.value = e.message
            }
        }
    }

    fun updateEtimsSettings(settings: EtimsSettings) {
        viewModelScope.launch {
            try {
                _loading.value = true
                settingsRepository.updateEtimsSettings(settings)
                _etimsSettings.value = settings
                _loading.value = false
            } catch (e: Exception) {
                _loading.value = false
                _error.value = e.message
            }
        }
    }

    fun updateTaxSettings(settings: TaxSettings) {
        viewModelScope.launch {
            try {
                _loading.value = true
                settingsRepository.updateTaxSettings(settings)
                _taxSettings.value = settings
                _loading.value = false
            } catch (e: Exception) {
                _loading.value = false
                _error.value = e.message
            }
        }
    }

    fun updateAutoNumberingSettings(settings: AutoNumberingSettings) {
        viewModelScope.launch {
            try {
                _loading.value = true
                settingsRepository.updateAutoNumberingSettings(settings)
                val updatedList = _autoNumberingSettings.value.map {
                    if (it.id == settings.id) settings else it
                }
                _autoNumberingSettings.value = updatedList
                _loading.value = false
            } catch (e: Exception) {
                _loading.value = false
                _error.value = e.message
            }
        }
    }

    fun updateSystemSettings(settings: SystemSettings) {
        viewModelScope.launch {
            try {
                _loading.value = true
                settingsRepository.updateSystemSettings(settings)
                _systemSettings.value = settings
                _loading.value = false
            } catch (e: Exception) {
                _loading.value = false
                _error.value = e.message
            }
        }
    }

    fun updateUserProfile(profile: UserProfile) {
        viewModelScope.launch {
            try {
                _loading.value = true
                settingsRepository.updateUserProfile(profile)
                _userProfile.value = profile
                _loading.value = false
            } catch (e: Exception) {
                _loading.value = false
                _error.value = e.message
            }
        }
    }

    fun updateUserRole(role: UserRole) {
        viewModelScope.launch {
            try {
                _loading.value = true
                settingsRepository.updateUserRole(role)
                val updatedList = _userRoles.value.map {
                    if (it.id == role.id) role else it
                }
                _userRoles.value = updatedList
                _loading.value = false
            } catch (e: Exception) {
                _loading.value = false
                _error.value = e.message
            }
        }
    }

    fun updatePermission(permission: Permission) {
        viewModelScope.launch {
            try {
                _loading.value = true
                settingsRepository.updatePermission(permission)
                val updatedList = _permissions.value.map {
                    if (it.id == permission.id) permission else it
                }
                _permissions.value = updatedList
                _loading.value = false
            } catch (e: Exception) {
                _loading.value = false
                _error.value = e.message
            }
        }
    }

    fun clearError() {
        _error.value = null
    }
}
*/
