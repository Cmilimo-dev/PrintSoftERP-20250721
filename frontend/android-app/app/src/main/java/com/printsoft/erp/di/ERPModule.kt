package com.printsoft.erp.di

import android.content.Context
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.printsoft.erp.data.api.ComprehensiveERPApiService
import com.printsoft.erp.data.local.database.MobileERPDatabase
import com.printsoft.erp.data.local.preferences.PreferencesManager
import com.printsoft.erp.data.repository.ComprehensiveERPRepository
import com.printsoft.erp.services.BusinessDocumentWorkflowService
import com.printsoft.erp.services.MobileDocumentExportService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object ERPModule {

    @Provides
    @Singleton
    fun provideGson(): Gson {
        return GsonBuilder()
            .setLenient()
            .create()
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        return OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://api.printsoft-erp.com/v1/") // Replace with actual base URL
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideERPApiService(retrofit: Retrofit): ComprehensiveERPApiService {
        return retrofit.create(ComprehensiveERPApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideMobileERPDatabase(@ApplicationContext context: Context): MobileERPDatabase {
        return MobileERPDatabase.getInstance(context)
    }

    @Provides
    @Singleton
    fun providePreferencesManager(@ApplicationContext context: Context, gson: Gson): PreferencesManager {
        return PreferencesManager(context, gson)
    }

    @Provides
    @Singleton
    fun provideComprehensiveERPRepository(
        apiService: ComprehensiveERPApiService,
        database: MobileERPDatabase
    ): ComprehensiveERPRepository {
        return ComprehensiveERPRepository(apiService, database)
    }

    @Provides
    @Singleton
    fun provideMobileDocumentExportService(@ApplicationContext context: Context): MobileDocumentExportService {
        return MobileDocumentExportService(context)
    }

    @Provides
    @Singleton
    fun provideBusinessDocumentWorkflowService(
        @ApplicationContext context: Context,
        database: MobileERPDatabase,
        exportService: MobileDocumentExportService
    ): BusinessDocumentWorkflowService {
        return BusinessDocumentWorkflowService(context, database, exportService)
    }
}
