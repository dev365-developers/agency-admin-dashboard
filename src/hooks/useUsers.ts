// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { 
  UpdateUserDTO, 
  UserWithStats, 
  UserDetailsResponse,
  PaginatedResponse,
  ApiResponse,
  UserStats,
  WebsiteRequest,
  Website
} from '@/types';

interface UsersParams {
  search?: string;
  authProvider?: 'clerk' | 'google' | 'email';
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'email' | 'firstName';
  order?: 'asc' | 'desc';
}

// Get all users
export function useUsers(params: UsersParams = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      return apiClient.get<PaginatedResponse<UserWithStats>>(
        `/admin/users?${queryParams}`
      );
    },
  });
}

// Get user details
export function useUserDetails(userId: string) {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: async () => {
      return apiClient.get<ApiResponse<UserDetailsResponse>>(`/admin/users/${userId}`);
    },
    enabled: !!userId,
  });
}

// Get user statistics
export function useUserStats() {
  return useQuery({
    queryKey: ['admin', 'users', 'stats'],
    queryFn: async () => {
      return apiClient.get<ApiResponse<UserStats>>('/admin/users/stats');
    },
  });
}

// Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserDTO }) => {
      return apiClient.patch(`/admin/users/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.id] });
    },
  });
}

// Get user requests
export function useUserRequests(
  userId: string,
  params?: {
    status?: string;
    projectType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
) {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'requests', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      return apiClient.get<PaginatedResponse<WebsiteRequest>>(
        `/admin/users/${userId}/requests?${queryParams}`
      );
    },
    enabled: !!userId,
  });
}

// Get user websites
export function useUserWebsites(
  userId: string,
  params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
) {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'websites', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      return apiClient.get<PaginatedResponse<Website>>(
        `/admin/users/${userId}/websites?${queryParams}`
      );
    },
    enabled: !!userId,
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return apiClient.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'stats'] });
    },
  });
}