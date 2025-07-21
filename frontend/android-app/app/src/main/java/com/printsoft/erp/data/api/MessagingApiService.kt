package com.printsoft.erp.data.api

import com.printsoft.erp.data.dto.*
import com.printsoft.erp.data.model.*
import com.printsoft.erp.data.models.ApiResponse
import com.printsoft.erp.data.models.*
import retrofit2.Response
import retrofit2.http.*
import okhttp3.MultipartBody
import okhttp3.RequestBody

interface MessagingApiService {
    
    // Message endpoints
    @GET("messaging/messages")
    suspend fun getMessages(
        @Query("folder_id") folderId: String? = null,
        @Query("sender_id") senderId: String? = null,
        @Query("message_type") messageType: String? = null,
        @Query("priority") priority: String? = null,
        @Query("status") status: String? = null,
        @Query("is_read") isRead: Boolean? = null,
        @Query("is_starred") isStarred: Boolean? = null,
        @Query("tags") tags: List<String>? = null,
        @Query("date_from") dateFrom: String? = null,
        @Query("date_to") dateTo: String? = null,
        @Query("search_query") searchQuery: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("sort_by") sortBy: String = "sentAt",
        @Query("sort_order") sortOrder: String = "desc"
    ): Response<ApiResponse<List<Message>>>
    
    @GET("messaging/messages/{id}")
    suspend fun getMessage(@Path("id") messageId: String): Response<ApiResponse<Message>>
    
    @POST("messaging/messages")
    suspend fun sendMessage(@Body request: SendMessageRequest): Response<ApiResponse<Message>>
    
    @PUT("messaging/messages/{id}")
    suspend fun updateMessage(
        @Path("id") messageId: String,
        @Body request: UpdateMessageRequest
    ): Response<ApiResponse<Message>>
    
    @DELETE("messaging/messages/{id}")
    suspend fun deleteMessage(@Path("id") messageId: String): Response<ApiResponse<Unit>>
    
    @POST("messaging/messages/bulk-action")
    suspend fun bulkMessageAction(@Body request: BulkMessageActionRequest): Response<ApiResponse<Unit>>
    
    @POST("messaging/messages/{id}/reply")
    suspend fun replyToMessage(
        @Path("id") messageId: String,
        @Body request: SendMessageRequest
    ): Response<ApiResponse<Message>>
    
    @POST("messaging/messages/{id}/forward")
    suspend fun forwardMessage(
        @Path("id") messageId: String,
        @Body request: SendMessageRequest
    ): Response<ApiResponse<Message>>
    
