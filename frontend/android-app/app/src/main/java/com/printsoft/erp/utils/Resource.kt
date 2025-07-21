package com.printsoft.erp.utils

sealed class Resource<T> {
    class Idle<T> : Resource<T>()
    class Loading<T> : Resource<T>()
    data class Success<T>(val data: T) : Resource<T>()
    data class Error<T>(val message: String) : Resource<T>()
    
    val isLoading: Boolean
        get() = this is Loading
    
    val isSuccess: Boolean
        get() = this is Success
    
    val isError: Boolean
        get() = this is Error
    
    val isIdle: Boolean
        get() = this is Idle
}
