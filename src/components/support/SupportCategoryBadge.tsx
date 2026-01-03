import { SupportCategory } from '@/types';
import { 
  Bug,
  RefreshCw,
  CreditCard, 
  HelpCircle 
} from 'lucide-react';

interface SupportCategoryBadgeProps {
  category: SupportCategory;
  className?: string;
}

export function SupportCategoryBadge({ category, className = '' }: SupportCategoryBadgeProps) {
  const variants: Record<SupportCategory, { icon: any; label: string; color: string }> = {
    BUG: {
      icon: Bug,
      label: 'Bug',
      color: 'text-red-400',
    },
    CHANGE_REQUEST: {
      icon: RefreshCw,
      label: 'Change Request',
      color: 'text-purple-400',
    },
    BILLING: {
      icon: CreditCard,
      label: 'Billing',
      color: 'text-green-400',
    },
    GENERAL: {
      icon: HelpCircle,
      label: 'General',
      color: 'text-gray-400',
    },
  };

  const variant = variants[category];
  
  // Fallback if category is invalid
  if (!variant) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-xs font-medium text-gray-400 ${className}`}>
        <HelpCircle className="w-3 h-3" />
        Unknown
      </span>
    );
  }

  const Icon = variant.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-xs font-medium ${variant.color} ${className}`}
    >
      <Icon className="w-3 h-3" />
      {variant.label}
    </span>
  );
}
