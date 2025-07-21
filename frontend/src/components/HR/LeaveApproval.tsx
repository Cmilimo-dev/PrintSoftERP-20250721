import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';

interface LeaveRequest {
  id: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  status: string;
  created_at: string;
}

interface LeaveApprovalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, comments?: string) => void;
  onReject: (id: string, comments: string) => void;
  request: LeaveRequest | null;
}

const LeaveApproval: React.FC<LeaveApprovalProps> = ({ 
  isOpen, 
  onClose, 
  onApprove, 
  onReject, 
  request 
}) => {
  const [comments, setComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (!request) return;
    
    setIsProcessing(true);
    try {
      await onApprove(request.id, comments);
      setComments('');
      onClose();
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;
    
    if (!comments.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setIsProcessing(true);
    try {
      await onReject(request.id, comments);
      setComments('');
      onClose();
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLeaveTypeColor = (type: string) => {
    const colors = {
      annual: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      personal: 'bg-green-100 text-green-800',
      maternity: 'bg-pink-100 text-pink-800',
      paternity: 'bg-purple-100 text-purple-800',
      unpaid: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl mx-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold">
            Review Leave Request
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Employee Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <h3 className="font-semibold text-lg">{request.employee_name}</h3>
                <p className="text-sm text-gray-600">
                  Submitted on {formatDate(request.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Leave Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700">Leave Type</Label>
                <div className="mt-1">
                  <Badge className={`${getLeaveTypeColor(request.leave_type)} capitalize`}>
                    {request.leave_type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Duration</Label>
                <div className="mt-1 flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-semibold">
                    {request.days_requested} day(s)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                <div className="mt-1 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formatDate(request.start_date)}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">End Date</Label>
                <div className="mt-1 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{formatDate(request.end_date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reason */}
          {request.reason && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Reason</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-800">{request.reason}</p>
              </div>
            </div>
          )}

          {/* Manager Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Manager Comments</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add comments about this leave request..."
              className="w-full"
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Comments are optional for approval but required for rejection
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full sm:w-auto"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleReject}
            className="w-full sm:w-auto"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Reject'}
          </Button>
          <Button 
            onClick={handleApprove}
            className="w-full sm:w-auto"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Approve'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveApproval;
