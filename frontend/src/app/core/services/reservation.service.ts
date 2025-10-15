import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';
import { Vehicle } from './vehicle.service';

export interface Reservation {
  id: string;
  status: 'active' | 'released';
  reservedAt: string;
  releasedAt?: string;
  vehicle: Vehicle;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
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

  async listMyReservations(): Promise<Reservation[]> {
    const response$ = this.http.get<Reservation[]>(`${this.authService.apiUrl}/reservations/me`, {
      headers: this.authHeaders,
    });

    return firstValueFrom(response$);
  }

  async createReservation(vehicleId: string): Promise<Reservation> {
    const response$ = this.http.post<Reservation>(
      `${this.authService.apiUrl}/reservations`,
      { vehicleId },
      {
        headers: this.authHeaders,
      },
    );

    return firstValueFrom(response$);
  }

  async releaseReservation(reservationId: string): Promise<Reservation> {
    const response$ = this.http.post<Reservation>(
      `${this.authService.apiUrl}/reservations/${reservationId}/release`,
      {},
      {
        headers: this.authHeaders,
      },
    );

    return firstValueFrom(response$);
  }
}
