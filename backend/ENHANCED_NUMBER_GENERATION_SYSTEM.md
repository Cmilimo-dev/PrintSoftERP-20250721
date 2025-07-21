# Enhanced Document Number Generation System

## Overview

The PrintSoft ERP system now includes a comprehensive document number generation system that supports multiple formats and provides consistent numbering across all document types. This system is designed to be flexible, configurable, and accessible through both API endpoints and the settings interface.

## Key Features

### 1. Multiple Number Format Options

The system supports 9 different number formats:

1. **Prefix + Timestamp** (`prefix-timestamp`)
   - Example: `PAY-1752224798257`
   - Uses current timestamp for uniqueness

2. **Prefix + Sequential Number** (`prefix-sequential`)
   - Example: `PAY-000001`
   - Traditional sequential numbering

3. **Prefix + Year + Sequential** (`prefix-year-sequential`)
   - Example: `PAY-2025-000001`
   - Includes year for annual tracking

4. **Prefix + Year/Month + Sequential** (`prefix-yearmonth-sequential`)
   - Example: `PAY-202507-000001`
   - Monthly segmentation

5. **Prefix + Date + Sequential** (`prefix-date-sequential`)
   - Example: `PAY-20250711-000001`
   - Daily segmentation

6. **Year + Prefix + Sequential** (`year-prefix-sequential`)
   - Example: `2025-PAY-000001`
   - Year-first format

7. **Date + Prefix + Sequential** (`date-prefix-sequential`)
   - Example: `20250711-PAY-000001`
   - Date-first format

8. **Sequential Number Only** (`sequential-only`)
   - Example: `000001`
   - Simple sequential numbering

9. **Custom Format** (`custom`)
   - User-defined format patterns

### 2. Supported Document Types

The system supports 21 different document types:

- **Financial Documents**: Payment Receipt, Invoice, Credit Note, Debit Note, Receipt
- **Sales Documents**: Sales Order, Quotation, Delivery Note
- **Purchase Documents**: Purchase Order, Purchase Return, Goods Receiving Voucher
- **Inventory Documents**: Stock Adjustment, Stock Transfer
- **Business Documents**: Work Order, Service Order, Expense Claim, Petty Cash, Journal Entry
- **Customer/Vendor**: Customer, Vendor, Customer Return

### 3. Configurable Settings

Each document type can be configured with:

- **Prefix**: Custom prefix (e.g., "PAY", "INV", "SO")
- **Suffix**: Optional suffix
- **Next Number**: Starting number for sequence
- **Number Length**: Zero-padded length (1-12 digits)
- **Separator**: Character between components (-, _, ., /, or none)
- **Format**: One of the 9 supported formats
- **Auto Increment**: Enable/disable automatic incrementing
- **Reset Frequency**: Never, Yearly, Monthly, or Daily
- **Active Status**: Enable/disable number generation

## API Endpoints

### Core Number Generation

```http
POST /api/number-generation/generate-number/:type
```
Generate a new number for the specified document type.

```http
GET /api/number-generation/generate-number/:type/next
```
Preview the next number without incrementing.

```http
PUT /api/number-generation/generate-number/:type/reset
```
Reset the counter for a document type.

### Format Management

```http
GET /api/settings/number-generation/formats
```
Get all available number formats.

```http
POST /api/settings/number-generation/preview/:type
```
Preview a number with specific format settings.

```http
PUT /api/settings/number-generation/formats/bulk-update
```
Update format settings for all document types.

### Settings Management

```http
GET /api/settings/number-generation
```
Get all number generation settings.

```http
POST /api/settings/number-generation
```
Update settings for a specific document type.

```http
GET /api/settings/number-generation/counters
```
Get all counters and their current values.

## Usage Examples

### Generate a Payment Receipt Number

```bash
curl -X POST http://localhost:3001/api/number-generation/generate-number/payment_receipt \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "number": "PAY-202507-009005",
    "type": "payment_receipt",
    "counter": 9005,
    "prefix": "PAY",
    "format": "prefix-yearmonth-sequential"
  }
}
```

### Preview Format Changes

```bash
curl -X POST http://localhost:3001/api/settings/number-generation/preview/payment_receipt \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "prefix-date-sequential",
    "separator": "-",
    "number_length": 6
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "preview": "PAY-20250711-009005",
    "settings": {
      "format": "prefix-date-sequential",
      "separator": "-",
      "number_length": 6
    },
    "format_info": {
      "name": "Prefix + Date + Sequential",
      "example": "PAY-20250711-000001"
    }
  }
}
```

