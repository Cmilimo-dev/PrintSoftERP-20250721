package com.printsoft.erp.data.local.preferences

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.google.gson.Gson
import com.printsoft.erp.data.models.User
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PreferencesManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val gson: Gson
) {
    
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val encryptedSharedPreferences: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "erp_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    // Authentication related preferences
    fun saveAccessToken(token: String) {
        encryptedSharedPreferences.edit()
            .putString(KEY_ACCESS_TOKEN, token)
            .apply()
    }

    fun getAccessToken(): String? {
        return encryptedSharedPreferences.getString(KEY_ACCESS_TOKEN, null)
    }

    fun saveUser(user: User) {
        val userJson = gson.toJson(user)
        encryptedSharedPreferences.edit()
            .putString(KEY_USER, userJson)
            .apply()
    }

    fun getUser(): User? {
        val userJson = encryptedSharedPreferences.getString(KEY_USER, null)
        return if (userJson != null) {
            try {
                gson.fromJson(userJson, User::class.java)
            } catch (e: Exception) {
                null
            }
        } else null
    }

    fun isLoggedIn(): Boolean {
        return !getAccessToken().isNullOrEmpty() && getUser() != null
    }

    fun clearAuthData() {
        encryptedSharedPreferences.edit()
            .remove(KEY_ACCESS_TOKEN)
            .remove(KEY_USER)
            .apply()
    }

    // App settings
    fun setThemeMode(isDarkMode: Boolean) {
        encryptedSharedPreferences.edit()
            .putBoolean(KEY_DARK_MODE, isDarkMode)
            .apply()
    }

    fun isDarkMode(): Boolean {
        return encryptedSharedPreferences.getBoolean(KEY_DARK_MODE, false)
    }

    fun setBiometricEnabled(enabled: Boolean) {
        encryptedSharedPreferences.edit()
            .putBoolean(KEY_BIOMETRIC_ENABLED, enabled)
            .apply()
    }

    fun isBiometricEnabled(): Boolean {
        return encryptedSharedPreferences.getBoolean(KEY_BIOMETRIC_ENABLED, false)
    }

    fun setNotificationsEnabled(enabled: Boolean) {
        encryptedSharedPreferences.edit()
            .putBoolean(KEY_NOTIFICATIONS_ENABLED, enabled)
            .apply()
    }

    fun isNotificationsEnabled(): Boolean {
        return encryptedSharedPreferences.getBoolean(KEY_NOTIFICATIONS_ENABLED, true)
    }

    fun setDefaultCurrency(currency: String) {
        encryptedSharedPreferences.edit()
            .putString(KEY_DEFAULT_CURRENCY, currency)
            .apply()
    }

    fun getDefaultCurrency(): String {
        return encryptedSharedPreferences.getString(KEY_DEFAULT_CURRENCY, "USD") ?: "USD"
    }

    companion object {
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_USER = "user"
        private const val KEY_DARK_MODE = "dark_mode"
        private const val KEY_BIOMETRIC_ENABLED = "biometric_enabled"
        private const val KEY_NOTIFICATIONS_ENABLED = "notifications_enabled"
        private const val KEY_DEFAULT_CURRENCY = "default_currency"
    }
}
