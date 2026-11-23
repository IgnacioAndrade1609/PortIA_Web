import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';
import { AlertService } from '../../../../shared/services/alert.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NivelRiesgo } from '../../../../shared/models/riesgo.model';
import { TipoAlerta } from '../../../../shared/models/alerta.model';

type FiltroLeida = 'TODAS' | 'NO_LEIDAS' | 'LEIDAS';

@Component({
  selector: 'app-alerts',
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
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css'
})
export class AlertsComponent {
  private readonly alertService = inject(AlertService);
  private readonly auth = inject(AuthService);

  readonly esAnalista = computed(() => this.auth.rol() === 'Analista');

  readonly columnas = computed(() =>
    this.esAnalista()
      ? ['numeroContainer', 'tipoAlerta', 'nivelRiesgo', 'mensaje', 'createAt', 'leida', 'acciones']
      : ['numeroContainer', 'tipoAlerta', 'nivelRiesgo', 'mensaje', 'createAt', 'leida', 'analistaAsignado']
  );

  private readonly todas = this.alertService.alertas;

  readonly draftBusqueda = signal('');
  readonly draftRiesgo = signal<NivelRiesgo | 'TODOS'>('TODOS');
  readonly draftTipo = signal<TipoAlerta | 'TODOS'>('TODOS');
  readonly draftLeida = signal<FiltroLeida>('TODAS');

  private readonly busqueda = signal('');
  private readonly riesgoSeleccionado = signal<NivelRiesgo | 'TODOS'>('TODOS');
  private readonly tipoSeleccionado = signal<TipoAlerta | 'TODOS'>('TODOS');
  private readonly leidaSeleccionada = signal<FiltroLeida>('TODAS');

  readonly alertas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const riesgo = this.riesgoSeleccionado();
    const tipo = this.tipoSeleccionado();
    const leida = this.leidaSeleccionada();

    return this.todas().filter(a =>
      (!texto || a.numeroContainer.toLowerCase().includes(texto)) &&
      (riesgo === 'TODOS' || a.nivelRiesgo === riesgo) &&
      (tipo === 'TODOS' || a.tipoAlerta === tipo) &&
      (leida === 'TODAS' || (leida === 'LEIDAS' ? a.leida : !a.leida))
    );
  });

  buscar(): void {
    this.busqueda.set(this.draftBusqueda());
    this.riesgoSeleccionado.set(this.draftRiesgo());
    this.tipoSeleccionado.set(this.draftTipo());
    this.leidaSeleccionada.set(this.draftLeida());
  }

  limpiar(): void {
    this.draftBusqueda.set('');
    this.draftRiesgo.set('TODOS');
    this.draftTipo.set('TODOS');
    this.draftLeida.set('TODAS');
    this.busqueda.set('');
    this.riesgoSeleccionado.set('TODOS');
    this.tipoSeleccionado.set('TODOS');
    this.leidaSeleccionada.set('TODAS');
  }

  marcarLeida(id: number): void {
    this.alertService.marcarLeida(id);
  }
}
