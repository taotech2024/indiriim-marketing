export type UserRole = 'ADMIN' | 'PROJECT_OWNER' | 'MARKETING_MANAGER' | 'MARKETING_STAFF';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface SessionData {
  user: User;
  lastActivityAt: number;
}

const SESSION_KEY = 'indiriim_notification_session';

class SessionManager {
  private static instance: SessionManager;

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  saveSession(user: User): void {
    const session: SessionData = {
      user,
      lastActivityAt: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  getSession(): SessionData | null {
    const value = localStorage.getItem(SESSION_KEY);
    if (!value) return null;
    try {
      return JSON.parse(value) as SessionData;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  }
}

export const sessionManager = SessionManager.getInstance();
