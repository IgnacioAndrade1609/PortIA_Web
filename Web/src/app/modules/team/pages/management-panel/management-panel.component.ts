import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ContainerService } from '../../../../shared/services/container.service';
import { UserService } from '../../../../shared/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { TeamDashboardService } from '../../../../shared/services/team-dashboard.service';
import { TeamDocumentsService } from '../../../../shared/services/team-documents.service';
import { TeamDashboardResponse } from '../../../../shared/models/team-dashboard.model';
import { ContainerListItem } from '../../../../shared/models/container.model';
import { AnalystDocument } from '../../../../shared/models/analyst-document.model';
import { UserDto } from '../../../../shared/models/usuario.model';
import { exportToExcelHojas } from '../../../../shared/utils/excel-export.util';

type Preset = 7 | 30 | 90 | 'custom';

const TARIFA_DIARIA_USD = 150;
const TODOS_LOS_EQUIPOS = -1;

const COLORS = {
  light: {
    ok: '#1e7e34', warning: '#b45309', critical: '#c5221f', overdue: '#1e2a38',
    primary: '#3d5270', pending: '#b45309',
    grid: '#f0f0f0', text: '#1a1a1a', textMuted: '#5f5f5f'
  },
  dark: {
    ok: '#86d7a1', warning: '#f3c37a', critical: '#f4a9a3', overdue: '#c0cfdd',
    primary: '#96aec4', pending: '#f3c37a',
    grid: '#2c3847', text: '#eceff1', textMuted: '#a8b8c8'
  }
};

const RISK_LABELS: Record<string, string> = {
  OK: 'OK', WARNING: 'Advertencia', CRITICAL: 'Crítico', OVERDUE: 'Vencido'
};

export interface RiskSegment {
  level: string;
  label: string;
  count: number;
  pct: number;
  color: string;
  textColor: string;
  showLabel: boolean;
}

export interface Delta {
  texto: string;
  clase: 'good' | 'bad' | 'neutral';
}

export interface AnalystRow {
  id: number | null;
  nombre: string;
  contenedores: number;
  advertencia: number;
  criticosVencidos: number;
  alertas: number;
  gestionadasPct: number | null;
}

const LABEL_MIN_PCT = 8;

function calcularDelta(actual: number | null, previo: number | null, menorEsMejor: boolean, sufijo = ''): Delta | null {
  if (actual == null || previo == null) return null;
  const diff = Math.round((actual - previo) * 10) / 10;
  if (diff === 0) return { texto: 'Sin cambios vs. período anterior', clase: 'neutral' };
  const sube = diff > 0;
  const bueno = menorEsMejor ? !sube : sube;
  return {
    texto: `${sube ? '▲ +' : '▼ '}${diff}${sufijo} vs. período anterior`,
    clase: bueno ? 'good' : 'bad'
  };
}

