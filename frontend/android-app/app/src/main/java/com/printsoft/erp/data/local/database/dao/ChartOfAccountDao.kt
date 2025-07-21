package com.printsoft.erp.data.local.database.dao

import androidx.room.*
import com.printsoft.erp.data.models.ChartOfAccount
import kotlinx.coroutines.flow.Flow

@Dao
interface ChartOfAccountDao {
    
    @Query("SELECT * FROM chart_of_accounts WHERE is_active = 1 ORDER BY account_code ASC")
    suspend fun getAllAccounts(): List<ChartOfAccount>
    
    @Query("SELECT * FROM chart_of_accounts WHERE is_active = 1 ORDER BY account_code ASC")
    fun getAllAccountsFlow(): Flow<List<ChartOfAccount>>
    
    @Query("SELECT * FROM chart_of_accounts WHERE id = :id")
    suspend fun getAccountById(id: String): ChartOfAccount?
    
    @Query("SELECT * FROM chart_of_accounts WHERE account_code = :accountCode")
    suspend fun getAccountByCode(accountCode: String): ChartOfAccount?
    
    @Query("SELECT * FROM chart_of_accounts WHERE account_type = :accountType AND is_active = 1")
    fun getAccountsByType(accountType: String): Flow<List<ChartOfAccount>>
    
    @Query("SELECT * FROM chart_of_accounts WHERE parent_account_id = :parentId AND is_active = 1")
    fun getSubAccounts(parentId: String): Flow<List<ChartOfAccount>>
    
    @Query("SELECT * FROM chart_of_accounts WHERE account_name LIKE '%' || :query || '%' OR account_code LIKE '%' || :query || '%' AND is_active = 1")
    fun searchAccounts(query: String): Flow<List<ChartOfAccount>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAccount(account: ChartOfAccount)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAccounts(accounts: List<ChartOfAccount>)
    
    @Update
    suspend fun updateAccount(account: ChartOfAccount)
    
    @Delete
    suspend fun deleteAccount(account: ChartOfAccount)
    
    @Query("DELETE FROM chart_of_accounts WHERE id = :id")
    suspend fun deleteAccountById(id: String)
    
    @Query("UPDATE chart_of_accounts SET is_active = 0 WHERE id = :id")
    suspend fun deactivateAccount(id: String)
    
    @Query("DELETE FROM chart_of_accounts")
    suspend fun deleteAllAccounts()
    
    @Query("SELECT COUNT(*) FROM chart_of_accounts WHERE is_active = 1")
    suspend fun getActiveAccountCount(): Int
    
    @Query("SELECT DISTINCT account_type FROM chart_of_accounts WHERE is_active = 1")
    suspend fun getAllAccountTypes(): List<String>
}
