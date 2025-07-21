import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  Layout, 
  Type, 
  Image, 
  Table, 
  Square, 
  Circle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Palette,
  Move,
  Copy,
  Trash2,
  Eye,
  Save,
  Download,
  Upload,
  Undo,
  Redo,
  Grid,
  Ruler,
  ZoomIn,
  ZoomOut,
  MousePointer,
  Hand
} from 'lucide-react';
import { DocumentSettingsIntegrationService } from '@/services/documentSettingsIntegrationService';
import { toast } from 'sonner';

interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'table' | 'shape' | 'line' | 'header' | 'footer';
  x: number;
  y: number;
  width: number;
  height: number;
  properties: {
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderStyle?: string;
    padding?: number;
    margin?: number;
    textAlign?: 'left' | 'center' | 'right';
    imageUrl?: string;
    tableColumns?: string[];
    tableRows?: string[][];
    shapeType?: 'rectangle' | 'circle' | 'line';
    opacity?: number;
    rotation?: number;
    zIndex?: number;
  };
  locked?: boolean;
  visible?: boolean;
}

interface DocumentTemplate {
  id: string;
  name: string;
  documentType: string;
  pageFormat: 'A4' | 'Letter' | 'Legal' | 'A3';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number };
  elements: TemplateElement[];
  styles: {
    backgroundColor?: string;
    backgroundImage?: string;
    watermark?: string;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    author: string;
    description?: string;
    tags?: string[];
  };
}

interface AdvancedTemplateDesignerProps {
  template?: DocumentTemplate;
  onSave: (template: DocumentTemplate) => void;
  onCancel: () => void;
}

