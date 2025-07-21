package com.printsoft.erp.data.dto

import kotlinx.serialization.Serializable

@Serializable
data class SendMessageRequest(
    val recipientIds: List<String>,
    val subject: String,
    val body: String,
    val messageType: String = "email",
    val priority: String = "medium",
    val parentMessageId: String? = null,
    val attachmentIds: List<String> = emptyList(),
    val tags: List<String> = emptyList(),
    val scheduledFor: String? = null
)

@Serializable
data class UpdateMessageRequest(
    val isRead: Boolean? = null,
    val isStarred: Boolean? = null,
    val status: String? = null,
    val tags: List<String>? = null,
    val folderId: String? = null
)

@Serializable
data class CreateNotificationRequest(
    val title: String,
    val message: String,
    val type: String,
    val category: String,
    val userIds: List<String>,
    val actionUrl: String? = null,
    val actionText: String? = null,
    val metadata: Map<String, String> = emptyMap(),
    val expiresAt: String? = null
)

@Serializable
data class MessageFilterRequest(
    val folderId: String? = null,
    val senderId: String? = null,
    val messageType: String? = null,
    val priority: String? = null,
    val status: String? = null,
    val isRead: Boolean? = null,
    val isStarred: Boolean? = null,
    val tags: List<String>? = null,
    val dateFrom: String? = null,
    val dateTo: String? = null,
    val searchQuery: String? = null,
    val page: Int = 1,
    val limit: Int = 20,
    val sortBy: String = "sentAt",
    val sortOrder: String = "desc"
)

@Serializable
data class NotificationFilterRequest(
    val category: String? = null,
    val type: String? = null,
    val isRead: Boolean? = null,
    val dateFrom: String? = null,
    val dateTo: String? = null,
    val page: Int = 1,
    val limit: Int = 20
)

@Serializable
data class CreateContactRequest(
    val name: String,
    val email: String,
    val phone: String? = null,
    val company: String? = null,
    val department: String? = null,
    val role: String? = null,
    val isInternal: Boolean = false
)

@Serializable
data class UpdateContactRequest(
    val name: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val company: String? = null,
    val department: String? = null,
    val role: String? = null,
    val avatarUrl: String? = null
)

@Serializable
data class CreateFolderRequest(
    val name: String,
    val description: String? = null,
    val color: String? = null,
    val parentFolderId: String? = null
)

@Serializable
data class UpdateFolderRequest(
    val name: String? = null,
    val description: String? = null,
    val color: String? = null,
    val parentFolderId: String? = null
)

@Serializable
data class CreateTemplateRequest(
    val name: String,
    val subject: String,
    val body: String,
    val category: String,
    val variables: List<String> = emptyList()
)

@Serializable
data class UpdateTemplateRequest(
    val name: String? = null,
    val subject: String? = null,
    val body: String? = null,
    val category: String? = null,
    val variables: List<String>? = null,
    val isActive: Boolean? = null
)

@Serializable
data class BulkMessageActionRequest(
    val messageIds: List<String>,
    val action: String, // read, unread, star, unstar, archive, delete, move
    val targetFolderId: String? = null,
    val tags: List<String>? = null
)

@Serializable
data class MessageSearchRequest(
    val query: String,
    val folders: List<String>? = null,
    val dateFrom: String? = null,
    val dateTo: String? = null,
    val senders: List<String>? = null,
    val messageTypes: List<String>? = null,
    val hasAttachments: Boolean? = null,
    val page: Int = 1,
    val limit: Int = 20
)

@Serializable
data class MessageStatsResponse(
    val totalMessages: Int,
    val unreadMessages: Int,
    val todayMessages: Int,
    val weekMessages: Int,
    val monthMessages: Int,
    val messagesByType: Map<String, Int>,
    val messagesByPriority: Map<String, Int>,
    val topSenders: List<SenderStats>,
    val messageTrend: List<MessageTrendData>
)

@Serializable
data class SenderStats(
    val senderId: String,
    val senderName: String,
    val messageCount: Int,
    val lastMessageAt: String
)

@Serializable
data class MessageTrendData(
    val date: String,
    val messageCount: Int,
    val unreadCount: Int
)
