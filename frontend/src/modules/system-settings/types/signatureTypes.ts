export interface AuthorizedSignature {
  id: string;
  name: string;
  title: string;
  department?: string;
  signatureImageUrl?: string;
  signatureText?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SignatureSettings {
  enabled: boolean;
  showOnDocuments: boolean;
  defaultSignature?: string; // signature ID
  signaturePosition: 'bottom-left' | 'bottom-center' | 'bottom-right';
  showTitle: boolean;
  showName: boolean;
  showDate: boolean;
  customText?: string;
}

export interface DocumentSignature {
  signatureId?: string;
  signedBy?: string;
  signedAt?: string;
  signaturePosition?: 'bottom-left' | 'bottom-center' | 'bottom-right';
}
