import axios from 'axios';
import apiClient from './client';
import type { User, UserRole } from '../utils/sessionManager';

const baseURL =
  typeof process !== 'undefined' && process.env?.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : 'http://localhost:8092';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface LogoutRequest {
  refreshToken: string;
}

function mapUser(apiUser: LoginResponse['user']): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role as UserRole
  };
}

export async function login(email: string, password: string): Promise<{ token: string; refreshToken: string; user: User }> {
  const { data } = await apiClient.post<LoginResponse>('/api/v1/auth/login', { email, password });
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    user: mapUser(data.user)
  };
}

export async function refreshToken(refreshTokenValue: string): Promise<{ token: string; refreshToken: string; user: User }> {
  const { data } = await axios.post<RefreshResponse>(`${baseURL}/api/v1/auth/refresh`, { refreshToken: refreshTokenValue }, {
    headers: { 'Content-Type': 'application/json' }
  });
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    user: mapUser(data.user)
  };
}

export async function logout(refreshTokenValue: string): Promise<void> {
  await apiClient.post('/api/v1/auth/logout', { refreshToken: refreshTokenValue });
}
