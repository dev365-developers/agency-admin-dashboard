// src/hooks/useSupport.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { 
  ApiResponse,
  PaginatedResponse,
  SupportRequest,
  SupportStatus,
  SupportCategory,
  SupportPriority
} from '@/types';

// ============================================
// Types
// ============================================

export interface SupportRequestsParams {
  status?: SupportStatus;
  websiteId?: string;
  category?: SupportCategory;
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface SupportStats {
  total: number;
  byStatus: Record<SupportStatus, number>;
  byCategory: Record<SupportCategory, number>;
  recentRequests: number;
  averageResponseTime?: number;
}

export interface CreateSupportRequestData {
  websiteId: string;
  category: SupportCategory;
  subject: string;
  message: string;
}

export interface UpdateSupportStatusData {
  status: SupportStatus;
  adminNotes?: string;
  internalNotes?: string;
}

export interface AddSupportResponseData {
  message: string;
  isAdminResponse: boolean;
}

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch paginated support requests with filters
 */
export function useSupportRequests(params: SupportRequestsParams = {}) {
  return useQuery({
    queryKey: ['support-requests', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      return apiClient.get<PaginatedResponse<SupportRequest>>(
        `/admin/support?${queryParams}`
      );
    },
  });
}

/**
 * Fetch support request statistics
 */
export function useSupportStats() {
  return useQuery({
    queryKey: ['support-stats'],
    queryFn: () => apiClient.get<ApiResponse<SupportStats>>('/admin/support/stats'),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Fetch single support request details
 */
export function useSupportRequestDetails(id: string) {
  return useQuery({
    queryKey: ['support-request', id],
    queryFn: () => apiClient.get<ApiResponse<SupportRequest>>(`/admin/support/${id}`),
    enabled: !!id,
  });
}

/**
 * Fetch support requests for a specific website
 */
export function useWebsiteSupportRequests(websiteId: string) {
  return useQuery({
    queryKey: ['website-support', websiteId],
    queryFn: () => apiClient.get<ApiResponse<SupportRequest[]>>(
      `/admin/support/website/${websiteId}`
    ),
    enabled: !!websiteId,
  });
}

/**
 * Fetch support requests by user
 */
export function useUserSupportRequests(userId: string, params: SupportRequestsParams = {}) {
  return useQuery({
    queryKey: ['user-support', userId, params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      return apiClient.get<PaginatedResponse<SupportRequest>>(
        `/admin/support?${queryParams}`
      );
    },
    enabled: !!userId,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Create a new support request (typically used by users, but admin can too)
 */
export function useCreateSupportRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSupportRequestData) => 
      apiClient.post<ApiResponse<SupportRequest>>('/support', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      queryClient.invalidateQueries({ queryKey: ['support-stats'] });
    },
  });
}

/**
 * Update support request status
 */
export function useUpdateSupportStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupportStatusData }) => 
      apiClient.patch<ApiResponse<SupportRequest>>(
        `/admin/support/${id}/status`, 
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      queryClient.invalidateQueries({ queryKey: ['support-request', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['support-stats'] });
    },
  });
}

/**
 * Assign admin to support request
 */
export function useAssignSupportAdmin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, assignedAdmin }: { id: string; assignedAdmin: string }) => 
      apiClient.patch<ApiResponse<SupportRequest>>(
        `/admin/support/${id}/assign`, 
        { assignedAdmin }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      queryClient.invalidateQueries({ queryKey: ['support-request', variables.id] });
    },
  });
}

/**
 * Add response to support request
 */
export function useAddSupportResponse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddSupportResponseData }) => 
      apiClient.post<ApiResponse<SupportRequest>>(
        `/admin/support/${id}/response`, 
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-request', variables.id] });
    },
  });
}

/**
 * Update internal notes
 */
export function useUpdateSupportNotes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, internalNotes }: { id: string; internalNotes: string }) => 
      apiClient.patch<ApiResponse<SupportRequest>>(
        `/admin/support/${id}/notes`, 
        { internalNotes }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-request', variables.id] });
    },
  });
}

/**
 * Resolve support request (mark as resolved)
 */
export function useResolveSupportRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, resolutionNotes }: { id: string; resolutionNotes?: string }) => 
      apiClient.patch<ApiResponse<SupportRequest>>(
        `/admin/support/${id}/status`, 
        { 
          status: 'RESOLVED',
          resolutionNotes 
        }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      queryClient.invalidateQueries({ queryKey: ['support-request', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['support-stats'] });
    },
  });
}

/**
 * Reopen support request (change status back to OPEN)
 */
export function useReopenSupportRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      apiClient.patch<ApiResponse<SupportRequest>>(
        `/admin/support/${id}/status`,
        { status: 'OPEN' }
      ),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      queryClient.invalidateQueries({ queryKey: ['support-request', id] });
      queryClient.invalidateQueries({ queryKey: ['support-stats'] });
    },
  });
}

/**
 * Delete support request (admin only)
 */
export function useDeleteSupportRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      apiClient.delete<ApiResponse<void>>(`/admin/support/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      queryClient.invalidateQueries({ queryKey: ['support-stats'] });
    },
  });
}

/**
 * Bulk update support requests
 */
export function useBulkUpdateSupport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ids, data }: { 
      ids: string[]; 
      data: { status?: SupportStatus; assignedAdmin?: string } 
    }) => apiClient.patch<ApiResponse<{ updated: number }>>(
      '/admin/support/bulk-update', 
      { ids, ...data }
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      queryClient.invalidateQueries({ queryKey: ['support-stats'] });
    },
  });
}