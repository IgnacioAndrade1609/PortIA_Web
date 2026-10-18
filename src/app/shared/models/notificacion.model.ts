export type EstadoNotificacion = 'PENDIENTE_APROBACION' | 'APROBADA' | 'RECHAZADA' | 'ENVIADA';

export interface BorradorCorreo {
  idAlerta: number;
  numeroContainer: string;
  destinatario: string;
  asunto: string;
  contenido: string;
  estado: EstadoNotificacion;
}
