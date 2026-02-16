import apiClient from './client';

export type TemplateType = 'EMAIL' | 'SMS' | 'PUSH';

export interface TemplateItem {
  id: number;
  name: string;
  type: TemplateType;
  subject?: string | null;
  content?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchTemplates(): Promise<TemplateItem[]> {
  const { data } = await apiClient.get<TemplateItem[]>('/api/v1/templates');
  return Array.isArray(data) ? data : [];
}

export interface CreateTemplateRequest {
  name: string;
  type: TemplateType;
  subject?: string | null;
  content?: string | null;
  isActive?: boolean;
}

export interface UpdateTemplateRequest extends CreateTemplateRequest {}

export async function createTemplate(body: CreateTemplateRequest): Promise<TemplateItem> {
  const { data } = await apiClient.post<TemplateItem>('/api/v1/templates', body);
  return data;
}

export async function updateTemplate(id: number, body: UpdateTemplateRequest): Promise<TemplateItem> {
  const { data } = await apiClient.put<TemplateItem>(`/api/v1/templates/${id}`, body);
  return data;
}

export async function deleteTemplate(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/templates/${id}`);
}
