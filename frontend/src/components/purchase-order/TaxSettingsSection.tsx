
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaxSettings } from '@/types/businessDocuments';
import { MobileFormCard, MobileFormGrid } from '@/components/ui/mobile-form-layout';
import { useIsMobile } from '@/hooks/use-mobile';
import { Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaxSettingsSectionProps {
  taxSettings: TaxSettings;
  onUpdate: (updates: Partial<TaxSettings>) => void;
}

const TaxSettingsSection: React.FC<TaxSettingsSectionProps> = ({ taxSettings, onUpdate }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileFormCard 
        title="VAT Settings" 
        icon={<Hash className="h-5 w-5" />}
        collapsible={true}
        defaultCollapsed={false}
      >
        <MobileFormGrid columns={2}>
          <div>
            <Label>VAT Type</Label>
            <Select 
              value={taxSettings.type} 
              onValueChange={(value: 'inclusive' | 'exclusive' | 'per_item' | 'overall') => onUpdate({ type: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inclusive">VAT Inclusive</SelectItem>
                <SelectItem value="exclusive">VAT Exclusive</SelectItem>
                <SelectItem value="per_item">Per Item VAT</SelectItem>
                <SelectItem value="overall">Overall VAT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Default VAT Rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={taxSettings.defaultRate}
              onChange={(e) => onUpdate({ defaultRate: Number(e.target.value) })}
              placeholder="16.00"
              className="h-12"
            />
          </div>
        </MobileFormGrid>
      </MobileFormCard>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          VAT Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>VAT Type</Label>
            <Select 
              value={taxSettings.type} 
              onValueChange={(value: 'inclusive' | 'exclusive' | 'per_item' | 'overall') => onUpdate({ type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inclusive">VAT Inclusive</SelectItem>
                <SelectItem value="exclusive">VAT Exclusive</SelectItem>
                <SelectItem value="per_item">Per Item VAT</SelectItem>
                <SelectItem value="overall">Overall VAT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Default VAT Rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={taxSettings.defaultRate}
              onChange={(e) => onUpdate({ defaultRate: Number(e.target.value) })}
              placeholder="16.00"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxSettingsSection;
