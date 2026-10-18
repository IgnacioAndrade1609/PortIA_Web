import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ContainerService } from '../../../../shared/services/container.service';
import { MOCK_ANALISTAS_EQUIPO } from '../../../../shared/mocks/usuarios.mock';

interface CargaAnalista {
  nombre: string;
  cantidad: number;
  porcentaje: number;
}

@Component({
  selector: 'app-management-panel',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './management-panel.component.html',
  styleUrl: './management-panel.component.css'
})
export class ManagementPanelComponent {
  private readonly containerService = inject(ContainerService);

  private readonly contenedores = this.containerService.lista;

  readonly totalEquipo = computed(() => this.contenedores().length);
  readonly totalCritical = computed(() => this.contenedores().filter(c => c.nivelRiesgo === 'CRITICAL').length);
  readonly totalOverdue = computed(() => this.contenedores().filter(c => c.nivelRiesgo === 'OVERDUE').length);
  readonly totalWarning = computed(() => this.contenedores().filter(c => c.nivelRiesgo === 'WARNING').length);

  readonly cargaPorAnalista = computed<CargaAnalista[]>(() => {
    const todos = this.contenedores();
    const maximo = Math.max(1, ...MOCK_ANALISTAS_EQUIPO.map(
      a => todos.filter(c => c.asignadoA === a.nombreUsuario).length
    ));

    return MOCK_ANALISTAS_EQUIPO.map(a => {
      const cantidad = todos.filter(c => c.asignadoA === a.nombreUsuario).length;
      return { nombre: a.nombreUsuario, cantidad, porcentaje: (cantidad / maximo) * 100 };
    });
  });
}
