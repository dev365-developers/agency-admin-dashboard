import { Badge } from '@/components/ui/badge';
import { WebsiteStatus } from '@/types';

const statusConfig: Record<WebsiteStatus, { 
  label: string; 
  variant: 'default' | 'secondary' | 'outline' | 'destructive' 
}> = {
  [WebsiteStatus.CREATED]: { label: 'Created', variant: 'outline' },
  [WebsiteStatus.IN_PROGRESS]: { label: 'In Progress', variant: 'secondary' },
  [WebsiteStatus.REVIEW]: { label: 'Review', variant: 'secondary' },
  [WebsiteStatus.COMPLETED]: { label: 'Completed', variant: 'default' },
  [WebsiteStatus.DEPLOYED]: { label: 'Deployed', variant: 'default' },
  [WebsiteStatus.CANCELLED]: { label: 'Cancelled', variant: 'destructive' },
};

export function WebsiteStatusBadge({ status }: { status: WebsiteStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}