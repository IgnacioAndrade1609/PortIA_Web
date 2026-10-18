import { LogAuditoria } from '../models/auditoria.model';

export const MOCK_AUDITORIA: LogAuditoria[] = [
  {
    id: 1,
    nombreEntidad: 'CONTAINER',
    idEntidad: 1,
    accion: 'ACTUALIZAR',
    responsable: 'Camila Rojas',
    valoresAnteriores: { diasLibresDemurrage: 5 },
    valoresNuevos: { diasLibresDemurrage: 7 },
    createAt: '2026-10-15T15:20:00Z'
  },
  {
    id: 2,
    nombreEntidad: 'CONTAINER',
    idEntidad: 3,
    accion: 'CREAR',
    responsable: 'Diego Fuentes',
    valoresAnteriores: null,
    valoresNuevos: { numeroContainer: 'CMAU4455667' },
    createAt: '2026-09-28T09:00:00Z'
  },
  {
    id: 3,
    nombreEntidad: 'LOG_NOTIFICACION',
    idEntidad: 1,
    accion: 'ACTUALIZAR',
    responsable: 'Camila Rojas',
    valoresAnteriores: { estado: 'PENDIENTE_APROBACION' },
    valoresNuevos: { estado: 'APROBADA' },
    createAt: '2026-10-17T08:10:00Z'
  },
  {
    id: 4,
    nombreEntidad: 'USUARIO',
    idEntidad: 5,
    accion: 'CREAR',
    responsable: 'Valentina Muñoz',
    valoresAnteriores: null,
    valoresNuevos: { email: 'javiera.contreras@portia.cl', rol: 'Analista' },
    createAt: '2026-09-01T10:00:00Z'
  }
];
