import apiClient from './client';
import { generateIdempotencyKey } from '../utils/idempotency';

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

interface PageResponse<T> {
  content?: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  first?: boolean;
  last?: boolean;
}

export interface TemplatesListParams {
  page?: number;
  size?: number;
}

export async function fetchTemplates(params?: TemplatesListParams): Promise<TemplateItem[]> {
  const query = {
    page: params?.page ?? 0,
    size: params?.size ?? 50,
  };

  const { data } = await apiClient.get<TemplateItem[] | PageResponse<TemplateItem>>(
    '/api/v1/templates',
    { params: query }
  );

  if (Array.isArray(data)) {
    return data;
  }

  return data.content ?? [];
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
  const { data } = await apiClient.post<TemplateItem>(
    '/api/v1/templates',
    body,
    {
      headers: {
        'Idempotency-Key': generateIdempotencyKey(),
      },
    }
  );
  return data;
}

export async function updateTemplate(id: number, body: UpdateTemplateRequest): Promise<TemplateItem> {
  const { data } = await apiClient.put<TemplateItem>(`/api/v1/templates/${id}`, body);
  return data;
}

export async function deleteTemplate(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/templates/${id}`);
}
