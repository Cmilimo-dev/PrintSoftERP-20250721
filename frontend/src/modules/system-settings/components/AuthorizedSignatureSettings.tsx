import React, { useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Upload, User } from 'lucide-react';
import { AuthorizedSignature, SignatureSettings } from '../types/signatureTypes';
import { SystemSettingsService } from '../services/systemSettingsService';
import { DepartmentSignatureService } from '@/services/departmentSignatureService';
import { usePermissions } from '@/hooks/usePermissions';
import { SettingsGuard } from '@/components/auth/PermissionGuard';

interface AuthorizedSignatureSettingsProps {
  signatures: AuthorizedSignature[];
  signatureSettings: SignatureSettings;
  onUpdate: (signatures: AuthorizedSignature[], settings: SignatureSettings) => void;
}

export const AuthorizedSignatureSettings: React.FC<AuthorizedSignatureSettingsProps> = ({
  signatures,
  signatureSettings,
  onUpdate
}) => {
  const { hasPermission } = usePermissions();
  const [editingSignature, setEditingSignature] = useState<AuthorizedSignature | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);

  const handleAddSignature = useCallback(() => {
    setEditingSignature({
      id: '',
      name: '',
      title: '',
      department: '',
      signatureImageUrl: '',
      signatureText: '',
      isDefault: signatures.length === 0, // First signature becomes default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setShowAddForm(true);
  }, [signatures.length]);

  const handleSaveSignature = useCallback((signature: AuthorizedSignature) => {
    const isNew = !signature.id;
    const signatureToSave = {
      ...signature,
      id: signature.id || `sig_${Date.now()}`,
      updatedAt: new Date().toISOString(),
      createdAt: signature.createdAt || new Date().toISOString()
    };

    let updatedSignatures;
    if (isNew) {
      updatedSignatures = [...signatures, signatureToSave];
    } else {
      updatedSignatures = signatures.map(s => s.id === signature.id ? signatureToSave : s);
    }

    // If this is set as default, remove default from others
    if (signatureToSave.isDefault) {
      updatedSignatures = updatedSignatures.map(s => 
        s.id === signatureToSave.id ? s : { ...s, isDefault: false }
      );
    }

    // Update signature settings default if needed
    const updatedSettings = signatureToSave.isDefault 
      ? { ...signatureSettings, defaultSignature: signatureToSave.id }
      : signatureSettings;

    onUpdate(updatedSignatures, updatedSettings);
    setEditingSignature(null);
    setShowAddForm(false);
    
    // Trigger signature change event for real-time updates
    DepartmentSignatureService.triggerSignatureChange();
  }, [signatures, signatureSettings, onUpdate]);


  const handleDeleteSignature = useCallback((signatureId: string) => {
    const updatedSignatures = signatures.filter(s => s.id !== signatureId);
    
    // If deleted signature was default, set first remaining as default
    let updatedSettings = signatureSettings;
    if (signatureSettings.defaultSignature === signatureId && updatedSignatures.length > 0) {
      updatedSignatures[0].isDefault = true;
      updatedSettings = { ...signatureSettings, defaultSignature: updatedSignatures[0].id };
    } else if (updatedSignatures.length === 0) {
      updatedSettings = { ...signatureSettings, defaultSignature: undefined };
    }

    onUpdate(updatedSignatures, updatedSettings);
    
    // Trigger signature change event for real-time updates
    DepartmentSignatureService.triggerSignatureChange();
  }, [signatures, signatureSettings, onUpdate]);

  const handleSetDefault = useCallback((signatureId: string) => {
    const updatedSignatures = signatures.map(s => ({
      ...s,
      isDefault: s.id === signatureId
    }));

    const updatedSettings = {
      ...signatureSettings,
      defaultSignature: signatureId
    };

    onUpdate(updatedSignatures, updatedSettings);
    
    // Trigger signature change event for real-time updates
    DepartmentSignatureService.triggerSignatureChange();
  }, [signatures, signatureSettings, onUpdate]);


  const handleFileUpload = useCallback(async (file: File, signatureId: string) => {
    setUploadingFile(signatureId);
    
    try {
      // Create a data URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        
        if (editingSignature && editingSignature.id === signatureId) {
          setEditingSignature({
            ...editingSignature,
            signatureImageUrl: imageUrl
          });
        } else {
          const updatedSignatures = signatures.map(s => 
            s.id === signatureId ? { ...s, signatureImageUrl: imageUrl } : s
          );
          onUpdate(updatedSignatures, signatureSettings);
        }
        
        setUploadingFile(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading signature:', error);
      setUploadingFile(null);
    }
  }, [editingSignature, signatures, signatureSettings, onUpdate]);

  const handleSignatureSettingsUpdate = useCallback((updates: Partial<SignatureSettings>) => {
    const updatedSettings = { ...signatureSettings, ...updates };
    onUpdate(signatures, updatedSettings);
  }, [signatures, signatureSettings, onUpdate]);

  return (
    <SettingsGuard action="write">
      <div className="space-y-6">
      {/* Global Signature Settings */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Signature Display Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="signatures-enabled"
              checked={signatureSettings.enabled}
              onChange={(e) => handleSignatureSettingsUpdate({ enabled: e.target.checked })}
              disabled={!hasPermission('settings.write')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="signatures-enabled" className="text-sm font-medium text-gray-700">
              Enable signatures on documents
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="show-on-documents"
              checked={signatureSettings.showOnDocuments}
              onChange={(e) => handleSignatureSettingsUpdate({ showOnDocuments: e.target.checked })}
              disabled={!hasPermission('settings.write')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="show-on-documents" className="text-sm font-medium text-gray-700">
              Show signatures on all documents
            </label>
          </div>

          <div>
            <label htmlFor="signature-position" className="block text-sm font-medium text-gray-700 mb-1">
              Signature Position
            </label>
            <select
              id="signature-position"
              value={signatureSettings.signaturePosition}
              onChange={(e) => handleSignatureSettingsUpdate({ 
                signaturePosition: e.target.value as 'bottom-left' | 'bottom-center' | 'bottom-right' 
              })}
              disabled={!hasPermission('settings.write')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="show-title"
                checked={signatureSettings.showTitle}
                onChange={(e) => handleSignatureSettingsUpdate({ showTitle: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="show-title" className="text-sm font-medium text-gray-700">
                Show title
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="show-name"
                checked={signatureSettings.showName}
                onChange={(e) => handleSignatureSettingsUpdate({ showName: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="show-name" className="text-sm font-medium text-gray-700">
                Show name
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="show-date"
                checked={signatureSettings.showDate}
                onChange={(e) => handleSignatureSettingsUpdate({ showDate: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="show-date" className="text-sm font-medium text-gray-700">
                Show signature date
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="custom-text" className="block text-sm font-medium text-gray-700 mb-1">
            Custom Text (optional)
          </label>
          <input
            type="text"
            id="custom-text"
            value={signatureSettings.customText || ''}
            onChange={(e) => handleSignatureSettingsUpdate({ customText: e.target.value })}
            placeholder="e.g., Authorized by:"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Authorized Signatures List */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Authorized Signatures</h3>
          {hasPermission('settings.write') && (
            <button
              onClick={handleAddSignature}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Signature</span>
            </button>
          )}
        </div>

        {signatures.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No authorized signatures configured</p>
            <p className="text-sm">Add signatures to enable document signing</p>
          </div>
        ) : (
          <div className="space-y-4">
            {signatures.map((signature) => (
              <div key={signature.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {signature.signatureImageUrl ? (
                        <img
                          src={signature.signatureImageUrl}
                          alt={`${signature.name} signature`}
                          className="w-16 h-8 object-contain border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="w-16 h-8 bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{signature.name}</h4>
                        {signature.isDefault && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{signature.title}</p>
                      {signature.department && (
                        <p className="text-xs text-gray-500">{signature.department}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!signature.isDefault && hasPermission('settings.write') && (
                      <button
                        onClick={() => handleSetDefault(signature.id)}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    
                    {hasPermission('settings.write') && (
                      <>
                        <button
                          onClick={() => {
                            setEditingSignature(signature);
                            setShowAddForm(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteSignature(signature.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Signature Modal */}
      {(showAddForm || editingSignature) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingSignature?.id ? 'Edit Signature' : 'Add Signature'}
            </h3>
            
            <SignatureForm
              signature={editingSignature!}
              onSave={handleSaveSignature}
              onCancel={() => {
                setEditingSignature(null);
                setShowAddForm(false);
              }}
              onFileUpload={handleFileUpload}
              uploadingFile={uploadingFile}
            />
          </div>
        </div>
      )}
    </div>
    </SettingsGuard>
  );
};

interface SignatureFormProps {
  signature: AuthorizedSignature;
  onSave: (signature: AuthorizedSignature) => void;
  onCancel: () => void;
  onFileUpload: (file: File, signatureId: string) => void;
  uploadingFile: string | null;
}

const SignatureForm: React.FC<SignatureFormProps> = ({
  signature,
  onSave,
  onCancel,
  onFileUpload,
  uploadingFile
}) => {
  const [formData, setFormData] = useState<AuthorizedSignature>(signature);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.title.trim()) {
      onSave(formData);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileUpload(file, formData.id || 'temp');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title/Position *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
          Department
        </label>
        <input
          type="text"
          id="department"
          value={formData.department || ''}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="signature-upload" className="block text-sm font-medium text-gray-700 mb-1">
          Signature Image
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            id="signature-upload"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label
            htmlFor="signature-upload"
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </label>
          {uploadingFile === formData.id && (
            <span className="text-sm text-gray-500">Uploading...</span>
          )}
        </div>
        {formData.signatureImageUrl && (
          <div className="mt-2">
            <img
              src={formData.signatureImageUrl}
              alt="Signature preview"
              className="w-32 h-16 object-contain border border-gray-300 rounded"
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="signature-text" className="block text-sm font-medium text-gray-700 mb-1">
          Text Signature (fallback)
        </label>
        <input
          type="text"
          id="signature-text"
          value={formData.signatureText || ''}
          onChange={(e) => setFormData({ ...formData, signatureText: e.target.value })}
          placeholder="Type signature text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is-default"
          checked={formData.isDefault}
          onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is-default" className="text-sm font-medium text-gray-700">
          Set as default
        </label>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Signature
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
