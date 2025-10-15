import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form: FormGroup = this.fb.group({
    token: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.form.patchValue({ token });
    }
  }

  get tokenInvalid(): boolean {
    const control = this.form.get('token');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  get passwordInvalid(): boolean {
    const control = this.form.get('password');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  get confirmPasswordInvalid(): boolean {
    const control = this.form.get('confirmPassword');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private passwordsDoNotMatch(): boolean {
    const password = this.form.get('password')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;
    return password !== confirmPassword;
  }

  onFieldChange(): void {
    const confirmControl = this.form.get('confirmPassword');

    if (!confirmControl) {
      return;
    }

    const errors = confirmControl.errors;

    if (errors?.['mismatch'] && !this.passwordsDoNotMatch()) {
      const { mismatch, ...rest } = errors;
      const hasOtherErrors = Object.keys(rest).length > 0;
      confirmControl.setErrors(hasOtherErrors ? rest : null);

      if (this.form.hasError('mismatch')) {
        const formErrors = this.form.errors as Record<string, unknown> | null;
        if (formErrors && 'mismatch' in formErrors) {
          const { mismatch: _ignore, ...remaining } = formErrors;
          this.form.setErrors(Object.keys(remaining).length ? remaining : null);
        }
      }

      if (this.errorMessage()) {
        this.errorMessage.set(null);
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.submitting() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.passwordsDoNotMatch()) {
      this.errorMessage.set('As senhas precisam ser iguais.');
      this.form.get('confirmPassword')?.setErrors({ mismatch: true });
      this.form.setErrors({ mismatch: true });
      return;
    }

    this.form.setErrors(null);
    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      const { token, password } = this.form.value as { token: string; password: string };
      await this.authService.resetPassword({ token, password });
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao redefinir a senha';
      this.errorMessage.set(message);
    } finally {
      this.submitting.set(false);
    }
  }

  goToLogin(): void {
    void this.router.navigate(['/login']);
  }

  goToForgot(): void {
    void this.router.navigate(['/forgot-password']);
  }
}
