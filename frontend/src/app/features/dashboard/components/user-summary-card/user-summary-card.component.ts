import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthUser } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-summary-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="user-card"
      (click)="toggleRequested.emit()"
      [disabled]="disabled || !user"
    >
      <span class="user-card__greeting">Olá, {{ user?.name ?? 'usuário' }}</span>
      <span class="user-card__hint">Clique para editar seus dados</span>
    </button>
  `,
  styles: [
    `
      .user-card {
        width: 100%;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        border-radius: 1rem;
        padding: 1.25rem 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease;
        color: #0f172a;
        font: inherit;
        text-align: left;
      }

      .user-card:disabled {
        cursor: default;
        opacity: 0.65;
      }

      .user-card:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.15);
      }

      .user-card__greeting {
        font-size: 1.5rem;
        font-weight: 600;
      }

      .user-card__hint {
        font-size: 0.95rem;
        color: #475569;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSummaryCardComponent {
  @Input() user: AuthUser | null = null;
  @Input() disabled = false;
  @Output() toggleRequested = new EventEmitter<void>();
}
