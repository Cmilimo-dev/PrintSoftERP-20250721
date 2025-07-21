import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Lead } from '@/types/customers';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  Edit,
  FileText,
  DollarSign,
  Star,
  AlertCircle
} from 'lucide-react';

interface LeadViewProps {
  lead: Lead;
  onEdit: () => void;
  onClose: () => void;
}

const LeadView: React.FC<LeadViewProps> = ({ lead, onEdit, onClose }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number, currency: string = 'KES') => {
    if (typeof amount !== 'number') return 'N/A';
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'qualified': return 'outline';
      case 'proposal': return 'default';
      case 'negotiation': return 'default';
      case 'closed_won': return 'default';
      case 'closed_lost': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'secondary';
      case 'medium': return 'default';
      case 'high': return 'default';
      case 'urgent': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Target className="h-5 w-5" />;
      case 'contacted': return <Clock className="h-5 w-5" />;
      case 'qualified': return <TrendingUp className="h-5 w-5" />;
      case 'closed_won': return <CheckCircle className="h-5 w-5" />;
      case 'closed_lost': return <XCircle className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getStatusProgress = (status: string) => {
    const statusSteps = {
      'new': 10,
      'contacted': 25,
      'qualified': 50,
      'proposal': 70,
      'negotiation': 85,
      'closed_won': 100,
      'closed_lost': 0
    };
    return statusSteps[status as keyof typeof statusSteps] || 0;
  };

  const currentStatus = lead.lead_status || lead.status || 'new';
  const progress = getStatusProgress(currentStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon(currentStatus)}
          <div>
            <h2 className="text-2xl font-bold">
              {lead.contact_person || lead.contact_name || 'Lead Details'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getStatusColor(currentStatus) as any}>
                {currentStatus.replace('_', ' ')}
              </Badge>
              <Badge variant={getPriorityColor(lead.priority || 'medium') as any}>
                {lead.priority || 'medium'} priority
              </Badge>
              {lead.lead_number && (
                <span className="text-sm text-muted-foreground font-mono">
                  #{lead.lead_number}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>

      <Separator />

      {/* Lead Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lead Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Pipeline Stage</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>New</span>
            <span>Contacted</span>
            <span>Qualified</span>
            <span>Proposal</span>
            <span>Negotiation</span>
            <span>Closed</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lead.contact_person && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                <p className="mt-1">{lead.contact_person}</p>
              </div>
            )}

            {lead.company_name && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company</label>
                  <p className="mt-1">{lead.company_name}</p>
                </div>
              </div>
            )}

            {lead.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="mt-1">{lead.email}</p>
                </div>
              </div>
            )}

            {lead.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="mt-1">{lead.phone}</p>
                </div>
              </div>
            )}

            {lead.lead_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Lead Number</label>
                <p className="mt-1 font-mono">{lead.lead_number}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Lead Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={getStatusColor(currentStatus) as any}>
                  {currentStatus.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Priority</label>
              <div className="mt-1">
                <Badge variant={getPriorityColor(lead.priority || 'medium') as any}>
                  {lead.priority || 'medium'}
                </Badge>
              </div>
            </div>

            {(lead.lead_source || lead.source) && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Source</label>
                <p className="mt-1">{lead.lead_source || lead.source}</p>
              </div>
            )}

            {lead.estimated_value && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estimated Value</label>
                  <p className="mt-1 text-lg font-semibold">
                    {formatCurrency(lead.estimated_value)}
                  </p>
                </div>
              </div>
            )}

            {typeof lead.score === 'number' && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Lead Score</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={(lead.score / 100) * 100} className="flex-1" />
                    <span className="text-sm font-medium">{lead.score}/100</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        {lead.notes && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Timeline & Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Lead Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Lead Created</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(lead.created_at)} - Lead was first entered into the system
                  </p>
                </div>
              </div>
              
              {lead.updated_at && lead.updated_at !== lead.created_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(lead.updated_at)} - Lead information was last modified
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Current Stage</p>
                  <p className="text-xs text-muted-foreground">
                    Lead is currently in <strong>{currentStatus.replace('_', ' ')}</strong> stage
                  </p>
                </div>
              </div>

              {lead.estimated_value && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Opportunity Value</p>
                    <p className="text-xs text-muted-foreground">
                      Estimated deal value: <strong>{formatCurrency(lead.estimated_value)}</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Phone className="h-4 w-4 mr-2" />
              Make Call
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Create Proposal
            </Button>
          </CardContent>
        </Card>

        {/* Lead Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Lead Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Days in Pipeline</span>
              <span className="font-semibold">
                {lead.created_at ? Math.floor((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Lead Score</span>
              <span className="font-semibold">{lead.score || 0}/100</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Priority Level</span>
              <Badge variant={getPriorityColor(lead.priority || 'medium') as any}>
                {lead.priority || 'medium'}
              </Badge>
            </div>
            
            {lead.estimated_value && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Potential Value</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(lead.estimated_value)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Record Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Record Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-muted-foreground">Created</label>
              <p className="mt-1">{formatDate(lead.created_at)}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Last Updated</label>
              <p className="mt-1">{formatDate(lead.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadView;
