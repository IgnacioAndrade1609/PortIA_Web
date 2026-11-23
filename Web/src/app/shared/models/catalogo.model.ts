export interface Naviera {
  id: number;
  nombreNaviera: string;
  codigoNaviera: string | null;
  email: string | null;
  telefono: string | null;
  vigente: boolean;
}

export interface NavieraRequest {
  nombreNaviera: string;
  codigoNaviera: string | null;
  email: string | null;
  telefono: string | null;
}

export interface Terminal {
  id: number;
  codigoTerminal: string;
  nombreTerminal: string;
  idPais: number | null;
  pais: string | null;
  configScraper: string | null;
  vigente: boolean;
}

export interface TerminalRequest {
  codigoTerminal: string;
  nombreTerminal: string;
  idPais: number | null;
  configScraper: string | null;
}

export interface Pais {
  id: number;
  nombrePais: string;
}
