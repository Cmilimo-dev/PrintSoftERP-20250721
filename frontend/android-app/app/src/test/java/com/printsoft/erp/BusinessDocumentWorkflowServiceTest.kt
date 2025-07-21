package com.printsoft.erp

import com.printsoft.erp.services.BusinessDocumentWorkflowService
import com.printsoft.erp.data.local.database.MobileERPDatabase
import com.printsoft.erp.services.MobileDocumentExportService
import com.printsoft.erp.data.models.*
import android.content.Context
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test
import org.junit.Assert.*
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.MockitoAnnotations

/**
 * Unit tests for BusinessDocumentWorkflowService
 * 
 * Note: These tests will only work after build errors are resolved
 * and proper model imports are consolidated.
 */
class BusinessDocumentWorkflowServiceTest {

    @Mock
    private lateinit var context: Context

    @Mock
    private lateinit var database: MobileERPDatabase

    @Mock
    private lateinit var exportService: MobileDocumentExportService

    private lateinit var workflowService: BusinessDocumentWorkflowService

    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)
        workflowService = BusinessDocumentWorkflowService(context, database, exportService)
    }

    @Test
    fun `createQuotation should generate document number when empty`() = runBlocking {
        // Arrange
        val mockQuotationDao = mock(QuotationDao::class.java)
        `when`(database.quotationDao()).thenReturn(mockQuotationDao)
        
        val mockDocumentWorkflowDao = mock(DocumentWorkflowDao::class.java)
        `when`(database.documentWorkflowDao()).thenReturn(mockDocumentWorkflowDao)
        
        val mockDocumentStatusHistoryDao = mock(DocumentStatusHistoryDao::class.java)
        `when`(database.documentStatusHistoryDao()).thenReturn(mockDocumentStatusHistoryDao)
        
        val quotation = Quotation(
            id = "test-id",
            quotationNumber = "", // Empty number should trigger generation
            customerId = "customer-1",
            quotationDate = "2025-01-01",
            status = "draft",
            subtotal = 100.0,
            taxAmount = 10.0,
            totalAmount = 110.0,
            createdAt = "2025-01-01T10:00:00",
            updatedAt = "2025-01-01T10:00:00"
        )

        // Act
        val result = workflowService.createQuotation(quotation)

        // Assert
        assertTrue("Should succeed in creating quotation", result.isSuccess)
        assertEquals("test-id", result.getOrNull())
        
        // Verify database interactions
        verify(mockQuotationDao).insertQuotation(any(Quotation::class.java))
        verify(mockDocumentWorkflowDao).insertWorkflow(any(DocumentWorkflow::class.java))
        verify(mockDocumentStatusHistoryDao).insertStatusHistory(any(DocumentStatusHistory::class.java))
    }

    @Test
    fun `convertQuotationToSalesOrder should fail if quotation not found`() = runBlocking {
        // Arrange
        val mockQuotationDao = mock(QuotationDao::class.java)
        `when`(database.quotationDao()).thenReturn(mockQuotationDao)
        `when`(mockQuotationDao.getQuotationById("nonexistent")).thenReturn(null)

        // Act
        val result = workflowService.convertQuotationToSalesOrder("nonexistent")

        // Assert
        assertTrue("Should fail when quotation not found", result.isFailure)
        assertEquals("Quotation not found", result.exceptionOrNull()?.message)
    }

    @Test
    fun `convertQuotationToSalesOrder should fail if quotation not accepted`() = runBlocking {
        // Arrange
        val mockQuotationDao = mock(QuotationDao::class.java)
        `when`(database.quotationDao()).thenReturn(mockQuotationDao)
        
        val quotation = Quotation(
            id = "test-id",
            quotationNumber = "QT-2025-123456",
            customerId = "customer-1",
            quotationDate = "2025-01-01",
            status = "draft", // Not accepted
            subtotal = 100.0,
            taxAmount = 10.0,
            totalAmount = 110.0,
            createdAt = "2025-01-01T10:00:00",
            updatedAt = "2025-01-01T10:00:00"
        )
        
        `when`(mockQuotationDao.getQuotationById("test-id")).thenReturn(quotation)

        // Act
        val result = workflowService.convertQuotationToSalesOrder("test-id")

        // Assert
        assertTrue("Should fail when quotation not accepted", result.isFailure)
        assertEquals("Quotation must be accepted before conversion", result.exceptionOrNull()?.message)
    }

    @Test
    fun `isValidStatusTransition should return correct validation for quotation statuses`() {
        // Use reflection to access private method or make it internal/public for testing
        val method = BusinessDocumentWorkflowService::class.java.getDeclaredMethod(
            "isValidStatusTransition", 
            String::class.java, 
            String::class.java, 
            String::class.java
        )
        method.isAccessible = true

        // Test valid transitions
        val validTransition = method.invoke(
            workflowService, 
            "quotation", 
            "draft", 
            "sent"
        ) as Boolean
        
        assertTrue("Should allow draft to sent transition", validTransition)

        // Test invalid transitions
        val invalidTransition = method.invoke(
            workflowService, 
            "quotation", 
            "draft", 
            "completed"
        ) as Boolean
        
        assertFalse("Should not allow draft to completed transition", invalidTransition)
    }

    @Test
    fun `generateDocumentNumber should create proper format`() {
        // Use reflection to access private method
        val method = BusinessDocumentWorkflowService::class.java.getDeclaredMethod(
            "generateDocumentNumber", 
            String::class.java
        )
        method.isAccessible = true

        val documentNumber = method.invoke(workflowService, "quotation") as String
        
        assertTrue("Should start with QT-", documentNumber.startsWith("QT-"))
        assertTrue("Should contain year", documentNumber.contains("2025"))
        assertTrue("Should have proper format", documentNumber.matches(Regex("QT-\\d{4}-\\d{6}")))
    }

    @Test
    fun `getNextActions should return correct actions for quotation draft status`() = runBlocking {
        // Arrange
        val mockQuotationDao = mock(QuotationDao::class.java)
        `when`(database.quotationDao()).thenReturn(mockQuotationDao)
        
        val quotation = Quotation(
            id = "test-id",
            quotationNumber = "QT-2025-123456",
            customerId = "customer-1",
            quotationDate = "2025-01-01",
            status = "draft",
            subtotal = 100.0,
            taxAmount = 10.0,
            totalAmount = 110.0,
            createdAt = "2025-01-01T10:00:00",
            updatedAt = "2025-01-01T10:00:00"
        )
        
        `when`(mockQuotationDao.getQuotationById("test-id")).thenReturn(quotation)

        // Act
        val actions = workflowService.getNextActions("test-id", "quotation")

        // Assert
        assertEquals("Should return 3 actions", 3, actions.size)
        assertTrue("Should contain send action", actions.contains("send"))
        assertTrue("Should contain cancel action", actions.contains("cancel"))
        assertTrue("Should contain edit action", actions.contains("edit"))
    }

    // Additional test interfaces that will be needed once DAOs are properly defined
    interface QuotationDao {
        suspend fun insertQuotation(quotation: Quotation)
        suspend fun getQuotationById(id: String): Quotation?
        suspend fun updateQuotation(quotation: Quotation)
    }

    interface DocumentWorkflowDao {
        suspend fun insertWorkflow(workflow: DocumentWorkflow)
        suspend fun getWorkflowByDocumentId(documentId: String): DocumentWorkflow?
        suspend fun updateWorkflow(workflow: DocumentWorkflow)
    }

    interface DocumentStatusHistoryDao {
        suspend fun insertStatusHistory(history: DocumentStatusHistory)
    }
}
