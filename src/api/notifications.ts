import apiClient from './client';
import { generateIdempotencyKey } from '../utils/idempotency';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH';

export type NotificationStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'SCHEDULED'
  | 'PROCESSING'
  | 'SENT'
  | 'FAILED';

export interface NotificationItem {
  id: number;
  name: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  scheduledAt: string | null;
  segmentName?: string;
}

export interface NotificationsListParams {
  page?: number;
  size?: number;
  status?: NotificationStatus;
}

export interface NotificationsListResponse {
  content?: NotificationItem[];
  totalElements?: number;
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

/** GET /api/v1/notifications - list with optional pagination/filter */
export async function fetchNotifications(
  params?: NotificationsListParams
): Promise<NotificationItem[]> {
  const query = {
    page: params?.page ?? 0,
    size: params?.size ?? 50,
    status: params?.status,
  };

  const { data } = await apiClient.get<NotificationItem[] | PageResponse<NotificationItem>>(
    '/api/v1/notifications',
    { params: query }
  );

  if (Array.isArray(data)) {
    return data;
  }

  return data.content ?? [];
}

export interface CreateNotificationRequest {
  name: string;
  templateId: number;
  segmentId: number;
  channel: NotificationChannel;
  scheduledAt?: string | null;
}

export interface CreateNotificationResponse {
  id: number;
  name: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  scheduledAt?: string | null;
  segmentName?: string;
}

/** POST /api/v1/notifications */
export async function createNotification(
  body: CreateNotificationRequest
): Promise<CreateNotificationResponse> {
  const { data } = await apiClient.post<CreateNotificationResponse>(
    '/api/v1/notifications',
    body,
    {
      headers: {
        'Idempotency-Key': generateIdempotencyKey(),
      },
    }
  );
  return data;
}
