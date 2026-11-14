import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LogAuditoria } from '../models/auditoria.model';
import { PagedResult } from '../models/usuario.model';

export interface AuditQueryFilter {
  responsableId?: number | null;
  nombreEntidad?: string | null;
  accion?: string | null;
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
    let params = new HttpParams()
      .set('page', filter.page ?? 1)
      .set('pageSize', filter.pageSize ?? 50);

    if (filter.responsableId != null) params = params.set('responsableId', filter.responsableId);
    if (filter.nombreEntidad) params = params.set('nombreEntidad', filter.nombreEntidad);
    if (filter.accion) params = params.set('accion', filter.accion);
    if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter.toDate) params = params.set('toDate', filter.toDate);

    return this.http.get<PagedResult<LogAuditoria>>(this.url, { params });
  }
}
