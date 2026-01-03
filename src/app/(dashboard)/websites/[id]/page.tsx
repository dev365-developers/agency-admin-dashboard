'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useWebsiteDetails,
  useUpdateWebsite,
  useUpdateWebsiteStatus,
  useAssignAdmin,
  useAddMilestone,
  useUpdateMilestone,
} from '@/hooks/useWebsites';
import { useUpdateBilling, useRecordPayment } from '@/hooks/useBilling';
import { WebsiteStatus, BillingStatus } from '@/types';
import { WebsiteStatusBadge } from '@/components/websites/WebsiteStatusBadge';
import { BillingStatusBadge } from '@/components/websites/BillingStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Loader2,
  Save,
  ExternalLink,
  CheckCircle2,
  Circle,
  Plus,
  User,
  Copy,
  CreditCard,
  DollarSign,
  Calendar,
  Receipt,
  Clock,
  AlertTriangle,
  XCircle,
  IndianRupee,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusConfig = {
  [WebsiteStatus.CREATED]: {
    label: 'Created',
    color: 'bg-gray-500/20 text-gray-300 border-gray-500/40 hover:bg-gray-500/30',
  },
  [WebsiteStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30',
  },
  [WebsiteStatus.REVIEW]: {
    label: 'Review',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30',
  },
  [WebsiteStatus.COMPLETED]: {
    label: 'Completed',
    color: 'bg-green-500/20 text-green-300 border-green-500/40 hover:bg-green-500/30',
  },
  [WebsiteStatus.DEPLOYED]: {
    label: 'Deployed',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30',
  },
  [WebsiteStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30',
  },
};