### Update All Formats

```bash
curl -X PUT http://localhost:3001/api/settings/number-generation/formats/bulk-update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "prefix-yearmonth-sequential",
    "separator": "-",
    "number_length": 6
  }'
```

## Database Schema

### number_generation_settings Table

```sql
CREATE TABLE number_generation_settings (
  id VARCHAR(36) PRIMARY KEY,
  document_type VARCHAR(100) UNIQUE NOT NULL,
  prefix VARCHAR(10) DEFAULT '',
  suffix VARCHAR(10) DEFAULT '',
  next_number INT DEFAULT 1,
  number_length INT DEFAULT 6,
  separator VARCHAR(5) DEFAULT '-',
  format VARCHAR(50) DEFAULT 'prefix-number',
  auto_increment BOOLEAN DEFAULT TRUE,
  reset_frequency VARCHAR(20) DEFAULT 'never',
  last_reset_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### document_sequences Table

```sql
CREATE TABLE document_sequences (
  id VARCHAR(36) PRIMARY KEY,
  document_type VARCHAR(100) NOT NULL,
  document_number VARCHAR(100) NOT NULL,
  sequence_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_type) REFERENCES number_generation_settings(document_type)
);
```

## Frontend Integration

### Settings Interface

The system includes an enhanced settings interface accessible at:
- `/settings` → Number Generation tab
- Enhanced component: `EnhancedNumberGenerationSettingsTab`

Features:
- Global format settings for all documents
- Individual document configuration
- Real-time preview of number formats
- Bulk update capabilities
- Test number generation

### API Client Integration

The frontend API client includes methods for:
- `apiClient.generateNumber(type)`
- `apiClient.getNumberGenerationFormats()`
- `apiClient.previewNumberFormat(type, settings)`
- `apiClient.updateAllNumberFormats(settings)`
- `apiClient.getNumberGenerationSettings()`
- `apiClient.updateNumberGenerationSetting(type, updates)`

## Implementation Details

### Format Generation Logic

The system uses a centralized `generateFormattedNumber()` function that:
1. Extracts current date/time components
2. Pads sequence numbers to specified length
3. Applies the selected format pattern
4. Handles separator characters
5. Returns the formatted number

### Database Transactions

All number generation operations are atomic:
1. Generate the number
2. Update the counter
3. Record the sequence
4. Return the result

This ensures no duplicate numbers are generated even under high concurrency.

### Error Handling

The system includes comprehensive error handling:
- Invalid document types
- Missing settings
- Database connection issues
- Authentication failures
- Format validation errors

## Testing

### Test Endpoints

For development and testing, the system includes unauthenticated endpoints:
- `GET /test/number-generation` - View all settings
- `POST /test/generate-number/:type` - Generate test numbers

### Example Test Usage

```bash
# Test payment receipt generation
curl -X POST http://localhost:3001/test/generate-number/payment_receipt

# View all settings
curl -X GET http://localhost:3001/test/number-generation
```

## Configuration Best Practices

1. **Choose Appropriate Formats**: Use timestamp formats for high-volume documents, sequential for audit trails
2. **Set Reasonable Lengths**: 6-8 digits for most use cases
3. **Use Consistent Separators**: Maintain consistency across document types
4. **Plan for Growth**: Consider future volume when setting starting numbers
5. **Regular Resets**: Use reset frequency for period-based numbering
6. **Test Before Production**: Always test format changes in development

## Security Considerations

1. **Authentication Required**: All production endpoints require valid JWT tokens
2. **Role-Based Access**: Only admin users can modify global settings
3. **Audit Trail**: All number generation is logged in document_sequences
4. **Input Validation**: All settings are validated before saving
5. **Rate Limiting**: Consider implementing rate limiting for high-volume usage

## Future Enhancements

1. **Custom Format Builder**: Visual format builder interface
2. **Import/Export**: Bulk import/export of settings
3. **Templates**: Pre-defined format templates
4. **Analytics**: Usage statistics and analytics
5. **Multi-Company**: Company-specific numbering schemes
6. **Webhooks**: Integration with external systems
7. **Backup/Restore**: Settings backup and restoration

This enhanced number generation system provides a robust, flexible foundation for document numbering across the entire PrintSoft ERP system while maintaining consistency and providing powerful configuration options for users.
