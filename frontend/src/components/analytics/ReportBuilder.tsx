import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Settings, 
  Download,
  Calendar,
  Filter,
  Save,
  Clock,
  Mail
} from 'lucide-react';
import { ReportConfig, ReportFilters, ReportSchedule } from '@/types/analytics';

interface ReportBuilderProps {
  onSaveReport: (report: ReportConfig) => void;
  onGenerateReport: (report: ReportConfig) => void;
  className?: string;
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({
  onSaveReport,
  onGenerateReport,
  className
}) => {
  const [reportConfig, setReportConfig] = useState<Partial<ReportConfig>>({
    name: '',
    description: '',
    type: 'comprehensive',
    dateRange: {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    filters: {},
    format: 'pdf',
  });

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const [schedule, setSchedule] = useState<ReportSchedule>({
    frequency: 'monthly',
    time: '09:00',
    recipients: [],
    enabled: false,
  });

  const [newRecipient, setNewRecipient] = useState('');

  const reportTypes = [
    { value: 'sales', label: 'Sales Report' },
    { value: 'inventory', label: 'Inventory Report' },
    { value: 'financial', label: 'Financial Report' },
    { value: 'customer', label: 'Customer Report' },
    { value: 'comprehensive', label: 'Comprehensive Report' },
  ];

  const reportFormats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' },
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
  ];

  const handleDateRangeChange = (range: any) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setReportConfig(prev => ({
        ...prev,
        dateRange: {
          startDate: range.from.toISOString().split('T')[0],
          endDate: range.to.toISOString().split('T')[0],
        },
      }));
    }
  };

  const addRecipient = () => {
    if (newRecipient && newRecipient.includes('@')) {
      setSchedule(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient],
      }));
      setNewRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    setSchedule(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email),
    }));
  };

  const handleSave = () => {
    if (!reportConfig.name) {
      alert('Please enter a report name');
      return;
    }

    const finalConfig: ReportConfig = {
      id: Date.now().toString(),
      name: reportConfig.name!,
      description: reportConfig.description || '',
      type: reportConfig.type!,
      dateRange: reportConfig.dateRange!,
      filters: reportConfig.filters!,
      format: reportConfig.format!,
      schedule: schedule.enabled ? schedule : undefined,
    };

    onSaveReport(finalConfig);
  };

  const handleGenerate = () => {
    if (!reportConfig.name) {
      alert('Please enter a report name');
      return;
    }

    const finalConfig: ReportConfig = {
      id: Date.now().toString(),
      name: reportConfig.name!,
      description: reportConfig.description || '',
      type: reportConfig.type!,
      dateRange: reportConfig.dateRange!,
      filters: reportConfig.filters!,
      format: reportConfig.format!,
    };

    onGenerateReport(finalConfig);
  };

  const updateFilter = (filterType: keyof ReportFilters, value: string[]) => {
    setReportConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value,
      },
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Report Builder</h2>
          <p className="text-muted-foreground">Create custom analytics reports</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          <Button onClick={handleGenerate}>
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportName">Report Name</Label>
                  <Input
                    id="reportName"
                    placeholder="Enter report name"
                    value={reportConfig.name || ''}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select
                    value={reportConfig.type}
                    onValueChange={(value) => setReportConfig(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter report description"
                  value={reportConfig.description || ''}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <DatePickerWithRange
                    date={dateRange}
                    onDateChange={handleDateRangeChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select
                    value={reportConfig.format}
                    onValueChange={(value) => setReportConfig(prev => ({ ...prev, format: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportFormats.map(format => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Report Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Document Types</Label>
                    <div className="space-y-2 mt-2">
                      {['invoice', 'quote', 'sales-order', 'purchase-order', 'delivery-note'].map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={reportConfig.filters?.documentTypes?.includes(type)}
                            onCheckedChange={(checked) => {
                              const current = reportConfig.filters?.documentTypes || [];
                              const updated = checked 
                                ? [...current, type]
                                : current.filter(t => t !== type);
                              updateFilter('documentTypes', updated);
                            }}
                          />
                          <Label htmlFor={type} className="capitalize">
                            {type.replace('-', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Status Filters</Label>
                    <div className="space-y-2 mt-2">
                      {['draft', 'pending', 'approved', 'paid', 'overdue', 'cancelled'].map(status => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={status}
                            checked={reportConfig.filters?.status?.includes(status)}
                            onCheckedChange={(checked) => {
                              const current = reportConfig.filters?.status || [];
                              const updated = checked 
                                ? [...current, status]
                                : current.filter(s => s !== status);
                              updateFilter('status', updated);
                            }}
                          />
                          <Label htmlFor={status} className="capitalize">
                            {status}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Product Categories</Label>
                    <div className="space-y-2 mt-2">
                      {['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'].map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={reportConfig.filters?.categories?.includes(category)}
                            onCheckedChange={(checked) => {
                              const current = reportConfig.filters?.categories || [];
                              const updated = checked 
                                ? [...current, category]
                                : current.filter(c => c !== category);
                              updateFilter('categories', updated);
                            }}
                          />
                          <Label htmlFor={category}>
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Schedule Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableSchedule"
                  checked={schedule.enabled}
                  onCheckedChange={(checked) => setSchedule(prev => ({ ...prev, enabled: !!checked }))}
                />
                <Label htmlFor="enableSchedule">Enable scheduled reports</Label>
              </div>

              {schedule.enabled && (
                <div className="space-y-4 pl-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={schedule.frequency}
                        onValueChange={(value) => setSchedule(prev => ({ ...prev, frequency: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencies.map(freq => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={schedule.time}
                        onChange={(e) => setSchedule(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Recipients</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter email address"
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                      />
                      <Button onClick={addRecipient} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {schedule.recipients.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {schedule.recipients.map((email, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {email}
                            <button
                              onClick={() => removeRecipient(email)}
                              className="ml-1 hover:text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {reportConfig.name || 'Untitled Report'}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {reportConfig.type}
                  </div>
                  <div>
                    <span className="font-medium">Format:</span> {reportConfig.format?.toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium">Date Range:</span>{' '}
                    {reportConfig.dateRange?.startDate} to {reportConfig.dateRange?.endDate}
                  </div>
                </div>

                {reportConfig.description && (
                  <div>
                    <span className="font-medium">Description:</span> {reportConfig.description}
                  </div>
                )}

                {Object.keys(reportConfig.filters || {}).length > 0 && (
                  <div>
                    <span className="font-medium">Filters Applied:</span>
                    <div className="mt-2 space-y-1">
                      {Object.entries(reportConfig.filters || {}).map(([key, values]) => (
                        values && values.length > 0 && (
                          <div key={key} className="text-sm">
                            <span className="capitalize">{key}:</span> {values.join(', ')}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {schedule.enabled && (
                  <div>
                    <span className="font-medium">Schedule:</span> {schedule.frequency} at {schedule.time}
                    {schedule.recipients.length > 0 && (
                      <div className="text-sm mt-1">
                        Recipients: {schedule.recipients.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportBuilder;
