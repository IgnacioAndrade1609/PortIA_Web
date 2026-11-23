import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';
import { ContainerService } from '../../../../shared/services/container.service';
import { UserService } from '../../../../shared/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { ContainerListItem } from '../../../../shared/models/container.model';
import { NivelRiesgo } from '../../../../shared/models/riesgo.model';
import { UserDto } from '../../../../shared/models/usuario.model';
import { exportToExcel } from '../../../../shared/utils/excel-export.util';

type FiltroRiesgo = NivelRiesgo | 'TODOS' | 'CRITICO_VENCIDO';

const ORDEN_RIESGO: Record<NivelRiesgo, number> = { OVERDUE: 0, CRITICAL: 1, WARNING: 2, OK: 3 };

@Component({
  selector: 'app-team-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RiskBadgeComponent
  ],
  templateUrl: './team-dashboard.component.html',
  styleUrl: './team-dashboard.component.css'
})
export class TeamDashboardComponent implements OnInit {
  private readonly containerService = inject(ContainerService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly route = inject(ActivatedRoute);

  readonly columnas = ['numeroContainer', 'asignadoA', 'naviera', 'eta', 'venceEn', 'nivelRiesgo', 'acciones'];

  readonly esAdmin = computed(() => this.auth.rol() === 'Admin');

  readonly jefes = signal<UserDto[]>([]);
  readonly analistas = signal<UserDto[]>([]);
  readonly contenedores = signal<ContainerListItem[]>([]);

  readonly jefeSeleccionado = signal<number | null>(null);
  readonly analistaSeleccionado = signal<number | 'TODOS'>('TODOS');

  readonly draftBusqueda = signal('');
  readonly draftRiesgo = signal<FiltroRiesgo>('TODOS');
  readonly draftNaviera = signal<string | 'TODAS'>('TODAS');

  private readonly busqueda = signal('');
  private readonly riesgoSeleccionado = signal<FiltroRiesgo>('TODOS');
  private readonly navieraSeleccionada = signal<string | 'TODAS'>('TODAS');

  readonly alertasSinLeer = this.alertService.noLeidas;

  readonly navieras = computed(() => {
    const unicas = new Set(this.contenedores().map(c => c.naviera).filter((n): n is string => !!n));
    return Array.from(unicas).sort();
  });

  readonly totalCriticos = computed(() =>
    this.contenedores().filter(c => c.nivelRiesgo === 'CRITICAL' || c.nivelRiesgo === 'OVERDUE').length
  );
  readonly totalAdvertencia = computed(() =>
    this.contenedores().filter(c => c.nivelRiesgo === 'WARNING').length
  );

  readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const riesgo = this.riesgoSeleccionado();
    const naviera = this.navieraSeleccionada();

    return this.contenedores()
      .filter(c => {
        const coincideTexto = !texto || c.numeroContainer.toLowerCase().includes(texto);
        const coincideRiesgo = riesgo === 'TODOS' || (riesgo === 'CRITICO_VENCIDO' ? (c.nivelRiesgo === 'CRITICAL' || c.nivelRiesgo === 'OVERDUE') : c.nivelRiesgo === riesgo);
        const coincideNaviera = naviera === 'TODAS' || c.naviera === naviera;
        return coincideTexto && coincideRiesgo && coincideNaviera;
      })
      .sort((a, b) => {
        const porRiesgo = ORDEN_RIESGO[a.nivelRiesgo] - ORDEN_RIESGO[b.nivelRiesgo];
        if (porRiesgo !== 0) return porRiesgo;
        return (a.horasParaDeadline ?? Number.MAX_SAFE_INTEGER) - (b.horasParaDeadline ?? Number.MAX_SAFE_INTEGER);
      });
  });

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
  }

  ngOnInit(): void {
    const usuario = this.auth.usuario();
    const query = this.route.snapshot.queryParamMap;

    const riesgo = query.get('riesgo');
    if (riesgo && ['OK', 'WARNING', 'CRITICAL', 'OVERDUE', 'CRITICO_VENCIDO'].includes(riesgo)) {
      this.filtrarPorRiesgo(riesgo as FiltroRiesgo);
    }

    const analistaId = Number(query.get('analistaId'));
    if (analistaId > 0) this.analistaSeleccionado.set(analistaId);

    if (this.auth.rol() === 'Jefe' && usuario) {
      this.jefeSeleccionado.set(usuario.id);
      return;
    }

    this.userService.getUsers({ pageSize: 1000 }).subscribe({
      next: resultado => this.jefes.set(resultado.items.filter(u => u.role.name === 'Jefe'))
    });

    const jefeId = Number(query.get('jefeId'));
    if (jefeId > 0) this.jefeSeleccionado.set(jefeId);
  }

  seleccionarJefe(jefeId: number | null): void {
    this.jefeSeleccionado.set(jefeId);
    this.analistaSeleccionado.set('TODOS');
    this.limpiar();
  }

  buscar(): void {
    this.busqueda.set(this.draftBusqueda());
    this.riesgoSeleccionado.set(this.draftRiesgo());
    this.navieraSeleccionada.set(this.draftNaviera());
  }

  limpiar(): void {
    this.draftBusqueda.set('');
    this.draftRiesgo.set('TODOS');
    this.draftNaviera.set('TODAS');
    this.busqueda.set('');
    this.riesgoSeleccionado.set('TODOS');
    this.navieraSeleccionada.set('TODAS');
  }

  filtrarPorRiesgo(riesgo: FiltroRiesgo): void {
    this.draftRiesgo.set(riesgo);
    this.riesgoSeleccionado.set(riesgo);
  }

  venceEn(c: ContainerListItem): string {
    const horas = c.horasParaDeadline;
    if (horas == null) return '—';
    const abs = Math.abs(horas);
    const texto = abs < 48 ? `${Math.round(abs)} h` : `${Math.floor(abs / 24)} d`;
    return horas < 0 ? `Vencido hace ${texto}` : `En ${texto}`;
  }

  exportar(): void {
    const filas = this.filtrados().map(c => ({
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
}
