package com.printsoft.erp.ui.viewmodel

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.printsoft.erp.data.models.LoginRequest
import com.printsoft.erp.data.repository.AuthRepository
import com.printsoft.erp.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    // Mutable state for UI
    val email = mutableStateOf("")
    val password = mutableStateOf("")
    
    private val _loginState = MutableStateFlow<Resource<Boolean>>(Resource.Idle())
    val loginState: StateFlow<Resource<Boolean>> = _loginState
    
    private val _isAuthenticated = MutableStateFlow(false)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated
    
    init {
        checkAuthenticationStatus()
    }
    
    fun onEmailChange(newEmail: String) {
        email.value = newEmail
    }
    
    fun onPasswordChange(newPassword: String) {
        password.value = newPassword
    }
    
    fun login() {
        if (email.value.isEmpty() || password.value.isEmpty()) {
            _loginState.value = Resource.Error("Please fill in all fields")
            return
        }
        
        viewModelScope.launch {
            _loginState.value = Resource.Loading()
            
            val loginRequest = LoginRequest(
                email = email.value.trim(),
                password = password.value
            )
            
            try {
                val result = authRepository.login(loginRequest)
                result.fold(
                    onSuccess = { authResponse ->
                        if (authResponse.success && authResponse.token != null && authResponse.user != null) {
                            _loginState.value = Resource.Success(true)
                            _isAuthenticated.value = true
                        } else {
                            _loginState.value = Resource.Error(authResponse.message ?: "Login failed")
                        }
                    },
                    onFailure = { exception ->
                        _loginState.value = Resource.Error(exception.message ?: "Network error")
                    }
                )
            } catch (e: Exception) {
                _loginState.value = Resource.Error(e.message ?: "Unknown error")
            }
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            try {
                authRepository.logout()
                _isAuthenticated.value = false
                email.value = ""
                password.value = ""
                _loginState.value = Resource.Idle()
            } catch (e: Exception) {
                // Handle logout error if needed
            }
        }
    }
    
    private fun checkAuthenticationStatus() {
        viewModelScope.launch {
            _isAuthenticated.value = authRepository.isLoggedIn()
        }
    }
}
