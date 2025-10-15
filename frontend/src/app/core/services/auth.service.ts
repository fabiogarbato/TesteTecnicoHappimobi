import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'happimobi:auth-token';

  private getDefaultApiUrl(): string {
    if (typeof window === 'undefined') {
      return 'http://localhost:3000';
    }

    const { protocol, hostname } = window.location;
    const port = '3000';

    return `${protocol}//${hostname}:${port}`;
  }

  apiUrl = (window as any)?.__env?.apiUrl ?? this.getDefaultApiUrl();

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response$ = this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
    const response = await firstValueFrom(response$);
    this.setToken(response.token);
    return response;
  }

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const response$ = this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload);
    const response = await firstValueFrom(response$);
    this.setToken(response.token);
    return response;
  }

  async requestPasswordReset(email: string): Promise<ForgotPasswordResponse> {
    const response$ = this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, { email });
    return firstValueFrom(response$);
  }

  async resetPassword(payload: ResetPasswordRequest): Promise<AuthResponse> {
    const response$ = this.http.post<AuthResponse>(`${this.apiUrl}/reset-password`, payload);
    const response = await firstValueFrom(response$);
    this.setToken(response.token);
    return response;
  }

  setToken(token: string): void {
    localStorage.setItem(this.storageKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
