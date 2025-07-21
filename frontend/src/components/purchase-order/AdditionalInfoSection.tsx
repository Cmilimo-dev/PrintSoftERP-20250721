
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AdditionalInfoSectionProps {
  notes: string;
  terms: string;
  onUpdate: (field: 'notes' | 'terms', value: string) => void;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ notes, terms, onUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={notes || ''}
            onChange={(e) => onUpdate('notes', e.target.value)}
            placeholder="Additional notes..."
          />
        </div>
        <div>
          <Label htmlFor="terms">Terms & Conditions</Label>
          <Textarea
            id="terms"
            rows={4}
            value={terms || ''}
            onChange={(e) => onUpdate('terms', e.target.value)}
            placeholder="Terms and conditions..."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdditionalInfoSection;
