import { DocumentoExtraido } from '../models/documento.model';

export const MOCK_DOCUMENTOS_REVISION: DocumentoExtraido[] = [
  {
    idDocumento: 5,
    idCargaDocumentos: 5,
    estadoExtraccion: 'NEEDS_REVIEW',
    confidence: 0.62,
    datos: {
      numeroContainer: 'COSU3322110',
      naviera: 'COSCO',
      puertoDestino: 'Puerto del Callao',
      numeroBl: 'BL-COS-00789',
      nombreForwarder: 'Andes Forwarding Ltda.',
      eta: '2026-10-25T00:00:00Z',
      diasLibresDemurrage: 5,
      diasLibresDetention: 4
    }
  }
];
