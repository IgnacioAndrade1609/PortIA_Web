import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';
import { ChipComponent } from '../../../../shared/components/chip/chip.component';
import { AssignContainerDialogComponent } from '../../../../shared/components/assign-container-dialog/assign-container-dialog.component';
import { ContainerService } from '../../../../shared/services/container.service';
import { UserService } from '../../../../shared/services/user.service';
import { SystemHealthService } from '../../../../shared/services/system-health.service';
import { ContainerListItem } from '../../../../shared/models/container.model';
import { NivelRiesgo } from '../../../../shared/models/riesgo.model';
import { UserDto } from '../../../../shared/models/usuario.model';
import { SystemHealth } from '../../../../shared/models/system-health.model';
import { exportToExcel } from '../../../../shared/utils/excel-export.util';

type FiltroRiesgo = NivelRiesgo | 'TODOS' | 'CRITICO_VENCIDO';

interface EquipoResumen {
  jefe: string;
  contenedores: number;
  enRiesgo: number;
  criticosVencidos: number;
  sinAnalista: number;
}

interface IndicadorSalud {
  etiqueta: string;
  valor: number;
  ayuda: string;
}

const ORDEN_RIESGO: Record<NivelRiesgo, number> = { OVERDUE: 0, CRITICAL: 1, WARNING: 2, OK: 3 };
const SIN_JEFE = 'Sin jefe';

