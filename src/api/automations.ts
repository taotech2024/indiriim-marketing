import apiClient from './client';

export type AutomationStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT';

export interface AutomationItem {
  id: number;
  name: string;
  trigger: string;
  status: AutomationStatus;
  stats?: {
    triggered: number;
    completed: number;
  };
  lastRun?: string;
}

export interface AutomationsListParams {
  page?: number;
  size?: number;
  status?: AutomationStatus;
}

export async function fetchAutomations(params?: AutomationsListParams): Promise<AutomationItem[]> {
  const { data } = await apiClient.get<AutomationItem[] | { content: AutomationItem[] }>(
    '/api/v1/automations',
    { params }
  );
  if (Array.isArray(data)) return data;
  return data?.content ?? [];
}
