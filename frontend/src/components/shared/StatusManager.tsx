import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, AlertCircle, XCircle, FileText, ArrowRight } from 'lucide-react';

export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected';

interface StatusManagerProps {
  currentStatus: DocumentStatus;
  documentType: string;
  documentId?: string;
  onStatusChange: (newStatus: DocumentStatus) => void;
  allowedTransitions?: DocumentStatus[];
  showWorkflow?: boolean;
  className?: string;
}

const STATUS_CONFIGS: Record<DocumentStatus, {
  label: string;
  icon: React.ReactNode;
  color: string;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
}> = {
  draft: {
    label: 'Draft',
    icon: <FileText className="h-4 w-4" />,
    color: 'text-gray-600',
    badgeVariant: 'outline'
  },
  pending: {
    label: 'Pending',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-yellow-600',
    badgeVariant: 'secondary'
  },
  approved: {
    label: 'Approved',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-blue-600',
    badgeVariant: 'default'
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-green-600',
    badgeVariant: 'default'
  },
  cancelled: {
    label: 'Cancelled',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-600',
    badgeVariant: 'destructive'
  },
  rejected: {
    label: 'Rejected',
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'text-red-600',
    badgeVariant: 'destructive'
  }
};

const DEFAULT_WORKFLOWS: Record<string, Record<DocumentStatus, DocumentStatus[]>> = {
  'purchase-order': {
    draft: ['pending', 'cancelled'],
    pending: ['approved', 'rejected', 'cancelled'],
    approved: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    rejected: ['draft']
  },
  'sales-order': {
    draft: ['pending', 'cancelled'],
    pending: ['approved', 'rejected', 'cancelled'],
    approved: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    rejected: ['draft']
  },
  'invoice': {
    draft: ['pending', 'cancelled'],
    pending: ['approved', 'rejected', 'cancelled'],
    approved: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    rejected: ['draft']
  },
  'quote': {
    draft: ['pending', 'cancelled'],
    pending: ['approved', 'rejected', 'cancelled'],
    approved: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    rejected: ['draft']
  },
  'delivery-note': {
    draft: ['pending', 'cancelled'],
    pending: ['approved', 'rejected', 'cancelled'],
    approved: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    rejected: ['draft']
  },
  'payment-receipt': {
    draft: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    pending: ['completed', 'cancelled'],
    approved: ['completed', 'cancelled'],
    rejected: ['draft']
  }
};

const StatusManager: React.FC<StatusManagerProps> = ({
  currentStatus,
  documentType,
  documentId,
  onStatusChange,
  allowedTransitions,
  showWorkflow = false,
  className = ''
}) => {
  const { toast } = useToast();
  
  const config = STATUS_CONFIGS[currentStatus];
  const possibleTransitions = allowedTransitions || 
    DEFAULT_WORKFLOWS[documentType]?.[currentStatus] || [];

  const handleStatusChange = (newStatus: DocumentStatus) => {
    if (!possibleTransitions.includes(newStatus)) {
      toast({
        title: "Invalid Status Transition",
        description: `Cannot change from ${currentStatus} to ${newStatus}`,
        variant: "destructive"
      });
      return;
    }

    onStatusChange(newStatus);
    toast({
      title: "Status Updated",
      description: `Document status changed to ${STATUS_CONFIGS[newStatus].label}`,
    });
  };

  const getWorkflowSteps = (): DocumentStatus[] => {
    switch (documentType) {
      case 'purchase-order':
      case 'sales-order':
      case 'invoice':
      case 'quote':
        return ['draft', 'pending', 'approved', 'completed'];
      case 'delivery-note':
        return ['draft', 'pending', 'approved', 'completed'];
      case 'payment-receipt':
        return ['draft', 'completed'];
      default:
        return ['draft', 'pending', 'approved', 'completed'];
    }
  };

  const getStepStatus = (step: DocumentStatus): 'completed' | 'current' | 'pending' => {
    const steps = getWorkflowSteps();
    const currentIndex = steps.indexOf(currentStatus);
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Status Display */}
      <div className="flex items-center gap-2">
        <Badge variant={config.badgeVariant} className="flex items-center gap-1">
          {config.icon}
          {config.label}
        </Badge>
      </div>

      {/* Status Change Controls */}
      {possibleTransitions.length > 0 && (
        <div className="flex items-center gap-2">
          <Select onValueChange={handleStatusChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Change status..." />
            </SelectTrigger>
            <SelectContent>
              {possibleTransitions.map((status) => {
                const statusConfig = STATUS_CONFIGS[status];
                return (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      {statusConfig.icon}
                      {statusConfig.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Workflow Progress */}
      {showWorkflow && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Document Workflow</h4>
          <div className="flex items-center justify-between">
            {getWorkflowSteps().map((step, index) => {
              const stepConfig = STATUS_CONFIGS[step];
              const stepStatus = getStepStatus(step);
              const isLast = index === getWorkflowSteps().length - 1;
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    stepStatus === 'completed' ? 'bg-green-100 border-green-500 text-green-700' :
                    stepStatus === 'current' ? 'bg-blue-100 border-blue-500 text-blue-700' :
                    'bg-gray-100 border-gray-300 text-gray-500'
                  }`}>
                    {stepConfig.icon}
                  </div>
                  <div className="ml-2 text-sm">
                    <div className={`font-medium ${
                      stepStatus === 'current' ? 'text-blue-700' : 
                      stepStatus === 'completed' ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {stepConfig.label}
                    </div>
                  </div>
                  {!isLast && (
                    <ArrowRight className={`mx-3 h-4 w-4 ${
                      stepStatus === 'completed' ? 'text-green-500' : 'text-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      {possibleTransitions.length > 0 && (
        <div className="flex gap-2">
          {possibleTransitions.slice(0, 2).map((status) => {
            const statusConfig = STATUS_CONFIGS[status];
            return (
              <Button
                key={status}
                variant={status === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange(status)}
                className="flex items-center gap-1"
              >
                {statusConfig.icon}
                {statusConfig.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatusManager;
