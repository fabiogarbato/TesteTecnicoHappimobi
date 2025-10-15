import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';

export interface VehiclePayload {
  name: string;
  brand: string;
  modelName: string;
  year: number;
  licensePlate: string;
  color?: string;
  category?: string;
  engine?: string;
  size?: number;
}

export interface Vehicle extends VehiclePayload {
  id: string;
  status: 'available' | 'reserved';
  type?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private get authHeaders() {
    const token = this.authService.getToken();

    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async listVehicles(): Promise<Vehicle[]> {
    const response$ = this.http.get<Vehicle[]>(`${this.authService.apiUrl}/vehicles`, {
      headers: this.authHeaders,
    });

    return firstValueFrom(response$);
  }

  async createVehicle(payload: VehiclePayload): Promise<Vehicle> {
    const response$ = this.http.post<Vehicle>(`${this.authService.apiUrl}/vehicles`, payload, {
      headers: this.authHeaders,
    });

    return firstValueFrom(response$);
  }

  async updateVehicle(id: string, payload: Partial<VehiclePayload>): Promise<Vehicle> {
    const response$ = this.http.put<Vehicle>(`${this.authService.apiUrl}/vehicles/${id}`,
      payload,
      {
        headers: this.authHeaders,
      },
    );

    return firstValueFrom(response$);
  }

  async deleteVehicle(id: string): Promise<void> {
    const response$ = this.http.delete<void>(`${this.authService.apiUrl}/vehicles/${id}`, {
      headers: this.authHeaders,
    });

    await firstValueFrom(response$);
  }
}
