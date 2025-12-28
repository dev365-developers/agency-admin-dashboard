import { Badge } from '@/components/ui/badge';
import { RequestStatus } from '@/types';

const statusConfig: Record<RequestStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  [RequestStatus.PENDING]: { label: 'Pending', variant: 'outline' },
  [RequestStatus.IN_REVIEW]: { label: 'In Review', variant: 'secondary' },
  [RequestStatus.CONTACTED]: { label: 'Contacted', variant: 'secondary' },
  [RequestStatus.APPROVED]: { label: 'Approved', variant: 'default' },
  [RequestStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}