import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Observable, catchError, concat, concatMap, firstValueFrom, from, map, of, tap, toArray } from 'rxjs';
import { ContainerService } from '../../../../shared/services/container.service';
import { BackendContainer } from '../../../../shared/models/container.model';
import { exportToExcel, parseExcelFile } from '../../../../shared/utils/excel-export.util';

type EstadoUi = 'IDLE' | 'PROCESANDO' | 'COMPLETO';
type EstadoCampo = 'OK' | 'ERROR' | 'SIN_CAMBIOS';

interface ResultadoCampo {
  campo: string;
  estado: EstadoCampo;
  detalle?: string;
}

interface ResultadoFila {
  numeroContainer: string;
  campos: ResultadoCampo[];
}

const COL_ID = 'ID';
const COL_NUMERO = 'N° Contenedor';
const COL_NAVIERA = 'Naviera';
const COL_TERM_ORIGEN = 'Terminal origen';
const COL_TERM_LLEGADA = 'Terminal llegada';
const COL_BL = 'N° BL';
const COL_FORWARDER = 'Forwarder';
const COL_ETA = 'Llegada estimada (dd-mm-aaaa)';
const COL_DEMURRAGE = 'Días libres demurrage';
const COL_DETENTION = 'Días libres detention';
const COL_ARRIBO = 'Fecha arribo real (dd-mm-aaaa)';
const COL_RETIRADO = 'Retirado (SI/NO)';
const COL_DEVUELTO = 'Devuelto vacío (SI/NO)';
const COL_RIESGO_RO = 'Riesgo (NO EDITAR - solo referencia)';
const COL_DEADLINE_DEM_RO = 'Deadline demurrage (NO EDITAR - solo referencia)';
const COL_DEADLINE_DET_RO = 'Deadline detention (NO EDITAR - solo referencia)';
const COL_ESTADO_PUERTO_RO = 'Estado puerto (NO EDITAR - solo referencia)';
const ESTADO_DEVUELTO_VACIO = 'DEVUELTO_VACIO';

@Component({
  selector: 'app-bulk-edit',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, MatDialogModule],
  templateUrl: './bulk-edit.component.html',
  styleUrl: './bulk-edit.component.css'
})
export class BulkEditComponent {
  private readonly containerService = inject(ContainerService);
  private readonly dialogRef = inject(MatDialogRef<BulkEditComponent>, { optional: true });

  readonly estado = signal<EstadoUi>('IDLE');
  readonly error = signal<string | null>(null);
  readonly progreso = signal(0);
  readonly resultados = signal<ResultadoFila[]>([]);

  private originales: BackendContainer[] = [];

