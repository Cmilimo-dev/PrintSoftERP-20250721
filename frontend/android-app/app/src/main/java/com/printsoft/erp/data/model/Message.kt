package com.printsoft.erp.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Message(
    val id: String,
    val subject: String,
    val body: String,
    val senderId: String,
    val senderName: String,
    val senderEmail: String,
    val recipientId: String,
    val recipientName: String,
    val recipientEmail: String,
    val messageType: String, // email, notification, internal, system
    val priority: String, // low, medium, high, urgent
    val status: String, // unread, read, archived, deleted
    val isRead: Boolean = false,
    val isStarred: Boolean = false,
    val parentMessageId: String? = null, // For replies and threads
    val threadId: String? = null,
    val attachments: List<MessageAttachment> = emptyList(),
    val tags: List<String> = emptyList(),
    val sentAt: String,
    val readAt: String? = null,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class MessageAttachment(
    val id: String,
    val fileName: String,
    val fileSize: Long,
    val mimeType: String,
    val url: String,
    val uploadedAt: String
)

@Serializable
data class MessageThread(
    val id: String,
    val subject: String,
    val participantIds: List<String>,
    val participantNames: List<String>,
    val messageCount: Int,
    val unreadCount: Int,
    val lastMessageAt: String,
    val lastMessagePreview: String,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class Notification(
    val id: String,
    val title: String,
    val message: String,
    val type: String, // info, warning, error, success
    val category: String, // order, shipment, hr, system, payment
    val userId: String,
    val isRead: Boolean = false,
    val actionUrl: String? = null,
    val actionText: String? = null,
    val metadata: Map<String, String> = emptyMap(),
    val createdAt: String,
    val readAt: String? = null,
    val expiresAt: String? = null
)

@Serializable
data class MailboxStats(
    val totalMessages: Int,
    val unreadMessages: Int,
    val starredMessages: Int,
    val archivedMessages: Int,
    val draftMessages: Int,
    val sentMessages: Int,
    val totalNotifications: Int,
    val unreadNotifications: Int,
    val activeThreads: Int,
    val todayMessages: Int
)

@Serializable
data class Contact(
    val id: String,
    val name: String,
    val email: String,
    val phone: String? = null,
    val company: String? = null,
    val department: String? = null,
    val role: String? = null,
    val avatarUrl: String? = null,
    val isInternal: Boolean = false,
    val lastContactAt: String? = null,
    val messageCount: Int = 0,
    val createdAt: String
)

@Serializable
data class MessageFolder(
    val id: String,
    val name: String,
    val description: String? = null,
    val messageCount: Int,
    val unreadCount: Int,
    val color: String? = null,
    val isSystem: Boolean = false, // inbox, sent, drafts, archive, trash
    val parentFolderId: String? = null,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class MessageTemplate(
    val id: String,
    val name: String,
    val subject: String,
    val body: String,
    val category: String, // order_confirmation, shipping_notification, etc.
    val variables: List<String> = emptyList(), // {customer_name}, {order_id}, etc.
    val isActive: Boolean = true,
    val createdBy: String,
    val createdAt: String,
    val updatedAt: String
)
