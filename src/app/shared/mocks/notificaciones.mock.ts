import { BorradorCorreo } from '../models/notificacion.model';

export const MOCK_BORRADORES: BorradorCorreo[] = [
  {
    idAlerta: 1,
    numeroContainer: 'MAEU7654321',
    destinatario: 'agente.aduana@transportespacifico.cl',
    asunto: 'Solicitud de extensión de días libres — Contenedor MAEU7654321',
    contenido:
      'Estimado agente de aduana,\n\nSolicitamos evaluar la extensión de días libres de demurrage para el contenedor MAEU7654321, considerando que se encuentra a menos de 48 horas del deadline.\n\nQuedamos atentos.\n\nSaludos,\nEquipo PortIA',
    estado: 'PENDIENTE_APROBACION'
  }
];
