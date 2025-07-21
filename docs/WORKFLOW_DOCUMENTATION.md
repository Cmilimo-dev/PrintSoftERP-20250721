# Document Workflow System

## Overview

The PrintSoft ERP system now implements a comprehensive document workflow with status-based conversions and a clean three-dot menu interface for document actions.

## Workflow Rules

### Quotation → Sales Order
- **Trigger**: Quotation status changes to "accepted"
- **Action**: Three-dot menu shows "Make Sale Order" option
- **Result**: Creates new sales order with same line items and customer information
- **Status Change**: Quotation status becomes "converted"

### Sales Order → Invoice & Delivery Note
- **Trigger**: Sales order status changes to "confirmed"
- **Actions**: Three-dot menu shows both:
  - "Make Invoice" - Creates invoice for billing
  - "Create DNote" - Creates delivery note for shipping
- **Result**: Both documents can be created independently from the same sales order

## User Interface

### Three-Dot Menu System
Instead of showing conversion buttons that appear and disappear, we now use a consistent three-dot (⋯) menu that:

1. **Positioned alongside status**: The three-dot menu appears next to the status change button
2. **Contextual content**: Menu items only appear when the document status allows for conversions
3. **Tooltip support**: Hover over the three-dot menu to see "Document Actions" tooltip
4. **Short labels**: Uses concise text like "Make Sale Order", "Make Invoice", "Create DNote"
5. **Consistent placement**: Same horizontal layout across all document types

### Status-Based Workflow
- Documents must be in the correct status for conversions to be available
- Status changes are handled by the `StatusChangeButton` component
- Conversions are triggered through the dropdown menu actions

## Implementation Details

### Components Updated
1. **QuotationList.tsx**: Uses three-dot menu with "Make Sale Order" option
2. **SalesOrderList.tsx**: Uses three-dot menu with "Make Invoice" and "Create DNote" options
3. **DocumentWorkflowDemo.tsx**: Demonstrates the new workflow system
4. **Tooltip.tsx**: New component for enhanced UX

### Key Features
- **Status validation**: Actions only appear when document status permits conversion
- **Short labels**: "Make Sale Order", "Make Invoice", "Create DNote"
- **Tooltip support**: Hover hints for better user experience
- **Consistent UX**: Same interaction pattern across all document types

### Hooks Used
- `useConvertQuotationToSalesOrder`: Handles quotation to sales order conversion
- `useConvertSalesOrderToInvoice`: Handles sales order to invoice conversion
- `useCreateDeliveryNoteFromSalesOrder`: Handles delivery note creation

## Usage Examples

### For Quotations
1. Create a quotation
2. Change status to "accepted"
3. Click the three-dot menu (⋯)
4. Select "Make Sale Order"
5. New sales order is created and quotation status becomes "converted"

### For Sales Orders
1. Create or convert from quotation
2. Change status to "confirmed"
3. Click the three-dot menu (⋯)
4. Choose either:
   - "Make Invoice" to create billing document
   - "Create DNote" to create delivery document
5. Both can be created independently

## Benefits

1. **Clean Interface**: No more buttons appearing/disappearing based on status
2. **Consistent UX**: Same interaction pattern for all conversions
3. **Better Discoverability**: Three-dot menu is always visible
4. **Improved Workflow**: Clear progression from quote → order → invoice/delivery
5. **Professional Look**: Short, concise labels that save space
6. **Enhanced UX**: Tooltips provide additional context

## Technical Notes

### Service Layer
- `DocumentWorkflowService` handles all conversion logic
- Validates document status before allowing conversions
- Creates linked documents with proper relationships
- Updates original document status after conversion

### Database Relations
- Quotations link to sales orders via `converted_to_order_id`
- Sales orders link to invoices via `sales_order_id`
- Sales orders link to delivery notes via `sales_order_id`

### Error Handling
- Status validation prevents invalid conversions
- Duplicate conversion checks prevent data issues
- Proper error messages for user feedback
