import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { BackendContainer, ContainerDetail, ContainerListItem } from '../models/container.model';
import { MOCK_CONTAINER_DETAIL } from '../mocks/containers.mock';

@Injectable({ providedIn: 'root' })
export class ContainerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5146/api/v1/containers';

  private readonly listaSignal = signal<ContainerListItem[]>([]);
  private readonly detalleSignal = signal<Record<number, ContainerDetail>>(MOCK_CONTAINER_DETAIL);

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

  getById(id: number): ContainerDetail | undefined {
    return this.detalleSignal()[id];
  }

  updateFreeDays(id: number, diasLibresDemurrage: number, diasLibresDetention: number): ContainerDetail | undefined {
    const actual = this.detalleSignal()[id];
    if (!actual) return undefined;

    const actualizado: ContainerDetail = { ...actual, diasLibresDemurrage, diasLibresDetention };
    this.detalleSignal.update(detalles => ({ ...detalles, [id]: actualizado }));
    return actualizado;
  }
}