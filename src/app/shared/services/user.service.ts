import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateUserRequest, PagedResult, RoleDto, UserDto } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly usersUrl = `${environment.apiUrl}/users`;
  private readonly rolesUrl = `${environment.apiUrl}/roles`;

  getUsers(): Observable<PagedResult<UserDto>> {
    return this.http.get<PagedResult<UserDto>>(this.usersUrl, {
      params: { page: 1, pageSize: 100 }
    });
  }

  getRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(this.rolesUrl);
  }

  create(request: CreateUserRequest): Observable<UserDto> {
    return this.http.post<UserDto>(this.usersUrl, request);
  }

  updateStatus(id: number, active: boolean): Observable<UserDto> {
    return this.http.patch<UserDto>(`${this.usersUrl}/${id}/status`, { active });
  }
}
