import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuditService } from '../../../../shared/services/audit.service';
import { ContainerService } from '../../../../shared/services/container.service';
import { ChipComponent } from '../../../../shared/components/chip/chip.component';
import { LogAuditoria } from '../../../../shared/models/auditoria.model';
import {
  CategoriaAuditoria,
  EventoAuditoria,
  OrigenAuditoria,
  describirEventoAuditoria
} from '../../../../shared/utils/audit-formatter.util';

@Component({
  selector: 'app-my-audit',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ChipComponent
  ],
  templateUrl: './my-audit.component.html',
  styleUrl: './my-audit.component.css'
})
export class MyAuditComponent implements OnInit {
  private readonly auditService = inject(AuditService);
  private readonly containerService = inject(ContainerService);

  readonly columnas = ['fecha', 'contenedor', 'detalle', 'origen'];
  readonly logs = signal<LogAuditoria[]>([]);
  readonly expandidos = signal<Set<number>>(new Set());

  readonly busqueda = signal('');
  readonly origen = signal<OrigenAuditoria | 'TODOS'>('TODOS');
  readonly categoria = signal<CategoriaAuditoria | 'TODAS'>('TODAS');
  readonly desde = signal('');
  readonly hasta = signal('');
  readonly mostrarConsultas = signal(false);

  private readonly numeroPorContenedor = computed(() =>
    new Map(this.containerService.lista().map(c => [c.id, c.numeroContainer] as [number, string]))
  );

  readonly eventos = computed<EventoAuditoria[]>(() =>
    this.logs().map(log => describirEventoAuditoria(log, this.numeroPorContenedor()))
  );

  readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const origen = this.origen();
    const categoria = this.categoria();
    const desde = this.desde() ? new Date(this.desde() + 'T00:00:00').getTime() : null;
    const hasta = this.hasta() ? new Date(this.hasta() + 'T23:59:59').getTime() : null;
    const consultas = this.mostrarConsultas();

    return this.eventos().filter(e => {
      const t = new Date(e.fecha).getTime();
      return (
        (consultas || e.categoria !== 'CONSULTA') &&
        (origen === 'TODOS' || e.origen === origen) &&
        (categoria === 'TODAS' || e.categoria === categoria) &&
        (!desde || t >= desde) &&
        (!hasta || t <= hasta) &&
        (!texto || (e.contenedorNumero ?? '').toLowerCase().includes(texto) || e.titulo.toLowerCase().includes(texto))
      );
    });
  });

  ngOnInit(): void {
    this.auditService.getLogs({ pageSize: 200 }).subscribe({
      next: resultado => this.logs.set(resultado.items)
    });
  }

  limpiar(): void {
    this.busqueda.set('');
    this.origen.set('TODOS');
    this.categoria.set('TODAS');
    this.desde.set('');
    this.hasta.set('');
    this.mostrarConsultas.set(false);
  }

  alternarTecnico(id: number): void {
    this.expandidos.update(actual => {
      const copia = new Set(actual);
      if (copia.has(id)) copia.delete(id);
      else copia.add(id);
      return copia;
    });
  }
}
