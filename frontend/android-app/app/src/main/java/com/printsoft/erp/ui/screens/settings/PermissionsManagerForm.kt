package com.printsoft.erp.ui.screens.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.printsoft.erp.data.model.UserRole
import com.printsoft.erp.ui.viewmodel.SettingsViewModel

@Composable
fun PermissionsManagerForm(viewModel: SettingsViewModel) {
    val userRoles = viewModel.userRoles.collectAsState().value
    val permissions = viewModel.permissions.collectAsState().value
    var showCreateRoleDialog by remember { mutableStateOf(false) }
    var selectedRole by remember { mutableStateOf<UserRole?>(null) }

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
                text = "User Roles & Permissions",
                style = MaterialTheme.typography.headlineMedium
            )
            FloatingActionButton(
                onClick = { showCreateRoleDialog = true },
                modifier = Modifier.size(40.dp)
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Create Role")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(userRoles) { role ->
                RoleCard(
                    role = role,
                    onEditClick = { selectedRole = it },
                    onDeleteClick = { /* Handle delete */ }
                )
            }
        }
    }

    if (showCreateRoleDialog) {
        CreateRoleDialog(
            onDismiss = { showCreateRoleDialog = false },
            onCreateRole = { name, description, selectedPermissions ->
                // Handle role creation
                showCreateRoleDialog = false
            },
            permissions = permissions
        )
    }
}

@Composable
fun RoleCard(
    role: UserRole,
    onEditClick: (UserRole) -> Unit,
    onDeleteClick: (UserRole) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onEditClick(role) }
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = role.name,
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = role.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Row {
                    IconButton(onClick = { onEditClick(role) }) {
                        Icon(Icons.Filled.Edit, contentDescription = "Edit")
                    }
                    if (!role.isSystemRole) {
                        IconButton(onClick = { onDeleteClick(role) }) {
                            Icon(Icons.Filled.Delete, contentDescription = "Delete")
                        }
                    }
                }
            }
            
            if (role.isSystemRole) {
                Chip(
                    onClick = { },
                    label = { Text("System Role", style = MaterialTheme.typography.labelSmall) }
                )
            }
        }
    }
}

@Composable
fun CreateRoleDialog(
    onDismiss: () -> Unit,
    onCreateRole: (String, String, List<String>) -> Unit,
    permissions: List<com.printsoft.erp.data.model.Permission>
) {
    var roleName by remember { mutableStateOf("") }
    var roleDescription by remember { mutableStateOf("") }
    var selectedPermissions by remember { mutableStateOf(setOf<String>()) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Create New Role") },
        text = {
            Column {
                OutlinedTextField(
                    value = roleName,
                    onValueChange = { roleName = it },
                    label = { Text("Role Name") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = roleDescription,
                    onValueChange = { roleDescription = it },
                    label = { Text("Description") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text("Permissions:", style = MaterialTheme.typography.titleSmall)
                
                LazyColumn(
                    modifier = Modifier.height(200.dp)
                ) {
                    items(permissions) { permission ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(
                                checked = selectedPermissions.contains(permission.id),
                                onCheckedChange = { isChecked ->
                                    selectedPermissions = if (isChecked) {
                                        selectedPermissions + permission.id
                                    } else {
                                        selectedPermissions - permission.id
                                    }
                                }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    text = permission.name,
                                    style = MaterialTheme.typography.bodyMedium
                                )
                                Text(
                                    text = permission.description ?: "",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onCreateRole(roleName, roleDescription, selectedPermissions.toList())
                },
                enabled = roleName.isNotBlank()
            ) {
                Text("Create")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
