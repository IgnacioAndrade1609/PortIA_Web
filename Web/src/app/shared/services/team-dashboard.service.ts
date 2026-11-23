import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TeamDashboardResponse } from '../models/team-dashboard.model';

@Injectable({ providedIn: 'root' })
export class TeamDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/teams`;

  getDashboard(jefeId: number, fromDate: Date, toDate: Date): Observable<TeamDashboardResponse> {
    return this.http.get<TeamDashboardResponse>(`${this.baseUrl}/${jefeId}/dashboard`, { params: this.rango(fromDate, toDate) });
  }

  getDashboardTodos(fromDate: Date, toDate: Date): Observable<TeamDashboardResponse> {
    return this.http.get<TeamDashboardResponse>(`${this.baseUrl}/all/dashboard`, { params: this.rango(fromDate, toDate) });
  }

  private rango(fromDate: Date, toDate: Date): HttpParams {
    return new HttpParams()
      .set('fromDate', fromDate.toISOString())
      .set('toDate', toDate.toISOString());
  }
}
