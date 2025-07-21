import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  BarChart3,
  TrendingUp,
  DollarSign,
  Archive
} from 'lucide-react';

interface GeneratedReport {
  id: string;
  reportType: 'balance-sheet' | 'profit-loss' | 'cash-flow' | 'general-ledger';
  reportName: string;
  generatedDate: string;
  reportPeriod: string;
  status: 'completed' | 'processing' | 'failed';
  format: 'pdf' | 'excel' | 'csv';
  fileSize: string;
  downloadUrl?: string;
  parameters: {
    startDate?: string;
    endDate?: string;
    asOfDate?: string;
    comparisonPeriod?: string;
  };
}

const ReportsDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('generatedDate');

  // Mock generated reports data
  const generatedReports: GeneratedReport[] = [
    {
      id: 'BS-2024-001',
      reportType: 'balance-sheet',
      reportName: 'Balance Sheet - December 2024',
      generatedDate: '2024-06-29T12:30:00Z',
      reportPeriod: 'As of 2024-12-31',
      status: 'completed',
      format: 'pdf',
      fileSize: '234 KB',
      downloadUrl: '/downloads/balance-sheet-dec-2024.pdf',
      parameters: {
        asOfDate: '2024-12-31',
        comparisonPeriod: 'previous-year'
      }
    },
    {
      id: 'PL-2024-002',
      reportType: 'profit-loss',
      reportName: 'P&L Statement - Q4 2024',
      generatedDate: '2024-06-29T11:45:00Z',
      reportPeriod: '2024-10-01 to 2024-12-31',
      status: 'completed',
      format: 'excel',
      fileSize: '156 KB',
      downloadUrl: '/downloads/pl-statement-q4-2024.xlsx',
      parameters: {
        startDate: '2024-10-01',
        endDate: '2024-12-31',
        comparisonPeriod: 'previous-quarter'
      }
    },
    {
      id: 'BS-2024-003',
      reportType: 'balance-sheet',
      reportName: 'Balance Sheet - November 2024',
      generatedDate: '2024-06-29T10:15:00Z',
      reportPeriod: 'As of 2024-11-30',
      status: 'completed',
      format: 'pdf',
      fileSize: '198 KB',
      downloadUrl: '/downloads/balance-sheet-nov-2024.pdf',
      parameters: {
        asOfDate: '2024-11-30',
        comparisonPeriod: 'previous-month'
      }
    },
    {
      id: 'PL-2024-004',
      reportType: 'profit-loss',
      reportName: 'P&L Statement - November 2024',
      generatedDate: '2024-06-29T09:30:00Z',
      reportPeriod: '2024-11-01 to 2024-11-30',
      status: 'completed',
      format: 'csv',
      fileSize: '89 KB',
      downloadUrl: '/downloads/pl-statement-nov-2024.csv',
      parameters: {
        startDate: '2024-11-01',
        endDate: '2024-11-30',
        comparisonPeriod: 'none'
      }
    },
    {
      id: 'GL-2024-005',
      reportType: 'general-ledger',
      reportName: 'General Ledger - December 2024',
      generatedDate: '2024-06-29T08:00:00Z',
      reportPeriod: '2024-12-01 to 2024-12-31',
      status: 'processing',
      format: 'pdf',
      fileSize: 'Processing...',
      parameters: {
        startDate: '2024-12-01',
        endDate: '2024-12-31'
      }
    }
  ];

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'balance-sheet':
        return <BarChart3 className="h-4 w-4" />;
      case 'profit-loss':
        return <TrendingUp className="h-4 w-4" />;
      case 'cash-flow':
        return <DollarSign className="h-4 w-4" />;
      case 'general-ledger':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      completed: 'default',
      processing: 'secondary',
      failed: 'destructive'
    };
    
    return (
      <Badge variant={statusColors[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getFormatBadge = (format: string) => {
    const formatColors: { [key: string]: string } = {
      pdf: 'bg-red-100 text-red-800',
      excel: 'bg-green-100 text-green-800',
      csv: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge variant="outline" className={formatColors[format]}>
        {format.toUpperCase()}
      </Badge>
    );
  };

  const filteredReports = generatedReports.filter(report => {
    const matchesSearch = report.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.reportType === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDownload = (report: GeneratedReport) => {
    if (report.downloadUrl && report.status === 'completed') {
      // In a real application, this would trigger the actual download
      console.log('Downloading report:', report.id);
      alert(`Downloading ${report.reportName}`);
    }
  };

  const handleView = (report: GeneratedReport) => {
    if (report.status === 'completed') {
      // In a real application, this would open the report in a viewer
      console.log('Viewing report:', report.id);
      alert(`Opening ${report.reportName} for viewing`);
    }
  };

  const handleRegenerate = (report: GeneratedReport) => {
    console.log('Regenerating report:', report.id);
    alert(`Regenerating ${report.reportName} with current data`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Archive className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Generated Reports</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generatedReports.length}</div>
            <p className="text-xs text-muted-foreground">
              All generated reports
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generatedReports.filter(r => r.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for download
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generatedReports.filter(r => r.status === 'processing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently generating
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generatedReports.filter(r => new Date(r.generatedDate).getMonth() === new Date().getMonth()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Generated this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
                <SelectItem value="profit-loss">P&L Statement</SelectItem>
                <SelectItem value="cash-flow">Cash Flow</SelectItem>
                <SelectItem value="general-ledger">General Ledger</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="generatedDate">Generation Date</SelectItem>
                <SelectItem value="reportName">Report Name</SelectItem>
                <SelectItem value="reportType">Report Type</SelectItem>
                <SelectItem value="fileSize">File Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getReportTypeIcon(report.reportType)}
                      <div>
                        <div className="font-medium">{report.reportName}</div>
                        <div className="text-sm text-muted-foreground">{report.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="capitalize">{report.reportType.replace('-', ' ')}</div>
                  </TableCell>
                  <TableCell>{report.reportPeriod}</TableCell>
                  <TableCell>
                    {new Date(report.generatedDate).toLocaleDateString()} <br />
                    <span className="text-sm text-muted-foreground">
                      {new Date(report.generatedDate).toLocaleTimeString()}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>{getFormatBadge(report.format)}</TableCell>
                  <TableCell>{report.fileSize}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleView(report)}
                        disabled={report.status !== 'completed'}
                        title="View Report"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownload(report)}
                        disabled={report.status !== 'completed'}
                        title="Download Report"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRegenerate(report)}
                        title="Regenerate Report"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsDashboard;
