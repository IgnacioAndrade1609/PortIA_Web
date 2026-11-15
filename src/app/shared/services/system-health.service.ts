import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SystemHealth } from '../models/system-health.model';

@Injectable({ providedIn: 'root' })
export class SystemHealthService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/system-health`;

  getSalud(): Observable<SystemHealth> {
    return this.http.get<SystemHealth>(this.url);
  }
}
