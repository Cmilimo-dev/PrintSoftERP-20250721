package com.printsoft.erp.di

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.printsoft.erp.data.api.ApiService
import com.printsoft.erp.data.api.ApiServiceImpl
import com.printsoft.erp.data.api.ComprehensiveERPApiService
import com.printsoft.erp.data.api.ERPApiService
import com.printsoft.erp.data.local.preferences.PreferencesManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideGson(): Gson = GsonBuilder()
        .setLenient()
        .create()

    @Provides
    @Singleton
    fun provideHttpLoggingInterceptor(): HttpLoggingInterceptor =
        HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

    @Provides
    @Singleton
    fun provideAuthInterceptor(preferencesManager: PreferencesManager): Interceptor =
        Interceptor { chain ->
            val token = preferencesManager.getAccessToken()
            val request = chain.request().newBuilder()
                .apply {
                    if (!token.isNullOrEmpty()) {
                        addHeader("Authorization", "Bearer $token")
                    }
                    addHeader("Content-Type", "application/json")
                }
                .build()
            chain.proceed(request)
        }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        loggingInterceptor: HttpLoggingInterceptor,
        authInterceptor: Interceptor
    ): OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    @Provides
    @Singleton
    fun provideRetrofit(
        okHttpClient: OkHttpClient,
        gson: Gson
    ): Retrofit {
        // Dynamic API URL detection similar to React app
        val baseUrl = getApiBaseUrl()
        
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
    }

    @Provides
    @Singleton
    fun provideERPApiService(retrofit: Retrofit): ERPApiService =
        retrofit.create(ERPApiService::class.java)

    @Provides
    @Singleton
    fun provideComprehensiveERPApiService(retrofit: Retrofit): ComprehensiveERPApiService =
        retrofit.create(ComprehensiveERPApiService::class.java)

    @Provides
    @Singleton
    fun provideApiService(comprehensiveApi: ComprehensiveERPApiService): ApiService =
        ApiServiceImpl(comprehensiveApi)

    private fun getApiBaseUrl(): String {
        // For now, use localhost - in production this would be configurable
        return "http://localhost:3001/api/"
    }
}
