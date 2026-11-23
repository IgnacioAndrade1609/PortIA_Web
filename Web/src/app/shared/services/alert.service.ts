import { Injectable, inject, signal, effect, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { Alerta } from '../models/alerta.model';
import { AuthService } from '../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly apiUrl = `${environment.apiUrl}/alerts`;
  private readonly hubUrl = `${environment.apiUrl.replace('/api/v1', '')}/hubs/alerts`;

  private readonly alertasSignal = signal<Alerta[]>([]);
  readonly alertas = this.alertasSignal.asReadonly();
  readonly noLeidas = computed(() => this.alertasSignal().filter(a => !a.leida).length);

  private connection: signalR.HubConnection | null = null;

  constructor() {
    effect(() => {
      const token = this.auth.token();
      if (token) {
        this.cargarAlertas();
        this.conectar(token);
      } else {
        this.desconectar();
        this.alertasSignal.set([]);
      }
    });
  }

  cargarAlertas(): void {
    this.http.get<Alerta[]>(this.apiUrl).subscribe({
      next: (alertas) => this.alertasSignal.set(alertas),
      error: (err) => console.error('Error al cargar alertas desde la API:', err)
    });
  }

  marcarLeida(id: number): void {
    this.http.put<void>(`${this.apiUrl}/${id}/leida`, {}).subscribe({
      next: () => this.alertasSignal.update(lista => lista.map(a => (a.id === id ? { ...a, leida: true } : a))),
      error: (err) => console.error('Error al marcar la alerta como leída:', err)
    });
  }

  private conectar(token: string): void {
    if (this.connection) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    this.connection.on('alertaCreada', (alerta: Alerta) => {
      this.alertasSignal.update(lista => [alerta, ...lista]);
      this.mostrarToast(alerta);
    });

    this.connection.start().catch(err => console.error('Error al conectar con el hub de alertas:', err));
  }

  private desconectar(): void {
    this.connection?.stop();
    this.connection = null;
  }

  private mostrarToast(alerta: Alerta): void {
    const ref = this.snackBar.open(alerta.mensaje, 'Ver', { duration: 8000, panelClass: 'alert-toast' });
    ref.onAction().subscribe(() => this.router.navigate(['/contenedores', alerta.containerId]));
  }
}
