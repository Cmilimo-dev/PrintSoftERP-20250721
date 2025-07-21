package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.Vendor
import kotlinx.coroutines.flow.Flow

@Dao
interface VendorDao {
    
    @Query("SELECT * FROM vendors ORDER BY name ASC")
    fun getAllVendors(): Flow<List<Vendor>>
    
    @Query("SELECT * FROM vendors WHERE id = :id")
    suspend fun getVendorById(id: String): Vendor?
    
    @Query("SELECT * FROM vendors WHERE name LIKE '%' || :query || '%' OR email LIKE '%' || :query || '%' OR phone LIKE '%' || :query || '%'")
    fun searchVendors(query: String): Flow<List<Vendor>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVendor(vendor: Vendor)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVendors(vendors: List<Vendor>)
    
    @Update
    suspend fun updateVendor(vendor: Vendor)
    
    @Delete
    suspend fun deleteVendor(vendor: Vendor)
    
    @Query("DELETE FROM vendors WHERE id = :id")
    suspend fun deleteVendorById(id: String)
    
    @Query("DELETE FROM vendors")
    suspend fun deleteAllVendors()
    
    @Query("SELECT COUNT(*) FROM vendors")
    suspend fun getVendorCount(): Int
}
