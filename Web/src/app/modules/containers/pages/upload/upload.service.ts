import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface UploadedDocumentResult {
  fileName: string;
  status: 'PENDIENTE' | 'DUPLICADO' | 'RECHAZADO';
  documentId: number | null;
  reason: string | null;
}

export interface ShipmentCreatedResponse {
  shipmentId: number;
  status: string;
  createdAt: string;
  documents: UploadedDocumentResult[];
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private apiUrl = `${environment.apiUrl}/shipments`;

  constructor(private http: HttpClient) {}

  uploadFiles(archivos: File[]): Observable<HttpEvent<ShipmentCreatedResponse>> {
    const formData = new FormData();

    for (const archivo of archivos) {
      formData.append('files', archivo);
    }

    return this.http.post<ShipmentCreatedResponse>(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}
