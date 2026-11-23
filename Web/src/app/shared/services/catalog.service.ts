import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Naviera, NavieraRequest, Pais, Terminal, TerminalRequest } from '../models/catalogo.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly navierasUrl = `${environment.apiUrl}/navieras`;
  private readonly terminalesUrl = `${environment.apiUrl}/terminales`;
  private readonly paisesUrl = `${environment.apiUrl}/paises`;

  private readonly navierasSignal = signal<Naviera[]>([]);
  private readonly terminalesSignal = signal<Terminal[]>([]);
  private readonly paisesSignal = signal<Pais[]>([]);

  readonly navieras = this.navierasSignal.asReadonly();
  readonly terminales = this.terminalesSignal.asReadonly();
  readonly paises = this.paisesSignal.asReadonly();

  cargarNavieras(): Observable<Naviera[]> {
    return this.http.get<Naviera[]>(this.navierasUrl).pipe(
      tap(lista => this.navierasSignal.set(lista))
    );
  }

  crearNaviera(request: NavieraRequest): Observable<Naviera> {
    return this.http.post<Naviera>(this.navierasUrl, request).pipe(
      tap(creada => this.navierasSignal.update(lista => this.ordenarNavieras([...lista, creada])))
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

  cargarTerminales(): Observable<Terminal[]> {
    return this.http.get<Terminal[]>(this.terminalesUrl).pipe(
      tap(lista => this.terminalesSignal.set(lista))
    );
  }

  cargarPaises(): Observable<Pais[]> {
    return this.http.get<Pais[]>(this.paisesUrl).pipe(
      tap(lista => this.paisesSignal.set(lista))
    );
  }

  crearTerminal(request: TerminalRequest): Observable<Terminal> {
    return this.http.post<Terminal>(this.terminalesUrl, request).pipe(
      tap(creado => this.terminalesSignal.update(lista => this.ordenarTerminales([...lista, creado])))
    );
  }

  actualizarTerminal(id: number, request: TerminalRequest): Observable<Terminal> {
    return this.http.put<Terminal>(`${this.terminalesUrl}/${id}`, request).pipe(
      tap(actualizado => this.reemplazarTerminal(actualizado))
    );
  }

  cambiarVigenciaTerminal(id: number, vigente: boolean): Observable<Terminal> {
    return this.http.patch<Terminal>(`${this.terminalesUrl}/${id}/vigencia`, { vigente }).pipe(
      tap(actualizado => this.reemplazarTerminal(actualizado))
    );
  }

  private reemplazarNaviera(actualizada: Naviera): void {
    this.navierasSignal.update(lista =>
      this.ordenarNavieras(lista.map(n => (n.id === actualizada.id ? actualizada : n)))
    );
  }

  private reemplazarTerminal(actualizado: Terminal): void {
    this.terminalesSignal.update(lista =>
      this.ordenarTerminales(lista.map(t => (t.id === actualizado.id ? actualizado : t)))
    );
  }

  private ordenarNavieras(lista: Naviera[]): Naviera[] {
    return [...lista].sort((a, b) => a.nombreNaviera.localeCompare(b.nombreNaviera));
  }

  private ordenarTerminales(lista: Terminal[]): Terminal[] {
    return [...lista].sort((a, b) => a.nombreTerminal.localeCompare(b.nombreTerminal));
  }
}
