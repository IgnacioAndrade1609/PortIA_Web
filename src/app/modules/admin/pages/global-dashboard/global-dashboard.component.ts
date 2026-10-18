import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';
import { NivelRiesgo } from '../../../../shared/models/riesgo.model';
import { ContainerService } from '../../../../shared/services/container.service';

@Component({
  selector: 'app-global-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RiskBadgeComponent
  ],
  templateUrl: './global-dashboard.component.html'
})
export class GlobalDashboardComponent {
  private readonly containerService = inject(ContainerService);

  readonly columnas = ['numeroContainer', 'asignadoA', 'naviera', 'puertoDestino', 'nivelRiesgo', 'acciones'];
  readonly riesgoSeleccionado = signal<NivelRiesgo | 'TODOS'>('TODOS');

  readonly contenedores = computed(() => {
    const riesgo = this.riesgoSeleccionado();
    const todos = this.containerService.lista();
    return riesgo === 'TODOS' ? todos : todos.filter(c => c.nivelRiesgo === riesgo);
  });
}
