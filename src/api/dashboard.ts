import apiClient from './client';

export interface DashboardSummary {
  draftCount: number;
  scheduledCount: number;
  sentCount: number;
  lastNotifications?: Array<{
    id: number;
    name: string;
    channel?: string;
    status?: string;
    scheduledAt?: string | null;
  }>;
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>('/api/v1/dashboard/summary');
  return data;
}
