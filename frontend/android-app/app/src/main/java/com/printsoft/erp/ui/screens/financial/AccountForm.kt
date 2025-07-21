package com.printsoft.erp.ui.screens.financial

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.printsoft.erp.ui.viewmodel.FinancialViewModel
import java.util.*

@Composable
fun AccountForm(
    account: Map<String, Any>?,
    viewModel: FinancialViewModel,
    onClose: () -> Unit
) {
    var accountCode by remember { mutableStateOf(account?.get("accountCode") as? String ?: "") }
    var accountName by remember { mutableStateOf(account?.get("accountName") as? String ?: "") }
    var accountType by remember { mutableStateOf(account?.get("accountType") as? String ?: "asset") }
    var description by remember { mutableStateOf(account?.get("description") as? String ?: "") }
    var isActive by remember { mutableStateOf(account?.get("isActive") as? Boolean ?: true) }
    
    val accountTypes = listOf("asset", "liability", "equity", "income", "expense")

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = if (account == null) "Create Account" else "Edit Account",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))

        TextField(
            value = accountCode,
            onValueChange = { accountCode = it },
            label = { Text("Account Code") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = accountName,
            onValueChange = { accountName = it },
            label = { Text("Account Name") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        var expandedType by remember { mutableStateOf(false) }
        
        ExposedDropdownMenuBox(
            expanded = expandedType,
            onExpandedChange = { expandedType = !expandedType },
            modifier = Modifier.fillMaxWidth()
        ) {
            TextField(
                value = accountType,
                onValueChange = { },
                readOnly = true,
                label = { Text("Account Type") },
                trailingIcon = {
                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedType)
                },
                modifier = Modifier
                    .menuAnchor()
                    .fillMaxWidth()
            )
            
            ExposedDropdownMenu(
                expanded = expandedType,
                onDismissRequest = { expandedType = false }
            ) {
                accountTypes.forEach { type ->
                    DropdownMenuItem(
                        text = { Text(type.capitalize()) },
                        onClick = {
                            accountType = type
                            expandedType = false
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Description") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
            maxLines = 4
        )

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = isActive,
                    onCheckedChange = { isActive = it }
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Active")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            horizontalArrangement = Arrangement.End,
            modifier = Modifier.fillMaxWidth()
        ) {
            TextButton(onClick = { onClose() }) {
                Icon(Icons.Filled.Close, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Cancel")
            }
            Spacer(modifier = Modifier.width(16.dp))
            Button(
                onClick = {
                    val newAccount = mapOf(
                        "id" to (account?.get("id") ?: UUID.randomUUID().toString()),
                        "accountCode" to accountCode,
                        "accountName" to accountName,
                        "accountType" to accountType,
                        "description" to description,
                        "isActive" to isActive
                    )
                    if (account == null) {
                        viewModel.createAccount(newAccount)
                    } else {
                        viewModel.updateAccount(newAccount)
                    }
                    onClose()
                }
            ) {
                Icon(Icons.Filled.Save, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Save")
            }
        }
    }
}