@Component({
  selector: 'app-global-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    RiskBadgeComponent,
    ChipComponent
  ],
  templateUrl: './global-dashboard.component.html',
  styleUrl: './global-dashboard.component.css'
})
export class GlobalDashboardComponent implements OnInit {
  private readonly containerService = inject(ContainerService);
  private readonly userService = inject(UserService);
  private readonly systemHealthService = inject(SystemHealthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly columnas = ['numeroContainer', 'asignadoA', 'jefe', 'naviera', 'puertoDestino', 'venceEn', 'nivelRiesgo', 'acciones'];
  readonly columnasEquipo = ['jefe', 'contenedores', 'enRiesgo', 'criticosVencidos', 'sinAnalista'];

  readonly usuarios = signal<UserDto[]>([]);
  readonly salud = signal<SystemHealth | null>(null);
  readonly errorSalud = signal(false);

  readonly draftBusqueda = signal('');
  readonly draftRiesgo = signal<FiltroRiesgo>('TODOS');
  readonly draftNaviera = signal<string | 'TODAS'>('TODAS');
  readonly draftJefe = signal<string | 'TODOS'>('TODOS');
  readonly draftAnalista = signal<string | 'TODOS' | 'SIN_ASIGNAR'>('TODOS');

  private readonly todos = this.containerService.lista;

  readonly analistas = computed(() =>
    this.usuarios().filter(u => u.role.name === 'Analista' && u.active)
  );
  readonly jefes = computed(() => this.usuarios().filter(u => u.role.name === 'Jefe'));

  private readonly jefePorAnalista = computed(() => {
    const mapa = new Map<string, string>();
    for (const u of this.usuarios()) {
      if (u.role.name === 'Analista') mapa.set(u.name, u.supervisor?.name ?? SIN_JEFE);
    }
    return mapa;
  });

  readonly navieras = computed(() => {
    const unicas = new Set(this.todos().map(c => c.naviera).filter((n): n is string => !!n));
    return Array.from(unicas).sort();
  });

  readonly total = computed(() => this.todos().length);
  readonly sinAsignar = computed(() => this.todos().filter(c => !c.asignadoA).length);
  readonly criticosVencidos = computed(() =>
    this.todos().filter(c => c.nivelRiesgo === 'CRITICAL' || c.nivelRiesgo === 'OVERDUE').length
  );
  readonly enRiesgoPct = computed(() => {
    const total = this.total();
    if (total === 0) return 0;
    return Math.round((this.todos().filter(c => c.nivelRiesgo !== 'OK').length / total) * 100);
  });

  readonly filtrados = computed(() => {
    const texto = this.draftBusqueda().trim().toLowerCase();
    const riesgo = this.draftRiesgo();
    const naviera = this.draftNaviera();
    const jefe = this.draftJefe();
    const analista = this.draftAnalista();

    return this.todos()
      .filter(c => {
        const jefeDelContenedor = this.jefeDe(c);
        return (
          (!texto || c.numeroContainer.toLowerCase().includes(texto)) &&
          (riesgo === 'TODOS' ||
            (riesgo === 'CRITICO_VENCIDO' ? c.nivelRiesgo === 'CRITICAL' || c.nivelRiesgo === 'OVERDUE' : c.nivelRiesgo === riesgo)) &&
          (naviera === 'TODAS' || c.naviera === naviera) &&
          (jefe === 'TODOS' || jefeDelContenedor === jefe) &&
          (analista === 'TODOS' || (analista === 'SIN_ASIGNAR' ? !c.asignadoA : c.asignadoA === analista))
        );
      })
      .sort((a, b) => {
        const huerfanoA = a.asignadoA ? 1 : 0;
        const huerfanoB = b.asignadoA ? 1 : 0;
        if (huerfanoA !== huerfanoB) return huerfanoA - huerfanoB;
        const porRiesgo = ORDEN_RIESGO[a.nivelRiesgo] - ORDEN_RIESGO[b.nivelRiesgo];
        if (porRiesgo !== 0) return porRiesgo;
        return (a.horasParaDeadline ?? Number.MAX_SAFE_INTEGER) - (b.horasParaDeadline ?? Number.MAX_SAFE_INTEGER);
      });
  });

  readonly equipos = computed<EquipoResumen[]>(() => {
    const mapa = new Map<string, EquipoResumen>();
    for (const c of this.todos()) {
      const jefe = this.jefeDe(c);
      const fila = mapa.get(jefe) ?? { jefe, contenedores: 0, enRiesgo: 0, criticosVencidos: 0, sinAnalista: 0 };
      fila.contenedores++;
      if (c.nivelRiesgo !== 'OK') fila.enRiesgo++;
      if (c.nivelRiesgo === 'CRITICAL' || c.nivelRiesgo === 'OVERDUE') fila.criticosVencidos++;
      if (!c.asignadoA) fila.sinAnalista++;
      mapa.set(jefe, fila);
    }
    return Array.from(mapa.values()).sort((a, b) => b.criticosVencidos - a.criticosVencidos || a.jefe.localeCompare(b.jefe));
  });

  readonly indicadoresSalud = computed<IndicadorSalud[]>(() => {
    const s = this.salud();
    if (!s) return [];
    return [
      { etiqueta: 'Contenedores sin analista', valor: s.contenedoresSinAsignar, ayuda: 'Nadie recibe sus alertas' },
      { etiqueta: 'Con analista deshabilitado', valor: s.contenedoresConAnalistaInactivo, ayuda: 'Asignados a un usuario inactivo' },
      { etiqueta: 'Documentos por revisar', valor: s.documentosPorRevisar, ayuda: 'La IA los dejó con baja confianza' },
      { etiqueta: 'Extracciones atascadas', valor: s.documentosPendientesAtascados + s.cargasAtascadas, ayuda: 'Pendientes o procesando hace más de 1 hora' },
      { etiqueta: 'Cargas con error', valor: s.cargasConError, ayuda: 'Fallaron al procesarse' },
      { etiqueta: 'Mensajes fallidos (7 días)', valor: s.notificacionesFallidas7Dias, ayuda: 'Correos o Telegram que no salieron' },
      { etiqueta: 'Alertas sin leer (+24 h)', valor: s.alertasSinLeerMas24Horas, ayuda: 'Nadie las ha atendido' }
    ];
  });

  ngOnInit(): void {
    this.userService.getUsers({ pageSize: 1000 }).subscribe({
      next: resultado => this.usuarios.set(resultado.items)
    });
    this.cargarSalud();
  }

  cargarSalud(): void {
    this.systemHealthService.getSalud().subscribe({
      next: datos => {
        this.salud.set(datos);
        this.errorSalud.set(false);
      },
      error: () => this.errorSalud.set(true)
    });
  }

  jefeDe(c: ContainerListItem): string {
    if (!c.asignadoA) return SIN_JEFE;
    return this.jefePorAnalista().get(c.asignadoA) ?? SIN_JEFE;
  }

  venceEn(c: ContainerListItem): string {
    const horas = c.horasParaDeadline;
    if (horas == null) return '—';
    const abs = Math.abs(horas);
    const texto = abs < 48 ? `${Math.round(abs)} h` : `${Math.floor(abs / 24)} d`;
    return horas < 0 ? `Vencido hace ${texto}` : `En ${texto}`;
  }

  filtrarPorRiesgo(riesgo: FiltroRiesgo): void {
    this.draftRiesgo.set(riesgo);
  }

  filtrarSinAsignar(): void {
    this.draftAnalista.set('SIN_ASIGNAR');
  }

  limpiar(): void {
    this.draftBusqueda.set('');
    this.draftRiesgo.set('TODOS');
    this.draftNaviera.set('TODAS');
    this.draftJefe.set('TODOS');
    this.draftAnalista.set('TODOS');
  }

  asignar(c: ContainerListItem): void {
    const ref = this.dialog.open(AssignContainerDialogComponent, {
      width: '460px',
      autoFocus: false,
      data: {
        numeroContainer: c.numeroContainer,
        analistaActual: c.asignadoA ?? null,
        analistas: this.analistas()
      }
    });

    ref.afterClosed().subscribe((analistaId: number | null | undefined) => {
      if (analistaId == null) return;
      this.containerService.asignar(c.id, analistaId).subscribe({
        next: () => {
          this.snackBar.open(`Contenedor ${c.numeroContainer} reasignado.`, 'Cerrar', { duration: 3500 });
          this.containerService.cargarContenedores();
          this.cargarSalud();
        },
        error: err => {
          const mensaje = err?.error?.detail || 'No se pudo reasignar el contenedor.';
          this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
        }
      });
    });
  }

  exportar(): void {
    const filas = this.filtrados().map(c => ({
      'N° Contenedor': c.numeroContainer,
      Analista: c.asignadoA ?? 'Sin asignar',
      Jefe: this.jefeDe(c),
      Naviera: c.naviera ?? '',
      'Puerto destino': c.puertoDestino ?? '',
      'Vence en': this.venceEn(c),
      'Deadline demurrage': c.deadlineDemurrage ? new Date(c.deadlineDemurrage).toLocaleDateString('es-CL') : '',
      'Deadline detention': c.deadlineDetention ? new Date(c.deadlineDetention).toLocaleDateString('es-CL') : '',
      Riesgo: c.nivelRiesgo
    }));
    exportToExcel('dashboard-global', filas);
  }

  imprimir(): void {
    window.print();
  }
}