export default function WebsiteDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: websiteResponse, isLoading } = useWebsiteDetails(id);
  const updateWebsite = useUpdateWebsite();
  const updateStatus = useUpdateWebsiteStatus();
  const assignAdmin = useAssignAdmin();
  const addMilestone = useAddMilestone();
  const updateMilestone = useUpdateMilestone();
  const updateBilling = useUpdateBilling();
  const recordPayment = useRecordPayment();

  const website = websiteResponse?.data;

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [newMilestone, setNewMilestone] = useState('');
  const [assignedAdmin, setAssignedAdmin] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<WebsiteStatus>(WebsiteStatus.CREATED);

  // Billing states
  const [billingPlan, setBillingPlan] = useState('');
  const [billingPrice, setBillingPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  
  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Update form when data loads
  useEffect(() => {
    if (website) {
      setName(website.name);
      setDescription(website.description || '');
      setDomain(website.domain || '');
      setDeploymentUrl(website.deploymentUrl || '');
      setRepositoryUrl(website.repositoryUrl || '');
      setAdminNotes(website.adminNotes || '');
      setClientNotes(website.clientNotes || '');
      setAssignedAdmin(website.assignedAdmin || '');
      setSelectedStatus(website.status);
      
      // Billing info
      setBillingPlan(website.billing?.plan || '');
      setBillingPrice(website.billing?.price?.toString() || '');
      setBillingCycle(website.billing?.billingCycle || 'monthly');
    }
  }, [website]);

  const handleSaveAll = async () => {
    try {
      // Update basic info
      await updateWebsite.mutateAsync({
        id,
        data: {
          name,
          description,
          domain,
          deploymentUrl,
          repositoryUrl,
          adminNotes,
          clientNotes,
        },
      });

      // Update status if changed
      if (selectedStatus !== website?.status) {
        await updateStatus.mutateAsync({ id, status: selectedStatus });
      }

      // Update assigned admin if changed
      if (assignedAdmin !== website?.assignedAdmin && assignedAdmin) {
        await assignAdmin.mutateAsync({ id, assignedAdmin });
      }

      toast.success('Changes saved successfully!', {
        description: 'All updates have been applied to the website.',
      });
    } catch (error) {
      toast.error('Failed to save changes', {
        description: error instanceof Error ? error.message : 'An error occurred while saving.',
      });
    }
  };

  const handleUpdateBilling = async () => {
    try {
      await updateBilling.mutateAsync({
        id,
        plan: billingPlan,
        price: billingPrice ? parseFloat(billingPrice) : undefined,
        billingCycle,
      });
      toast.success('Billing information updated!');
    } catch (error) {
      toast.error('Failed to update billing', {
        description: error instanceof Error ? error.message : 'An error occurred.',
      });
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    try {
      await recordPayment.mutateAsync({
        id,
        amount: parseFloat(paymentAmount),
        method: paymentMethod || undefined,
        transactionId: transactionId || undefined,
      });
      
      toast.success('Payment recorded successfully!', {
        description: 'Billing status has been updated to Active.',
      });
      
      // Reset form
      setPaymentAmount('');
      setPaymentMethod('');
      setTransactionId('');
      setPaymentDialogOpen(false);
    } catch (error) {
      toast.error('Failed to record payment', {
        description: error instanceof Error ? error.message : 'An error occurred.',
      });
    }
  };

  const handleStatusChange = async (newStatus: WebsiteStatus) => {
    setSelectedStatus(newStatus);
    if (newStatus === WebsiteStatus.DEPLOYED) {
      toast.info('⚡ Deploying website', {
        description: 'Billing will be automatically initialized with a 5-day grace period.',
      });
    } else {
      toast.info('Status updated', {
        description: `Status changed to ${statusConfig[newStatus].label}. Don't forget to save!`,
      });
    }
  };

  const handleAddMilestone = async () => {
    if (newMilestone.trim()) {
      try {
        await addMilestone.mutateAsync({
          id,
          title: newMilestone,
          completed: false,
        });
        setNewMilestone('');
        toast.success('Milestone added!', {
          description: newMilestone,
        });
      } catch (error) {
        toast.error('Failed to add milestone', {
          description: error instanceof Error ? error.message : 'An error occurred.',
        });
      }
    }
  };

  const handleToggleMilestone = async (index: number, completed: boolean) => {
    try {
      await updateMilestone.mutateAsync({
        id,
        milestoneIndex: index,
        completed,
      });
      toast.success(completed ? 'Milestone completed!' : 'Milestone reopened');
    } catch (error) {
      toast.error('Failed to update milestone', {
        description: error instanceof Error ? error.message : 'An error occurred.',
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`, {
      description: text,
    });
  };

  const getDaysRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pl-16 lg:pl-0">
        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white/40 animate-spin" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="p-3 sm:p-6 pl-[4.5rem] lg:pl-6">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-white/60 text-xs sm:text-sm">Website not found</p>
          <Button
            onClick={() => router.push('/websites')}
            variant="outline"
            className="mt-4 border-white/10 h-8 sm:h-9 text-xs sm:text-sm"
          >
            Back to Websites
          </Button>
        </div>
      </div>
    );
  }

  const billing = website.billing;
  const daysRemaining = billing?.graceEndsAt ? getDaysRemaining(billing.graceEndsAt) : null;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 pl-[4.5rem] lg:pl-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-2 sm:gap-4">
          <Button
            onClick={() => router.push('/websites')}
            variant="ghost"
            size="icon"
            className="hover:bg-white/5 flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                {website.name}
              </h1>
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-white/5 border border-white/10 rounded-md w-fit">
                <span className="text-xs text-white/60">ID:</span>
                <span className="text-xs font-mono text-white truncate max-w-[100px] sm:max-w-none">
                  {website._id.slice(-8)}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 sm:h-6 sm:w-6 hover:bg-white/10 flex-shrink-0"
                  onClick={() => copyToClipboard(website._id, 'Website ID')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <p className="text-white/60 mt-1 text-xs sm:text-sm">{website.projectType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <WebsiteStatusBadge status={website.status} />
          <BillingStatusBadge status={billing.status} />
          <Button
            onClick={handleSaveAll}
            disabled={updateWebsite.isPending || updateStatus.isPending || assignAdmin.isPending}
            className="bg-white text-black hover:bg-white/90 h-8 sm:h-10 text-xs sm:text-sm"
          >
            {(updateWebsite.isPending || updateStatus.isPending || assignAdmin.isPending) ? (
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
            ) : (
              <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            )}
            <span className="hidden sm:inline">Save All Changes</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      {/* Billing Alert */}
      {billing.status === BillingStatus.SUSPENDED && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="h-5 w-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <XCircle className="h-3 w-3 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-300">Website Suspended</h3>
              <p className="text-xs text-red-400 mt-1">
                This website has been suspended due to non-payment. Record a payment to reactivate.
              </p>
            </div>
          </div>
        </div>
      )}

      {billing.status === BillingStatus.OVERDUE && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="h-5 w-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="h-3 w-3 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-orange-300">Payment Overdue</h3>
              <p className="text-xs text-orange-400 mt-1">
                Payment is overdue. Please collect payment to avoid service suspension.
              </p>
            </div>
          </div>
        </div>
      )}

      {billing.status === BillingStatus.PENDING && daysRemaining !== null && daysRemaining > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="h-5 w-5 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock className="h-3 w-3 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-300">Grace Period Active</h3>
              <p className="text-xs text-yellow-400 mt-1">
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining until payment is due.
                {billing.graceEndsAt && ` Due: ${format(new Date(billing.graceEndsAt), 'MMM d, yyyy')}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Billing & Payment Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Billing Information */}
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing Information
              </CardTitle>
              <BillingStatusBadge status={billing.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">Plan</Label>
              <Input
                value={billingPlan}
                onChange={(e) => setBillingPlan(e.target.value)}
                placeholder="e.g., Premium, Enterprise"
                className="bg-black border-white/10 text-white mt-1 h-9 sm:h-10 text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">Price</Label>
                <div className="relative mt-1">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    type="number"
                    value={billingPrice}
                    onChange={(e) => setBillingPrice(e.target.value)}
                    placeholder="0.00"
                    className="bg-black border-white/10 text-white h-9 sm:h-10 text-sm pl-9"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">Cycle</Label>
                <Select value={billingCycle} onValueChange={(v: any) => setBillingCycle(v)}>
                  <SelectTrigger className="bg-black border-white/10 text-white mt-1 h-9 sm:h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {billing.activatedAt && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div>
                  <Label className="text-white/60 text-xs">Activated</Label>
                  <p className="text-white text-xs sm:text-sm mt-1">
                    {format(new Date(billing.activatedAt), 'MMM d, yyyy')}
                  </p>
                </div>
                {billing.dueAt && (
                  <div>
                    <Label className="text-white/60 text-xs">Due Date</Label>
                    <p className="text-white text-xs sm:text-sm mt-1">
                      {format(new Date(billing.dueAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {billing.lastPaymentAt && (
              <div>
                <Label className="text-white/60 text-xs">Last Payment</Label>
                <p className="text-white text-xs sm:text-sm mt-1">
                  {format(new Date(billing.lastPaymentAt), 'MMM d, yyyy')}
                </p>
              </div>
            )}

            <Button
              onClick={handleUpdateBilling}
              disabled={updateBilling.isPending}
              className="w-full bg-white border border-white/20 h-9 text-black"
            >
              {updateBilling.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Update Billing Info
            </Button>
          </CardContent>
        </Card>

        {/* Payment Management */}
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Payment Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-green-500 hover:bg-green-600 h-10">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black border-white/10">
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>
                    Record a payment for this website. This will update the billing status to Active.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-white/60 text-sm">Amount *</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                      <Input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        className="bg-white/5 border-white/10 text-white pl-9"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white/60 text-sm">Payment Method</Label>
                    <Input
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      placeholder="e.g., Credit Card, Bank Transfer"
                      className="bg-white/5 border-white/10 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white/60 text-sm">Transaction ID</Label>
                    <Input
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Optional reference number"
                      className="bg-white/5 border-white/10 text-white mt-1"
                    />
                  </div>

                  <Button
                    onClick={handleRecordPayment}
                    disabled={recordPayment.isPending || !paymentAmount}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    {recordPayment.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Confirm Payment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Payment History */}
            {billing.paymentHistory && billing.paymentHistory.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <Label className="text-white/60 text-xs sm:text-sm mb-2 block">
                  Payment History
                </Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {billing.paymentHistory.map((payment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          ₹{payment.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-white/60">
                          {format(new Date(payment.date), 'MMM d, yyyy')}
                          {payment.method && ` • ${payment.method}`}
                        </p>
                      </div>
                      {payment.transactionId && (
                        <code className="text-xs text-white/60 font-mono">
                          {payment.transactionId}
                        </code>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!billing.paymentHistory || billing.paymentHistory.length === 0) && (
              <div className="text-center py-6 text-white/40">
                <Receipt className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No payments recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Information & Technical Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-base sm:text-lg">Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">User ID</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={website.userId}
                  readOnly
                  className="bg-black border-white/10 text-white font-mono text-xs sm:text-sm h-9 sm:h-10"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="border-white/10 hover:bg-white/5 h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                  onClick={() => copyToClipboard(website.userId, 'User ID')}
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">Request ID</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={website.requestId}
                  readOnly
                  className="bg-black border-white/10 text-white font-mono text-xs sm:text-sm h-9 sm:h-10"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="border-white/10 hover:bg-white/5 h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                  onClick={() => copyToClipboard(website.requestId, 'Request ID')}
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black border-white/10 text-white mt-1 h-9 sm:h-10 text-sm"
              />
            </div>
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-black border-white/10 text-white mt-1 text-sm"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">Created</Label>
                <p className="text-white text-xs sm:text-sm mt-1">
                  {format(new Date(website.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              {website.startedAt && (
                <div>
                  <Label className="text-white/60 text-xs sm:text-sm">Started</Label>
                  <p className="text-white text-xs sm:text-sm mt-1">
                    {format(new Date(website.startedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">Assigned Admin</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={assignedAdmin}
                  onChange={(e) => setAssignedAdmin(e.target.value)}
                  placeholder="admin@example.com"
                  className="bg-black border-white/10 text-white h-9 sm:h-10 text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="border-white/10 hover:bg-white/5 h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                >
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-base sm:text-lg">Technical Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div>
              <Label className="text-white/60 mb-2 sm:mb-3 block text-xs sm:text-sm">Project Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status as WebsiteStatus)}
                    className={`px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium border transition-all ${
                      selectedStatus === status
                        ? config.color + ' ring-2 ring-white/20'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white/60 text-xs sm:text-sm">Domain</Label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="bg-black border-white/10 text-white mt-1 h-9 sm:h-10 text-sm"
              />
            </div>
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">Deployment URL</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={deploymentUrl}
                  onChange={(e) => setDeploymentUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-black border-white/10 text-white h-9 sm:h-10 text-sm"
                />
                {deploymentUrl && (
                  <Button
                    onClick={() => window.open(deploymentUrl, '_blank')}
                    variant="outline"
                    size="icon"
                    className="border-white/10 h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                  >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">Repository URL</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="bg-black border-white/10 text-white h-9 sm:h-10 text-sm"
                />
                {repositoryUrl && (
                  <Button
                    onClick={() => window.open(repositoryUrl, '_blank')}
                    variant="outline"
                    size="icon"
                    className="border-white/10 h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                  >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label className="text-white/60 text-xs sm:text-sm">Progress</Label>
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-white/80">
                    {website.pagesCompleted || 0} of {website.totalPages || 0} pages
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-white">
                    {website.completionPercentage || 0}%
                  </span>
                </div>
                <div className="h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                    style={{ width: `${website.completionPercentage || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card className="bg-white/5 border-white/10 rounded-lg">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-white text-base sm:text-lg">Milestones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
          {website.milestones && website.milestones.length > 0 ? (
            <div className="space-y-2">
              {website.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <button
                    onClick={() => handleToggleMilestone(index, !milestone.completed)}
                    className="flex-shrink-0"
                  >
                    {milestone.completed ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    ) : (
                      <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-white text-xs sm:text-sm ${milestone.completed ? 'line-through text-white/60' : ''}`}>
                      {milestone.title}
                    </p>
                    {milestone.completed && milestone.completedAt && (
                      <p className="text-xs text-white/40 mt-0.5 sm:mt-1">
                        Completed on {format(new Date(milestone.completedAt), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-xs sm:text-sm text-center py-4">No milestones added yet</p>
          )}
          <div className="flex gap-2">
            <Input
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddMilestone()}
              placeholder="Add a new milestone..."
              className="bg-black border-white/10 text-white h-9 sm:h-10 text-sm"
            />
            <Button
              onClick={handleAddMilestone}
              disabled={!newMilestone.trim() || addMilestone.isPending}
              className="bg-white text-black hover:bg-white/90 h-9 sm:h-10 px-3 sm:px-4 flex-shrink-0"
            >
              {addMilestone.isPending ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-base sm:text-lg">Admin Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes for admins..."
              className="bg-black border-white/10 text-white text-sm"
              rows={6}
            />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-base sm:text-lg">Client Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Textarea
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              placeholder="Notes visible to client..."
              className="bg-black border-white/10 text-white text-sm"
              rows={6}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}