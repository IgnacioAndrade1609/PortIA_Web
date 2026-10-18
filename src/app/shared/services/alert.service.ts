import { Injectable, signal } from '@angular/core';
import { Alerta } from '../models/alerta.model';
import { MOCK_ALERTAS } from '../mocks/alertas.mock';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly alertasSignal = signal<Alerta[]>(MOCK_ALERTAS);

  readonly alertas = this.alertasSignal.asReadonly();

  marcarLeida(id: number): void {
    this.alertasSignal.update(lista =>
      lista.map(a => (a.id === id ? { ...a, leida: true } : a))
    );
  }
}
