import { BorradorCorreo } from '../models/notificacion.model';

export const MOCK_BORRADORES: BorradorCorreo[] = [
  {
    idLogNotificacion: 1,
    idAlerta: 1,
    numeroContainer: 'MAEU7654321',
    canal: 'EMAIL',
    destinatario: 'agente.aduana@transportespacifico.cl',
    asunto: 'Solicitud de extensión de días libres — Contenedor MAEU7654321',
    contenido:
      'Estimado agente de aduana,\n\nSolicitamos evaluar la extensión de días libres de demurrage para el contenedor MAEU7654321, considerando que se encuentra a menos de 48 horas del deadline.\n\nQuedamos atentos.\n\nSaludos,\nEquipo PortIA',
    estado: 'PENDIENTE_APROBACION',
    createAt: '2026-11-13T09:30:00-03:00'
  },
  {
    idLogNotificacion: 2,
    idAlerta: 2,
    numeroContainer: 'MSKU1234567',
    canal: 'EMAIL',
    destinatario: 'canje@forwarderandes.cl',
    asunto: 'Canje de documentos — Contenedor MSKU1234567',
    contenido:
      'Estimado equipo,\n\nSolicitamos coordinar el canje de documentos del contenedor MSKU1234567, cuyo arribo está próximo.\n\nAgradecemos confirmar disponibilidad.\n\nSaludos,\nEquipo PortIA',
    estado: 'PENDIENTE_APROBACION',
    createAt: '2026-11-13T14:10:00-03:00'
  },
  {
    idLogNotificacion: 3,
    idAlerta: 3,
    numeroContainer: 'TGHU9876543',
    canal: 'EMAIL',
    destinatario: 'agente.aduana@transportespacifico.cl',
    asunto: 'Solicitud de extensión de días libres — Contenedor TGHU9876543',
    contenido:
      'Estimado agente de aduana,\n\nSolicitamos evaluar la extensión de días libres de detention para el contenedor TGHU9876543.\n\nQuedamos atentos.\n\nSaludos,\nEquipo PortIA',
    estado: 'PENDIENTE_APROBACION',
    createAt: '2026-11-14T08:05:00-03:00'
  }
];
