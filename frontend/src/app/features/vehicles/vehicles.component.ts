import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Vehicle, VehiclePayload, VehicleService } from '../../core/services/vehicle.service';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="main-container">
      <div class="card form-card">
        <h2 class="card-title">{{ editingVehicle() ? 'Editar Veículo' : 'Adicionar Novo Veículo' }}</h2>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="form-grid">
            <label>
              <span>Nome</span>
              <input type="text" formControlName="name" placeholder="Ex: Onix 1.0" />
            </label>
            <label>
              <span>Marca</span>
              <input type="text" formControlName="brand" placeholder="Ex: Chevrolet" />
            </label>
            <label>
              <span>Modelo</span>
              <input type="text" formControlName="modelName" placeholder="Ex: Onix" />
            </label>
            <label>
              <span>Ano</span>
              <input type="number" formControlName="year" placeholder="Ex: 2023" />
            </label>
            <label>
              <span>Placa</span>
              <input type="text" formControlName="licensePlate" placeholder="Ex: BRA2E19" />
            </label>
            <label>
              <span>Cor</span>
              <input type="text" formControlName="color" placeholder="Ex: Prata" />
            </label>
            <label>
              <span>Categoria</span>
              <input type="text" formControlName="category" placeholder="Ex: Hatch" />
            </label>
            <label>
              <span>Motor</span>
              <input type="text" formControlName="engine" placeholder="Ex: 1.0 Turbo" />
            </label>
            <label>
              <span>Tamanho (m³)</span>
              <input type="number" formControlName="size" placeholder="Ex: 1.8" />
            </label>
          </div>

          <p class="form-error" *ngIf="formInvalid()">
            Por favor, verifique os campos destacados e tente novamente.
          </p>

          <div class="form-actions">
            <button type="submit" class="primary-button" [disabled]="submitting()">
              {{ submitting() ? 'Salvando...' : editingVehicle() ? 'Atualizar Veículo' : 'Cadastrar Veículo' }}
            </button>
            <button
              type="button"
              class="secondary-button"
              *ngIf="editingVehicle()"
              (click)="cancelEdit()"
              [disabled]="submitting()"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <div class="card list-card">
        <div class="list-header">
          <h2 class="card-title">Veículos Cadastrados</h2>
          <button class="icon-button" (click)="loadVehicles()" [disabled]="loading()">
            <i class="icon gg-sync"></i>
          </button>
        </div>

        <div class="list-container">
          <div *ngIf="loading()" class="info-state">
            <p>Carregando veículos...</p>
          </div>
          <div *ngIf="!loading() && vehicles().length === 0" class="info-state">
            <p>Nenhum veículo cadastrado.</p>
          </div>
          <p *ngIf="errorMessage()" class="error-state">{{ errorMessage() }}</p>

          <ul class="vehicle-list">
            <li *ngFor="let vehicle of vehicles()" class="vehicle-item">
              <div class="vehicle-info">
                <h3>{{ vehicle.name }}</h3>
                <p>{{ vehicle.brand }} • {{ vehicle.modelName }} • {{ vehicle.year }}</p>
                <p>Placa: <strong>{{ vehicle.licensePlate }}</strong></p>
              </div>
              <div class="vehicle-actions">
                <div class="status" [class.status--reserved]="vehicle.status === 'reserved'">
                  {{ vehicle.status === 'reserved' ? 'Reservado' : 'Disponível' }}
                </div>
                <button class="icon-button" (click)="startEdit(vehicle)">
                  <i class="icon gg-pen"></i>
                </button>
                <button class="icon-button danger" (click)="remove(vehicle)" [disabled]="submitting()">
                  <i class="icon gg-trash"></i>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        background-color: #f1f5f9;
        font-family: 'Inter', sans-serif;
        overflow-y: auto;
      }

      .main-container {
        display: flex;
        justify-content: center;
        gap: 2rem;
        flex-wrap: wrap;
        padding: 2rem;
        overflow-x: hidden;
      }

      .card {
        background: linear-gradient(#fff, #f9fafb);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        padding: 2rem;
        width: 100%;
      }

      .form-card {
        max-width: 450px;
      }

      .list-card {
        max-width: 600px;
        display: flex;
        flex-direction: column;
      }

      .card-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #475569;
        margin-bottom: 1.5rem;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #475569;
      }

      input, select {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        width: 100%;
        font-size: 0.95rem;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      input:focus, select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
      }

      button {
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 600;
      }

      .primary-button {
        background: #3b82f6;
        color: white;
        border-radius: 8px;
        padding: 0.8rem 1.2rem;
        flex-grow: 1;
      }

      .primary-button:hover {
        transform: scale(1.03);
        background: #2563eb;
      }

      .secondary-button {
        background: transparent;
        color: #475569;
      }

      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .list-container {
        overflow-y: auto;
        flex-grow: 1;
      }

      .vehicle-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .vehicle-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-radius: 8px;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
      }

      .vehicle-info h3 {
        margin: 0 0 0.25rem;
        font-size: 1rem;
        font-weight: 600;
      }

      .vehicle-info p {
        margin: 0;
        font-size: 0.875rem;
        color: #64748b;
      }

      .vehicle-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .status {
        font-size: 0.8rem;
        font-weight: 600;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        color: #166534;
        background-color: #dcfce7;
      }

      .status--reserved {
        color: #9a3412;
        background-color: #ffedd5;
      }

      .icon-button {
        background: transparent;
        color: #64748b;
        padding: 0.5rem;
        border-radius: 50%;
      }

      .icon-button:hover {
        background-color: #e2e8f0;
        color: #1e293b;
      }

      .icon-button.danger:hover {
        color: #dc2626;
        background-color: rgba(220, 38, 38, 0.1);
      }

      .icon {
        --ggs: 1;
      }

      .info-state, .error-state {
        text-align: center;
        padding: 2rem;
        color: #64748b;
      }

      .error-state {
        color: #dc2626;
      }

      @media (max-width: 768px) {
        .main-container {
          padding: 1rem;
        }
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class VehiclesComponent {
  private readonly vehicleService = inject(VehicleService);
  private readonly fb = inject(FormBuilder);

  readonly vehicles = signal<Vehicle[]>([]);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly editingVehicle = signal<Vehicle | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    brand: ['', [Validators.required]],
    modelName: ['', [Validators.required]],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
    licensePlate: ['', [Validators.required]],
    color: [''],
    category: [''],
    engine: [''],
    size: [null as number | null],
  });

  constructor() {
    void this.loadVehicles();
  }

  async loadVehicles(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const list = await this.vehicleService.listVehicles();
      this.vehicles.set(list.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível carregar os veículos.';
      this.errorMessage.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  formInvalid(): boolean {
    return this.form.invalid && (this.form.dirty || this.form.touched);
  }

  startEdit(vehicle: Vehicle): void {
    this.editingVehicle.set(vehicle);
    this.form.patchValue({
      name: vehicle.name,
      brand: vehicle.brand,
      modelName: vehicle.modelName,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      color: vehicle.color ?? '',
      category: vehicle.category ?? '',
      engine: vehicle.engine ?? '',
      size: vehicle.size ?? null,
    });
    document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editingVehicle.set(null);
    this.form.reset({
      name: '',
      brand: '',
      modelName: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      color: '',
      category: '',
      engine: '',
      size: null,
    });
  }

  async submit(): Promise<void> {
    if (this.submitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, brand, modelName, year, licensePlate, color, category, engine, size } = this.form.getRawValue();

    const payload: VehiclePayload = {
      name: name.trim(),
      brand: brand.trim(),
      modelName: modelName.trim(),
      year: Number(year),
      licensePlate: licensePlate.trim(),
      color: color?.trim() || undefined,
      category: category?.trim() || undefined,
      engine: engine?.trim() || undefined,
      size: size !== null && size !== undefined ? Number(size) : undefined,
    };

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      const editing = this.editingVehicle();

      if (editing) {
        await this.vehicleService.updateVehicle(editing.id, payload);
      } else {
        await this.vehicleService.createVehicle(payload);
      }

      await this.loadVehicles();
      this.cancelEdit();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível salvar o veículo.';
      this.errorMessage.set(message);
    } finally {
      this.submitting.set(false);
    }
  }

  async remove(vehicle: Vehicle): Promise<void> {
    if (this.submitting()) {
      return;
    }

    const confirmed = window.confirm(`Deseja realmente remover o veículo "${vehicle.name}"? Esta ação não poderá ser desfeita.`);

    if (!confirmed) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.vehicleService.deleteVehicle(vehicle.id);
      await this.loadVehicles();

      if (this.editingVehicle()?.id === vehicle.id) {
        this.cancelEdit();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível remover o veículo.';
      this.errorMessage.set(message);
    } finally {
      this.submitting.set(false);
    }
  }
}
