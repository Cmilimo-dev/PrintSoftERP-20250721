import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Layout, 
  Type, 
  Palette,
  Ruler,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save
} from 'lucide-react';
import { DocumentLayoutSettings } from '@/modules/system-settings/types/systemSettingsTypes';

interface DocumentLayoutTabProps {
  documentLayout: DocumentLayoutSettings | undefined;
  onUpdate: (updates: Partial<DocumentLayoutSettings>) => void;
}

const DocumentLayoutTab: React.FC<DocumentLayoutTabProps> = ({
  documentLayout,
  onUpdate
}) => {
  // If documentLayout is undefined, provide defaults
  if (!documentLayout) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Document layout settings not available.</p>
          <p className="text-sm text-muted-foreground mt-2">Please refresh the page or check your settings.</p>
        </div>
      </div>
    );
  }
  const updateSetting = (key: keyof DocumentLayoutSettings, value: any) => {
    onUpdate({ [key]: value });
  };

  const updateMargins = (side: keyof DocumentLayoutSettings['margins'], value: number) => {
    onUpdate({
      margins: {
        ...documentLayout.margins,
        [side]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Page Layout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Page Size</Label>
              <Select 
                value={documentLayout.pageSize} 
                onValueChange={(value: 'A4' | 'Letter' | 'Legal' | 'A5') => updateSetting('pageSize', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="A5">A5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Orientation</Label>
              <Select 
                value={documentLayout.orientation} 
                onValueChange={(value: 'portrait' | 'landscape') => updateSetting('orientation', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-4 block">Margins (mm)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Top</Label>
                <Input
                  type="number"
                  value={documentLayout.margins.top}
                  onChange={(e) => updateMargins('top', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Bottom</Label>
                <Input
                  type="number"
                  value={documentLayout.margins.bottom}
                  onChange={(e) => updateMargins('bottom', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Left</Label>
                <Input
                  type="number"
                  value={documentLayout.margins.left}
                  onChange={(e) => updateMargins('left', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Right</Label>
                <Input
                  type="number"
                  value={documentLayout.margins.right}
                  onChange={(e) => updateMargins('right', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Font Family</Label>
              <Select 
                value={documentLayout.fontFamily} 
                onValueChange={(value) => updateSetting('fontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Calibri">Calibri</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Line Height</Label>
              <Input
                type="number"
                step="0.1"
                min="1"
                max="3"
                value={documentLayout.lineHeight}
                onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value) || 1.4)}
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Base Font Size: {documentLayout.baseFontSize}px</Label>
            <Slider
              value={[documentLayout.baseFontSize]}
              onValueChange={([value]) => updateSetting('baseFontSize', value)}
              min={8}
              max={24}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <Label className="mb-2 block">Header Font Size: {documentLayout.headerFontSize}px</Label>
            <Slider
              value={[documentLayout.headerFontSize]}
              onValueChange={([value]) => updateSetting('headerFontSize', value)}
              min={12}
              max={32}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={documentLayout.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={documentLayout.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={documentLayout.secondaryColor}
                  onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={documentLayout.secondaryColor}
                  onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                  placeholder="#666666"
                />
              </div>
            </div>
            <div>
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={documentLayout.textColor}
                  onChange={(e) => updateSetting('textColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={documentLayout.textColor}
                  onChange={(e) => updateSetting('textColor', e.target.value)}
                  placeholder="#333333"
                />
              </div>
            </div>
            <div>
              <Label>Border Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={documentLayout.borderColor}
                  onChange={(e) => updateSetting('borderColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={documentLayout.borderColor}
                  onChange={(e) => updateSetting('borderColor', e.target.value)}
                  placeholder="#cccccc"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Components */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Layout Components
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={documentLayout.showHeader}
                onCheckedChange={(checked) => updateSetting('showHeader', checked)}
              />
              <span>Show Header</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={documentLayout.showFooter}
                onCheckedChange={(checked) => updateSetting('showFooter', checked)}
              />
              <span>Show Footer</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={documentLayout.showWatermark}
                onCheckedChange={(checked) => updateSetting('showWatermark', checked)}
              />
              <span>Show Watermark</span>
            </div>
          </div>

          {documentLayout.showWatermark && (
            <div>
              <Label>Watermark Text</Label>
              <Input
                value={documentLayout.watermarkText || ''}
                onChange={(e) => updateSetting('watermarkText', e.target.value)}
                placeholder="CONFIDENTIAL"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Header Alignment</Label>
              <Select 
                value={documentLayout.headerAlignment} 
                onValueChange={(value: 'left' | 'center' | 'right') => updateSetting('headerAlignment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Footer Alignment</Label>
              <Select 
                value={documentLayout.footerAlignment} 
                onValueChange={(value: 'left' | 'center' | 'right') => updateSetting('footerAlignment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Table Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Table Header Background</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={documentLayout.tableHeaderBg}
                  onChange={(e) => updateSetting('tableHeaderBg', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={documentLayout.tableHeaderBg}
                  onChange={(e) => updateSetting('tableHeaderBg', e.target.value)}
                  placeholder="#f8f9fa"
                />
              </div>
            </div>
            <div>
              <Label>Border Style</Label>
              <Select 
                value={documentLayout.tableBorderStyle} 
                onValueChange={(value: 'solid' | 'dashed' | 'dotted' | 'none') => updateSetting('tableBorderStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={documentLayout.tableRowAlternating}
              onCheckedChange={(checked) => updateSetting('tableRowAlternating', checked)}
            />
            <span>Alternating Row Colors</span>
          </div>

          <div>
            <Label className="mb-2 block">Section Spacing: {documentLayout.sectionSpacing}px</Label>
            <Slider
              value={[documentLayout.sectionSpacing]}
              onValueChange={([value]) => updateSetting('sectionSpacing', value)}
              min={0}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <Label className="mb-2 block">Item Spacing: {documentLayout.itemSpacing}px</Label>
            <Slider
              value={[documentLayout.itemSpacing]}
              onValueChange={([value]) => updateSetting('itemSpacing', value)}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentLayoutTab;
