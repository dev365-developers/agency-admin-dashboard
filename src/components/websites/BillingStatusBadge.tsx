// components/websites/BillingStatusBadge.tsx
import { BillingStatus } from '@/types';
import { CreditCard, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface BillingStatusBadgeProps {
  status: BillingStatus;
  className?: string;
}

const billingConfig = {
  [BillingStatus.PENDING]: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  },
  [BillingStatus.ACTIVE]: {
    label: 'Active',
    icon: CreditCard,
    className: 'bg-green-500/20 text-green-300 border-green-500/40',
  },
  [BillingStatus.OVERDUE]: {
    label: 'Overdue',
    icon: AlertTriangle,
    className: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  },
  [BillingStatus.SUSPENDED]: {
    label: 'Suspended',
    icon: XCircle,
    className: 'bg-red-500/20 text-red-300 border-red-500/40',
  },
};

export function BillingStatusBadge({ status, className = '' }: BillingStatusBadgeProps) {
  const config = billingConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  );
}