package com.printsoft.erp.ui.screens.mailbox

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.lifecycle.viewmodel.compose.viewModel
import com.printsoft.erp.ui.viewmodel.MailboxViewModel
import com.printsoft.erp.data.model.Message

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MailboxScreen(navController: NavHostController) {
    val mailboxViewModel: MailboxViewModel = viewModel()
    val messages = mailboxViewModel.messages.collectAsState().value
    val mailboxStats = mailboxViewModel.mailboxStats.collectAsState().value

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Mailbox",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            IconButton(onClick = { mailboxViewModel.refreshData() }) {
                Icon(Icons.Filled.Refresh, contentDescription = "Refresh")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        mailboxStats?.let { stats ->
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.height(80.dp)
            ) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        StatCard(
                            title = "Unread Messages",
                            value = stats.unreadMessages.toString(),
                            icon = Icons.Filled.Markunread,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "Starred",
                            value = stats.starredMessages.toString(),
                            icon = Icons.Filled.Star,
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "Drafts",
                            value = stats.draftMessages.toString(),
                            icon = Icons.Filled.Drafts,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Messages",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxHeight()
        ) {
            items(messages) { message ->
                MessageCard(message = message)
            }
        }
    }
}

@Composable
fun MessageCard(message: Message) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Subject: ${message.subject}",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "From: ${message.senderName}",
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = "To: ${message.recipientName}",
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = "Sent: ${message.sentAt}",
                style = MaterialTheme.typography.bodySmall
            )
            Text(
                text = "Preview: ${message.body.take(100)}...",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        )
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}
