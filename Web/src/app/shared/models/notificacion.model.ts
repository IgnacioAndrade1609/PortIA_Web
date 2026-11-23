export interface AlertaPendiente {
  alertaId: number;
  containerId: number;
  numeroContainer: string;
  canalId: number;
  canal: string; // 'EMAIL' | 'TELEGRAM'
  tipoAlerta: string;
  nivelRiesgo: string;
  asunto: string;
  destinatario: string;
  fechaAlerta: string;
}

export interface NotificationDetail {
  alertaId: number;
  containerId: number;
  contenedor: string;
  tipoCanal: number;
  nombreCanal: string;
  asunto: string;
  destinatario: string;
  mensaje: string;
}

export interface SendNotificationRequest {
  canalId: number;
  mensaje: string;
  destinatario?: string;
  asunto?: string;
}