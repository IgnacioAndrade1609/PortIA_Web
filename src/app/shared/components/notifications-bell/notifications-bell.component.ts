import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AlertService } from '../../services/alert.service';
import { RiskBadgeComponent } from '../risk-badge/risk-badge.component';

const MAX_VISIBLES = 8;

@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  imports: [DatePipe, RouterLink, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatTooltipModule, RiskBadgeComponent],
  templateUrl: './notifications-bell.component.html',
  styleUrl: './notifications-bell.component.css'
})
export class NotificationsBellComponent {
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);

  readonly noLeidas = this.alertService.noLeidas;

  readonly visibles = computed(() => this.alertService.alertas().slice(0, MAX_VISIBLES));

  irAlContenedor(containerId: number): void {
    this.router.navigate(['/contenedores', containerId]);
  }

  marcarLeida(event: Event, id: number): void {
    event.stopPropagation();
    this.alertService.marcarLeida(id);
  }
}
