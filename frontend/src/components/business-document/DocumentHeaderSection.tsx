
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BaseDocument } from '@/types/businessDocuments';

interface DocumentHeaderSectionProps {
  formData: BaseDocument;
  onUpdate: (updates: Partial<BaseDocument>) => void;
}

const DocumentHeaderSection: React.FC<DocumentHeaderSectionProps> = ({
  formData,
  onUpdate
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <Label htmlFor="documentNumber" className="block text-sm font-medium mb-2">
          Document Number
        </Label>
        <Input
          id="documentNumber"
          type="text"
          value={formData.documentNumber}
          onChange={(e) => onUpdate({ documentNumber: e.target.value })}
          className="w-full"
          required
        />
      </div>
      <div>
        <Label htmlFor="date" className="block text-sm font-medium mb-2">
          Date
        </Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => onUpdate({ date: e.target.value })}
          className="w-full"
          required
        />
      </div>
    </div>
  );
};

export default DocumentHeaderSection;
