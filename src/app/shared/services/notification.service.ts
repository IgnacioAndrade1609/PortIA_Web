import { Injectable, signal } from '@angular/core';
import { BorradorCorreo } from '../models/notificacion.model';
import { MOCK_BORRADORES } from '../mocks/notificaciones.mock';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly borradoresSignal = signal<BorradorCorreo[]>(MOCK_BORRADORES);

  readonly borradores = this.borradoresSignal.asReadonly();

  actualizarContenido(idAlerta: number, asunto: string, contenido: string): void {
    this.borradoresSignal.update(lista =>
      lista.map(b => (b.idAlerta === idAlerta ? { ...b, asunto, contenido } : b))
    );
  }

  aprobar(idAlerta: number): void {
    this.cambiarEstado(idAlerta, 'APROBADA');
  }

  rechazar(idAlerta: number): void {
    this.cambiarEstado(idAlerta, 'RECHAZADA');
  }

  private cambiarEstado(idAlerta: number, estado: BorradorCorreo['estado']): void {
    this.borradoresSignal.update(lista =>
      lista.map(b => (b.idAlerta === idAlerta ? { ...b, estado } : b))
    );
  }
}
