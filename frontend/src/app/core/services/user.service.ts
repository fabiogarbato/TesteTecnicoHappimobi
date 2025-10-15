import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AuthService, AuthUser } from './auth.service';

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  async updateUser(id: string, payload: UpdateUserPayload): Promise<AuthUser> {
    const token = this.authService.getToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response$ = this.http.put<AuthUser>(`${this.authService.apiUrl}/users/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return firstValueFrom(response$);
  }
}
