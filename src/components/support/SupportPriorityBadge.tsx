
// src/components/support/SupportPriorityBadge.tsx (NEW)
import { SupportPriority } from '@/types';
import { AlertTriangle, Minus, ArrowUp } from 'lucide-react';

interface SupportPriorityBadgeProps {
  priority: SupportPriority;
  className?: string;
}

export function SupportPriorityBadge({ priority, className = '' }: SupportPriorityBadgeProps) {
  const variants: Record<SupportPriority, { 
    bg: string; 
    text: string; 
    border: string; 
    icon: any; 
    label: string 
  }> = {
    LOW: {
      bg: 'bg-gray-500/20',
      text: 'text-gray-400',
      border: 'border-gray-500/30',
      icon: Minus,
      label: 'Low',
    },
    MEDIUM: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      icon: ArrowUp,
      label: 'Medium',
    },
    HIGH: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
      icon: AlertTriangle,
      label: 'High',
    },
  };

  const variant = variants[priority];
  
  if (!variant) {
    return null;
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