import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ContainerService } from '../../../../shared/services/container.service';
import { UserService } from '../../../../shared/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { TeamDashboardService } from '../../../../shared/services/team-dashboard.service';
import { TeamDashboardResponse } from '../../../../shared/models/team-dashboard.model';
import { UserDto } from '../../../../shared/models/usuario.model';

type Preset = 7 | 30 | 90 | 'custom';

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

const LABEL_MIN_PCT = 8;

@Component({
  selector: 'app-management-panel',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatInputModule,
    BaseChartDirective
  ],
  templateUrl: './management-panel.component.html',
  styleUrl: './management-panel.component.css'
})
export class ManagementPanelComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly containerService = inject(ContainerService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);
  private readonly teamDashboardService = inject(TeamDashboardService);

  readonly esAdmin = computed(() => this.auth.rol() === 'Admin');
  readonly today = new Date();

  readonly jefes = signal<UserDto[]>([]);

  readonly jefeSeleccionado = signal<number | null>(null);

  readonly preset = signal<Preset>(30);
  readonly fromDate = signal<Date>(this.calcularDesde(30));
  readonly toDate = signal<Date>(new Date());

  readonly dashboard = signal<TeamDashboardResponse | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  private readonly colores = computed(() => this.theme.tema() === 'dark' ? COLORS.dark : COLORS.light);

  readonly totalContenedores = computed(() =>
    this.dashboard()?.containersByRisk.reduce((acc, r) => acc + r.count, 0) ?? 0
  );

  readonly reaccionLabel = computed(() => {
    const minutos = this.dashboard()?.avgReactionTimeCriticalMinutes;
    if (minutos == null) return 'Sin datos';
    if (minutos < 60) return `${Math.round(minutos)} min`;
    const horas = Math.floor(minutos / 60);
    const resto = Math.round(minutos % 60);
    return `${horas}h ${resto}m`;
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

  readonly alertsChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const data = this.dashboard()?.alertsByAnalyst ?? [];
    const c = this.colores();

    return {
      labels: data.map(a => a.analystName),
      datasets: [
        {
          label: 'Gestionadas',
          data: data.map(a => a.managed),
          backgroundColor: c.primary,
          borderRadius: 4,
          maxBarThickness: 40
        },
        {
          label: 'Pendientes',
          data: data.map(a => Math.max(0, a.generated - a.managed)),
          backgroundColor: c.pending,
          borderRadius: 4,
          maxBarThickness: 40
        }
      ]
    };
  });

  readonly alertsChartOptions = computed<ChartConfiguration<'bar'>['options']>(() => {
    const opts = this.barOptions(true);
    return {
      ...opts,
      scales: {
        x: { ...opts!.scales!['x'], stacked: true },
        y: { ...opts!.scales!['y'], stacked: true }
      }
    };
  });

  readonly documentsChartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const data = this.dashboard()?.documentsByPeriod ?? [];
    const c = this.colores();

    return {
      labels: data.map(d => this.formatearFechaCorta(d.date)),
      datasets: [{
        label: 'Documentos cargados',
        data: data.map(d => d.count),
        borderColor: c.primary,
        backgroundColor: c.primary,
        pointBackgroundColor: c.primary,
        pointRadius: 4,
        borderWidth: 2,
        tension: 0.25,
        fill: false
      }]
    };
  });

  readonly documentsChartOptions = computed<ChartConfiguration<'line'>['options']>(() => {
    const c = this.colores();
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: c.textMuted } },
        y: {
          beginAtZero: true,
          ticks: { color: c.textMuted, precision: 0 },
          grid: { color: c.grid }
        }
      }
    };
  });

  constructor() {
    effect(() => {
      const jefeId = this.jefeSeleccionado();
      if (jefeId == null) return;

      const desde = this.fromDate();
      const hasta = this.toDate();

      this.cargando.set(true);
      this.error.set(null);

      this.teamDashboardService.getDashboard(jefeId, desde, hasta).subscribe({
        next: data => {
          this.dashboard.set(data);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el dashboard del equipo.');
          this.cargando.set(false);
        }
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

  private calcularDesde(dias: number): Date {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    return fecha;
  }

  private formatearFechaCorta(iso: string): string {
    const [, mes, dia] = iso.split('T')[0].split('-');
    return `${dia}/${mes}`;
  }

  private barOptions(showLegend: boolean): ChartConfiguration<'bar'>['options'] {
    const c = this.colores();
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: true },
      plugins: {
        legend: { display: showLegend, position: 'bottom', labels: { color: c.text } },
        tooltip: { enabled: true }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: c.textMuted } },
        y: {
          beginAtZero: true,
          ticks: { color: c.textMuted, precision: 0 },
          grid: { color: c.grid }
        }
      }
    };
  }
}
