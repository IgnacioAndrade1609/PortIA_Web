import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';
import { ContainerService } from '../../../../shared/services/container.service';
import { UserService } from '../../../../shared/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ContainerListItem } from '../../../../shared/models/container.model';
import { UserDto } from '../../../../shared/models/usuario.model';
import { AnalystDocument } from '../../../../shared/models/analyst-document.model';
import { TeamDocumentsService } from '../../../../shared/services/team-documents.service';
import { exportToExcel } from '../../../../shared/utils/excel-export.util';

@Component({
  selector: 'app-team-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
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
export class TeamDashboardComponent implements OnInit {
  private readonly containerService = inject(ContainerService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly teamDocumentsService = inject(TeamDocumentsService);

  readonly columnas = ['numeroContainer', 'asignadoA', 'naviera', 'eta', 'nivelRiesgo', 'acciones'];
  readonly columnasDocumentos = ['tipoDocumento', 'analystName', 'createAt', 'estadoExtraccion', 'confidence', 'containerNumber', 'acciones'];

  readonly esAdmin = computed(() => this.auth.rol() === 'Admin');

  readonly jefes = signal<UserDto[]>([]);
  readonly analistas = signal<UserDto[]>([]);
  readonly contenedores = signal<ContainerListItem[]>([]);
  readonly documentos = signal<AnalystDocument[]>([]);

  readonly jefeSeleccionado = signal<number | null>(null);
  readonly analistaSeleccionado = signal<number | 'TODOS'>('TODOS');

  constructor() {
    effect(() => {
      const jefeId = this.jefeSeleccionado();
      if (jefeId == null) {
        this.analistas.set([]);
        return;
      }
      this.userService.getUsers({ jefeId, pageSize: 1000 }).subscribe({
        next: resultado => this.analistas.set(resultado.items),
        error: () => this.analistas.set([])
      });
    });

    effect(() => {
      const jefeId = this.jefeSeleccionado();
      const analistaId = this.analistaSeleccionado();

      if (jefeId == null) {
        this.contenedores.set([]);
        return;
      }

      this.containerService.listarPorEquipo({
        jefeId,
        assignedTo: analistaId === 'TODOS' ? null : analistaId
      }).subscribe({
        next: items => this.contenedores.set(items),
        error: () => this.contenedores.set([])
      });
    });

    effect(() => {
      const jefeId = this.jefeSeleccionado();
      const analistaId = this.analistaSeleccionado();

      if (jefeId == null) {
        this.documentos.set([]);
        return;
      }

      this.teamDocumentsService.getDocuments(jefeId, {
        analystId: analistaId === 'TODOS' ? null : analistaId
      }).subscribe({
        next: items => this.documentos.set(items),
        error: () => this.documentos.set([])
      });
    });
  }

  ngOnInit(): void {
    const usuario = this.auth.usuario();

    if (this.auth.rol() === 'Jefe' && usuario) {
      this.jefeSeleccionado.set(usuario.id);
      return;
    }

    this.userService.getUsers({ pageSize: 1000 }).subscribe({
      next: resultado => this.jefes.set(resultado.items.filter(u => u.role.name === 'Jefe'))
    });
  }

  seleccionarJefe(jefeId: number | null): void {
    this.jefeSeleccionado.set(jefeId);
    this.analistaSeleccionado.set('TODOS');
  }

  exportar(): void {
    const filas = this.contenedores().map(c => ({
      'N° Contenedor': c.numeroContainer,
      Analista: c.asignadoA ?? '',
      'N° BL': c.numeroBl ?? '',
      Forwarder: c.nombreForwarder ?? '',
      Naviera: c.naviera ?? '',
      'Terminal origen': c.terminalOrigen ?? '',
      'Terminal destino': c.puertoDestino ?? '',
      'Llegada estimada': c.eta ? new Date(c.eta).toLocaleDateString('es-CL') : '',
      'Días libres demurrage': c.diasLibresDemurrage,
      'Días libres detention': c.diasLibresDetention,
      'Deadline demurrage': c.deadlineDemurrage ? new Date(c.deadlineDemurrage).toLocaleDateString('es-CL') : '',
      'Deadline detention': c.deadlineDetention ? new Date(c.deadlineDetention).toLocaleDateString('es-CL') : '',
      'Estado puerto': c.estadoPuerto ?? '',
      Riesgo: c.nivelRiesgo
    }));
    exportToExcel('contenedores-equipo', filas);
  }

  imprimir(): void {
    window.print();
  }

  abrirDocumento(url: string): void {
    window.open(url, '_blank', 'noopener');
  }
}
