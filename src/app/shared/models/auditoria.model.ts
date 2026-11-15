export type AccionAuditoria = 'CREAR' | 'ACTUALIZAR' | 'LEER';

export interface LogAuditoria {
  id: number;
  createAt: string;
  nombreEntidad: string;
  idEntidad: number;
  accion: AccionAuditoria;
  responsableId: number | null;
  responsableNombre: string | null;
  valoresAnteriores: string | null;
  valoresNuevos: string | null;
  contenedorId: number | null;
  contenedorNumero: string | null;
  sensibilidad: string | null;
}

export interface AuditSensitiveCount {
  tipo: string;
  cantidad: number;
}

export interface AuditSummary {
  totalEventos: number;
  usuariosActivos: number;
  eventosDeSistema: number;
  accionesSensibles: number;
  sensiblesPorTipo: AuditSensitiveCount[];
  resultadoTruncado: boolean;
}
