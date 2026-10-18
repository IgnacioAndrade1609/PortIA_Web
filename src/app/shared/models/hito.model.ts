export type OrigenHito = 'USUARIO' | 'IA' | 'SCRAPER';

export interface Hito {
  id: number;
  descripcion: string;
  origen: OrigenHito;
  fechaOcurrencia: string;
}
