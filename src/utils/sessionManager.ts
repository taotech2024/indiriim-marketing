// FE roles + BE roles for compatibility until Kart 3 decision
export type UserRole =
  | 'ADMIN'
  | 'PROJECT_OWNER'
  | 'MARKETING_MANAGER'
  | 'MARKETING_STAFF'
  | 'MARKETING'
  | 'READ_ONLY'
  | 'USER';

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
const TOKEN_KEY = 'indiriim_notification_token';
const REFRESH_TOKEN_KEY = 'indiriim_notification_refresh_token';

class SessionManager {
  private static instance: SessionManager;

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setTokens(token: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  saveSession(user: User, token?: string, refreshToken?: string): void {
    const session: SessionData = {
      user,
      lastActivityAt: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (token !== undefined) localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken !== undefined) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
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
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export const sessionManager = SessionManager.getInstance();
