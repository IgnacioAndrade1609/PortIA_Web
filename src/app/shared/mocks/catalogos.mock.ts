import { Naviera, Terminal } from '../models/catalogo.model';

export const MOCK_NAVIERAS: Naviera[] = [
  { id: 1, nombreNaviera: 'MSC', codigoNaviera: 'MSC', email: 'contacto@msc.com', telefono: '+56 2 2345 6789', vigente: true },
  { id: 2, nombreNaviera: 'Maersk', codigoNaviera: 'MAEU', email: 'contacto@maersk.com', telefono: '+56 2 2345 1234', vigente: true },
  { id: 3, nombreNaviera: 'CMA CGM', codigoNaviera: 'CMAU', email: 'contacto@cma-cgm.com', telefono: '+56 2 2345 5678', vigente: true },
  { id: 4, nombreNaviera: 'Hapag-Lloyd', codigoNaviera: 'HLXU', email: 'contacto@hapag-lloyd.com', telefono: '+56 2 2345 8765', vigente: true },
  { id: 5, nombreNaviera: 'COSCO', codigoNaviera: 'COSU', email: 'contacto@cosco.com', telefono: '+56 2 2345 4321', vigente: false }
];

export const MOCK_TERMINALES: Terminal[] = [
  { id: 1, codigoTerminal: 'STI', nombreTerminal: 'San Antonio Terminal Internacional', pais: 'Chile', vigente: true },
  { id: 2, codigoTerminal: 'TPS', nombreTerminal: 'Terminal Pacífico Sur Valparaíso', pais: 'Chile', vigente: true },
  { id: 3, codigoTerminal: 'DPW', nombreTerminal: 'DP World San Antonio', pais: 'Chile', vigente: true }
];
