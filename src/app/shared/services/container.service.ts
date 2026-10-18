import { Injectable, signal } from '@angular/core';
import { ContainerDetail, ContainerListItem } from '../models/container.model';
import { MOCK_CONTAINERS, MOCK_CONTAINER_DETAIL } from '../mocks/containers.mock';

@Injectable({ providedIn: 'root' })
export class ContainerService {
  private readonly listaSignal = signal<ContainerListItem[]>(MOCK_CONTAINERS);
  private readonly detalleSignal = signal<Record<number, ContainerDetail>>(MOCK_CONTAINER_DETAIL);

  readonly lista = this.listaSignal.asReadonly();

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
