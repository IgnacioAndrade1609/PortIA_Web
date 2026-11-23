export interface AnalystDocument {
  id: number;
  tipoDocumento: string;
  createAt: string;
  estadoExtraccion: string;
  confidence: number | null;
  analystId: number;
  analystName: string;
  containerId: number | null;
  containerNumber: string | null;
  downloadUrl: string;
}
