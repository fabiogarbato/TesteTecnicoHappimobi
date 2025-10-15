import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthUser } from '../../../../core/services/auth.service';
import { UpdateUserPayload } from '../../../../core/services/user.service';

@Component({
  selector: 'app-user-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="panel" *ngIf="user">
      <form [formGroup]="form" (ngSubmit)="handleSubmit()" class="panel__form">
        <div class="form-group">
          <label for="name">Nome</label>
          <input id="name" type="text" formControlName="name" />
          <span *ngIf="nameInvalid" class="error-message">Informe um nome válido.</span>
        </div>

        <div class="form-group">
          <label for="email">E-mail</label>
          <input id="email" type="email" formControlName="email" />
          <span *ngIf="emailInvalid" class="error-message">Informe um e-mail válido.</span>
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <input
            id="password"
            type="password"
            formControlName="password"
            placeholder="Deixe em branco para manter"
          />
        </div>

        <div class="feedback" *ngIf="shouldShowFeedback">
          <p *ngIf="successMessage" class="feedback__message feedback__message--success">
            {{ successMessage }}
          </p>
          <p *ngIf="errorMessage" class="feedback__message feedback__message--error">
            {{ errorMessage }}
          </p>
          <p *ngIf="localError()" class="feedback__message feedback__message--error">
            {{ localError() }}
          </p>
        </div>

        <button type="submit" class="save-button" [disabled]="submitting">
          {{ submitting ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </form>
    </section>
  `,
  styles: [
    `
      .panel {
        max-width: 36rem;
        padding: 2rem;
        border-radius: 1rem;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12);
      }

      .panel__form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .form-group label {
        font-weight: 600;
        color: #0f172a;
      }

      .form-group input {
        padding: 0.75rem 1rem;
        border-radius: 0.75rem;
        border: 1px solid #cbd5f5;
        background: #f8fafc;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        font: inherit;
      }

      .form-group input:focus {
        outline: none;
        border-color: #1d4ed8;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      }

      .error-message {
        color: #dc2626;
        font-size: 0.85rem;
      }

      .feedback {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .feedback__message {
        padding: 0.75rem 1rem;
        border-radius: 0.75rem;
        font-size: 0.95rem;
      }

      .feedback__message--success {
        background: #ecfdf5;
        color: #047857;
        border: 1px solid #a7f3d0;
      }

      .feedback__message--error {
        background: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fecaca;
      }

      .save-button {
        align-self: flex-end;
        border: none;
        border-radius: 0.75rem;
        padding: 0.85rem 2.5rem;
        background: #1e40af;
        color: #ffffff;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s ease, transform 0.15s ease;
      }

      .save-button:disabled {
        cursor: default;
        opacity: 0.7;
      }

      .save-button:not(:disabled):hover {
        background: #1d4ed8;
        transform: translateY(-1px);
      }

      @media (max-width: 640px) {
        .panel {
          padding: 1.5rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() user: AuthUser | null = null;
  @Input() submitting = false;
  @Input() successMessage: string | null = null;
  @Input() errorMessage: string | null = null;

  @Output() save = new EventEmitter<UpdateUserPayload>();
  @Output() noChanges = new EventEmitter<void>();

  readonly localError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
  });

  get shouldShowFeedback(): boolean {
    return !!(this.successMessage || this.errorMessage || this.localError());
  }

  get nameInvalid(): boolean {
    const control = this.form.get('name');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  get emailInvalid(): boolean {
    const control = this.form.get('email');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']) {
      this.syncFormWithUser();
    }

    if (changes['successMessage'] && this.successMessage) {
      this.form.controls.password.reset('');
    }

    if (changes['errorMessage']) {
      this.localError.set(null);
    }
  }

  handleSubmit(): void {
    if (this.submitting) {
      return;
    }

    this.localError.set(null);

    if (!this.user) {
      this.localError.set('Nenhum usuário autenticado.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.form.value;
    const payload: UpdateUserPayload = {};

    if (name && name.trim() && name.trim() !== this.user.name) {
      payload.name = name.trim();
    }

    if (email && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== this.user.email) {
        payload.email = normalizedEmail;
      }
    }

    if (password) {
      if (password.length < 6) {
        this.localError.set('A senha deve ter ao menos 6 caracteres.');
        this.form.controls.password.markAsTouched();
        return;
      }

      payload.password = password;
    }

    if (Object.keys(payload).length === 0) {
      this.noChanges.emit();
      this.form.controls.password.reset('');
      return;
    }

    this.save.emit(payload);
  }

  private syncFormWithUser(): void {
    if (!this.user) {
      this.form.reset();
      return;
    }

    this.form.patchValue({
      name: this.user.name,
      email: this.user.email,
    });
  }
}
