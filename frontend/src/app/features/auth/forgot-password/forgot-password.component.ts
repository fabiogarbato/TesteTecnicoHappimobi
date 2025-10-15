import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly resetToken = signal<string | null>(null);

  readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get emailInvalid(): boolean {
    const control = this.form.get('email');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  async onSubmit(): Promise<void> {
    if (this.submitting() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.resetToken.set(null);

    try {
      const { email } = this.form.value as { email: string };
      const { message, resetToken } = await this.authService.requestPasswordReset(email);
      this.successMessage.set(message);
      if (resetToken) {
        this.resetToken.set(resetToken);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao processar a solicitação';
      this.errorMessage.set(message);
    } finally {
      this.submitting.set(false);
    }
  }

  goToLogin(): void {
    void this.router.navigate(['/login']);
  }

  goToReset(): void {
    const token = this.resetToken();
    if (token) {
      void this.router.navigate(['/reset-password'], { queryParams: { token } });
    } else {
      void this.router.navigate(['/reset-password']);
    }
  }
}
