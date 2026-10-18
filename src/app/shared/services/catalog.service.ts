import { Injectable, signal } from '@angular/core';
import { Naviera, Terminal } from '../models/catalogo.model';
import { MOCK_NAVIERAS, MOCK_TERMINALES } from '../mocks/catalogos.mock';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly navierasSignal = signal<Naviera[]>(MOCK_NAVIERAS);
  private readonly terminalesSignal = signal<Terminal[]>(MOCK_TERMINALES);

  readonly navieras = this.navierasSignal.asReadonly();
  readonly terminales = this.terminalesSignal.asReadonly();

  alternarVigenciaNaviera(id: number): void {
    this.navierasSignal.update(lista => lista.map(n => (n.id === id ? { ...n, vigente: !n.vigente } : n)));
  }

  alternarVigenciaTerminal(id: number): void {
    this.terminalesSignal.update(lista => lista.map(t => (t.id === id ? { ...t, vigente: !t.vigente } : t)));
  }

  crearNaviera(nombreNaviera: string, codigoNaviera: string): void {
    this.navierasSignal.update(lista => [
      ...lista,
      { id: Math.max(0, ...lista.map(n => n.id)) + 1, nombreNaviera, codigoNaviera, email: null, telefono: null, vigente: true }
    ]);
  }
}
