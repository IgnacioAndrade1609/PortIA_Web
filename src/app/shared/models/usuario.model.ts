export type RolUsuario = 'Analista' | 'Jefe' | 'Admin';

export interface Usuario {
  id: number;
  nombreUsuario: string;
  email: string;
  rol: RolUsuario;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginApiResponse {
  token: string;
  expiresAt: string;
  usuarioId: number;
  nombreUsuario: string;
  email: string;
  rol: RolUsuario;
}

export interface RoleSummary {
  id: number;
  name: string;
}

export interface RoleDto {
  id: number;
  name: string;
  active: boolean;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: RoleSummary;
  active: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  nombreUsuario: string;
  email: string;
  password: string;
  rolId: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
