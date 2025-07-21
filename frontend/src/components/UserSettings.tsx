import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExportSettings } from '@/contexts/ExportSettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Type } from 'lucide-react';

interface UserSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSettings: React.FC<UserSettingsProps> = ({ isOpen, onClose }) => {
  const { exportSettings, updateExportSettings } = useExportSettings();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            User Typography Settings
          </DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Typography Settings
            </CardTitle>
            <CardDescription>
              Configure fonts and text styling for your personal experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="body-font">Body Font</Label>
                <select
                  id="body-font"
                  value={exportSettings.typography.bodyFont}
                  onChange={(e) => updateExportSettings({
                    typography: {
                      ...exportSettings.typography,
                      bodyFont: e.target.value
                    }
                  })}
                  className="w-full p-2 border rounded"
                >
                  <option value="Trebuchet MS">Trebuchet MS</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Calibri">Calibri</option>
                </select>
              </div>
              <div>
                <Label htmlFor="body-font-size">Body Font Size (px)</Label>
                <Input
                  id="body-font-size"
                  type="number"
                  value={exportSettings.typography.bodyFontSize}
                  onChange={(e) => updateExportSettings({
                    typography: {
                      ...exportSettings.typography,
                      bodyFontSize: parseInt(e.target.value) || 12
                    }
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="body-color">Body Text Color</Label>
                <Input
                  id="body-color"
                  type="color"
                  value={exportSettings.typography.bodyColor}
                  onChange={(e) => updateExportSettings({
                    typography: {
                      ...exportSettings.typography,
                      bodyColor: e.target.value
                    }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="accent-color">Accent Color</Label>
                <Input
                  id="accent-color"
                  type="color"
                  value={exportSettings.typography.accentColor}
                  onChange={(e) => updateExportSettings({
                    typography: {
                      ...exportSettings.typography,
                      accentColor: e.target.value
                    }
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-6">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettings;
