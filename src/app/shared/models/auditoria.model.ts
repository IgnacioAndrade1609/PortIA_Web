export type AccionAuditoria = 'CREAR' | 'ACTUALIZAR' | 'LEER';

export interface LogAuditoria {
  id: number;
  nombreEntidad: string;
  idEntidad: number;
  accion: AccionAuditoria;
  responsable: string | null;
  valoresAnteriores: Record<string, unknown> | null;
  valoresNuevos: Record<string, unknown> | null;
  createAt: string;
}
