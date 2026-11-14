export type CanalNotificacion = 'EMAIL' | 'TELEGRAM';

export type EstadoNotificacion = 'PENDIENTE_APROBACION' | 'APROBADA' | 'RECHAZADA' | 'ENVIADA';

export interface BorradorCorreo {
  idLogNotificacion: number;
  idAlerta: number;
  numeroContainer: string;
  canal: CanalNotificacion;
  destinatario: string;
  asunto: string;
  contenido: string;
  estado: EstadoNotificacion;
  createAt: string;
}
