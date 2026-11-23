import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditSummary, LogAuditoria } from '../models/auditoria.model';
import { PagedResult } from '../models/usuario.model';

export interface AuditQueryFilter {
  responsableId?: number | null;
  nombreEntidad?: string | null;
  accion?: string | null;
  origen?: string | null;
  containerNumber?: string | null;
  soloSensibles?: boolean;
  fromDate?: string | null;
  toDate?: string | null;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/audit`;

  getLogs(filter: AuditQueryFilter = {}): Observable<PagedResult<LogAuditoria>> {
    let params = this.filtros(filter)
      .set('page', filter.page ?? 1)
      .set('pageSize', filter.pageSize ?? 50);

    return this.http.get<PagedResult<LogAuditoria>>(this.url, { params });
  }

  getSummary(filter: AuditQueryFilter = {}): Observable<AuditSummary> {
    return this.http.get<AuditSummary>(`${this.url}/summary`, { params: this.filtros(filter) });
  }

  private filtros(filter: AuditQueryFilter): HttpParams {
    let params = new HttpParams();

    if (filter.responsableId != null) params = params.set('responsableId', filter.responsableId);
    if (filter.nombreEntidad) params = params.set('nombreEntidad', filter.nombreEntidad);
    if (filter.accion) params = params.set('accion', filter.accion);
    if (filter.origen) params = params.set('origen', filter.origen);
    if (filter.containerNumber) params = params.set('containerNumber', filter.containerNumber);
    if (filter.soloSensibles) params = params.set('soloSensibles', true);
    if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter.toDate) params = params.set('toDate', filter.toDate);

    return params;
  }
}
