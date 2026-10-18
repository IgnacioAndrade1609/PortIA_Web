import { Usuario } from '../models/usuario.model';

export interface MockCredential {
  email: string;
  password: string;
  usuario: Usuario;
}

export const MOCK_CREDENTIALS: MockCredential[] = [
  {
    email: 'analista@portia.cl',
    password: 'portia123',
    usuario: { id: 1, nombreUsuario: 'Camila Rojas', email: 'analista@portia.cl', rol: 'Analista' }
  },
  {
    email: 'jefe@portia.cl',
    password: 'portia123',
    usuario: { id: 2, nombreUsuario: 'Felipe Soto', email: 'jefe@portia.cl', rol: 'Jefe' }
  },
  {
    email: 'admin@portia.cl',
    password: 'portia123',
    usuario: { id: 3, nombreUsuario: 'Valentina Muñoz', email: 'admin@portia.cl', rol: 'Admin' }
  }
];

export const MOCK_ANALISTAS_EQUIPO: Usuario[] = [
  { id: 1, nombreUsuario: 'Camila Rojas', email: 'analista@portia.cl', rol: 'Analista' },
  { id: 4, nombreUsuario: 'Diego Fuentes', email: 'diego.fuentes@portia.cl', rol: 'Analista' },
  { id: 5, nombreUsuario: 'Javiera Contreras', email: 'javiera.contreras@portia.cl', rol: 'Analista' }
];