export const AdvancedTemplateDesigner: React.FC<AdvancedTemplateDesignerProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [currentTemplate, setCurrentTemplate] = useState<DocumentTemplate>(
    template || {
      id: `template-${Date.now()}`,
      name: 'New Template',
      documentType: 'invoice',
      pageFormat: 'A4',
      orientation: 'portrait',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      elements: [],
      styles: {},
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        author: 'System User',
        description: 'Custom template created with Advanced Template Designer',
        tags: ['custom', 'business']
      }
    }
  );
  
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<TemplateElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const [tool, setTool] = useState<'select' | 'text' | 'image' | 'table' | 'shape'>('select');
  const [history, setHistory] = useState<DocumentTemplate[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([currentTemplate]);
      setHistoryIndex(0);
    }
  }, []);

  // Save to history on template change
  const saveToHistory = (template: DocumentTemplate) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...template, metadata: { ...template.metadata, updatedAt: new Date() } });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo functions
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentTemplate(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentTemplate(history[historyIndex + 1]);
    }
  };

  // Get page dimensions based on format
  const getPageDimensions = () => {
    const formats = {
      A4: { width: 210, height: 297 },
      Letter: { width: 216, height: 279 },
      Legal: { width: 216, height: 356 },
      A3: { width: 297, height: 420 }
    };
    
    const dims = formats[currentTemplate.pageFormat];
    return currentTemplate.orientation === 'landscape' 
      ? { width: dims.height, height: dims.width }
      : dims;
  };

  // Convert mm to pixels for display
  const mmToPx = (mm: number) => Math.round(mm * 3.78 * (zoom / 100));
  const pxToMm = (px: number) => px / 3.78 / (zoom / 100);

  // Add element to template
  const addElement = (type: TemplateElement['type'], x: number = 50, y: number = 50) => {
    const newElement: TemplateElement = {
      id: `element-${Date.now()}`,
      type,
      x,
      y,
      width: type === 'text' ? 100 : type === 'table' ? 200 : 80,
      height: type === 'text' ? 20 : type === 'table' ? 100 : 40,
      properties: {
        fontSize: 12,
        fontFamily: 'Arial',
        color: '#000000',
        backgroundColor: 'transparent',
        textAlign: 'left',
        opacity: 1,
        zIndex: currentTemplate.elements.length + 1,
        ...(type === 'text' && { text: 'Sample Text' }),
        ...(type === 'table' && { 
          tableColumns: ['Column 1', 'Column 2', 'Column 3'],
          tableRows: [['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3']]
        }),
        ...(type === 'shape' && { shapeType: 'rectangle' as const }),
        ...(type === 'header' && { text: 'Header Content' }),
        ...(type === 'footer' && { text: 'Footer Content' })
      },
      visible: true
    };

    const updatedTemplate = {
      ...currentTemplate,
      elements: [...currentTemplate.elements, newElement]
    };
    
    setCurrentTemplate(updatedTemplate);
    saveToHistory(updatedTemplate);
    setSelectedElementId(newElement.id);
  };

  // Update element properties
  const updateElement = (id: string, updates: Partial<TemplateElement>) => {
    const updatedTemplate = {
      ...currentTemplate,
      elements: currentTemplate.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    };
    
    setCurrentTemplate(updatedTemplate);
    saveToHistory(updatedTemplate);
  };

  // Delete element
  const deleteElement = (id: string) => {
    const updatedTemplate = {
      ...currentTemplate,
      elements: currentTemplate.elements.filter(el => el.id !== id)
    };
    
    setCurrentTemplate(updatedTemplate);
    saveToHistory(updatedTemplate);
    setSelectedElementId(null);
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, element: TemplateElement) => {
    e.preventDefault();
    setDraggedElement(element);
    setIsDragging(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - mmToPx(element.x),
        y: e.clientY - rect.top - mmToPx(element.y)
      });
    }
  };

  // Handle drag
  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging || !draggedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = pxToMm(e.clientX - rect.left - dragOffset.x);
    const y = pxToMm(e.clientY - rect.top - dragOffset.y);

    updateElement(draggedElement.id, { x: Math.max(0, x), y: Math.max(0, y) });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Generate preview
  const generatePreview = async () => {
    try {
      const settings = DocumentSettingsIntegrationService.loadSettings();
      const html = await DocumentSettingsIntegrationService.generatePreviewWithSettings(
        currentTemplate.id,
        currentTemplate.documentType,
        {
          templateEngine: {
            ...settings.templateEngine,
            templateStyle: 'custom'
          }
        }
      );
      setPreviewHtml(html);
      setShowPreview(true);
    } catch (error) {
      toast.error('Failed to generate preview');
      console.error('Preview generation error:', error);
    }
  };

  // Save template
  const handleSave = () => {
    try {
      onSave(currentTemplate);
      toast.success('Template saved successfully');
    } catch (error) {
      toast.error('Failed to save template');
      console.error('Save error:', error);
    }
  };

  // Export template
  const exportTemplate = () => {
    try {
      const blob = new Blob([JSON.stringify(currentTemplate, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentTemplate.name.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Template exported successfully');
    } catch (error) {
      toast.error('Failed to export template');
      console.error('Export error:', error);
    }
  };

  // Import template
  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTemplate = JSON.parse(e.target?.result as string);
        setCurrentTemplate(importedTemplate);
        saveToHistory(importedTemplate);
        toast.success('Template imported successfully');
      } catch (error) {
        toast.error('Failed to import template');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  const selectedElement = currentTemplate.elements.find(el => el.id === selectedElementId);
  const pageDimensions = getPageDimensions();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="w-16 bg-white border-r border-gray-200 p-2 flex flex-col gap-2">
        <Button
          variant={tool === 'select' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('select')}
          className="p-2"
        >
          <MousePointer className="h-4 w-4" />
        </Button>
        <Button
          variant={tool === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('text')}
          className="p-2"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant={tool === 'image' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('image')}
          className="p-2"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          variant={tool === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('table')}
          className="p-2"
        >
          <Table className="h-4 w-4" />
        </Button>
        <Button
          variant={tool === 'shape' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('shape')}
          className="p-2"
        >
          <Square className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              value={currentTemplate.name}
              onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
              className="w-48"
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowRuler(!showRuler)}>
                <Ruler className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(25, zoom - 25))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={generatePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={exportTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <label htmlFor="import-template">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
            </label>
            <input
              id="import-template"
              type="file"
              accept=".json"
              onChange={importTemplate}
              className="hidden"
            />
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex">
          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-gray-100 p-8">
            <div className="flex justify-center">
              <div
                ref={canvasRef}
                className="bg-white shadow-lg relative border"
                style={{
                  width: mmToPx(pageDimensions.width),
                  height: mmToPx(pageDimensions.height),
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top left'
                }}
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onClick={(e) => {
                  if (tool !== 'select') {
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (rect) {
                      const x = pxToMm(e.clientX - rect.left);
                      const y = pxToMm(e.clientY - rect.top);
                      addElement(tool, x, y);
                      setTool('select');
                    }
                  }
                }}
              >
                {/* Grid */}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none">
                    <svg
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                      style={{ opacity: 0.1 }}
                    >
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#000" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>
                )}

                {/* Ruler */}
                {showRuler && (
                  <>
                    <div className="absolute top-0 left-0 w-full h-4 bg-gray-200 text-xs flex items-center">
                      {/* Horizontal ruler marks */}
                    </div>
                    <div className="absolute top-0 left-0 w-4 h-full bg-gray-200 text-xs flex flex-col items-center">
                      {/* Vertical ruler marks */}
                    </div>
                  </>
                )}

                {/* Elements */}
                {currentTemplate.elements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute border-2 cursor-move ${
                      selectedElementId === element.id ? 'border-blue-500' : 'border-transparent'
                    } hover:border-gray-300`}
                    style={{
                      left: mmToPx(element.x),
                      top: mmToPx(element.y),
                      width: mmToPx(element.width),
                      height: mmToPx(element.height),
                      backgroundColor: element.properties.backgroundColor,
                      opacity: element.properties.opacity || 1,
                      zIndex: element.properties.zIndex || 1,
                      transform: `rotate(${element.properties.rotation || 0}deg)`,
                      display: element.visible ? 'block' : 'none'
                    }}
                    onMouseDown={(e) => {
                      setSelectedElementId(element.id);
                      handleDragStart(e, element);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElementId(element.id);
                    }}
                  >
                    {element.type === 'text' && (
                      <div
                        className="w-full h-full flex items-center p-1"
                        style={{
                          fontSize: element.properties.fontSize,
                          fontFamily: element.properties.fontFamily,
                          color: element.properties.color,
                          textAlign: element.properties.textAlign,
                          fontWeight: element.properties.fontWeight
                        }}
                      >
                        {element.properties.text}
                      </div>
                    )}
                    {element.type === 'image' && (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <Image className="h-8 w-8" />
                      </div>
                    )}
                    {element.type === 'table' && (
                      <div className="w-full h-full p-1">
                        <table className="w-full h-full border-collapse">
                          <thead>
                            <tr>
                              {element.properties.tableColumns?.map((col, i) => (
                                <th key={i} className="border border-gray-300 p-1 text-xs">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {element.properties.tableRows?.map((row, i) => (
                              <tr key={i}>
                                {row.map((cell, j) => (
                                  <td key={j} className="border border-gray-300 p-1 text-xs">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {element.type === 'shape' && (
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundColor: element.properties.backgroundColor,
                          border: `${element.properties.borderWidth || 1}px ${element.properties.borderStyle || 'solid'} ${element.properties.borderColor || '#000'}`,
                          borderRadius: element.properties.shapeType === 'circle' ? '50%' : '0'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Properties</h3>
              
              {selectedElement ? (
                <div className="space-y-4">
                  <div>
                    <Label>Element Type</Label>
                    <div className="mt-1">
                      <Badge variant="secondary">{selectedElement.type}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>X Position</Label>
                      <Input
                        type="number"
                        value={selectedElement.x}
                        onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Y Position</Label>
                      <Input
                        type="number"
                        value={selectedElement.y}
                        onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Width</Label>
                      <Input
                        type="number"
                        value={selectedElement.width}
                        onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Height</Label>
                      <Input
                        type="number"
                        value={selectedElement.height}
                        onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {selectedElement.type === 'text' && (
                    <>
                      <div>
                        <Label>Text Content</Label>
                        <Textarea
                          value={selectedElement.properties.text}
                          onChange={(e) => updateElement(selectedElement.id, { 
                            properties: { ...selectedElement.properties, text: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label>Font Size</Label>
                        <Input
                          type="number"
                          value={selectedElement.properties.fontSize}
                          onChange={(e) => updateElement(selectedElement.id, { 
                            properties: { ...selectedElement.properties, fontSize: Number(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <Label>Font Family</Label>
                        <Select
                          value={selectedElement.properties.fontFamily}
                          onValueChange={(value) => updateElement(selectedElement.id, { 
                            properties: { ...selectedElement.properties, fontFamily: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Text Color</Label>
                        <Input
                          type="color"
                          value={selectedElement.properties.color}
                          onChange={(e) => updateElement(selectedElement.id, { 
                            properties: { ...selectedElement.properties, color: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label>Text Alignment</Label>
                        <div className="flex gap-1">
                          <Button
                            variant={selectedElement.properties.textAlign === 'left' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedElement.id, { 
                              properties: { ...selectedElement.properties, textAlign: 'left' }
                            })}
                          >
                            <AlignLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={selectedElement.properties.textAlign === 'center' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedElement.id, { 
                              properties: { ...selectedElement.properties, textAlign: 'center' }
                            })}
                          >
                            <AlignCenter className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={selectedElement.properties.textAlign === 'right' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElement(selectedElement.id, { 
                              properties: { ...selectedElement.properties, textAlign: 'right' }
                            })}
                          >
                            <AlignRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label>Background Color</Label>
                    <Input
                      type="color"
                      value={selectedElement.properties.backgroundColor}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        properties: { ...selectedElement.properties, backgroundColor: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <Label>Opacity</Label>
                    <Slider
                      value={[selectedElement.properties.opacity || 1]}
                      onValueChange={(value) => updateElement(selectedElement.id, { 
                        properties: { ...selectedElement.properties, opacity: value[0] }
                      })}
                      max={1}
                      min={0}
                      step={0.1}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={selectedElement.visible}
                      onCheckedChange={(checked) => updateElement(selectedElement.id, { visible: checked })}
                    />
                    <Label>Visible</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newElement = {
                          ...selectedElement,
                          id: `element-${Date.now()}`,
                          x: selectedElement.x + 10,
                          y: selectedElement.y + 10
                        };
                        setCurrentTemplate({
                          ...currentTemplate,
                          elements: [...currentTemplate.elements, newElement]
                        });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteElement(selectedElement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  Select an element to edit its properties
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Template Preview</h3>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close
              </Button>
            </div>
            <div
              className="border rounded-lg p-4 bg-white"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
