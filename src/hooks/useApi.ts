import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Campaign, Lead, PaginatedResult, DashboardMetrics,
  ActivityEvent, OrgSettings, UploadResult, OnboardingData,
} from '@/lib/types';

// ============================================
// Dashboard
// ============================================

export const useDashboardMetrics = () =>
  useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => api.get<DashboardMetrics>('/api/dashboard/metrics'),
    refetchInterval: 30000,
  });

export const useDashboardActivity = () =>
  useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => api.get<ActivityEvent[]>('/api/dashboard/activity'),
    refetchInterval: 15000,
  });

// ============================================
// Campaigns
// ============================================

export const useCampaigns = () =>
  useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get<Campaign[]>('/api/campaigns'),
  });

export const useCampaign = (id: string) =>
  useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => api.get<Campaign>(`/api/campaigns/${id}`),
    enabled: !!id,
    refetchInterval: 5000,
  });

export const useUploadCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.upload<UploadResult>('/api/campaigns', formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

// ============================================
// Leads
// ============================================

interface LeadFilters {
  campaignId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const useLeads = (filters: LeadFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.campaignId) params.set('campaignId', filters.campaignId);
  if (filters.status) params.set('status', filters.status);
  params.set('page', String(filters.page || 1));
  params.set('limit', String(filters.limit || 20));

  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => api.get<PaginatedResult<Lead>>(`/api/leads?${params}`),
    refetchInterval: 5000,
  });
};

export const useLead = (id: string) =>
  useQuery({
    queryKey: ['leads', id],
    queryFn: () => api.get<Lead>(`/api/leads/${id}`),
    enabled: !!id,
    refetchInterval: 3000,
  });

export const useApproveLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<Lead>(`/api/leads/${id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
};

export const useSkipLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<Lead>(`/api/leads/${id}/skip`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
};

export const useDiscardLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<Lead>(`/api/leads/${id}/discard`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
};

export const useRegenerateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/leads/${id}/regenerate`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
};

export const useEditLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, subject, body }: { id: string; subject: string; body: string }) =>
      api.post(`/api/leads/${id}/edit`, { subject, body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
};

export const useBulkApprove = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (leadIds: string[]) =>
      api.post<{ updatedCount: number }>('/api/leads/bulk-approve', { leadIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
};

export const useSendApproved = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) =>
      api.post<{ queuedCount: number }>('/api/leads/send-approved', { campaignId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
};

export const useBulkRetryFailed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) =>
      api.post<{ retriedCount: number }>('/api/leads/bulk-retry-failed', { campaignId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
};

// ============================================
// Settings
// ============================================

export const useSettings = () =>
  useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get<OrgSettings>('/api/settings'),
  });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<OrgSettings>) =>
      api.patch('/api/settings', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
};

// ============================================
// Onboarding
// ============================================

export const useCompleteOnboarding = () =>
  useMutation({
    mutationFn: (data: OnboardingData) =>
      api.post('/api/onboarding/complete', data),
  });
