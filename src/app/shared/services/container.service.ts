import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BackendContainer, ContainerDetail, ContainerListItem } from '../models/container.model';
import { Hito } from '../models/hito.model';

@Injectable({ providedIn: 'root' })
export class ContainerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/containers`;

  private readonly listaSignal = signal<ContainerListItem[]>([]);

  readonly lista = this.listaSignal.asReadonly();

  constructor() {
    this.cargarContenedores();
  }

  cargarContenedores(): void {
    this.http.get<BackendContainer[]>(this.apiUrl).pipe(
      tap(data => {
        const contenedoresMapeados: ContainerListItem[] = data.map(c => ({
          id: c.id,
          numeroContainer: c.containerNumber,
          naviera: c.shippingLine?.name && c.shippingLine.name !== 'N/A' ? c.shippingLine.name : null,
          puertoDestino: c.destinationTerminal?.name ?? null,
          eta: c.eta,
          deadlineDemurrage: c.demurrageDeadline,
          deadlineDetention: c.detentionDeadline,
          nivelRiesgo: c.riskLevel ?? 'OK',
          asignadoA: c.assignedTo?.name
        }));

        this.listaSignal.set(contenedoresMapeados);
      })
    ).subscribe({
      error: (err) => console.error('Error al cargar contenedores desde la API:', err)
    });
  }

  listarCompleto(): Observable<BackendContainer[]> {
    return this.http.get<BackendContainer[]>(this.apiUrl);
  }

  getDetalle(id: number): Observable<ContainerDetail | undefined> {
    return forkJoin({
      contenedores: this.http.get<BackendContainer[]>(this.apiUrl),
      hitos: this.http.get<Hito[]>(`${this.apiUrl}/${id}/hitos`)
    }).pipe(
      map(({ contenedores, hitos }) => {
        const c = contenedores.find(item => item.id === id);
        if (!c) return undefined;

        const detalle: ContainerDetail = {
          id: c.id,
          numeroContainer: c.containerNumber,
          naviera: c.shippingLine?.name && c.shippingLine.name !== 'N/A' ? c.shippingLine.name : null,
          puertoDestino: c.destinationTerminal?.name ?? null,
          numeroBl: c.blNumber,
          nombreForwarder: c.forwarderName,
          terminalOrigen: c.originTerminal?.name ?? null,
          terminalLlegada: c.destinationTerminal?.name ?? null,
          eta: c.eta,
          diasLibresDemurrage: c.demurrageFreeDays,
          diasLibresDetention: c.detentionFreeDays,
          fechaArriboReal: c.arrivalDate,
          fechaRetiroContainer: c.pickupDate,
          estadoPuerto: c.portStatus,
          deadlineDemurrage: c.demurrageDeadline,
          deadlineDetention: c.detentionDeadline,
          nivelRiesgo: c.riskLevel ?? 'OK',
          hitos
        };

        return detalle;
      })
    );
  }

  marcarRetiro(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/retiro`, {});
  }

  marcarDevolucionVacia(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/devolucion-vacio`, {});
  }

  confirmarArriboReal(id: number, fechaArriboReal: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/arribo-real`, { fechaArriboReal });
  }

  actualizarDiasLibres(id: number, demurrageFreeDays: number, detentionFreeDays: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/dias-libres`, { demurrageFreeDays, detentionFreeDays });
  }

  actualizarDatosExtraidos(id: number, cambios: {
    naviera?: string;
    terminalOrigen?: string;
    terminalLlegada?: string;
    numeroBl?: string;
    nombreForwarder?: string;
    eta?: string;
  }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/datos-extraidos`, cambios);
  }
}
