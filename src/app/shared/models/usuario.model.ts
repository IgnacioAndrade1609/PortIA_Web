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

export interface LoginResponse {
  token: string;
  nombreUsuario: string;
  rol: RolUsuario;
  expiraEn: string;
}
