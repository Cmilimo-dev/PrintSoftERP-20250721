import React, { useContext, useEffect, useState } from 'react';
import { SystemSettings, DocumentType } from '@/types/businessDocuments';

interface SettingsContextValue {
  settings: SystemSettings;
  updateSettings: (updates: Partial<SystemSettings>) => void;
}

const defaultSettings: SystemSettings = {
  company: {
    name: 'Default Company',
    address: '123 Default St, City',
    city: 'Example City',
    state: 'EX',
    zip: '11111',
    country: 'Example Country',
    phone: '+1 234 567 890',
    email: 'info@default.com',
    taxId: 'AB123456',
  },
  companyDisplay: {
    logoPosition: 'left-logo-with-name',
    showCompanyName: true,
    showAddress: true,
    showContactInfo: true,
    showRegistrationDetails: true,
    customLogoSize: {
      width: 100,
      height: 50,
    },
  },
  documentSettings: [
    {
      documentType: 'invoice',
      prefix: 'INV',
      nextNumber: 1001,
      numberLength: 5,
      resetPeriod: 'yearly',
      format: '{prefix}-{year}-{number:0000}',
      enabled: true,
    },
  ],
  etimsSettings: {
    enabled: false,
    pin: '0000',
    apiUrl: '',
    environment: 'sandbox',
    autoSubmit: false,
  },
  currency: 'USD',
  taxSettings: {
    type: 'exclusive',
    defaultRate: 10,
  },
  autoNumbering: {
    customers: {
      enabled: true,
      prefix: 'CUST',
      nextNumber: 1001,
      format: '{prefix}-{number:0000}',
    },
    vendors: {
      enabled: true,
      prefix: 'VEND',
      nextNumber: 1001,
      format: '{prefix}-{number:0000}',
    },
    items: {
      enabled: true,
      prefix: 'ITEM',
      nextNumber: 1001,
      format: '{prefix}-{number:0000}',
    },
  },
};

const SettingsContext = React.createContext<SettingsContextValue | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  const updateSettings = (updates: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    // Placeholder for fetching settings from an API or local storage
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

