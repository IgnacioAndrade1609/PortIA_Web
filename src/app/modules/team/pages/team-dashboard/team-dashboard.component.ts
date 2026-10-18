import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';
import { ContainerService } from '../../../../shared/services/container.service';
import { MOCK_ANALISTAS_EQUIPO } from '../../../../shared/mocks/usuarios.mock';

@Component({
  selector: 'app-team-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RiskBadgeComponent
  ],
  templateUrl: './team-dashboard.component.html'
})
export class TeamDashboardComponent {
  private readonly containerService = inject(ContainerService);

  readonly columnas = ['numeroContainer', 'asignadoA', 'naviera', 'eta', 'nivelRiesgo', 'acciones'];
  readonly analistas = MOCK_ANALISTAS_EQUIPO;

  readonly analistaSeleccionado = signal<string | 'TODOS'>('TODOS');

  readonly contenedores = computed(() => {
    const analista = this.analistaSeleccionado();
    const todos = this.containerService.lista();
    return analista === 'TODOS' ? todos : todos.filter(c => c.asignadoA === analista);
  });
}
