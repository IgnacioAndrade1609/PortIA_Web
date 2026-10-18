import { Injectable, signal } from '@angular/core';
import { DocumentoExtraido } from '../models/documento.model';
import { MOCK_DOCUMENTOS_REVISION } from '../mocks/documentos.mock';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly pendientesSignal = signal<DocumentoExtraido[]>(MOCK_DOCUMENTOS_REVISION);

  readonly pendientesDeRevision = this.pendientesSignal.asReadonly();

  confirmar(idDocumento: number): void {
    this.pendientesSignal.update(lista => lista.filter(doc => doc.idDocumento !== idDocumento));
  }
}
