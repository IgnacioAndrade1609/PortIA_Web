import { Alerta } from '../models/alerta.model';

export const MOCK_ALERTAS: Alerta[] = [
  {
    id: 1,
    containerId: 2,
    numeroContainer: 'MAEU7654321',
    tipoAlerta: 'DEMURRAGE',
    nivelRiesgo: 'CRITICAL',
    mensaje: 'Quedan menos de 48 h para el deadline de demurrage del contenedor MAEU7654321.',
    leida: false,
    createAt: '2026-10-17T07:00:00Z',
    analistaAsignado: 'Camila Rojas'
  },
  {
    id: 2,
    containerId: 3,
    numeroContainer: 'CMAU4455667',
    tipoAlerta: 'DEMURRAGE',
    nivelRiesgo: 'OVERDUE',
    mensaje: 'El deadline de demurrage del contenedor CMAU4455667 ya venció sin retiro registrado.',
    leida: false,
    createAt: '2026-10-14T00:05:00Z',
    analistaAsignado: 'Diego Fuentes'
  },
  {
    id: 3,
    containerId: 4,
    numeroContainer: 'HLXU9988776',
    tipoAlerta: 'DETENTION',
    nivelRiesgo: 'WARNING',
    mensaje: 'El contenedor HLXU9988776 entra en ventana de riesgo de detention en los próximos días.',
    leida: true,
    createAt: '2026-10-17T07:00:00Z',
    analistaAsignado: 'Javiera Contreras'
  }
];
