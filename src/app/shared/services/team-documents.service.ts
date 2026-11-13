import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnalystDocument } from '../models/analyst-document.model';

export interface TeamDocumentsFilter {
  analystId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class TeamDocumentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/teams`;

  getDocuments(jefeId: number, filter: TeamDocumentsFilter = {}): Observable<AnalystDocument[]> {
    let params = new HttpParams();
    if (filter.analystId != null) params = params.set('analystId', filter.analystId);

    return this.http.get<AnalystDocument[]>(`${this.baseUrl}/${jefeId}/documents`, { params });
  }
}
