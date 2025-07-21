package com.printsoft.erp.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.printsoft.erp.data.repository.DashboardRepository
import com.printsoft.erp.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val dashboardRepository: DashboardRepository
) : ViewModel() {

    private val _dashboardState = MutableStateFlow<Resource<Map<String, Any>>>(Resource.Loading())
    val dashboardState: StateFlow<Resource<Map<String, Any>>> = _dashboardState

    init {
        loadDashboardData()
    }

    fun loadDashboardData() {
        viewModelScope.launch {
            _dashboardState.value = Resource.Loading()

            try {
                val result = dashboardRepository.getDashboardStats()
                result.fold(
                    onSuccess = {
                        _dashboardState.value = Resource.Success(it)
                    },
                    onFailure = {
                        _dashboardState.value = Resource.Error(it.message ?: "Error loading data")
                    }
                )
            } catch (e: Exception) {
                _dashboardState.value = Resource.Error(e.message ?: "Unknown error")
            }
        }
    }
}
