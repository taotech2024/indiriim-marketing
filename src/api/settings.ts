import apiClient from './client';

export interface SettingsEmail {
  senderName?: string;
  senderEmail?: string;
  serviceProvider?: string;
}

export interface SettingsSms {
  provider?: string;
  originator?: string;
}

export interface SettingsPush {
  provider?: string;
  apiKey?: string;
}

export interface FallbackRule {
  id: number;
  trigger: string;
  action: string;
  enabled: boolean;
}

export interface SettingsDistribution {
  retryCount?: number;
  retryDelay?: number;
  smartRouting?: boolean;
}

export interface Settings {
  email?: SettingsEmail;
  sms?: SettingsSms;
  push?: SettingsPush;
  fallbackRules?: FallbackRule[];
  distribution?: SettingsDistribution;
}

export async function fetchSettings(): Promise<Settings> {
  const { data } = await apiClient.get<Settings>('/api/v1/settings');
  return data ?? {};
}

export async function updateSettings(settings: Settings): Promise<Settings> {
  const { data } = await apiClient.put<Settings>('/api/v1/settings', settings);
  return data ?? settings;
}
