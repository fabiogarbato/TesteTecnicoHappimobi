import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

import { AuthService, AuthUser } from '../../core/services/auth.service';
import { UpdateUserPayload, UserService } from '../../core/services/user.service';
import { UserSummaryCardComponent } from './components/user-summary-card/user-summary-card.component';
import { UserProfileFormComponent } from './components/user-profile-form/user-profile-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, UserSummaryCardComponent, UserProfileFormComponent],
  template: `
    <section class="dashboard">
      <header class="dashboard__header">
        <app-user-summary-card
          class="dashboard__user-card"
          [user]="user()"
          [disabled]="submitting() || !user()"
          (toggleRequested)="togglePanel()"
        ></app-user-summary-card>

        <button type="button" (click)="logout()" class="logout-button">
          Sair
        </button>
      </header>

      <nav class="dashboard__nav">
        <a routerLink="/vehicles" class="nav-link">Gerenciar veículos</a>
        <a routerLink="/reservations" class="nav-link">Reservas</a>
      </nav>

      <app-user-profile-form
        *ngIf="panelOpen() && user()"
        [user]="user()"
        [submitting]="submitting()"
        [successMessage]="successMessage()"
        [errorMessage]="errorMessage()"
        (save)="handleSave($event)"
        (noChanges)="handleNoChanges()"
      ></app-user-profile-form>
    </section>
  `,
  styles: [
    `
      .dashboard {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 2rem;
        min-height: 100vh;
        background: #f8fafc;
      }

      .dashboard__header {
        display: flex;
        gap: 1.5rem;
        align-items: center;
        flex-wrap: wrap;
      }

      .dashboard__user-card {
        flex: 1 1 18rem;
      }

      .dashboard__nav {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .nav-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.85rem 1.75rem;
        border-radius: 0.75rem;
        border: 1px solid #1e40af;
        color: #1e40af;
        font-weight: 600;
        text-decoration: none;
        transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
      }

      .nav-link:hover {
        background: #1e40af;
        color: #ffffff;
        transform: translateY(-1px);
      }

      .logout-button {
        border: none;
        background: #1e40af;
        color: #ffffff;
        font-weight: 600;
        border-radius: 0.75rem;
        padding: 0.85rem 2rem;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .logout-button:hover {
        background: #1d4ed8;
      }

      @media (max-width: 640px) {
        .dashboard {
          padding: 1.5rem;
        }

        .dashboard__header {
          flex-direction: column;
          align-items: stretch;
        }

        .dashboard__nav {
          flex-direction: column;
        }

        .logout-button {
          width: 100%;
        }
      }
    `,
  ],
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly user = signal<AuthUser | null>(this.authService.getCurrentUser());
  readonly panelOpen = signal(false);
  readonly submitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  togglePanel(): void {
    if (!this.user()) {
      return;
    }

    this.panelOpen.update((current) => !current);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  async handleSave(payload: UpdateUserPayload): Promise<void> {
    const currentUser = this.user();

    if (!currentUser) {
      this.errorMessage.set('Nenhum usuário autenticado.');
      return;
    }

    this.submitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    try {
      const updatedUser = await this.userService.updateUser(currentUser.id, payload);
      this.authService.updateStoredUser(updatedUser);
      this.user.set(updatedUser);
      this.successMessage.set('Dados atualizados com sucesso.');
    } catch (error) {
      const message =
        error instanceof HttpErrorResponse && error.error?.message
          ? error.error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível atualizar o usuário.';
      this.errorMessage.set(message);
    } finally {
      this.submitting.set(false);
    }
  }

  handleNoChanges(): void {
    this.successMessage.set('Nenhuma alteração para salvar.');
    this.errorMessage.set(null);
  }

  logout(): void {
    this.authService.clearToken();
    this.user.set(null);
    this.panelOpen.set(false);
    this.successMessage.set(null);
    this.errorMessage.set(null);
    void this.router.navigate(['/login']);
  }
}
