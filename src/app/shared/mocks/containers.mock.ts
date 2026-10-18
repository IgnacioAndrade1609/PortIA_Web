import { ContainerDetail, ContainerListItem } from '../models/container.model';

export const MOCK_CONTAINERS: ContainerListItem[] = [
  {
    id: 1,
    numeroContainer: 'MSCU1234567',
    naviera: 'MSC',
    puertoDestino: 'Puerto de Valparaíso',
    eta: '2026-10-20T10:00:00Z',
    deadlineDemurrage: '2026-11-05T00:00:00Z',
    deadlineDetention: '2026-11-10T00:00:00Z',
    nivelRiesgo: 'OK',
    asignadoA: 'Camila Rojas'
  },
  {
    id: 2,
    numeroContainer: 'MAEU7654321',
    naviera: 'Maersk',
    puertoDestino: 'Puerto de San Antonio',
    eta: '2026-10-16T08:00:00Z',
    deadlineDemurrage: '2026-10-19T12:00:00Z',
    deadlineDetention: '2026-10-21T12:00:00Z',
    nivelRiesgo: 'CRITICAL',
    asignadoA: 'Camila Rojas'
  },
  {
    id: 3,
    numeroContainer: 'CMAU4455667',
    naviera: 'CMA CGM',
    puertoDestino: 'Puerto del Callao',
    eta: '2026-10-10T08:00:00Z',
    deadlineDemurrage: '2026-10-14T00:00:00Z',
    deadlineDetention: '2026-10-16T00:00:00Z',
    nivelRiesgo: 'OVERDUE',
    asignadoA: 'Diego Fuentes'
  },
  {
    id: 4,
    numeroContainer: 'HLXU9988776',
    naviera: 'Hapag-Lloyd',
    puertoDestino: 'Puerto de Valparaíso',
    eta: '2026-10-18T08:00:00Z',
    deadlineDemurrage: '2026-10-22T00:00:00Z',
    deadlineDetention: '2026-10-24T00:00:00Z',
    nivelRiesgo: 'WARNING',
    asignadoA: 'Javiera Contreras'
  }
];

export const MOCK_CONTAINER_DETAIL: Record<number, ContainerDetail> = {
  1: {
    id: 1,
    numeroContainer: 'MSCU1234567',
    naviera: 'MSC',
    puertoDestino: 'Puerto de Valparaíso',
    numeroBl: 'BL-MSC-00123',
    nombreForwarder: 'Agencia Andes Logística',
    terminalOrigen: 'Shanghai',
    terminalLlegada: 'STI',
    eta: '2026-10-20T10:00:00Z',
    diasLibresDemurrage: 7,
    diasLibresDetention: 5,
    fechaArriboReal: null,
    fechaRetiroContainer: null,
    estadoPuerto: 'En tránsito',
    deadlineDemurrage: '2026-11-05T00:00:00Z',
    deadlineDetention: '2026-11-10T00:00:00Z',
    nivelRiesgo: 'OK',
    documentoUrl: 'https://storage.portia.cl/mock/bl-msc-00123.pdf',
    hitos: [
      { id: 1, descripcion: 'Documento BL cargado y validado', origen: 'USUARIO', fechaOcurrencia: '2026-10-05T09:00:00Z' },
      { id: 2, descripcion: 'Extracción de datos completada por IA', origen: 'IA', fechaOcurrencia: '2026-10-05T09:02:00Z' }
    ]
  },
  2: {
    id: 2,
    numeroContainer: 'MAEU7654321',
    naviera: 'Maersk',
    puertoDestino: 'Puerto de San Antonio',
    numeroBl: 'BL-MAE-00987',
    nombreForwarder: 'Transportes del Pacífico',
    terminalOrigen: 'Busan',
    terminalLlegada: 'TPS',
    eta: '2026-10-16T08:00:00Z',
    diasLibresDemurrage: 3,
    diasLibresDetention: 3,
    fechaArriboReal: '2026-10-16T11:30:00Z',
    fechaRetiroContainer: null,
    estadoPuerto: 'En puerto',
    deadlineDemurrage: '2026-10-19T12:00:00Z',
    deadlineDetention: '2026-10-21T12:00:00Z',
    nivelRiesgo: 'CRITICAL',
    documentoUrl: 'https://storage.portia.cl/mock/bl-mae-00987.pdf',
    hitos: [
      { id: 3, descripcion: 'Documento BL cargado y validado', origen: 'USUARIO', fechaOcurrencia: '2026-10-02T09:00:00Z' },
      { id: 4, descripcion: 'Arribo real confirmado por terminal', origen: 'SCRAPER', fechaOcurrencia: '2026-10-16T11:30:00Z' },
      { id: 5, descripcion: 'Alerta CRITICAL generada (< 48 h para deadline)', origen: 'IA', fechaOcurrencia: '2026-10-17T07:00:00Z' }
    ]
  },
  3: {
    id: 3,
    numeroContainer: 'CMAU4455667',
    naviera: 'CMA CGM',
    puertoDestino: 'Puerto del Callao',
    numeroBl: 'BL-CMA-00456',
    nombreForwarder: 'Global Cargo SpA',
    terminalOrigen: 'Ningbo',
    terminalLlegada: 'DPW',
    eta: '2026-10-10T08:00:00Z',
    diasLibresDemurrage: 4,
    diasLibresDetention: 4,
    fechaArriboReal: '2026-10-10T14:00:00Z',
    fechaRetiroContainer: null,
    estadoPuerto: 'Mantenimiento aduanero',
    deadlineDemurrage: '2026-10-14T00:00:00Z',
    deadlineDetention: '2026-10-16T00:00:00Z',
    nivelRiesgo: 'OVERDUE',
    documentoUrl: 'https://storage.portia.cl/mock/bl-cma-00456.pdf',
    hitos: [
      { id: 6, descripcion: 'Documento BL cargado y validado', origen: 'USUARIO', fechaOcurrencia: '2026-09-28T09:00:00Z' },
      { id: 7, descripcion: 'Deadline de demurrage vencido sin retiro', origen: 'IA', fechaOcurrencia: '2026-10-14T00:05:00Z' }
    ]
  },
  4: {
    id: 4,
    numeroContainer: 'HLXU9988776',
    naviera: 'Hapag-Lloyd',
    puertoDestino: 'Puerto de Valparaíso',
    numeroBl: 'BL-HL-00321',
    nombreForwarder: 'Andes Forwarding Ltda.',
    terminalOrigen: 'Hamburgo',
    terminalLlegada: 'STI',
    eta: '2026-10-18T08:00:00Z',
    diasLibresDemurrage: 6,
    diasLibresDetention: 5,
    fechaArriboReal: null,
    fechaRetiroContainer: null,
    estadoPuerto: 'En tránsito',
    deadlineDemurrage: '2026-10-22T00:00:00Z',
    deadlineDetention: '2026-10-24T00:00:00Z',
    nivelRiesgo: 'WARNING',
    documentoUrl: 'https://storage.portia.cl/mock/bl-hl-00321.pdf',
    hitos: [
      { id: 8, descripcion: 'Documento BL cargado y validado', origen: 'USUARIO', fechaOcurrencia: '2026-10-11T09:00:00Z' },
      { id: 9, descripcion: 'Alerta WARNING generada (48-96 h para deadline)', origen: 'IA', fechaOcurrencia: '2026-10-17T07:00:00Z' }
    ]
  }
};
