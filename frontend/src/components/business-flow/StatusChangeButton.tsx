import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateDocumentStatus } from '@/hooks/useDocumentStatus';
import { CheckCircle, Clock, AlertCircle, XCircle, RefreshCw } from 'lucide-react';

interface StatusChangeButtonProps {
  documentType: string;
  documentId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

const StatusChangeButton: React.FC<StatusChangeButtonProps> = ({
  documentType,
  documentId,
  currentStatus,
  onStatusChange
}) => {
  const updateStatus = useUpdateDocumentStatus();

  const getStatusOptions = (docType: string, current: string): string[] => {
    const statusOptions: Record<string, Record<string, string[]>> = {
      'quotation': {
        'draft': ['sent'],
        'sent': ['accepted', 'rejected', 'expired'],
        'accepted': [], // No further status changes after accepted, workflow takes over
        'rejected': [],
        'expired': []
      },
      'sales_order': {
        'draft': ['confirmed', 'cancelled'],
        'confirmed': [], // No further status changes after confirmed, workflow takes over
        'cancelled': []
      },
      'invoice': {
        'pending': ['sent', 'cancelled'],
        'sent': ['paid', 'overdue'],
        'paid': [],
        'overdue': ['paid'],
        'cancelled': []
      }
    };

    return statusOptions[docType]?.[current] || [];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="w-3 h-3" />;
      case 'sent': return <RefreshCw className="w-3 h-3" />;
      case 'accepted':
      case 'confirmed':
      case 'paid': return <CheckCircle className="w-3 h-3" />;
      case 'rejected':
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      case 'expired':
      case 'overdue': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted':
      case 'confirmed':
      case 'paid': return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired':
      case 'overdue': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate({
      documentType,
      documentId,
      newStatus
    }, {
      onSuccess: () => {
        onStatusChange?.(newStatus);
      }
    });
  };

  const availableStatuses = getStatusOptions(documentType, currentStatus);

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${getStatusColor(currentStatus)} flex items-center gap-1`}>
        {getStatusIcon(currentStatus)}
        {currentStatus.toUpperCase()}
      </Badge>
      
      {availableStatuses.length > 0 && (
        <Select onValueChange={handleStatusChange} disabled={updateStatus.isPending}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Change status" />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map(status => (
              <SelectItem key={status} value={status}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {updateStatus.isPending && (
        <RefreshCw className="w-4 h-4 animate-spin" />
      )}
    </div>
  );
};

export default StatusChangeButton;
