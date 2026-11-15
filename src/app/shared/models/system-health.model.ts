export interface SystemHealth {
  contenedoresSinAsignar: number;
  contenedoresConAnalistaInactivo: number;
  documentosPorRevisar: number;
  documentosPendientesAtascados: number;
  cargasConError: number;
  cargasAtascadas: number;
  notificacionesFallidas7Dias: number;
  alertasSinLeerMas24Horas: number;
  generadoEn: string;
}
