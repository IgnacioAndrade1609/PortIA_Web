import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateUserRequest, PagedResult, RoleDto, UserDto } from '../models/usuario.model';

export interface UserQueryFilter {
  search?: string | null;
  roleId?: number | null;
  jefeId?: number | null;
  active?: boolean | null;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly usersUrl = `${environment.apiUrl}/users`;
  private readonly rolesUrl = `${environment.apiUrl}/roles`;

  getUsers(filter: UserQueryFilter = {}): Observable<PagedResult<UserDto>> {
    let params = new HttpParams()
      .set('page', filter.page ?? 1)
      .set('pageSize', filter.pageSize ?? 100);

    if (filter.search) params = params.set('search', filter.search);
    if (filter.roleId != null) params = params.set('roleId', filter.roleId);
    if (filter.jefeId != null) params = params.set('jefeId', filter.jefeId);
    if (filter.active != null) params = params.set('active', filter.active);

    return this.http.get<PagedResult<UserDto>>(this.usersUrl, { params });
  }

  getRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(this.rolesUrl);
  }

  create(request: CreateUserRequest): Observable<UserDto> {
    return this.http.post<UserDto>(this.usersUrl, request);
  }

  update(id: number, request: { name: string; email: string }): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.usersUrl}/${id}`, request);
  }

  // Envía { roleId } exactamente como lo espera el endpoint /api/v1/users/{id}/role
  updateRole(id: number, roleId: number): Observable<any> {
    return this.http.put(`${this.usersUrl}/${id}/role`, { roleId });
  }

  updateStatus(id: number, active: boolean): Observable<UserDto> {
    return this.http.patch<UserDto>(`${this.usersUrl}/${id}/status`, { active });
  }

  updateSupervisor(id: number, jefeId: number | null): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.usersUrl}/${id}/supervisor`, { jefeId });
  }
}