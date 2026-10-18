export interface Naviera {
  id: number;
  nombreNaviera: string;
  codigoNaviera: string | null;
  email: string | null;
  telefono: string | null;
  vigente: boolean;
}

export interface Terminal {
  id: number;
  codigoTerminal: string;
  nombreTerminal: string;
  pais: string | null;
  vigente: boolean;
}
