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
}
