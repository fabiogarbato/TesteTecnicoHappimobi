import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Reservation, ReservationService } from '../../core/services/reservation.service';
import { Vehicle, VehicleService } from '../../core/services/vehicle.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="reservations">
      <header class="reservations__header">
        <h1>Minhas Reservas</h1>
        <p>Crie e gerencie suas reservas de veículos de forma rápida e fácil.</p>
      </header>

      <div class="content">
        <div class="form-container">
          <section class="card">
            <h2>Reservar um Veículo</h2>
            <p class="subtitle">Selecione um veículo da lista para criar uma nova reserva.</p>

            <form [formGroup]="form" (ngSubmit)="reserve()">
              <label>
                <span>Veículos Disponíveis</span>
                <div class="select-wrapper">
                  <select formControlName="vehicleId">
                    <option value="" disabled>Escolha um veículo</option>
                    <option *ngFor="let vehicle of availableVehicles()" [value]="vehicle.id">
                      {{ vehicle.name }} ({{ vehicle.licensePlate }})
                    </option>
                  </select>
                </div>
              </label>

              <div *ngIf="loadingVehicles()" class="info-state info-state--compact">
                <i class="icon gg-spinner"></i>
                <p>Carregando veículos...</p>
              </div>

              <div *ngIf="!loadingVehicles() && availableVehicles().length === 0" class="info-state info-state--compact">
                <i class="icon gg-info"></i>
                <p>Nenhum veículo disponível no momento.</p>
              </div>

              <p class="form-error" *ngIf="formInvalid()">
                Por favor, selecione um veículo para continuar.
              </p>

              <button type="submit" [disabled]="submitting() || form.invalid || availableVehicles().length === 0">
                <i class="icon" [class.gg-spinner]="submitting()" [class.gg-add]="!submitting()"></i>
                {{ submitting() ? 'Reservando...' : 'Confirmar Reserva' }}
              </button>
            </form>
          </section>
        </div>

        <div class="list-container">
          <section class="card">
            <div class="card__header">
              <h2>Histórico de Reservas</h2>
              <button type="button" class="refresh" (click)="refreshAll()" [disabled]="loadingReservations() || loadingVehicles()">
                <i class="icon gg-sync"></i>
                Atualizar
              </button>
            </div>

            <div *ngIf="loadingReservations()" class="info-state">
              <i class="icon gg-spinner"></i>
              <p>Carregando seu histórico...</p>
            </div>

            <div *ngIf="!loadingReservations() && reservations().length === 0" class="info-state">
              <i class="icon gg-info"></i>
              <p>Você ainda não fez nenhuma reserva.</p>
            </div>

            <p *ngIf="errorMessage()" class="error-state">{{ errorMessage() }}</p>

            <ul class="reservation-list">
              <li *ngFor="let reservation of reservations()" class="reservation-item" [class.reservation-item--released]="reservation.status === 'released'">
                <div class="reservation-item__icon">
                  <i class="icon" [class.gg-check-o]="reservation.status === 'released'" [class.gg-time]="reservation.status === 'active'"></i>
                </div>
                <div class="reservation-item__details">
                  <div class="reservation-item__header">
                    <h3>{{ reservation.vehicle.name }}</h3>
                    <div class="status" [class.status--released]="reservation.status === 'released'">
                      {{ reservation.status === 'released' ? 'Liberada' : 'Ativa' }}
                    </div>
                  </div>
                  <p class="subtitle">{{ reservation.vehicle.brand }} • {{ reservation.vehicle.modelName }} • Placa: <strong>{{ reservation.vehicle.licensePlate }}</strong></p>
                  <div class="reservation-item__meta">
                    <span>Reservado em: {{ reservation.reservedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
                    <span *ngIf="reservation.releasedAt">Liberado em: {{ reservation.releasedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                </div>

                <div class="reservation-item__actions" *ngIf="reservation.status === 'active'">
                  <button type="button" class="release" (click)="release(reservation)" [disabled]="submitting()">
                    <i class="icon gg-log-out"></i>
                    Liberar
                  </button>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        --primary-color: #2563eb;
        --primary-color-hover: #1d4ed8;
        --secondary-color: #e2e8f0;
        --secondary-color-hover: #cbd5e1;
        --danger-color: #dc2626;
        --danger-color-hover: #b91c1c;
        --success-color: #16a34a;
        --release-color: #475569;
        --release-color-hover: #334155;
        --active-color: #f97316;
        --released-bg-color: #f8fafc;
        --text-color: #0f172a;
        --text-color-light: #475569;
        --background-color: #f1f5f9;
        --card-background: #ffffff;
        --border-color: #e2e8f0;
        --input-background: #f8fafc;
        --input-border: #cbd5e1;
        --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
        --border-radius: 0.75rem;
        --transition-speed: 0.2s;
      }

      .reservations {
        padding: 2rem;
        background: var(--background-color);
        min-height: 100vh;
      }

      .reservations__header h1 {
        margin: 0;
        font-size: 2.25rem;
        font-weight: 700;
        color: var(--text-color);
      }

      .reservations__header p {
        margin: 0.25rem 0 0;
        font-size: 1.125rem;
        color: var(--text-color-light);
      }

      .content {
        display: grid;
        grid-template-columns: 1fr 1.5fr;
        gap: 2rem;
        margin-top: 2rem;
      }

      .card {
        background: var(--card-background);
        border-radius: var(--border-radius);
        padding: 2rem;
        box-shadow: var(--shadow);
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .card h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
      }

      .subtitle {
        margin: -1rem 0 0;
        color: var(--text-color-light);
      }

      .card__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 1rem;
        margin-bottom: -0.5rem;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-weight: 600;
        color: var(--text-color);
        font-size: 0.875rem;
      }

      .select-wrapper {
        position: relative;
      }

      select {
        width: 100%;
        padding: 0.75rem 2.5rem 0.75rem 1rem;
        border-radius: 0.5rem;
        border: 1px solid var(--input-border);
        background-color: var(--input-background);
        font: inherit;
        appearance: none;
        -webkit-appearance: none;
        transition: all var(--transition-speed) ease;
      }

      .select-wrapper::after {
        content: '▼';
        position: absolute;
        top: 50%;
        right: 1rem;
        transform: translateY(-50%);
        pointer-events: none;
        color: var(--text-color-light);
        font-size: 0.8rem;
      }

      select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        background: var(--card-background);
      }

      .form-error {
        color: var(--danger-color);
        font-weight: 500;
        text-align: center;
      }

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        border: none;
        border-radius: 0.5rem;
        padding: 0.85rem 1.5rem;
        background: var(--primary-color);
        color: #ffffff;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-speed) ease;
        box-shadow: var(--shadow);
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      button:not(:disabled):hover {
        background: var(--primary-color-hover);
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      .refresh {
        background: transparent;
        color: var(--text-color-light);
        box-shadow: none;
        padding: 0.5rem 1rem;
      }

      .refresh:not(:disabled):hover {
        background: var(--secondary-color);
        color: var(--text-color);
        transform: translateY(0);
        box-shadow: none;
      }

      .release {
        background: var(--release-color);
      }

      .release:not(:disabled):hover {
        background: var(--release-color-hover);
      }

      .info-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 2rem;
        color: var(--text-color-light);
        border: 2px dashed var(--border-color);
        border-radius: var(--border-radius);
      }

      .info-state--compact {
        padding: 1rem;
        flex-direction: row;
        gap: 1rem;
      }

      .info-state .icon {
        --ggs: 1.5;
        margin-bottom: 1rem;
      }

      .info-state--compact .icon {
        --ggs: 1;
        margin-bottom: 0;
      }

      .error-state {
        color: var(--danger-color);
        margin: 0;
        text-align: center;
        padding: 1rem;
        background: rgba(220, 38, 38, 0.1);
        border-radius: 0.5rem;
      }

      .reservation-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0;
        margin: 0;
        list-style: none;
      }

      .reservation-item {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 1.25rem;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        background: var(--card-background);
        transition: all var(--transition-speed) ease;
      }

      .reservation-item--released {
        background: var(--released-bg-color);
        opacity: 0.8;
      }

      .reservation-item__icon {
        font-size: 1.5rem;
        color: var(--active-color);
      }

      .reservation-item--released .reservation-item__icon {
        color: var(--success-color);
      }

      .reservation-item__details {
        flex-grow: 1;
      }

      .reservation-item__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .reservation-item__header h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
      }

      .reservation-item__meta {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        margin-top: 0.75rem;
        font-size: 0.875rem;
        color: var(--text-color-light);
      }

      .reservation-item__actions {
        display: flex;
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        background: var(--active-color);
        color: #ffffff;
        font-weight: 600;
        font-size: 0.8rem;
      }

      .status--released {
        background: var(--secondary-color);
        color: var(--text-color-light);
      }

      .icon {
        display: inline-block;
        width: 1em;
        height: 1em;
        --ggs: 1;
      }

      @media (max-width: 1200px) {
        .content {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .reservations {
          padding: 1rem;
        }

        .reservations__header h1 {
          font-size: 1.75rem;
        }

        .reservations__header p {
          font-size: 1rem;
        }

        .card {
          padding: 1.5rem;
        }

        .reservation-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .reservation-item__actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
    `,
  ],
})
export class ReservationsComponent {
  private readonly reservationService = inject(ReservationService);
  private readonly vehicleService = inject(VehicleService);
  private readonly fb = inject(FormBuilder);

  readonly reservations = signal<Reservation[]>([]);
  readonly availableVehicles = signal<Vehicle[]>([]);
  readonly loadingReservations = signal(false);
  readonly loadingVehicles = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    vehicleId: ['', [Validators.required]],
  });

  constructor() {
    void this.refreshAll();
  }

  formInvalid(): boolean {
    return this.form.invalid && (this.form.dirty || this.form.touched);
  }

  async refreshAll(): Promise<void> {
    await Promise.all([this.loadReservations(), this.loadAvailableVehicles()]);
  }

  async loadReservations(): Promise<void> {
    this.loadingReservations.set(true);
    this.errorMessage.set(null);

    try {
      const list = await this.reservationService.listMyReservations();
      this.reservations.set(list.sort((a, b) => new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime()));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível carregar as reservas.';
      this.errorMessage.set(message);
    } finally {
      this.loadingReservations.set(false);
    }
  }

  async loadAvailableVehicles(): Promise<void> {
    this.loadingVehicles.set(true);

    try {
      const vehicles = await this.vehicleService.listVehicles();
      this.availableVehicles.set(
        vehicles
          .filter((vehicle) => vehicle.status === 'available')
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível carregar os veículos disponíveis.';
      this.errorMessage.set(message);
    } finally {
      this.loadingVehicles.set(false);
    }
  }

  async reserve(): Promise<void> {
    if (this.submitting() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      const vehicleId = this.form.controls.vehicleId.value;
      await this.reservationService.createReservation(vehicleId);
      this.form.reset({ vehicleId: '' });
      await this.refreshAll();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível criar a reserva.';
      this.errorMessage.set(message);
    } finally {
      this.submitting.set(false);
    }
  }

  async release(reservation: Reservation): Promise<void> {
    if (this.submitting()) {
      return;
    }

    const confirmed = window.confirm(`Deseja realmente liberar o veículo "${reservation.vehicle.name}"?`);

    if (!confirmed) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.reservationService.releaseReservation(reservation.id);
      await this.refreshAll();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível liberar a reserva.';
      this.errorMessage.set(message);
    } finally {
      this.submitting.set(false);
    }
  }
}