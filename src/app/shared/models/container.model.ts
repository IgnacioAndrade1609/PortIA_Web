import { Hito } from './hito.model';
import { NivelRiesgo } from './riesgo.model';

export interface BackendContainer {
  id: number;
  containerNumber: string;
  blNumber: string;
  shippingLine: {
    id: number;
    name: string;
  };
  eta: string | null;
  arrivalDate: string | null;
  pickupDate: string | null;
  demurrageFreeDays: number;
  detentionFreeDays: number;
  demurrageDeadline: string | null;
  detentionDeadline: string | null;
  riskLevel: NivelRiesgo | null;
  hoursToDeadline: number;
  needsReview: boolean;
  managed: boolean;
  portStatus: string | null;
  assignedTo: {
    id: number;
    name: string;
  };
  originTerminal: {
    id: number;
    name: string;
  } | null;
  destinationTerminal: {
    id: number;
    name: string;
  } | null;
}

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