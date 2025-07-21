package com.printsoft.erp.utils

import android.graphics.Bitmap
import android.graphics.Color
import com.google.zxing.BarcodeFormat
import com.google.zxing.WriterException
import com.google.zxing.common.BitMatrix
import com.google.zxing.qrcode.QRCodeWriter

object QRCodeGenerator {
    
    fun generateQRCodeBitmap(
        text: String,
        width: Int = 200,
        height: Int = 200
    ): Bitmap? {
        return try {
            val qrCodeWriter = QRCodeWriter()
            val bitMatrix: BitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height)
            
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565)
            for (x in 0 until width) {
                for (y in 0 until height) {
                    bitmap.setPixel(x, y, if (bitMatrix[x, y]) Color.BLACK else Color.WHITE)
                }
            }
            bitmap
        } catch (e: WriterException) {
            e.printStackTrace()
            null
        }
    }
    
    fun generateQRCodeForDocument(
        documentType: String,
        documentNumber: String,
        customerId: String,
        totalAmount: Double
    ): Bitmap? {
        val qrData = "Type: $documentType\nNumber: $documentNumber\nCustomer: $customerId\nAmount: $totalAmount"
        return generateQRCodeBitmap(qrData)
    }
}
