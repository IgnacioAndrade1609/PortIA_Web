export type EstadoCarga = 'PENDIENTE' | 'PROCESANDO' | 'COMPLETO' | 'ERROR';
export type EstadoExtraccion = 'PENDIENTE' | 'COMPLETO' | 'PENDIENTE_REVISION' | 'VALIDADO' | 'ERROR';

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
  confidence: number | null;
  datos: DatosExtraidos;
}

export interface BackendPendingDocument {
  documentId: number;
  shipmentId: number;
  confidence: number | null;
  containerNumberSugerido: string | null;
  blNumberSugerido: string | null;
  shippingLineSugerido: string | null;
  portOfDestinationSugerido: string | null;
  etaSugerido: string | null;
  demurrageFreeDaysSugerido: number | null;
  detentionFreeDaysSugerido: number | null;
  forwarderNameSugerido: string | null;
  createAt: string;
}
