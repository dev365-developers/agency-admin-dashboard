import { SupportStatus } from '@/types';
import { 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  HelpCircle
} from 'lucide-react';

interface SupportStatusBadgeProps {
  status: SupportStatus;
  className?: string;
}

export function SupportStatusBadge({ status, className = '' }: SupportStatusBadgeProps) {
  const variants: Record<SupportStatus, { 
    bg: string; 
    text: string; 
    border: string; 
    icon: any; 
    label: string 
  }> = {
    OPEN: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      icon: Clock,
      label: 'Open',
    },
    IN_PROGRESS: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      icon: PlayCircle,
      label: 'In Progress',
    },
    RESOLVED: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/30',
      icon: CheckCircle,
      label: 'Resolved',
    },
  };

  const variant = variants[status];
  
  // Fallback if status is invalid
  if (!variant) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium bg-gray-500/20 text-gray-400 border-gray-500/30 ${className}`}>
        <HelpCircle className="w-3 h-3" />
        Unknown
      </span>
    );
  }

  const Icon = variant.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${variant.bg} ${variant.text} ${variant.border} ${className}`}
    >
      <Icon className="w-3 h-3" />
      {variant.label}
    </span>
  );
}