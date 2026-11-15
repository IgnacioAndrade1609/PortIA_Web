import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin, of, switchMap } from 'rxjs';
import { AuditQueryFilter, AuditService } from '../../../../shared/services/audit.service';
import { UserService } from '../../../../shared/services/user.service';
import { ChipComponent } from '../../../../shared/components/chip/chip.component';
import { AuditSummary, LogAuditoria } from '../../../../shared/models/auditoria.model';
import { UserDto } from '../../../../shared/models/usuario.model';
import {
  ETIQUETAS_SENSIBILIDAD,
  EventoAuditoria,
  describirEventoAuditoria
} from '../../../../shared/utils/audit-formatter.util';
import { exportToExcel } from '../../../../shared/utils/excel-export.util';

type Rango = 'HOY' | '7' | '30' | 'MES' | 'PERSONALIZADO' | 'TODO';

const ENTIDADES: { valor: string; etiqueta: string }[] = [
  { valor: 'Container', etiqueta: 'Contenedores' },
  { valor: 'Notificacion', etiqueta: 'Mensajes' },
  { valor: 'Alerta', etiqueta: 'Alertas' },
  { valor: 'Usuario', etiqueta: 'Usuarios' },
  { valor: 'Naviera', etiqueta: 'Navieras' },
  { valor: 'Terminal', etiqueta: 'Terminales' },
  { valor: 'CredencialTerminal', etiqueta: 'Credenciales de terminal' },
  { valor: 'Sesion', etiqueta: 'Inicios de sesión' }
];

const LIMITE_EXPORTACION = 1000;

