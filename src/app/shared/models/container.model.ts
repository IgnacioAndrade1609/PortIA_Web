import { Hito } from './hito.model';
import { NivelRiesgo } from './riesgo.model';

export interface ContainerListItem {
  id: number;
  numeroContainer: string;
  naviera: string | null;
  puertoDestino: string | null;
  eta: string | null;
  deadlineDemurrage: string | null;
  deadlineDetention: string | null;
  nivelRiesgo: NivelRiesgo;
  asignadoA?: string;
}

export interface ContainerDetail {
  id: number;
  numeroContainer: string;
  naviera: string | null;
  puertoDestino: string | null;
  numeroBl: string | null;
  nombreForwarder: string | null;
  terminalOrigen: string | null;
  terminalLlegada: string | null;
  eta: string | null;
  diasLibresDemurrage: number;
  diasLibresDetention: number;
  fechaArriboReal: string | null;
  fechaRetiroContainer: string | null;
  estadoPuerto: string | null;
  deadlineDemurrage: string | null;
  deadlineDetention: string | null;
  nivelRiesgo: NivelRiesgo;
  hitos: Hito[];
  documentoUrl?: string;
}

export interface UpdateFreeDays {
  diasLibresDemurrage: number;
  diasLibresDetention: number;
}
