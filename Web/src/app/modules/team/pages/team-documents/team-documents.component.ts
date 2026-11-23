import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../../shared/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TeamDocumentsService } from '../../../../shared/services/team-documents.service';
import { UserDto } from '../../../../shared/models/usuario.model';
import { AnalystDocument } from '../../../../shared/models/analyst-document.model';
import { exportToExcel } from '../../../../shared/utils/excel-export.util';

type FiltroConfianza = 'TODAS' | 'BAJA' | 'MEDIA' | 'ALTA';

@Component({
  selector: 'app-team-documents',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './team-documents.component.html',
  styleUrl: './team-documents.component.css'
})
export class TeamDocumentsComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly teamDocumentsService = inject(TeamDocumentsService);

  readonly columnas = ['tipoDocumento', 'analystName', 'createAt', 'estadoExtraccion', 'confidence', 'containerNumber', 'acciones'];

  readonly esAdmin = computed(() => this.auth.rol() === 'Admin');

  readonly jefes = signal<UserDto[]>([]);
  readonly analistas = signal<UserDto[]>([]);
  readonly documentos = signal<AnalystDocument[]>([]);

  readonly jefeSeleccionado = signal<number | null>(null);
  readonly analistaSeleccionado = signal<number | 'TODOS'>('TODOS');

  readonly draftTipo = signal<string | 'TODOS'>('TODOS');
  readonly draftEstado = signal<string | 'TODOS'>('TODOS');

  private readonly tipoSeleccionado = signal<string | 'TODOS'>('TODOS');
  private readonly estadoSeleccionado = signal<string | 'TODOS'>('TODOS');

  readonly tipos = computed(() =>
    Array.from(new Set(this.documentos().map(d => d.tipoDocumento))).sort()
  );
  readonly estados = computed(() =>
    Array.from(new Set(this.documentos().map(d => d.estadoExtraccion))).sort()
  );

  readonly draftConfianza = signal<FiltroConfianza>('TODAS');
  private readonly confianzaSeleccionada = signal<FiltroConfianza>('TODAS');

  readonly orden = signal<Sort>({ active: 'createAt', direction: 'desc' });

  readonly filtrados = computed(() => {
    const tipo = this.tipoSeleccionado();
    const estado = this.estadoSeleccionado();
    const confianza = this.confianzaSeleccionada();
    const { active, direction } = this.orden();

    const lista = this.documentos().filter(d =>
      (tipo === 'TODOS' || d.tipoDocumento === tipo) &&
      (estado === 'TODOS' || d.estadoExtraccion === estado) &&
      this.coincideConfianza(d.confidence, confianza)
    );

    if (!active || !direction) return lista;
    const factor = direction === 'asc' ? 1 : -1;
    return [...lista].sort((a, b) => this.comparar(a, b, active) * factor);
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
    this.limpiar();
  }

  buscar(): void {
    this.tipoSeleccionado.set(this.draftTipo());
    this.estadoSeleccionado.set(this.draftEstado());
    this.confianzaSeleccionada.set(this.draftConfianza());
  }

  limpiar(): void {
    this.draftTipo.set('TODOS');
    this.draftEstado.set('TODOS');
    this.draftConfianza.set('TODAS');
    this.tipoSeleccionado.set('TODOS');
    this.estadoSeleccionado.set('TODOS');
    this.confianzaSeleccionada.set('TODAS');
  }

  ordenar(sort: Sort): void {
    this.orden.set(sort);
  }

  private coincideConfianza(valor: number | null, filtro: FiltroConfianza): boolean {
    if (filtro === 'TODAS') return true;
    if (valor == null) return false;
    if (filtro === 'BAJA') return valor < 0.8;
    if (filtro === 'MEDIA') return valor >= 0.8 && valor < 0.9;
    return valor >= 0.9;
  }

  private comparar(a: AnalystDocument, b: AnalystDocument, campo: string): number {
    switch (campo) {
      case 'tipoDocumento': return a.tipoDocumento.localeCompare(b.tipoDocumento);
      case 'analystName': return a.analystName.localeCompare(b.analystName);
      case 'createAt': return new Date(a.createAt).getTime() - new Date(b.createAt).getTime();
      case 'estadoExtraccion': return a.estadoExtraccion.localeCompare(b.estadoExtraccion);
      case 'confidence': return (a.confidence ?? -1) - (b.confidence ?? -1);
      case 'containerNumber': return (a.containerNumber ?? '').localeCompare(b.containerNumber ?? '');
      default: return 0;
    }
  }

  etiquetaEstado(estado: string): string {
    switch (estado) {
      case 'OK': return 'OK';
      case 'NEEDS_REVIEW': return 'Por revisar';
      case 'PENDIENTE': return 'Pendiente';
      default: return estado;
    }
  }

  claseConfianza(confidence: number | null): string {
    if (confidence == null) return '';
    if (confidence < 0.8) return 'confianza-baja';
    return '';
  }

  abrirDocumento(url: string): void {
    window.open(url, '_blank', 'noopener');
  }

  exportar(): void {
    const filas = this.filtrados().map(d => ({
      Tipo: d.tipoDocumento,
      Analista: d.analystName,
      'Fecha de carga': new Date(d.createAt).toLocaleString('es-CL'),
      Estado: this.etiquetaEstado(d.estadoExtraccion),
      'Confianza IA': d.confidence != null ? `${Math.round(d.confidence * 100)}%` : '',
      Contenedor: d.containerNumber ?? ''
    }));
    exportToExcel('documentos-equipo', filas);
  }
}
