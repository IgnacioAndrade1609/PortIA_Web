import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';
import { AlertService } from '../../../../shared/services/alert.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [DatePipe, RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule, RiskBadgeComponent],
  templateUrl: './alerts.component.html'
})
export class AlertsComponent {
  private readonly alertService = inject(AlertService);
  private readonly auth = inject(AuthService);

  readonly esAnalista = computed(() => this.auth.rol() === 'Analista');

  readonly columnas = computed(() =>
    this.esAnalista()
      ? ['numeroContainer', 'tipoAlerta', 'nivelRiesgo', 'mensaje', 'createAt', 'acciones']
      : ['numeroContainer', 'tipoAlerta', 'nivelRiesgo', 'mensaje', 'createAt', 'analistaAsignado']
  );

  readonly alertas = computed(() => {
    const todas = this.alertService.alertas();
    if (!this.esAnalista()) return todas;

    const nombre = this.auth.usuario()?.nombreUsuario;
    return todas.filter(a => a.analistaAsignado === nombre);
  });

  marcarLeida(id: number): void {
    this.alertService.marcarLeida(id);
  }
}
