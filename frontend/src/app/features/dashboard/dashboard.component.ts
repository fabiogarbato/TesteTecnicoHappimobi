import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <section class="dashboard">
      <div class="content">
        <h2>Painel em construção</h2>
        <p>Você está autenticado. Em breve apresentaremos os módulos do protótipo.</p>
      </div>
      <button type="button" (click)="logout()" class="logout-button">
        Sair
      </button>
    </section>
  `,
  styles: [
    `
      .dashboard {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        min-height: 100vh;
        background: #f7f7f7;
      }

      .content {
        text-align: center;
        max-width: 32rem;
      }

      .content h2 {
        margin: 0 0 0.5rem;
        font-size: 2rem;
      }

      .content p {
        margin: 0;
        color: #555;
      }

      .logout-button {
        padding: 0.75rem 2rem;
        border: none;
        border-radius: 0.5rem;
        background-color: #1e40af;
        color: #fff;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .logout-button:hover {
        background-color: #1d4ed8;
      }
    `,
  ],
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.clearToken();
    void this.router.navigate(['/login']);
  }
}
