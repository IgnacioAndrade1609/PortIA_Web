import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Naviera, NavieraRequest, Terminal } from '../models/catalogo.model';
import { MOCK_TERMINALES } from '../mocks/catalogos.mock';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly navierasUrl = `${environment.apiUrl}/navieras`;

  private readonly navierasSignal = signal<Naviera[]>([]);
  private readonly terminalesSignal = signal<Terminal[]>(MOCK_TERMINALES);

  readonly navieras = this.navierasSignal.asReadonly();
  readonly terminales = this.terminalesSignal.asReadonly();

  cargarNavieras(): Observable<Naviera[]> {
    return this.http.get<Naviera[]>(this.navierasUrl).pipe(
      tap(lista => this.navierasSignal.set(lista))
    );
  }

  crearNaviera(request: NavieraRequest): Observable<Naviera> {
    return this.http.post<Naviera>(this.navierasUrl, request).pipe(
      tap(creada => this.navierasSignal.update(lista => this.ordenar([...lista, creada])))
    );
  }

  actualizarNaviera(id: number, request: NavieraRequest): Observable<Naviera> {
    return this.http.put<Naviera>(`${this.navierasUrl}/${id}`, request).pipe(
      tap(actualizada => this.reemplazarNaviera(actualizada))
    );
  }

  cambiarVigenciaNaviera(id: number, vigente: boolean): Observable<Naviera> {
    return this.http.patch<Naviera>(`${this.navierasUrl}/${id}/vigencia`, { vigente }).pipe(
      tap(actualizada => this.reemplazarNaviera(actualizada))
    );
  }

  alternarVigenciaTerminal(id: number): void {
    this.terminalesSignal.update(lista => lista.map(t => (t.id === id ? { ...t, vigente: !t.vigente } : t)));
  }

  private reemplazarNaviera(actualizada: Naviera): void {
    this.navierasSignal.update(lista =>
      this.ordenar(lista.map(n => (n.id === actualizada.id ? actualizada : n)))
    );
  }

  private ordenar(lista: Naviera[]): Naviera[] {
    return [...lista].sort((a, b) => a.nombreNaviera.localeCompare(b.nombreNaviera));
  }
}