  descargarPlantilla(): void {
    this.error.set(null);
    this.containerService.listarCompleto().subscribe({
      next: (contenedores) => {
        const filas = contenedores.map(c => ({
          [COL_ID]: c.id,
          [COL_NUMERO]: c.containerNumber,
          [COL_NAVIERA]: c.shippingLine?.name && c.shippingLine.name !== 'N/A' ? c.shippingLine.name : '',
          [COL_TERM_ORIGEN]: c.originTerminal?.name ?? '',
          [COL_TERM_LLEGADA]: c.destinationTerminal?.name ?? '',
          [COL_BL]: c.blNumber ?? '',
          [COL_FORWARDER]: c.forwarderName ?? '',
          [COL_ETA]: c.eta ? this.aFechaTexto(c.eta) : '',
          [COL_DEMURRAGE]: c.demurrageFreeDays,
          [COL_DETENTION]: c.detentionFreeDays,
          [COL_ARRIBO]: c.arrivalDate ? this.aFechaTexto(c.arrivalDate) : '',
          [COL_RETIRADO]: c.pickupDate ? 'SI' : 'NO',
          [COL_DEVUELTO]: c.estado === ESTADO_DEVUELTO_VACIO ? 'SI' : 'NO',
          [COL_RIESGO_RO]: c.riskLevel ?? '',
          [COL_DEADLINE_DEM_RO]: c.demurrageDeadline ? this.aFechaTexto(c.demurrageDeadline) : '',
          [COL_DEADLINE_DET_RO]: c.detentionDeadline ? this.aFechaTexto(c.detentionDeadline) : '',
          [COL_ESTADO_PUERTO_RO]: c.portStatus ?? ''
        }));
        exportToExcel('plantilla-edicion-masiva', filas);
      },
      error: () => this.error.set('No se pudo generar la plantilla.')
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    const archivo = (event.target as HTMLInputElement).files?.[0];
    if (!archivo) return;

    this.error.set(null);

    let filas: Record<string, string>[];
    try {
      [filas, this.originales] = await Promise.all([
        parseExcelFile(archivo),
        firstValueFrom(this.containerService.listarCompleto())
      ]);
    } catch {
      this.error.set('No se pudo leer el archivo. Verifica que sea la plantilla exportada desde aquí.');
      return;
    }

    this.procesarFilas(filas.filter(f => f[COL_ID]));
  }

  reiniciar(): void {
    this.estado.set('IDLE');
    this.progreso.set(0);
    this.resultados.set([]);
    this.error.set(null);
  }

  cerrar(): void {
    this.dialogRef?.close(this.estado() === 'COMPLETO');
  }

  private procesarFilas(filas: Record<string, string>[]): void {
    if (filas.length === 0) {
      this.error.set('El archivo no tiene filas válidas (falta la columna ID).');
      return;
    }

    this.estado.set('PROCESANDO');
    this.progreso.set(0);
    this.resultados.set([]);

    from(filas).pipe(
      concatMap((fila, index) => this.procesarFila(fila).pipe(
        tap(() => this.progreso.set(Math.round(((index + 1) / filas.length) * 100)))
      )),
      toArray()
    ).subscribe(resultados => {
      this.resultados.set(resultados);
      this.estado.set('COMPLETO');
    });
  }

  private procesarFila(fila: Record<string, string>): Observable<ResultadoFila> {
    const id = Number(fila[COL_ID]);
    const original = this.originales.find(c => c.id === id);
    const numeroContainer = fila[COL_NUMERO] || original?.containerNumber || `#${id}`;

    if (!original) {
      return of({
        numeroContainer,
        campos: [{ campo: 'General', estado: 'ERROR' as const, detalle: 'No se encontró el contenedor (¿se editó la columna ID?).' }]
      });
    }

    const acciones: Observable<ResultadoCampo>[] = [];

    const cambiosMetadata: Record<string, string> = {};

    const navieraTexto = (fila[COL_NAVIERA] || '').trim();
    const navieraOriginal = original.shippingLine?.name && original.shippingLine.name !== 'N/A' ? original.shippingLine.name : '';
    if (navieraTexto && navieraTexto !== navieraOriginal) cambiosMetadata['naviera'] = navieraTexto;

    const terminalOrigenTexto = (fila[COL_TERM_ORIGEN] || '').trim();
    if (terminalOrigenTexto && terminalOrigenTexto !== (original.originTerminal?.name ?? '')) {
      cambiosMetadata['terminalOrigen'] = terminalOrigenTexto;
    }

    const terminalLlegadaTexto = (fila[COL_TERM_LLEGADA] || '').trim();
    if (terminalLlegadaTexto && terminalLlegadaTexto !== (original.destinationTerminal?.name ?? '')) {
      cambiosMetadata['terminalLlegada'] = terminalLlegadaTexto;
    }

    const blTexto = (fila[COL_BL] || '').trim();
    if (blTexto && blTexto !== (original.blNumber ?? '')) cambiosMetadata['numeroBl'] = blTexto;

    const forwarderTexto = (fila[COL_FORWARDER] || '').trim();
    if (forwarderTexto && forwarderTexto !== (original.forwarderName ?? '')) cambiosMetadata['nombreForwarder'] = forwarderTexto;

    const etaTexto = (fila[COL_ETA] || '').trim();
    const etaOriginalTexto = original.eta ? this.aFechaTexto(original.eta) : '';
    if (etaTexto && etaTexto !== etaOriginalTexto) {
      const etaIso = this.aFechaIso(etaTexto);
      if (etaIso) {
        cambiosMetadata['eta'] = etaIso;
      } else {
        acciones.push(of({ campo: 'Llegada estimada', estado: 'ERROR' as const, detalle: `Fecha inválida: "${etaTexto}" (usa dd-mm-aaaa).` }));
      }
    }

    if (Object.keys(cambiosMetadata).length > 0) {
      acciones.push(this.ejecutarCampo('Datos extraídos', this.containerService.actualizarDatosExtraidos(id, cambiosMetadata)));
    }

    const demurrageNuevo = this.aNumero(fila[COL_DEMURRAGE]);
    const detentionNuevo = this.aNumero(fila[COL_DETENTION]);
    if (
      demurrageNuevo !== null && detentionNuevo !== null &&
      (demurrageNuevo !== original.demurrageFreeDays || detentionNuevo !== original.detentionFreeDays)
    ) {
      acciones.push(this.ejecutarCampo('Días libres', this.containerService.actualizarDiasLibres(id, demurrageNuevo, detentionNuevo)));
    }

    const arriboTexto = (fila[COL_ARRIBO] || '').trim();
    const arriboOriginalTexto = original.arrivalDate ? this.aFechaTexto(original.arrivalDate) : '';
    if (arriboTexto && arriboTexto !== arriboOriginalTexto) {
      const fechaIso = this.aFechaIso(arriboTexto);
      if (fechaIso) {
        acciones.push(this.ejecutarCampo('Arribo real', this.containerService.confirmarArriboReal(id, fechaIso)));
      } else {
        acciones.push(of({ campo: 'Arribo real', estado: 'ERROR' as const, detalle: `Fecha inválida: "${arriboTexto}" (usa dd-mm-aaaa).` }));
      }
    }

    const retiradoNuevo = this.aSiNo(fila[COL_RETIRADO]);
    if (retiradoNuevo && !original.pickupDate) {
      acciones.push(this.ejecutarCampo('Retiro', this.containerService.marcarRetiro(id)));
    }

    const devueltoNuevo = this.aSiNo(fila[COL_DEVUELTO]);
    if (devueltoNuevo && original.estado !== ESTADO_DEVUELTO_VACIO) {
      acciones.push(this.ejecutarCampo('Devolución vacía', this.containerService.marcarDevolucionVacia(id)));
    }

    if (acciones.length === 0) {
      return of({ numeroContainer, campos: [{ campo: 'General', estado: 'SIN_CAMBIOS' as const }] });
    }

    return concat(...acciones).pipe(
      toArray(),
      map(campos => ({ numeroContainer, campos }))
    );
  }

  private ejecutarCampo(campo: string, accion: Observable<void>): Observable<ResultadoCampo> {
    return accion.pipe(
      map(() => ({ campo, estado: 'OK' as const })),
      catchError(err => of({ campo, estado: 'ERROR' as const, detalle: err?.error?.detail ?? 'Error al aplicar el cambio.' }))
    );
  }

  private aNumero(valor: string | undefined): number | null {
    if (valor === undefined || valor === '') return null;
    const n = Number(valor);
    return Number.isFinite(n) ? n : null;
  }

  private aSiNo(valor: string | undefined): boolean {
    return (valor ?? '').trim().toUpperCase().startsWith('S');
  }

  private aFechaTexto(iso: string): string {
    const d = new Date(iso);
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  private aFechaIso(texto: string): string | null {
    const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(texto);
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    const fecha = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
    return Number.isNaN(fecha.getTime()) ? null : fecha.toISOString();
  }
}
