import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Vehicle, VehiclePayload, VehicleService } from '../../core/services/vehicle.service';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="vehicles">
      <header class="vehicles__header">
        <h1>Manutenção de Frota</h1>
        <p>Adicione, edite e gerencie os veículos da sua frota com facilidade.</p>
      </header>

      <div class="content">
        <div class="form-container">
          <section class="card">
            <h2>{{ editingVehicle() ? 'Editar Veículo' : 'Adicionar Novo Veículo' }}</h2>
            <p class="subtitle">{{ editingVehicle() ? 'Altere os detalhes do veículo abaixo.' : 'Preencha os campos para adicionar um novo veículo.' }}</p>

            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <div class="grid">
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
                <button type="submit" [disabled]="submitting()">
                  <i class="icon" [class.gg-spinner]="submitting()" [class.gg-check]="!submitting()"></i>
                  {{ submitting() ? 'Salvando...' : editingVehicle() ? 'Atualizar Veículo' : 'Cadastrar Veículo' }}
                </button>

                <button
                  type="button"
                  class="secondary"
                  *ngIf="editingVehicle()"
                  (click)="cancelEdit()"
                  [disabled]="submitting()"
                >
                  <i class="icon gg-close"></i>
                  Cancelar Edição
                </button>
              </div>
            </form>
          </section>
        </div>

        <div class="list-container">
          <section class="card">
            <div class="card__header">
              <h2>Veículos Cadastrados</h2>
              <button type="button" class="refresh" (click)="loadVehicles()" [disabled]="loading()">
                <i class="icon gg-sync"></i>
                Atualizar
              </button>
            </div>

            <div *ngIf="loading()" class="info-state">
              <i class="icon gg-spinner"></i>
              <p>Carregando veículos...</p>
            </div>

            <div *ngIf="!loading() && vehicles().length === 0" class="info-state">
              <i class="icon gg-info"></i>
              <p>Nenhum veículo cadastrado. Comece adicionando um novo!</p>
            </div>

            <p *ngIf="errorMessage()" class="error-state">{{ errorMessage() }}</p>

            <ul class="vehicle-list">
              <li *ngFor="let vehicle of vehicles()" class="vehicle-item" [class.editing]="editingVehicle()?.id === vehicle.id">
                <div class="vehicle-item__details">
                  <div class="vehicle-item__header">
                    <h3>{{ vehicle.name }}</h3>
                    <div class="status" [class.status--reserved]="vehicle.status === 'reserved'">
                      <div class="status__dot"></div>
                      {{ vehicle.status === 'reserved' ? 'Reservado' : 'Disponível' }}
                    </div>
                  </div>
                  <p class="subtitle">{{ vehicle.brand }} • {{ vehicle.modelName }} • {{ vehicle.year }}</p>
                  <div class="vehicle-item__meta">
                    <span><i class="icon gg-pin"></i> Placa: <strong>{{ vehicle.licensePlate }}</strong></span>
                    <span *ngIf="vehicle.category"><i class="icon gg-tag"></i> Categoria: {{ vehicle.category }}</span>
                  </div>
                </div>

                <div class="vehicle-item__actions">
                  <button type="button" class="edit" (click)="startEdit(vehicle)">
                    <i class="icon gg-pen"></i>
                  </button>
                  <button type="button" class="danger" (click)="remove(vehicle)" [disabled]="submitting()">
                    <i class="icon gg-trash"></i>
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
        --reserved-color: #f97316;
        --available-color: #16a34a;
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

      .vehicles {
        padding: 2rem;
        background: var(--background-color);
        min-height: 100vh;
      }

      .vehicles__header h1 {
        margin: 0;
        font-size: 2.25rem;
        font-weight: 700;
        color: var(--text-color);
      }

      .vehicles__header p {
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

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
        gap: 1.25rem;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-weight: 600;
        color: var(--text-color);
        font-size: 0.875rem;
      }

      label input {
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        border: 1px solid var(--input-border);
        background: var(--input-background);
        font: inherit;
        transition: all var(--transition-speed) ease;
      }

      label input::placeholder {
        color: #94a3b8;
      }

      label input:focus {
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

      .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
      }

      button {
        display: inline-flex;
        align-items: center;
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

      .secondary {
        background: var(--secondary-color);
        color: var(--text-color);
      }

      .secondary:not(:disabled):hover {
        background: var(--secondary-color-hover);
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

      .danger {
        background: var(--danger-color);
      }

      .danger:not(:disabled):hover {
        background: var(--danger-color-hover);
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

      .info-state .icon {
        --ggs: 1.5;
        margin-bottom: 1rem;
      }

      .error-state {
        color: var(--danger-color);
        margin: 0;
        text-align: center;
        padding: 1rem;
        background: rgba(220, 38, 38, 0.1);
        border-radius: 0.5rem;
      }

      .vehicle-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0;
        margin: 0;
        list-style: none;
      }

      .vehicle-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1.5rem;
        padding: 1.25rem;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        background: var(--input-background);
        transition: all var(--transition-speed) ease;
      }

      .vehicle-item:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow);
        border-color: var(--primary-color);
      }
      
      .vehicle-item.editing {
        box-shadow: 0 0 0 2px var(--primary-color);
        border-color: var(--primary-color);
      }

      .vehicle-item__header {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .vehicle-item__header h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
      }

      .vehicle-item__meta {
        display: flex;
        gap: 1.5rem;
        margin-top: 0.75rem;
        font-size: 0.875rem;
        color: var(--text-color-light);
      }

      .vehicle-item__meta span {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .vehicle-item__actions {
        display: flex;
        gap: 0.75rem;
      }

      .vehicle-item__actions button {
        padding: 0.5rem;
        background: transparent;
        color: var(--text-color-light);
        box-shadow: none;
      }

      .vehicle-item__actions button:not(:disabled):hover {
        color: var(--text-color);
        background: var(--secondary-color);
        transform: translateY(0);
      }

      .vehicle-item__actions .danger:not(:disabled):hover {
        color: #ffffff;
        background: var(--danger-color);
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        background: var(--available-color);
        color: #ffffff;
        font-weight: 600;
        font-size: 0.8rem;
      }

      .status__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ffffff;
      }

      .status--reserved {
        background: var(--reserved-color);
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
        .vehicles {
          padding: 1rem;
        }

        .vehicles__header h1 {
          font-size: 1.75rem;
        }

        .vehicles__header p {
          font-size: 1rem;
        }

        .card {
          padding: 1.5rem;
        }

        .vehicle-item {
          flex-direction: column;
          align-items: flex-start;
        }

        .vehicle-item__actions {
          width: 100%;
          justify-content: flex-end;
          margin-top: 1rem;
        }
      }
    `
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
    document.querySelector('.form-container')?.scrollIntoView({ behavior: 'smooth' });
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