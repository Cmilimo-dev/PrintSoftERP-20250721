package com.printsoft.erp

import android.app.Application
import androidx.work.Configuration
import androidx.work.WorkManager
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class ERPApplication : Application(), Configuration.Provider {
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize WorkManager for background tasks
        WorkManager.initialize(this, workManagerConfiguration)
        
        // Initialize logging in debug mode
        if (BuildConfig.DEBUG) {
            // Initialize debug logging
        }
        
        // Initialize any other application-level services
    }
    
    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setMinimumLoggingLevel(android.util.Log.INFO)
            .build()
}
