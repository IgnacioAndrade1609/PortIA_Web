import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';
import { NivelRiesgo } from '../../../../shared/models/riesgo.model';
import { ContainerService } from '../../../../shared/services/container.service';
import { exportToExcel } from '../../../../shared/utils/excel-export.util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RiskBadgeComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private readonly containerService = inject(ContainerService);
  private readonly router = inject(Router);

  private readonly todos = this.containerService.lista;

  readonly draftBusqueda = signal('');
  readonly draftRiesgo = signal<NivelRiesgo | 'TODOS'>('TODOS');
  readonly draftNaviera = signal<string | 'TODAS'>('TODAS');

  private readonly busqueda = signal('');
  private readonly riesgoSeleccionado = signal<NivelRiesgo | 'TODOS'>('TODOS');
  private readonly navieraSeleccionada = signal<string | 'TODAS'>('TODAS');

  readonly idSeleccionado = signal<number | null>(null);

  readonly columnas = ['numeroContainer', 'naviera', 'puertoDestino', 'eta', 'nivelRiesgo'];

  readonly navieras = computed(() => {
    const unicas = new Set(this.todos().map(c => c.naviera).filter((n): n is string => !!n));
    return Array.from(unicas);
  });

  readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const riesgo = this.riesgoSeleccionado();
    const naviera = this.navieraSeleccionada();

    return this.todos().filter(c => {
      const coincideTexto = !texto || c.numeroContainer.toLowerCase().includes(texto);
      const coincideRiesgo = riesgo === 'TODOS' || c.nivelRiesgo === riesgo;
      const coincideNaviera = naviera === 'TODAS' || c.naviera === naviera;
      return coincideTexto && coincideRiesgo && coincideNaviera;
    });
  });

  buscar(): void {
    this.busqueda.set(this.draftBusqueda());
    this.riesgoSeleccionado.set(this.draftRiesgo());
    this.navieraSeleccionada.set(this.draftNaviera());
    this.idSeleccionado.set(null);
  }

  limpiar(): void {
    this.draftBusqueda.set('');
    this.draftRiesgo.set('TODOS');
    this.draftNaviera.set('TODAS');
    this.busqueda.set('');
    this.riesgoSeleccionado.set('TODOS');
    this.navieraSeleccionada.set('TODAS');
    this.idSeleccionado.set(null);
  }

  toggleSeleccion(id: number): void {
    this.idSeleccionado.set(this.idSeleccionado() === id ? null : id);
  }

  verDetalle(): void {
    if (this.idSeleccionado() !== null) this.irADetalle(this.idSeleccionado()!);
  }

  irADetalle(id: number): void {
    this.router.navigate(['/contenedores', id]);
  }

  exportar(): void {
    const filas = this.filtrados().map(c => ({
      'N° Contenedor': c.numeroContainer,
      Naviera: c.naviera ?? '',
      'Puerto destino': c.puertoDestino ?? '',
      ETA: c.eta ? new Date(c.eta).toLocaleDateString('es-CL') : '',
      Riesgo: c.nivelRiesgo
    }));
    exportToExcel('mis-contenedores', filas);
  }
}