function inicioDelDia(fecha: Date): Date {
  const copia = new Date(fecha);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function finDelDia(fecha: Date): Date {
  const copia = new Date(fecha);
  copia.setHours(23, 59, 59, 999);
  return copia;
}

function aFechaInput(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

@Component({
  selector: 'app-full-audit',
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
    MatPaginatorModule,
    MatSnackBarModule,
    ChipComponent
  ],
  templateUrl: './full-audit.component.html',
  styleUrl: './full-audit.component.css'
})
export class FullAuditComponent implements OnInit {
  private readonly auditService = inject(AuditService);
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);

  readonly columnas = ['fecha', 'responsable', 'detalle', 'contenedor', 'sensibilidad'];
  readonly entidades = ENTIDADES;
  readonly etiquetasSensibilidad = ETIQUETAS_SENSIBILIDAD;

  readonly usuarios = signal<UserDto[]>([]);
  readonly logs = signal<LogAuditoria[]>([]);
  readonly resumen = signal<AuditSummary | null>(null);
  readonly totalItems = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(25);
  readonly cargando = signal(false);
  readonly expandidos = signal<Set<number>>(new Set());

  readonly responsableId = signal<number | null>(null);
  readonly origen = signal<'TODOS' | 'USUARIO' | 'SISTEMA'>('TODOS');
  readonly entidad = signal<string | 'TODAS'>('TODAS');
  readonly accion = signal<string | 'TODAS'>('TODAS');
  readonly contenedor = signal('');
  readonly soloSensibles = signal(false);
  readonly rango = signal<Rango>('7');
  readonly desde = signal('');
  readonly hasta = signal('');

  readonly eventos = computed<EventoAuditoria[]>(() =>
    this.logs().map(log => describirEventoAuditoria(log, new Map(), { terceraPersona: true }))
  );

  ngOnInit(): void {
    this.userService.getUsers({ pageSize: 1000 }).subscribe({
      next: resultado => this.usuarios.set(resultado.items)
    });
    this.aplicarRango('7');
  }

  aplicarRango(rango: Rango): void {
    this.rango.set(rango);
    const hoy = new Date();

    if (rango === 'TODO') {
      this.desde.set('');
      this.hasta.set('');
    } else if (rango === 'HOY') {
      this.desde.set(aFechaInput(hoy));
      this.hasta.set(aFechaInput(hoy));
    } else if (rango === '7' || rango === '30') {
      const inicio = new Date(hoy);
      inicio.setDate(inicio.getDate() - Number(rango));
      this.desde.set(aFechaInput(inicio));
      this.hasta.set(aFechaInput(hoy));
    } else if (rango === 'MES') {
      this.desde.set(aFechaInput(new Date(hoy.getFullYear(), hoy.getMonth(), 1)));
      this.hasta.set(aFechaInput(hoy));
    }

    this.recargar();
  }

  cambiarFecha(campo: 'desde' | 'hasta', valor: string): void {
    (campo === 'desde' ? this.desde : this.hasta).set(valor);
    this.rango.set('PERSONALIZADO');
    this.recargar();
  }

  recargar(): void {
    this.pageIndex.set(0);
    this.cargar();
  }

  limpiar(): void {
    this.responsableId.set(null);
    this.origen.set('TODOS');
    this.entidad.set('TODAS');
    this.accion.set('TODAS');
    this.contenedor.set('');
    this.soloSensibles.set(false);
    this.aplicarRango('7');
  }

  filtrarPorUsuario(id: number | null): void {
    if (id == null) return;
    this.responsableId.set(id);
    this.recargar();
  }

  filtrarPorContenedor(numero: string | null): void {
    if (!numero) return;
    this.contenedor.set(numero);
    this.recargar();
  }

  filtrarSensibles(): void {
    this.soloSensibles.set(true);
    this.recargar();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.cargar();
  }

  alternarTecnico(id: number): void {
    this.expandidos.update(actual => {
      const copia = new Set(actual);
      if (copia.has(id)) copia.delete(id);
      else copia.add(id);
      return copia;
    });
  }

  copiar(texto: string): void {
    navigator.clipboard?.writeText(texto).then(
      () => this.snackBar.open('Copiado al portapapeles.', 'Cerrar', { duration: 2000 }),
      () => this.snackBar.open('No se pudo copiar.', 'Cerrar', { duration: 2500 })
    );
  }

  exportar(): void {
    const filtro = this.filtro();
    const paginas = Math.ceil(LIMITE_EXPORTACION / 200);

    this.auditService.getLogs({ ...filtro, page: 1, pageSize: 200 }).pipe(
      switchMap(primera => {
        const totalPaginas = Math.min(primera.totalPages, paginas);
        const restantes = Array.from({ length: Math.max(0, totalPaginas - 1) }, (_, i) =>
          this.auditService.getLogs({ ...filtro, page: i + 2, pageSize: 200 })
        );
        return restantes.length > 0 ? forkJoin([of(primera), ...restantes]) : of([primera]);
      })
    ).subscribe({
      next: paginasResultado => {
        const items = paginasResultado.flatMap(p => p.items);
        const filas = items.map(log => {
          const e = describirEventoAuditoria(log, new Map(), { terceraPersona: true });
          return {
            Fecha: new Date(e.fecha).toLocaleString('es-CL'),
            Responsable: e.responsableNombre ?? 'Sistema',
            Origen: e.origen === 'SISTEMA' ? 'Sistema' : 'Persona',
            Evento: e.titulo,
            Cambios: e.cambios.map(c => `${c.campo}: ${c.antes} -> ${c.despues}`).join(' | '),
            Contenedor: e.contenedorNumero ?? '',
            Sensibilidad: e.sensibilidadEtiqueta ?? '',
            'JSON anterior': log.valoresAnteriores ?? '',
            'JSON nuevo': log.valoresNuevos ?? ''
          };
        });
        exportToExcel('auditoria', filas);
        const total = paginasResultado[0]?.totalItems ?? items.length;
        if (total > items.length) {
          this.snackBar.open(`Se exportaron los ${items.length} más recientes de ${total}.`, 'Cerrar', { duration: 5000 });
        }
      },
      error: () => this.snackBar.open('No se pudo exportar la auditoría.', 'Cerrar', { duration: 4000 })
    });
  }

  private filtro(): AuditQueryFilter {
    const desde = this.desde();
    const hasta = this.hasta();
    const origen = this.origen();

    return {
      responsableId: this.responsableId(),
      origen: origen === 'TODOS' ? null : origen,
      nombreEntidad: this.entidad() === 'TODAS' ? null : this.entidad(),
      accion: this.accion() === 'TODAS' ? null : this.accion(),
      containerNumber: this.contenedor().trim() || null,
      soloSensibles: this.soloSensibles(),
      fromDate: desde ? inicioDelDia(new Date(desde + 'T00:00:00')).toISOString() : null,
      toDate: hasta ? finDelDia(new Date(hasta + 'T00:00:00')).toISOString() : null
    };
  }

  private cargar(): void {
    const filtro = this.filtro();
    this.cargando.set(true);

    this.auditService.getLogs({ ...filtro, page: this.pageIndex() + 1, pageSize: this.pageSize() }).subscribe({
      next: resultado => {
        this.logs.set(resultado.items);
        this.totalItems.set(resultado.totalItems);
        this.cargando.set(false);
      },
      error: () => {
        this.logs.set([]);
        this.totalItems.set(0);
        this.cargando.set(false);
      }
    });

    this.auditService.getSummary(filtro).subscribe({
      next: resumen => this.resumen.set(resumen),
      error: () => this.resumen.set(null)
    });
  }
}
