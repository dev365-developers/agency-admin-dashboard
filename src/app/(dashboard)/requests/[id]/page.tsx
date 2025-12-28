'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Globe,
  List,
  Briefcase,
  User,
  Copy,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RequestStatusBadge } from '@/components/requests/RequestStatusBadge';
import {
  useRequestDetails,
  useUpdateRequestStatus,
  useApproveRequest,
  useRejectRequest,
} from '@/hooks/useRequests';
import { RequestStatus } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data, isLoading } = useRequestDetails(id);
  const updateStatus = useUpdateRequestStatus();
  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [assignedAdmin, setAssignedAdmin] = useState('');
  const [initialNotes, setInitialNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [newStatus, setNewStatus] = useState<RequestStatus | ''>('');
  const [statusNotes, setStatusNotes] = useState('');

  const request = data?.data?.request;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`, {
      description: text,
    });
  };

  const handleApprove = async () => {
    try {
      await approveRequest.mutateAsync({
        id: id,
        assignedAdmin: assignedAdmin || undefined,
        initialNotes: initialNotes || undefined,
      });
      setShowApproveDialog(false);
      toast.success('Request approved successfully!', {
        description: 'A new website project has been created.',
      });
      router.push('/requests');
    } catch (error: any) {
      toast.error('Failed to approve request', {
        description: error.response?.data?.error || 'An error occurred while approving the request.',
      });
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason required', {
        description: 'Please provide a reason for rejecting this request.',
      });
      return;
    }
    try {
      await rejectRequest.mutateAsync({
        id: id,
        reason: rejectionReason,
      });
      setShowRejectDialog(false);
      toast.success('Request rejected', {
        description: 'The request has been rejected and the user has been notified.',
      });
      router.push('/requests');
    } catch (error: any) {
      toast.error('Failed to reject request', {
        description: error.response?.data?.error || 'An error occurred while rejecting the request.',
      });
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus) {
      toast.error('Status required', {
        description: 'Please select a status before updating.',
      });
      return;
    }
    try {
      await updateStatus.mutateAsync({
        id: id,
        status: newStatus as RequestStatus,
        internalNotes: statusNotes || undefined,
      });
      setNewStatus('');
      setStatusNotes('');
      toast.success('Status updated successfully!', {
        description: `Request status changed to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error: any) {
      toast.error('Failed to update status', {
        description: error.response?.data?.error || 'An error occurred while updating the status.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pl-16 lg:pl-0">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pl-16 lg:pl-0">
        <div className="text-white/60 mb-4 text-sm">Request not found</div>
        <Button onClick={() => router.push('/requests')} className="bg-white text-black hover:bg-white/90">
          Back to Requests
        </Button>
      </div>
    );
  }

  const canApproveOrReject = 
    request.status !== RequestStatus.APPROVED && 
    request.status !== RequestStatus.REJECTED;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 pl-[4.5rem] lg:pl-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/requests')}
            className="hover:bg-white/5 h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">{request.projectName}</h1>
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-white/5 border border-white/10 rounded-md w-fit">
                <span className="text-xs text-white/60">ID:</span>
                <span className="text-xs font-mono text-white truncate">{request._id.slice(-8)}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 sm:h-6 sm:w-6 hover:bg-white/10 flex-shrink-0"
                  onClick={() => copyToClipboard(request._id, 'Request ID')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <p className="text-white/60 mt-1 text-xs sm:text-sm">
              Created {formatDateTime(request.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <RequestStatusBadge status={request.status} />
          {canApproveOrReject && (
            <>
              <Button
                onClick={() => setShowApproveDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white h-8 sm:h-10 text-xs sm:text-sm"
                disabled={approveRequest.isPending}
              >
                {approveRequest.isPending ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                )}
                <span className="hidden sm:inline">Approve</span>
                <span className="sm:hidden">✓</span>
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectDialog(true)}
                disabled={rejectRequest.isPending}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              >
                {rejectRequest.isPending ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                )}
                <span className="hidden sm:inline">Reject</span>
                <span className="sm:hidden">✗</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Project Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">Project Name</Label>
              <Input
                value={request.projectName}
                readOnly
                className="mt-1 bg-black border-white/10 text-white text-sm h-9 sm:h-10"
              />
            </div>
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">Project Type</Label>
              <Input
                value={request.projectType.replace('_', ' ')}
                readOnly
                className="mt-1 bg-black border-white/10 text-white text-sm h-9 sm:h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">Pages</Label>
                <Input
                  value={request.pagesRequired || 'N/A'}
                  readOnly
                  className="mt-1 bg-black border-white/10 text-white text-sm h-9 sm:h-10"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">Plan</Label>
                <Input
                  value={request.selectedPlan || 'N/A'}
                  readOnly
                  className="mt-1 bg-black border-white/10 text-white text-sm h-9 sm:h-10"
                />
              </div>
            </div>
            {request.recommendedTemplate && (
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">Template</Label>
                <Input
                  value={request.recommendedTemplate}
                  readOnly
                  className="mt-1 bg-black border-white/10 text-white text-sm h-9 sm:h-10"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div>
              <Label className="text-white/60 flex items-center gap-2 text-xs sm:text-sm">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                User ID
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={request.userId}
                  readOnly
                  className="bg-black border-white/10 text-white font-mono text-xs sm:text-sm h-9 sm:h-10"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="border-white/10 hover:bg-white/5 h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                  onClick={() => copyToClipboard(request.userId, 'User ID')}
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-white/60 flex items-center gap-2 text-xs sm:text-sm">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                Name
              </Label>
              <Input
                value={request.contactName}
                readOnly
                className="mt-1 bg-black border-white/10 text-white text-sm h-9 sm:h-10"
              />
            </div>
            <div>
              <Label className="text-white/60 flex items-center gap-2 text-xs sm:text-sm">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                Email
              </Label>
              <Input
                value={request.contactEmail}
                readOnly
                className="mt-1 bg-black border-white/10 text-white text-sm h-9 sm:h-10"
              />
            </div>
            <div>
              <Label className="text-white/60 flex items-center gap-2 text-xs sm:text-sm">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                Phone
              </Label>
              <Input
                value={request.contactPhone}
                readOnly
                className="mt-1 bg-black border-white/10 text-white text-sm h-9 sm:h-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Description */}
      <Card className="bg-white/5 border-white/10 rounded-lg">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-white text-base sm:text-lg">Project Description</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <Textarea
            value={request.description}
            readOnly
            className="bg-black border-white/10 text-white min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Features and References */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Required Features */}
        {request.features.length > 0 && (
          <Card className="bg-white/5 border-white/10 rounded-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
                Required Features
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-2">
                {request.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 flex-shrink-0" />
                    <span className="text-sm text-white flex-1 break-words">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reference Links */}
        {request.referenceLinks.length > 0 && (
          <Card className="bg-white/5 border-white/10 rounded-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                Reference Links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-2">
                {request.referenceLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={link}
                      readOnly
                      className="bg-black border-white/10 text-white text-xs sm:text-sm h-9 sm:h-10"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-white/10 hover:bg-white/5 h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                      onClick={() => {
                        window.open(link, '_blank');
                        toast.info('Opening link');
                      }}
                    >
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Internal Notes */}
      {request.internalNotes && (
        <Card className="bg-yellow-500/10 border-yellow-500/30 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-yellow-400 text-base sm:text-lg">Internal Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Textarea
              value={request.internalNotes}
              readOnly
              className="bg-black/50 border-yellow-500/30 text-white min-h-[80px] text-sm"
            />
          </CardContent>
        </Card>
      )}

      {/* Update Status */}
      {request.status !== RequestStatus.APPROVED && 
       request.status !== RequestStatus.REJECTED && (
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-base sm:text-lg">Update Status</CardTitle>
            <CardDescription className="text-white/60 text-xs sm:text-sm">
              Change the request status and add notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">New Status</Label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
                className="mt-1 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-white text-sm focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 h-9 sm:h-10"
              >
                <option value="">Select status</option>
                {Object.values(RequestStatus)
                  .filter(s => s !== RequestStatus.APPROVED && s !== RequestStatus.REJECTED)
                  .map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">Notes (Optional)</Label>
              <Textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add notes..."
                className="mt-1 bg-black border-white/10 text-white text-sm"
                rows={3}
              />
            </div>
            <Button
              onClick={handleStatusChange}
              disabled={!newStatus || updateStatus.isPending}
              className="bg-white text-black hover:bg-white/90 h-9 sm:h-10 text-sm"
            >
              {updateStatus.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Approve Dialog */}
      {showApproveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-white/5 border-white/10 rounded-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-base sm:text-lg">Approve Request</CardTitle>
              <CardDescription className="text-white/60 text-xs sm:text-sm">
                This will create a new website project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">Assigned Admin (Optional)</Label>
                <Input
                  value={assignedAdmin}
                  onChange={(e) => setAssignedAdmin(e.target.value)}
                  placeholder="Enter admin name"
                  className="mt-1 bg-black border-white/10 text-white text-sm h-9 sm:h-10"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">Initial Notes (Optional)</Label>
                <Textarea
                  value={initialNotes}
                  onChange={(e) => setInitialNotes(e.target.value)}
                  placeholder="Add initial notes..."
                  className="mt-1 bg-black border-white/10 text-white text-sm"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={approveRequest.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9 sm:h-10 text-xs sm:text-sm"
                >
                  {approveRequest.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Approving...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Approve & Create</span>
                      <span className="sm:hidden">Approve</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowApproveDialog(false)}
                  disabled={approveRequest.isPending}
                  className="border-white/10 hover:bg-white/5 h-9 sm:h-10 text-xs sm:text-sm"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-white/5 border-white/10 rounded-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-base sm:text-lg">Reject Request</CardTitle>
              <CardDescription className="text-white/60 text-xs sm:text-sm">
                Please provide a reason for rejection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">Rejection Reason *</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why..."
                  className="mt-1 bg-black border-white/10 text-white text-sm"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejectRequest.isPending || !rejectionReason.trim()}
                  className="flex-1 h-9 sm:h-10 text-xs sm:text-sm"
                >
                  {rejectRequest.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Rejecting...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    'Reject'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(false)}
                  disabled={rejectRequest.isPending}
                  className="border-white/10 hover:bg-white/5 h-9 sm:h-10 text-xs sm:text-sm"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}