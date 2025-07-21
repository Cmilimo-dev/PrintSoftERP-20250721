package com.printsoft.erp.ui.screens.sales

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.printsoft.erp.data.model.Quotation
import com.printsoft.erp.ui.viewmodel.SalesViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun QuotationForm(
    quotation: Quotation?,
    viewModel: SalesViewModel,
    onClose: () -> Unit
) {
    var quotationNumber by remember { mutableStateOf(quotation?.quotationNumber ?: "") }
    var customerId by remember { mutableStateOf(quotation?.customerId ?: "") }
    var quotationDate by remember { mutableStateOf(quotation?.quotationDate ?: "") }
    var validUntil by remember { mutableStateOf(quotation?.validUntil ?: "") }
    var totalAmount by remember { mutableStateOf(quotation?.totalAmount ?: 0.0) }
    var notes by remember { mutableStateOf(quotation?.notes ?: "") }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = if (quotation == null) "Create Quotation" else "Edit Quotation",
            style = MaterialTheme.typography.titleLarge
        )
        Spacer(modifier = Modifier.height(16.dp))

        TextField(
            value = quotationNumber,
            onValueChange = { quotationNumber = it },
            label = { Text("Quotation Number") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = customerId,
            onValueChange = { customerId = it },
            label = { Text("Customer ID") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = quotationDate,
            onValueChange = { quotationDate = it },
            label = { Text("Quotation Date") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = validUntil,
            onValueChange = { validUntil = it },
            label = { Text("Valid Until") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = totalAmount.toString(),
            onValueChange = { totalAmount = it.toDoubleOrNull() ?: 0.0 },
            label = { Text("Total Amount") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions.Default.copy(keyboardType = KeyboardType.Number)
        )

        Spacer(modifier = Modifier.height(8.dp))

        TextField(
            value = notes,
            onValueChange = { notes = it },
            label = { Text("Notes") },
            modifier = Modifier.fillMaxWidth(),
            maxLines = 3
        )

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
                    val newQuotation = Quotation(
                        id = quotation?.id ?: UUID.randomUUID().toString(),
                        quotationNumber = quotationNumber,
                        customerId = customerId,
                        quotationDate = quotationDate,
                        validUntil = validUntil.takeIf { it.isNotEmpty() },
                        status = "draft",
                        subtotal = quotation?.subtotal ?: 0.0,
                        taxAmount = quotation?.taxAmount ?: 0.0,
                        totalAmount = totalAmount,
                        termsAndConditions = quotation?.termsAndConditions,
                        notes = notes.takeIf { it.isNotEmpty() },
                        createdBy = quotation?.createdBy,
                        createdAt = quotation?.createdAt ?: SimpleDateFormat("yyyy-MM-dd").format(Date()),
                        updatedAt = SimpleDateFormat("yyyy-MM-dd").format(Date())
                    )
                    if (quotation == null) {
                        viewModel.createQuotation(newQuotation)
                    } else {
                        viewModel.updateQuotation(newQuotation)
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