    // Thread endpoints
    @GET("messaging/threads")
    suspend fun getMessageThreads(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<List<MessageThread>>>
    
    @GET("messaging/threads/{id}")
    suspend fun getMessageThread(@Path("id") threadId: String): Response<ApiResponse<MessageThread>>
    
    @GET("messaging/threads/{id}/messages")
    suspend fun getThreadMessages(@Path("id") threadId: String): Response<ApiResponse<List<Message>>>
    
    // Notification endpoints
    @GET("messaging/notifications")
    suspend fun getNotifications(
        @Query("category") category: String? = null,
        @Query("type") type: String? = null,
        @Query("is_read") isRead: Boolean? = null,
        @Query("date_from") dateFrom: String? = null,
        @Query("date_to") dateTo: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<List<Notification>>>
    
    @GET("messaging/notifications/{id}")
    suspend fun getNotification(@Path("id") notificationId: String): Response<ApiResponse<Notification>>
    
    @POST("messaging/notifications")
    suspend fun createNotification(@Body request: CreateNotificationRequest): Response<ApiResponse<Notification>>
    
    @PUT("messaging/notifications/{id}/read")
    suspend fun markNotificationAsRead(@Path("id") notificationId: String): Response<ApiResponse<Notification>>
    
    @PUT("messaging/notifications/mark-all-read")
    suspend fun markAllNotificationsAsRead(): Response<ApiResponse<Unit>>
    
    @DELETE("messaging/notifications/{id}")
    suspend fun deleteNotification(@Path("id") notificationId: String): Response<ApiResponse<Unit>>
    
    // Contact endpoints
    @GET("messaging/contacts")
    suspend fun getContacts(
        @Query("search") search: String? = null,
        @Query("company") company: String? = null,
        @Query("department") department: String? = null,
        @Query("is_internal") isInternal: Boolean? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<List<Contact>>>
    
    @GET("messaging/contacts/{id}")
    suspend fun getContact(@Path("id") contactId: String): Response<ApiResponse<Contact>>
    
    @POST("messaging/contacts")
    suspend fun createContact(@Body request: CreateContactRequest): Response<ApiResponse<Contact>>
    
    @PUT("messaging/contacts/{id}")
    suspend fun updateContact(
        @Path("id") contactId: String,
        @Body request: UpdateContactRequest
    ): Response<ApiResponse<Contact>>
    
    @DELETE("messaging/contacts/{id}")
    suspend fun deleteContact(@Path("id") contactId: String): Response<ApiResponse<Unit>>
    
    // Folder endpoints
    @GET("messaging/folders")
    suspend fun getFolders(): Response<ApiResponse<List<MessageFolder>>>
    
    @GET("messaging/folders/{id}")
    suspend fun getFolder(@Path("id") folderId: String): Response<ApiResponse<MessageFolder>>
    
    @POST("messaging/folders")
    suspend fun createFolder(@Body request: CreateFolderRequest): Response<ApiResponse<MessageFolder>>
    
    @PUT("messaging/folders/{id}")
    suspend fun updateFolder(
        @Path("id") folderId: String,
        @Body request: UpdateFolderRequest
    ): Response<ApiResponse<MessageFolder>>
    
    @DELETE("messaging/folders/{id}")
    suspend fun deleteFolder(@Path("id") folderId: String): Response<ApiResponse<Unit>>
    
    // Template endpoints
    @GET("messaging/templates")
    suspend fun getTemplates(
        @Query("category") category: String? = null,
        @Query("is_active") isActive: Boolean? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<List<MessageTemplate>>>
    
    @GET("messaging/templates/{id}")
    suspend fun getTemplate(@Path("id") templateId: String): Response<ApiResponse<MessageTemplate>>
    
    @POST("messaging/templates")
    suspend fun createTemplate(@Body request: CreateTemplateRequest): Response<ApiResponse<MessageTemplate>>
    
    @PUT("messaging/templates/{id}")
    suspend fun updateTemplate(
        @Path("id") templateId: String,
        @Body request: UpdateTemplateRequest
    ): Response<ApiResponse<MessageTemplate>>
    
    @DELETE("messaging/templates/{id}")
    suspend fun deleteTemplate(@Path("id") templateId: String): Response<ApiResponse<Unit>>
    
    // Attachment endpoints
    @POST("messaging/attachments")
    suspend fun uploadAttachment(@Body request: UploadAttachmentRequest): Response<ApiResponse<MessageAttachment>>
    
    @DELETE("messaging/attachments/{id}")
    suspend fun deleteAttachment(@Path("id") attachmentId: String): Response<ApiResponse<Unit>>
    
    // Search and analytics
    @POST("messaging/search")
    suspend fun searchMessages(@Body request: MessageSearchRequest): Response<ApiResponse<List<Message>>>
    
    @GET("messaging/stats")
    suspend fun getMailboxStats(): Response<ApiResponse<MailboxStats>>
    
    @GET("messaging/dashboard")
    suspend fun getMessagingDashboard(): Response<ApiResponse<MessagingDashboardData>>
    
    @GET("messaging/reports/statistics")
    suspend fun getMessageStatistics(
        @Query("date_from") dateFrom: String,
        @Query("date_to") dateTo: String
    ): Response<ApiResponse<MessageStatsResponse>>
    
    // Settings
    @GET("messaging/settings")
    suspend fun getMessagingSettings(): Response<ApiResponse<MessagingSettings>>
    
    @PUT("messaging/settings")
    suspend fun updateMessagingSettings(@Body request: UpdateMessagingSettingsRequest): Response<ApiResponse<MessagingSettings>>
}
