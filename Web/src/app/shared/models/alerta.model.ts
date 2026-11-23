import { NivelRiesgo } from './riesgo.model';

export type TipoAlerta = 'DEMURRAGE' | 'DETENTION';

export interface Alerta {
  id: number;
  containerId: number;
  numeroContainer: string;
  tipoAlerta: TipoAlerta;
  nivelRiesgo: NivelRiesgo;
  mensaje: string;
  leida: boolean;
  createAt: string;
  analistaAsignado?: string;
}
