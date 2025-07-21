# System Settings Module

This module has been refactored for better code organization and maintainability.

## Structure

```
src/components/settings/
├── DocumentSettingsManager.tsx    # Main component (orchestrator)
├── tabs/                          # Individual tab components
│   ├── index.ts                  # Clean exports
│   ├── CompanyInfoTab.tsx        # Company information form
│   ├── NumberGenerationSettingsTab.tsx # Document number generation settings
│   ├── AutoNumberingTab.tsx      # Auto-numbering settings
│   ├── CompanyDisplayTab.tsx     # Display and logo settings
│   ├── TaxSettingsTab.tsx        # Tax configuration
│   └── IntegrationsTab.tsx       # eTIMS and other integrations
└── README.md                     # This file
```

## Custom Hook

```
src/hooks/
└── useSystemSettings.ts          # Custom hook for state management
```

## Key Improvements

### 1. **Modular Architecture**
- Each tab is now a separate, focused component
- Easier to maintain and test individual features
- Better code reusability

### 2. **Custom Hook Pattern**
- `useSystemSettings` centralizes all state logic
- Consistent data flow across all tabs
- Better separation of concerns

### 3. **Clean Imports**
- Index file for tab components
- Reduced import complexity in main component

### 4. **Better Error Handling**
- Graceful fallbacks for missing data
- Migration logic for backward compatibility
- Loading and error states

### 5. **Type Safety**
- Proper TypeScript interfaces
- Safe property access with optional chaining
- Runtime type checking where needed

## Usage

### Adding a New Tab

1. Create the tab component in `tabs/` directory
2. Export it from `tabs/index.ts`
3. Import and use in `DocumentSettingsManager.tsx`
4. Add the corresponding `TabsTrigger` and `TabsContent`

### Modifying Settings

Use the provided update functions from the hook:
- `updateCompanyInfo(updates)`
- `updateTaxConfig(updates)`
- `updateDocumentDefaults(updates)`
- `updateIntegrations(updates)`
- `saveSettings(updates)` for complex updates

### Example Tab Component

```tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// ... other imports

interface MyTabProps {
  data: MyDataType;
  onUpdate: (updates: Partial<MyDataType>) => void;
}

const MyTab: React.FC<MyTabProps> = ({ data, onUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Tab</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tab content */}
      </CardContent>
    </Card>
  );
};

export default MyTab;
```

## Benefits

- **Maintainability**: Easy to find and modify specific functionality
- **Testability**: Each tab can be tested in isolation
- **Scalability**: Simple to add new settings tabs
- **Readability**: Clean, focused components with single responsibilities
- **Performance**: Better code splitting and lazy loading potential
