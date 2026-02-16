export const API_ERROR_EVENT = 'indiriim-api-error';

export interface ApiErrorDetail {
  message: string;
  errorCode?: string;
}

export function notifyApiError(message: string, errorCode?: string): void {
  window.dispatchEvent(
    new CustomEvent<ApiErrorDetail>(API_ERROR_EVENT, {
      detail: { message, errorCode }
    })
  );
}

export function getApiErrorMessage(error: unknown): string {
  const err = error as {
    response?: { status?: number; data?: { message?: string } };
    message?: string;
  };
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.status === 403) return 'Bu işlem için yetkiniz yok.';
  if (err.response?.status && err.response.status >= 500) return 'Sunucu hatası. Lütfen sonra tekrar deneyin.';
  if (err.message === 'Network Error') return 'Bağlantı hatası. Lütfen ağ bağlantınızı kontrol edin.';
  return err.message ?? 'Beklenmeyen bir hata oluştu.';
}
