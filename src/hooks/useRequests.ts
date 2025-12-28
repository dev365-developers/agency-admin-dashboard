import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { 
  PaginatedResponse, 
  WebsiteRequest, 
  RequestStatus,
  ApiResponse,
  RequestStats
} from '@/types';

interface RequestsParams {
  status?: RequestStatus;
  projectType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useRequests(params: RequestsParams = {}) {
  return useQuery({
    queryKey: ['requests', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      return apiClient.get<PaginatedResponse<WebsiteRequest>>(
        `/admin/requests?${queryParams}`
      );
    },
  });
}

export function useRequestStats() {
  return useQuery({
    queryKey: ['request-stats'],
    queryFn: () => apiClient.get<ApiResponse<RequestStats>>('/admin/requests/stats'),
  });
}

export function useRequestDetails(id: string) {
  return useQuery({
    queryKey: ['request', id],
    queryFn: () => apiClient.get<ApiResponse<{ request: WebsiteRequest }>>(`/admin/requests/${id}`),
    enabled: !!id,
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, internalNotes }: { 
      id: string; 
      status: RequestStatus;
      internalNotes?: string;
    }) => apiClient.patch(`/admin/requests/${id}/status`, { status, internalNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['request-stats'] });
    },
  });
}

export function useApproveRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, assignedAdmin, initialNotes }: { 
      id: string; 
      assignedAdmin?: string;
      initialNotes?: string;
    }) => apiClient.post(`/admin/requests/${id}/approve`, { assignedAdmin, initialNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['request-stats'] });
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      apiClient.post(`/admin/requests/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['request-stats'] });
    },
  });
}