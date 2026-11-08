import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BackendPendingDocument, DatosExtraidos, DocumentoExtraido } from '../models/documento.model';

interface ValidateDocumentResponse {
  containerId: number;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/documents`;

  private readonly pendientesSignal = signal<DocumentoExtraido[]>([]);
  readonly pendientesDeRevision = this.pendientesSignal.asReadonly();

  cargarPendientes(): void {
    this.http.get<BackendPendingDocument[]>(`${this.apiUrl}/pendientes-revision`).subscribe({
      next: (documentos) => this.pendientesSignal.set(documentos.map(toDocumentoExtraido)),
      error: (err) => console.error('Error al cargar documentos pendientes de revisión:', err)
    });
  }

  confirmar(idDocumento: number, datos: DatosExtraidos): Observable<ValidateDocumentResponse> {
    const body = {
      containerNumber: datos.numeroContainer,
      blNumber: datos.numeroBl || null,
      shippingLine: datos.naviera || null,
      portOfDestination: datos.puertoDestino || null,
      eta: datos.eta ? new Date(datos.eta).toISOString() : null,
      demurrageFreeDays: datos.diasLibresDemurrage,
      detentionFreeDays: datos.diasLibresDetention,
      forwarderName: datos.nombreForwarder || null
    };

    return this.http.put<ValidateDocumentResponse>(`${this.apiUrl}/${idDocumento}/validacion`, body).pipe(
      tap(() => this.pendientesSignal.update(lista => lista.filter(doc => doc.idDocumento !== idDocumento)))
    );
  }
}

function toDocumentoExtraido(d: BackendPendingDocument): DocumentoExtraido {
  return {
    idDocumento: d.documentId,
    idCargaDocumentos: d.shipmentId,
    estadoExtraccion: 'PENDIENTE_REVISION',
    confidence: d.confidence,
    datos: {
      numeroContainer: d.containerNumberSugerido ?? '',
      naviera: d.shippingLineSugerido ?? '',
      puertoDestino: d.portOfDestinationSugerido ?? '',
      numeroBl: d.blNumberSugerido ?? '',
      nombreForwarder: d.forwarderNameSugerido ?? '',
      eta: d.etaSugerido ?? '',
      diasLibresDemurrage: d.demurrageFreeDaysSugerido ?? 0,
      diasLibresDetention: d.detentionFreeDaysSugerido ?? 0
    }
  };
}
