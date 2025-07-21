package com.printsoft.erp.data.repository

import com.printsoft.erp.data.api.ERPApiService
import com.printsoft.erp.data.local.preferences.PreferencesManager
import com.printsoft.erp.data.models.AuthResponse
import com.printsoft.erp.data.models.LoginRequest
import com.printsoft.erp.data.models.RegisterRequest
import com.printsoft.erp.data.models.User
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: ERPApiService,
    private val preferencesManager: PreferencesManager
) {
    
    suspend fun login(loginRequest: LoginRequest): Result<AuthResponse> {
        return try {
            val response = apiService.login(loginRequest)
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                if (authResponse.success && authResponse.token != null && authResponse.user != null) {
                    // Save authentication data locally
                    preferencesManager.saveAccessToken(authResponse.token)
                    preferencesManager.saveUser(authResponse.user)
                }
                Result.success(authResponse)
            } else {
                Result.failure(Exception("Login failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun register(registerRequest: RegisterRequest): Result<AuthResponse> {
        return try {
            val response = apiService.register(registerRequest)
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                if (authResponse.success && authResponse.token != null && authResponse.user != null) {
                    // Save authentication data locally
                    preferencesManager.saveAccessToken(authResponse.token)
                    preferencesManager.saveUser(authResponse.user)
                }
                Result.success(authResponse)
            } else {
                Result.failure(Exception("Registration failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCurrentUser(): Result<User> {
        return try {
            val response = apiService.getCurrentUser()
            if (response.isSuccessful && response.body() != null) {
                val apiResponse = response.body()!!
                if (apiResponse.success && apiResponse.data != null) {
                    // Update local user data
                    preferencesManager.saveUser(apiResponse.data)
                    Result.success(apiResponse.data)
                } else {
                    Result.failure(Exception(apiResponse.message ?: "Failed to get user"))
                }
            } else {
                Result.failure(Exception("Failed to get current user: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun logout(): Result<Boolean> {
        return try {
            // Call logout API
            val response = apiService.logout()
            
            // Clear local authentication data regardless of API response
            preferencesManager.clearAuthData()
            
            if (response.isSuccessful) {
                Result.success(true)
            } else {
                // Even if API call fails, we've cleared local data
                Result.success(true)
            }
        } catch (e: Exception) {
            // Clear local data even if network request fails
            preferencesManager.clearAuthData()
            Result.success(true)
        }
    }
    
    fun isLoggedIn(): Boolean {
        return preferencesManager.isLoggedIn()
    }
    
    fun getLocalUser(): User? {
        return preferencesManager.getUser()
    }
    
    fun getAccessToken(): String? {
        return preferencesManager.getAccessToken()
    }
}
