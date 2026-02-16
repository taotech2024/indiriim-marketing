import type { UserRole } from './sessionManager';

/** Full access: admin and manager-level roles (FE + BE) */
export function canManage(role?: UserRole | null): boolean {
  if (!role) return false;
  return (
    role === 'ADMIN' ||
    role === 'PROJECT_OWNER' ||
    role === 'MARKETING_MANAGER' ||
    role === 'MARKETING'
  );
}

/** Write access: manage or staff (excludes READ_ONLY, USER) */
export function canWrite(role?: UserRole | null): boolean {
  if (!role) return false;
  return (
    canManage(role) ||
    role === 'MARKETING_STAFF'
  );
}

/** Read-only: BE roles with no write */
export function isReadOnly(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === 'READ_ONLY' || role === 'USER';
}
