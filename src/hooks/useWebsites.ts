// ==============================================
// src/hooks/useWebsites.ts
// ==============================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { 
  PaginatedResponse, 
  Website, 
  WebsiteStatus,
  ApiResponse,
  WebsiteStats
} from '@/types';

interface WebsitesParams {
  status?: WebsiteStatus;
  assignedAdmin?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export function useWebsites(params: WebsitesParams = {}) {
  return useQuery({
    queryKey: ['websites', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      return apiClient.get<PaginatedResponse<Website>>(
        `/admin/websites?${queryParams}`
      );
    },
  });
}

export function useWebsiteStats() {
  return useQuery({
    queryKey: ['website-stats'],
    queryFn: () => apiClient.get<ApiResponse<WebsiteStats>>('/admin/websites/stats'),
  });
}

export function useWebsiteDetails(id: string) {
  return useQuery({
    queryKey: ['website', id],
    queryFn: () => apiClient.get<ApiResponse<Website>>(`/admin/websites/${id}`),
    enabled: !!id,
  });
}

export function useUpdateWebsite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiClient.patch(`/admin/websites/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      queryClient.invalidateQueries({ queryKey: ['website-stats'] });
    },
  });
}

export function useUpdateWebsiteStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, notes }: { 
      id: string; 
      status: WebsiteStatus;
      notes?: string;
    }) => apiClient.patch(`/admin/websites/${id}/status`, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      queryClient.invalidateQueries({ queryKey: ['website-stats'] });
    },
  });
}

export function useAssignAdmin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, assignedAdmin }: { id: string; assignedAdmin: string }) => 
      apiClient.patch(`/admin/websites/${id}/assign`, { assignedAdmin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      queryClient.invalidateQueries({ queryKey: ['website-stats'] });
    },
  });
}

export function useAddMilestone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, title, completed }: { 
      id: string; 
      title: string;
      completed?: boolean;
    }) => apiClient.post(`/admin/websites/${id}/milestones`, { title, completed }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['website', variables.id] });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, milestoneIndex, title, completed }: { 
      id: string;
      milestoneIndex: number;
      title?: string;
      completed?: boolean;
    }) => apiClient.patch(`/admin/websites/${id}/milestones/${milestoneIndex}`, { 
      title, 
      completed 
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['website', variables.id] });
    },
  });
}