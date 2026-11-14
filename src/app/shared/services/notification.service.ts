import { Injectable, computed, signal } from '@angular/core';
import { BorradorCorreo } from '../models/notificacion.model';
import { MOCK_BORRADORES } from '../mocks/notificaciones.mock';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly borradoresSignal = signal<BorradorCorreo[]>(MOCK_BORRADORES);

  readonly borradores = this.borradoresSignal.asReadonly();

  readonly pendientes = computed(() =>
    this.borradoresSignal().filter(b => b.estado === 'PENDIENTE_APROBACION')
  );

  obtenerPorId(idLogNotificacion: number): BorradorCorreo | undefined {
    return this.borradoresSignal().find(b => b.idLogNotificacion === idLogNotificacion);
  }

  guardarBorrador(idLogNotificacion: number, asunto: string, contenido: string): void {
    this.borradoresSignal.update(lista =>
      lista.map(b => (b.idLogNotificacion === idLogNotificacion ? { ...b, asunto, contenido } : b))
    );
  }

  enviar(idLogNotificacion: number, asunto: string, contenido: string): void {
    this.borradoresSignal.update(lista =>
      lista.map(b =>
        b.idLogNotificacion === idLogNotificacion ? { ...b, asunto, contenido, estado: 'ENVIADA' } : b
      )
    );
  }
}
