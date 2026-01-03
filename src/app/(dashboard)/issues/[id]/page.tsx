'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Copy,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  User,
  Globe,
  Calendar,
  MessageSquare,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { SupportStatusBadge } from '@/components/support/SupportStatusBadge';
import { SupportCategoryBadge } from '@/components/support/SupportCategoryBadge';
import { SupportPriorityBadge } from '@/components/support/SupportPriorityBadge';
import {
  useSupportRequestDetails,
  useUpdateSupportStatus,
  useAssignSupportAdmin,
  useAddSupportResponse,
  useResolveSupportRequest,
  useUpdateSupportNotes,
} from '@/hooks/useSupport';
import { SupportStatus } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function SupportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data, isLoading } = useSupportRequestDetails(id);

  const updateStatus = useUpdateSupportStatus();
  const assignAdmin = useAssignSupportAdmin();
  const addResponse = useAddSupportResponse();
  const resolveRequest = useResolveSupportRequest();
  const updateNotes = useUpdateSupportNotes();

  const [newStatus, setNewStatus] = useState<SupportStatus | ''>('');
  const [statusNotes, setStatusNotes] = useState('');
  const [assignedAdminInput, setAssignedAdminInput] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const request = data?.data;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleStatusChange = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }
    try {
      await updateStatus.mutateAsync({
        id,
        data: {
          status: newStatus as SupportStatus,
          adminNotes: statusNotes || undefined,
        },
      });
      setNewStatus('');
      setStatusNotes('');
      toast.success('Status updated successfully');
    } catch (error: any) {
      toast.error('Failed to update status', {
        description: error.response?.data?.error || 'An error occurred',
      });
    }
  };

  const handleAssignAdmin = async () => {
    if (!assignedAdminInput.trim()) {
      toast.error('Please enter admin name');
      return;
    }
    try {
      await assignAdmin.mutateAsync({
        id,
        assignedAdmin: assignedAdminInput,
      });
      setAssignedAdminInput('');
      toast.success('Admin assigned successfully');
    } catch (error: any) {
      toast.error('Failed to assign admin', {
        description: error.response?.data?.error,
      });
    }
  };

  const handleAddResponse = async () => {
    if (!responseMessage.trim()) {
      toast.error('Please enter a response');
      return;
    }
    try {
      await addResponse.mutateAsync({
        id,
        data: {
          message: responseMessage,
          isAdminResponse: true,
        },
      });
      setResponseMessage('');
      toast.success('Response added successfully');
    } catch (error: any) {
      toast.error('Failed to add response', {
        description: error.response?.data?.error,
      });
    }
  };

  const handleResolve = async () => {
    try {
      await resolveRequest.mutateAsync({
        id,
        resolutionNotes: resolutionNotes || undefined,
      });
      setResolutionNotes('');
      toast.success('Request resolved successfully');
    } catch (error: any) {
      toast.error('Failed to resolve request', {
        description: error.response?.data?.error,
      });
    }
  };

  const handleClose = async () => {
    try {
      await updateStatus.mutateAsync({
        id,
        data: {
          status: SupportStatus.RESOLVED,
          adminNotes: 'Ticket closed by admin',
        },
      });
      toast.success('Request closed successfully');
    } catch (error: any) {
      toast.error('Failed to close request', {
        description: error.response?.data?.error,
      });
    }
  };

  const handleReopen = async () => {
    try {
      await updateStatus.mutateAsync({
        id,
        data: {
          status: SupportStatus.OPEN,
        },
      });
      toast.success('Request reopened successfully');
    } catch (error: any) {
      toast.error('Failed to reopen request', {
        description: error.response?.data?.error,
      });
    }
  };

  const handleUpdateNotes = async () => {
    if (!internalNotes.trim()) {
      toast.error('Please enter notes');
      return;
    }
    try {
      await updateNotes.mutateAsync({
        id,
        internalNotes,
      });
      toast.success('Notes updated successfully');
    } catch (error: any) {
      toast.error('Failed to update notes', {
        description: error.response?.data?.error,
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
        <div className="text-white/60 mb-4 text-sm">Support request not found</div>
        <Button onClick={() => router.push('/support')} className="bg-white text-black hover:bg-white/90">
          Back to Support
        </Button>
      </div>
    );
  }

  const canResolve = request.status !== SupportStatus.RESOLVED;
  const canReopen = request.status === SupportStatus.RESOLVED;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 pl-[4.5rem] lg:pl-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/support')}
            className="hover:bg-white/5 h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                {request.subject}
              </h1>
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
          <SupportStatusBadge status={request.status} />
          <SupportCategoryBadge category={request.category} />
          {canResolve && (
            <Button
              onClick={handleResolve}
              className="bg-green-600 hover:bg-green-700 text-white h-8 sm:h-10 text-xs sm:text-sm"
              disabled={resolveRequest.isPending}
            >
              {resolveRequest.isPending ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              )}
              Resolve
            </Button>
          )}
          {canReopen && (
            <Button
              onClick={handleReopen}
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 sm:h-10 text-xs sm:text-sm"
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
              ) : (
                'Reopen'
              )}
            </Button>
          )}
          {request.status !== SupportStatus.RESOLVED && (
            <Button
              variant="destructive"
              onClick={handleClose}
              disabled={updateStatus.isPending}
              className="h-8 sm:h-10 text-xs sm:text-sm"
            >
              {updateStatus.isPending ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
              ) : (
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              )}
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Request Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              Request Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">User ID</Label>
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
              <Label className="text-white/60 text-xs sm:text-sm">Website</Label>
              <Input
                value={request.website?.name || 'N/A'}
                readOnly
                className="mt-1 bg-black border-white/10 text-white text-sm h-9 sm:h-10"
              />
            </div>
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">Category</Label>
              <div className="mt-1">
                <SupportCategoryBadge category={request.category} />
              </div>
            </div>
            {request.priority && (
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">Priority</Label>
                <div className={`mt-1 px-3 py-2 rounded-md border text-sm ${
                  request.priority === 'HIGH' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                  request.priority === 'MEDIUM' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
                  'bg-white/10 border-white/10 text-white/60'
                }`}>
                  {request.priority}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">Current Assignment</Label>
              <Input
                value={request.assignedAdmin || 'Unassigned'}
                readOnly
                className="mt-1 bg-black border-white/10 text-white text-sm h-9 sm:h-10"
              />
            </div>
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">Assign to Admin</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={assignedAdminInput}
                  onChange={(e) => setAssignedAdminInput(e.target.value)}
                  placeholder="Enter admin name"
                  className="bg-black border-white/10 text-white text-sm h-9 sm:h-10"
                />
                <Button
                  onClick={handleAssignAdmin}
                  disabled={assignAdmin.isPending || !assignedAdminInput.trim()}
                  className="bg-white text-black hover:bg-white/90 h-9 sm:h-10"
                >
                  {assignAdmin.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Assign'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Original Message */}
      <Card className="bg-white/5 border-white/10 rounded-lg">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-white text-base sm:text-lg">Original Message</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <Textarea
            value={request.message}
            readOnly
            className="bg-black border-white/10 text-white min-h-[100px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Responses */}
      {request.responses && request.responses.length > 0 && (
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-base sm:text-lg">Responses</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
            {request.responses.map((response, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  response.isAdminResponse
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/60">
                    {response.isAdminResponse ? 'Admin Response' : 'User Response'}
                    {response.respondedBy && ` by ${response.respondedBy}`}
                  </span>
                  <span className="text-xs text-white/40">
                    {formatDateTime(response.respondedAt)}
                  </span>
                </div>
                <p className="text-sm text-white whitespace-pre-wrap">{response.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add Response */}
      {request.status !== SupportStatus.RESOLVED && (
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-base sm:text-lg">Add Response</CardTitle>
            <CardDescription className="text-white/60 text-xs sm:text-sm">
              Send a response to the user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <Textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Type your response..."
              className="bg-black border-white/10 text-white min-h-[100px] text-sm"
            />
            <Button
              onClick={handleAddResponse}
              disabled={addResponse.isPending || !responseMessage.trim()}
              className="bg-white text-black hover:bg-white/90 h-9 sm:h-10"
            >
              {addResponse.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Internal Notes */}
      <Card className="bg-yellow-500/10 border-yellow-500/30 rounded-lg">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-yellow-400 text-base sm:text-lg">Internal Notes</CardTitle>
          <CardDescription className="text-yellow-400/60 text-xs sm:text-sm">
            Private notes visible only to admins
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
          {request.internalNotes && (
            <Textarea
              value={request.internalNotes}
              readOnly
              className="bg-black/50 border-yellow-500/30 text-white min-h-[80px] text-sm mb-3"
            />
          )}
          <Textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Add internal notes..."
            className="bg-black/50 border-yellow-500/30 text-white min-h-[80px] text-sm"
          />
          <Button
            onClick={handleUpdateNotes}
            disabled={updateNotes.isPending || !internalNotes.trim()}
            className="bg-yellow-500 text-black hover:bg-yellow-600 h-9 sm:h-10"
          >
            {updateNotes.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Notes'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Update Status */}
      {request.status !== SupportStatus.RESOLVED && (
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-base sm:text-lg">Update Status</CardTitle>
            <CardDescription className="text-white/60 text-xs sm:text-sm">
              Change the support request status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">New Status</Label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as SupportStatus)}
                className="mt-1 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-white text-sm focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 h-9 sm:h-10"
              >
                <option value="">Select status</option>
                {Object.values(SupportStatus)
                  .filter((s) => s !== SupportStatus.RESOLVED)
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
                placeholder="Add notes about status change..."
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
    </div>
  );
}