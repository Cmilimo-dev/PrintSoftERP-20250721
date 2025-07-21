import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CompanyDisplaySettings } from '@/modules/system-settings/types/systemSettingsTypes';
import { Upload, Image as ImageIcon, X, Save, Eye, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';

interface CompanyDisplayTabProps {
  companyDisplay: CompanyDisplaySettings | undefined;
  onUpdate: (updates: { companyDisplay: CompanyDisplaySettings }) => void;
}

const CompanyDisplayTab: React.FC<CompanyDisplayTabProps> = ({ 
  companyDisplay, 
  onUpdate 
}) => {
  const logoPositionOptions = [
    { value: 'only-logo', label: 'Only Logo' },
    { value: 'left-logo-with-name', label: 'Logo Left + Company Name' },
    { value: 'top-logo-with-name', label: 'Logo Top + Company Name' },
    { value: 'no-logo', label: 'No Logo' },
  ];

  const getDefaultCompanyDisplay = (): CompanyDisplaySettings => ({
    logoPosition: 'left-logo-with-name',
    showCompanyName: true,
    showLogo: true,
    showAddress: true,
    showContactInfo: true,
    showRegistrationDetails: true,
    logoUrl: '',
    headerDisplayFormat: 'logo-with-name',
    customLogoSize: {
      width: 100,
      height: 50
    }
  });

  const initializeCompanyDisplay = () => {
    const defaultSettings = getDefaultCompanyDisplay();
    onUpdate({ companyDisplay: defaultSettings });
  };

  const updateDisplaySettings = (updates: Partial<CompanyDisplaySettings>) => {
    if (!companyDisplay) return;
    
    const updatedCompanyDisplay = { ...companyDisplay, ...updates };
    onUpdate({ companyDisplay: updatedCompanyDisplay });
  };

  const updateLogoSize = (dimension: 'width' | 'height', value: number) => {
    if (!companyDisplay) return;
    
    const updatedCompanyDisplay = {
      ...companyDisplay,
      customLogoSize: {
        width: dimension === 'width' ? value : companyDisplay.customLogoSize?.width || 100,
        height: dimension === 'height' ? value : companyDisplay.customLogoSize?.height || 50
      }
    };
    onUpdate({ companyDisplay: updatedCompanyDisplay });
  };

  const handleLogoUpload = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const logoUrl = reader.result as string;
      updateDisplaySettings({ logoUrl });
    };
    reader.readAsDataURL(file);
  }, [companyDisplay]);

  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop: handleLogoUpload,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  });

  if (!companyDisplay) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Company display settings not available.
          </p>
          <Button onClick={initializeCompanyDisplay}>
            Initialize Display Settings
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Display Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Logo Position */}
        <div>
          <Label>Logo Position</Label>
          <Select 
            value={companyDisplay.logoPosition} 
            onValueChange={(value: 'only-logo' | 'left-logo-with-name' | 'top-logo-with-name' | 'no-logo') => 
              updateDisplaySettings({ logoPosition: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {logoPositionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Logo Upload */}
        {companyDisplay.logoPosition !== 'no-logo' && (
          <div>
            <Label>Upload Logo</Label>
            <div {...getRootProps({ className: 'dropzone border-dashed border-2 border-gray-300 p-6 text-center rounded-lg cursor-pointer hover:border-gray-400 transition-colors' })}>
              <input {...getInputProps()} />
              <ImageIcon className='h-10 w-10 mx-auto text-muted-foreground mb-2' />
              <p className='text-muted-foreground'>Drag 'n' drop or click to select logo</p>
              <p className='text-xs text-muted-foreground mt-1'>Supports: JPG, PNG, GIF</p>
            </div>
            {companyDisplay.logoUrl && (
              <div className='mt-4 p-4 border rounded-lg'>
                <Label className='mb-2 block'>Logo Preview</Label>
                <img 
                  src={companyDisplay.logoUrl} 
                  alt='Logo Preview' 
                  className='mx-auto border rounded' 
                  style={{ 
                    maxHeight: companyDisplay.customLogoSize?.height || 50,
                    maxWidth: companyDisplay.customLogoSize?.width || 100
                  }} 
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full"
                  onClick={() => updateDisplaySettings({ logoUrl: undefined })}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove Logo
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Document Header Display Format */}
        <div>
          <Label>Document Header Display Format</Label>
          <Select 
            value={companyDisplay.headerDisplayFormat || 'logo-with-name'} 
            onValueChange={(value: 'logo-only' | 'name-only' | 'logo-with-name' | 'none') => 
              updateDisplaySettings({ headerDisplayFormat: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="logo-only">Logo Only</SelectItem>
              <SelectItem value="name-only">Company Name Only</SelectItem>
              <SelectItem value="logo-with-name">Logo + Company Name</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Display Options */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={companyDisplay.showLogo}
              onCheckedChange={(checked) => updateDisplaySettings({ 
                showLogo: checked 
              })}
            />
            <span>Show Logo in Documents</span>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={companyDisplay.showCompanyName}
              onCheckedChange={(checked) => updateDisplaySettings({ 
                showCompanyName: checked 
              })}
            />
            <span>Show Company Name in Documents</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={companyDisplay.showAddress}
              onCheckedChange={(checked) => updateDisplaySettings({ 
                showAddress: checked 
              })}
            />
            <span>Show Address</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={companyDisplay.showContactInfo}
              onCheckedChange={(checked) => updateDisplaySettings({ 
                showContactInfo: checked 
              })}
            />
            <span>Show Contact Info</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={companyDisplay.showRegistrationDetails}
              onCheckedChange={(checked) => updateDisplaySettings({ 
                showRegistrationDetails: checked 
              })}
            />
            <span>Show Registration Details</span>
          </div>
        </div>

        {/* Custom Logo Size */}
        {companyDisplay.logoPosition !== 'no-logo' && (
          <div>
            <Label>Custom Logo Size</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label>Width (px)</Label>
                <Input
                  type="number"
                  value={companyDisplay.customLogoSize?.width || 100}
                  onChange={(e) => updateLogoSize('width', parseInt(e.target.value) || 100)}
                />
              </div>
              <div>
                <Label>Height (px)</Label>
                <Input
                  type="number"
                  value={companyDisplay.customLogoSize?.height || 50}
                  onChange={(e) => updateLogoSize('height', parseInt(e.target.value) || 50)}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyDisplayTab;
