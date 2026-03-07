import apiClient from './client';
import { generateIdempotencyKey } from '../utils/idempotency';

export type SegmentType = 'B2B' | 'B2C';

export interface SegmentItem {
  id: number;
  name: string;
  description?: string | null;
  type?: SegmentType;
  size?: number;
  ruleJson?: string | null;
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

export interface SegmentsListParams {
  page?: number;
  size?: number;
}

export async function fetchSegments(params?: SegmentsListParams): Promise<SegmentItem[]> {
  const query = {
    page: params?.page ?? 0,
    size: params?.size ?? 50,
  };

  const { data } = await apiClient.get<SegmentItem[] | PageResponse<SegmentItem>>(
    '/api/v1/segments',
    { params: query }
  );

  if (Array.isArray(data)) {
    return data;
  }

  return data.content ?? [];
}

export interface CreateSegmentRequest {
  name: string;
  description?: string | null;
  type?: SegmentType;
  size?: number;
  ruleJson?: string | null;
  isActive?: boolean;
}

export interface UpdateSegmentRequest extends CreateSegmentRequest {}

export async function createSegment(body: CreateSegmentRequest): Promise<SegmentItem> {
  const { data } = await apiClient.post<SegmentItem>(
    '/api/v1/segments',
    body,
    {
      headers: {
        'Idempotency-Key': generateIdempotencyKey(),
      },
    }
  );
  return data;
}

export async function updateSegment(id: number, body: UpdateSegmentRequest): Promise<SegmentItem> {
  const { data } = await apiClient.put<SegmentItem>(`/api/v1/segments/${id}`, body);
  return data;
}
