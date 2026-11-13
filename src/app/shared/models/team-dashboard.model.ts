import { NivelRiesgo } from './riesgo.model';

export interface ContainersByRisk {
  riskLevel: NivelRiesgo;
  count: number;
}

export interface AlertsByAnalyst {
  analystId: number;
  analystName: string;
  generated: number;
  managed: number;
}

export interface DocumentsByDay {
  date: string;
  count: number;
}

export interface TeamDashboardResponse {
  fromDate: string;
  toDate: string;
  containersByRisk: ContainersByRisk[];
  alertsByAnalyst: AlertsByAnalyst[];
  avgReactionTimeCriticalMinutes: number | null;
  documentsByPeriod: DocumentsByDay[];
}
