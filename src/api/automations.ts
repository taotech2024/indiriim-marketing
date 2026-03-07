import apiClient from './client';

export type AutomationStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT';

export interface AutomationTrigger {
  type: string;
  config?: string | null;
}

export interface AutomationItem {
  id: number;
  name: string;
  trigger: AutomationTrigger;
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
  const query = {
    page: params?.page ?? 0,
    size: params?.size ?? 50,
    status: params?.status,
  };

  const { data } = await apiClient.get<AutomationItem[] | { content: AutomationItem[] }>(
    '/api/v1/automations',
    { params: query }
  );
  if (Array.isArray(data)) return data;
  return data?.content ?? [];
}
