// hooks/useBilling.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { BillingStatus, ApiResponse } from '@/types';

interface UpdateBillingParams {
  id: string;
  plan?: string;
  price?: number;
  billingCycle?: 'monthly' | 'quarterly' | 'yearly';
  status?: BillingStatus;
}

interface RecordPaymentParams {
  id: string;
  amount: number;
  method?: string;
  transactionId?: string;
}

export function useUpdateBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateBillingParams) => {
      return apiClient.patch(`/admin/websites/${id}/billing`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      queryClient.invalidateQueries({ queryKey: ['website-stats'] });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: RecordPaymentParams) => {
      return apiClient.post(`/admin/websites/${id}/payment`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      queryClient.invalidateQueries({ queryKey: ['website-stats'] });
    },
  });
}

export function useTriggerBillingCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiClient.post('/admin/billing/check');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      queryClient.invalidateQueries({ queryKey: ['website-stats'] });
    },
  });
}