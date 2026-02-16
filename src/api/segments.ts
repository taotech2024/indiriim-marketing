import apiClient from './client';

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

export async function fetchSegments(): Promise<SegmentItem[]> {
  const { data } = await apiClient.get<SegmentItem[]>('/api/v1/segments');
  return Array.isArray(data) ? data : [];
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
  const { data } = await apiClient.post<SegmentItem>('/api/v1/segments', body);
  return data;
}

export async function updateSegment(id: number, body: UpdateSegmentRequest): Promise<SegmentItem> {
  const { data } = await apiClient.put<SegmentItem>(`/api/v1/segments/${id}`, body);
  return data;
}
