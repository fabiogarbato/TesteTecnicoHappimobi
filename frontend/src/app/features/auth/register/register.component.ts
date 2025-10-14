import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get nameInvalid(): boolean {
    const control = this.form.get('name');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  get emailInvalid(): boolean {
    const control = this.form.get('email');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  get passwordInvalid(): boolean {
    const control = this.form.get('password');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  async onSubmit(): Promise<void> {
    if (this.submitting() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.register(this.form.value);
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao criar conta';
      this.errorMessage.set(message);
    } finally {
      this.submitting.set(false);
    }
  }

  goToLogin(): void {
    void this.router.navigate(['/login']);
  }
}
