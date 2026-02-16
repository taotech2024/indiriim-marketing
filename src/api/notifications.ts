import apiClient from './client';

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
  segment?: string;
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

/** GET /api/v1/notifications - list with optional pagination/filter */
export async function fetchNotifications(
  params?: NotificationsListParams
): Promise<NotificationItem[]> {
  const { data } = await apiClient.get<NotificationItem[] | NotificationsListResponse>(
    '/api/v1/notifications',
    { params }
  );
  if (Array.isArray(data)) return data;
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
  const { data } = await apiClient.post<CreateNotificationResponse>('/api/v1/notifications', body);
  return data;
}