@Component({
  selector: 'app-management-panel',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatInputModule,
    MatTableModule,
    MatTooltipModule,
    BaseChartDirective
  ],
  templateUrl: './management-panel.component.html',
  styleUrl: './management-panel.component.css'
})
export class ManagementPanelComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly containerService = inject(ContainerService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);
  private readonly alertService = inject(AlertService);
  private readonly teamDashboardService = inject(TeamDashboardService);
  private readonly teamDocumentsService = inject(TeamDocumentsService);

  readonly tarifaDiariaUsd = TARIFA_DIARIA_USD;
  readonly todosLosEquipos = TODOS_LOS_EQUIPOS;
  readonly columnasAnalistas = ['nombre', 'contenedores', 'advertencia', 'criticosVencidos', 'alertas', 'gestionadasPct'];

  readonly esAdmin = computed(() => this.auth.rol() === 'Admin');
  readonly today = new Date();

  readonly jefes = signal<UserDto[]>([]);
  readonly jefeSeleccionado = signal<number | null>(null);

  readonly preset = signal<Preset>(30);
  readonly fromDate = signal<Date>(this.calcularDesde(30));
  readonly toDate = signal<Date>(new Date());

  readonly dashboard = signal<TeamDashboardResponse | null>(null);
  readonly dashboardAnterior = signal<TeamDashboardResponse | null>(null);
  readonly contenedores = signal<ContainerListItem[]>([]);
  readonly documentos = signal<AnalystDocument[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  private readonly colores = computed(() => this.theme.tema() === 'dark' ? COLORS.dark : COLORS.light);

  private contarRiesgo(nivel: string): number {
    return this.dashboard()?.containersByRisk.find(r => r.riskLevel === nivel)?.count ?? 0;
  }

  readonly totalContenedores = computed(() =>
    this.dashboard()?.containersByRisk.reduce((acc, r) => acc + r.count, 0) ?? 0
  );

  readonly vencidos = computed(() => this.contarRiesgo('OVERDUE'));

  readonly enRiesgoPct = computed(() => {
    const total = this.totalContenedores();
    if (total === 0) return 0;
    const enRiesgo = this.contarRiesgo('WARNING') + this.contarRiesgo('CRITICAL') + this.contarRiesgo('OVERDUE');
    return Math.round((enRiesgo / total) * 100);
  });

  private sumarAlertas(d: TeamDashboardResponse | null): { generadas: number; gestionadas: number } {
    const lista = d?.alertsByAnalyst ?? [];
    return {
      generadas: lista.reduce((acc, a) => acc + a.generated, 0),
      gestionadas: lista.reduce((acc, a) => acc + a.managed, 0)
    };
  }

  private porcentajeGestionadas(d: TeamDashboardResponse | null): number | null {
    const { generadas, gestionadas } = this.sumarAlertas(d);
    return generadas === 0 ? null : Math.round((gestionadas / generadas) * 100);
  }

  readonly alertasGeneradas = computed(() => this.sumarAlertas(this.dashboard()).generadas);
  readonly gestionadasPct = computed(() => this.porcentajeGestionadas(this.dashboard()));
  readonly alertasPendientes = computed(() => {
    const { generadas, gestionadas } = this.sumarAlertas(this.dashboard());
    return generadas - gestionadas;
  });

  readonly deltaAlertas = computed(() =>
    calcularDelta(this.alertasGeneradas(), this.sumarAlertas(this.dashboardAnterior()).generadas, true)
  );
  readonly deltaGestionadas = computed(() =>
    calcularDelta(this.gestionadasPct(), this.porcentajeGestionadas(this.dashboardAnterior()), false, ' pts')
  );
  readonly deltaReaccion = computed(() =>
    calcularDelta(
      this.dashboard()?.avgReactionTimeCriticalMinutes ?? null,
      this.dashboardAnterior()?.avgReactionTimeCriticalMinutes ?? null,
      true,
      ' min'
    )
  );

  readonly reaccionLabel = computed(() => {
    const minutos = this.dashboard()?.avgReactionTimeCriticalMinutes;
    if (minutos == null) return 'Sin datos';
    if (minutos < 60) return `${Math.round(minutos)} min`;
    const horas = Math.floor(minutos / 60);
    const resto = Math.round(minutos % 60);
    return `${horas}h ${resto}m`;
  });

  readonly documentosPeriodo = computed(() => {
    const desde = this.fromDate().getTime();
    const hasta = this.toDate().getTime() + 86400000;
    return this.documentos().filter(d => {
      const t = new Date(d.createAt).getTime();
      return t >= desde && t <= hasta;
    });
  });

  readonly confianzaMedia = computed(() => {
    const con = this.documentosPeriodo().filter(d => d.confidence != null);
    if (con.length === 0) return null;
    return Math.round((con.reduce((acc, d) => acc + (d.confidence ?? 0), 0) / con.length) * 100);
  });

  readonly porRevisarPct = computed(() => {
    const docs = this.documentosPeriodo();
    if (docs.length === 0) return null;
    return Math.round((docs.filter(d => d.estadoExtraccion === 'NEEDS_REVIEW').length / docs.length) * 100);
  });

  readonly confianzaBajaCount = computed(() =>
    this.documentosPeriodo().filter(d => d.confidence != null && d.confidence < 0.8).length
  );

  readonly costoAcumulado = computed(() => {
    const dias = this.contenedores()
      .filter(c => c.nivelRiesgo === 'OVERDUE' && c.horasParaDeadline != null && c.horasParaDeadline < 0)
      .reduce((acc, c) => acc + Math.ceil(Math.abs(c.horasParaDeadline!) / 24), 0);
    return { dias, usd: dias * TARIFA_DIARIA_USD };
  });

  readonly costoDiarioEnJuego = computed(() => {
    const n = this.contenedores().filter(c => c.nivelRiesgo === 'OVERDUE' || c.nivelRiesgo === 'CRITICAL').length;
    return { contenedores: n, usd: n * TARIFA_DIARIA_USD };
  });

  readonly filasAnalistas = computed<AnalystRow[]>(() => {
    const alertas = this.dashboard()?.alertsByAnalyst ?? [];
    const porNombre = new Map<string, AnalystRow>();

    for (const a of alertas) {
      porNombre.set(a.analystName, {
        id: a.analystId,
        nombre: a.analystName,
        contenedores: 0,
        advertencia: 0,
        criticosVencidos: 0,
        alertas: a.generated,
        gestionadasPct: a.generated === 0 ? null : Math.round((a.managed / a.generated) * 100)
      });
    }

    for (const c of this.contenedores()) {
      const nombre = c.asignadoA ?? 'Sin asignar';
      const fila = porNombre.get(nombre) ?? {
        id: null, nombre, contenedores: 0, advertencia: 0, criticosVencidos: 0, alertas: 0, gestionadasPct: null
      };
      fila.contenedores++;
      if (c.nivelRiesgo === 'WARNING') fila.advertencia++;
      if (c.nivelRiesgo === 'CRITICAL' || c.nivelRiesgo === 'OVERDUE') fila.criticosVencidos++;
      porNombre.set(nombre, fila);
    }

    return Array.from(porNombre.values()).sort((a, b) =>
      b.criticosVencidos - a.criticosVencidos || b.advertencia - a.advertencia || a.nombre.localeCompare(b.nombre)
    );
  });

  readonly riskSegments = computed<RiskSegment[]>(() => {
    const data = this.dashboard()?.containersByRisk ?? [];
    const c = this.colores();
    const colorByLevel: Record<string, string> = { OK: c.ok, WARNING: c.warning, CRITICAL: c.critical, OVERDUE: c.overdue };
    const textColor = this.theme.tema() === 'dark' ? '#12181f' : '#ffffff';
    const total = data.reduce((acc, d) => acc + d.count, 0) || 1;

    return data
      .filter(d => d.count > 0)
      .map(d => {
        const pct = (d.count / total) * 100;
        return {
          level: d.riskLevel,
          label: RISK_LABELS[d.riskLevel] ?? d.riskLevel,
          count: d.count,
          pct,
          color: colorByLevel[d.riskLevel] ?? c.primary,
          textColor,
          showLabel: pct >= LABEL_MIN_PCT
        };
      });
  });

  readonly tendenciaChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const nombres = new Set((this.dashboard()?.alertsByAnalyst ?? []).map(a => a.analystName));
    const alertas = this.alertService.alertas().filter(a => !a.analistaAsignado || nombres.has(a.analistaAsignado));
    const c = this.colores();

    const dias: string[] = [];
    const cursor = new Date(this.fromDate());
    cursor.setHours(0, 0, 0, 0);
    const fin = new Date(this.toDate());
    fin.setHours(0, 0, 0, 0);
    while (cursor <= fin) {
      dias.push(this.claveDia(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    const niveles: { nivel: string; color: string }[] = [
      { nivel: 'WARNING', color: c.warning },
      { nivel: 'CRITICAL', color: c.critical },
      { nivel: 'OVERDUE', color: c.overdue }
    ];

    return {
      labels: dias.map(d => `${d.slice(8, 10)}/${d.slice(5, 7)}`),
      datasets: niveles.map(n => ({
        label: RISK_LABELS[n.nivel],
        backgroundColor: n.color,
        borderRadius: 2,
        maxBarThickness: 28,
        data: dias.map(d => alertas.filter(a => a.nivelRiesgo === n.nivel && this.claveDia(new Date(a.createAt)) === d).length)
      }))
    };
  });

  readonly tendenciaChartOptions = computed<ChartConfiguration<'bar'>['options']>(() => {
    const c = this.colores();
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, position: 'bottom', labels: { color: c.text } },
        tooltip: { enabled: true }
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: c.textMuted, maxRotation: 0, autoSkip: true } },
        y: { stacked: true, beginAtZero: true, ticks: { color: c.textMuted, precision: 0 }, grid: { color: c.grid } }
      }
    };
  });

  constructor() {
    effect(() => {
      const jefeId = this.jefeSeleccionado();
      if (jefeId == null) return;

      const desde = this.fromDate();
      const hasta = this.toDate();
      const duracion = hasta.getTime() - desde.getTime();
      const desdeAnterior = new Date(desde.getTime() - duracion);

      this.cargando.set(true);
      this.error.set(null);

      const todos = jefeId === TODOS_LOS_EQUIPOS;

      (todos ? this.teamDashboardService.getDashboardTodos(desde, hasta) : this.teamDashboardService.getDashboard(jefeId, desde, hasta)).subscribe({
        next: data => {
          this.dashboard.set(data);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el dashboard del equipo.');
          this.cargando.set(false);
        }
      });

      (todos ? this.teamDashboardService.getDashboardTodos(desdeAnterior, desde) : this.teamDashboardService.getDashboard(jefeId, desdeAnterior, desde)).subscribe({
        next: data => this.dashboardAnterior.set(data),
        error: () => this.dashboardAnterior.set(null)
      });
    });

    effect(() => {
      const jefeId = this.jefeSeleccionado();
      if (jefeId == null) return;

      this.containerService.listarPorEquipo({ jefeId: jefeId === TODOS_LOS_EQUIPOS ? null : jefeId }).subscribe({
        next: items => this.contenedores.set(items),
        error: () => this.contenedores.set([])
      });

      (jefeId === TODOS_LOS_EQUIPOS ? this.teamDocumentsService.getDocumentsTodos() : this.teamDocumentsService.getDocuments(jefeId)).subscribe({
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

    const jefeIdFromQuery = Number(this.route.snapshot.queryParamMap.get('jefeId'));
    this.jefeSeleccionado.set(TODOS_LOS_EQUIPOS);

    if (jefeIdFromQuery > 0) {
      this.jefeSeleccionado.set(jefeIdFromQuery);
    }
  }

  seleccionarJefe(jefeId: number | null): void {
    this.jefeSeleccionado.set(jefeId);
  }

  seleccionarPreset(dias: 7 | 30 | 90): void {
    this.preset.set(dias);
    this.fromDate.set(this.calcularDesde(dias));
    this.toDate.set(new Date());
  }

  activarRangoCustom(): void {
    this.preset.set('custom');
  }

  onFromDateChange(fecha: Date | null): void {
    if (fecha) this.fromDate.set(fecha);
  }

  onToDateChange(fecha: Date | null): void {
    if (fecha) this.toDate.set(fecha);
  }

  verContenedores(riesgo?: string, analistaId?: number | null): void {
    const queryParams: Record<string, string | number> = {};
    if (riesgo) queryParams['riesgo'] = riesgo;
    if (analistaId != null) queryParams['analistaId'] = analistaId;
    const jefeId = this.jefeSeleccionado();
    if (this.esAdmin() && jefeId != null && jefeId > 0) queryParams['jefeId'] = jefeId;
    this.router.navigate(['/equipo/dashboard'], { queryParams });
  }

  verAlertas(): void {
    this.router.navigate(['/alertas']);
  }

  imprimir(): void {
    window.print();
  }

  exportar(): void {
    const formato = (f: Date) => f.toLocaleDateString('es-CL');
    const comparar = (d: Delta | null) => d?.texto ?? '';

    const resumen = [
      { Indicador: 'Período', Valor: `${formato(this.fromDate())} al ${formato(this.toDate())}`, Comparación: '' },
      { Indicador: 'Contenedores del equipo (hoy)', Valor: this.totalContenedores(), Comparación: '' },
      { Indicador: 'Contenedores en riesgo (%)', Valor: `${this.enRiesgoPct()}%`, Comparación: '' },
      { Indicador: 'Contenedores vencidos (hoy)', Valor: this.vencidos(), Comparación: '' },
      { Indicador: 'Alertas generadas', Valor: this.alertasGeneradas(), Comparación: comparar(this.deltaAlertas()) },
      { Indicador: 'Alertas gestionadas (%)', Valor: this.gestionadasPct() ?? 'Sin datos', Comparación: comparar(this.deltaGestionadas()) },
      { Indicador: 'Tiempo de reacción (alertas críticas)', Valor: this.reaccionLabel(), Comparación: comparar(this.deltaReaccion()) },
      { Indicador: 'Documentos cargados en el período', Valor: this.documentosPeriodo().length, Comparación: '' },
      { Indicador: 'Confianza media de la IA (%)', Valor: this.confianzaMedia() ?? 'Sin datos', Comparación: '' },
      { Indicador: 'Documentos por revisar (%)', Valor: this.porRevisarPct() ?? 'Sin datos', Comparación: '' },
      { Indicador: 'Costo estimado acumulado por vencidos (USD, aproximado)', Valor: this.costoAcumulado().usd, Comparación: `${this.costoAcumulado().dias} días de atraso x USD ${TARIFA_DIARIA_USD} por día (tarifa supuesta)` },
      { Indicador: 'Costo diario estimado en juego (USD, aproximado)', Valor: this.costoDiarioEnJuego().usd, Comparación: `${this.costoDiarioEnJuego().contenedores} contenedores críticos o vencidos x USD ${TARIFA_DIARIA_USD} por día (tarifa supuesta)` }
    ];

    const analistas = this.filasAnalistas().map(f => ({
      Analista: f.nombre,
      Contenedores: f.contenedores,
      'En advertencia': f.advertencia,
      'Críticos y vencidos': f.criticosVencidos,
      'Alertas generadas': f.alertas,
      'Alertas gestionadas (%)': f.gestionadasPct ?? ''
    }));

    exportToExcelHojas('resumen-gestion-equipo', [
      { nombre: 'Resumen', filas: resumen },
      { nombre: 'Desempeño por analista', filas: analistas }
    ]);
  }

  private claveDia(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private calcularDesde(dias: number): Date {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    return fecha;
  }
}
