export type EstadoCarga = 'PENDIENTE' | 'PROCESANDO' | 'COMPLETO' | 'ERROR';
export type EstadoExtraccion = 'PENDIENTE' | 'COMPLETO' | 'NEEDS_REVIEW' | 'ERROR';

export interface ShipmentUploadResponse {
  idCargaDocumentos: number;
  status: EstadoCarga;
}

export interface DatosExtraidos {
  numeroContainer: string;
  naviera: string;
  puertoDestino: string;
  numeroBl: string;
  nombreForwarder: string;
  eta: string;
  diasLibresDemurrage: number;
  diasLibresDetention: number;
}

export interface DocumentoExtraido {
  idDocumento: number;
  idCargaDocumentos: number;
  estadoExtraccion: EstadoExtraccion;
  confidence: number;
  datos: DatosExtraidos;
}
