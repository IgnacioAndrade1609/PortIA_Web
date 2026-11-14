import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlertaPendiente, NotificationDetail, SendNotificationRequest } from '../models/notificacion.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  private readonly pendientesSignal = signal<AlertaPendiente[]>([]);
  readonly pendientes = this.pendientesSignal.asReadonly();


  cargarPendientes(): void {
    this.http.get<AlertaPendiente[]>(`${this.apiUrl}/alertas/mias`).subscribe({
      next: (datos) => this.pendientesSignal.set(datos),
      error: (err) => console.error('Error al cargar alertas pendientes de notificación:', err)
    });
  }


  obtenerDetalle(alertaId: number, canalId: number = 1): Observable<NotificationDetail> {
    return this.http.get<NotificationDetail>(`${this.apiUrl}/${alertaId}`, {
      params: { canalId: canalId.toString() }
    });
  }


  enviar(alertaId: number, request: SendNotificationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${alertaId}/send`, request).pipe(
      tap(() => {
        this.pendientesSignal.update(lista =>
          lista.filter(p => !(p.alertaId === alertaId && p.canalId === request.canalId))
        );
      })
    );
  }
}