import { LogAuditoria } from '../models/auditoria.model';

export type OrigenAuditoria = 'USUARIO' | 'SISTEMA';
export type CategoriaAuditoria = 'CONTENEDOR' | 'MENSAJE' | 'CONSULTA' | 'ADMINISTRACION' | 'SESION' | 'OTRO';

export interface CambioAuditoria {
  campo: string;
  antes: string;
  despues: string;
}

export interface FilaTecnica {
  clave: string;
  antes: string;
  despues: string;
  cambio: boolean;
}

export interface EventoAuditoria {
  id: number;
  fecha: string;
  titulo: string;
  cambios: CambioAuditoria[];
  origen: OrigenAuditoria;
  categoria: CategoriaAuditoria;
  contenedorId: number | null;
  contenedorNumero: string | null;
  responsableId: number | null;
  responsableNombre: string | null;
  sensibilidad: string | null;
  sensibilidadEtiqueta: string | null;
  filasTecnicas: FilaTecnica[];
  jsonAnterior: string;
  jsonNuevo: string;
  tecnico: string;
}

export interface OpcionesFormato {
  terceraPersona?: boolean;
}

export const ETIQUETAS_SENSIBILIDAD: Record<string, string> = {
  REASIGNACION: 'Reasignación',
  DIAS_LIBRES: 'Cambio de días libres',
  MENSAJE_RECHAZADO: 'Mensaje rechazado',
  MENSAJE_FALLIDO: 'Mensaje fallido',
  CREDENCIAL: 'Credencial de terminal',
  CAMBIO_USUARIO: 'Cambio de usuario',
  CAMBIO_CATALOGO: 'Cambio de catálogo',
  LOGIN_FALLIDO: 'Inicio de sesión fallido'
};

const ESTADOS_POR_ID: Record<number, string> = {
  1: 'Planificado',
  2: 'En patio de origen',
  3: 'Embarcado',
  4: 'En tránsito',
  5: 'Arribado',
  6: 'Descargado',
  7: 'En inspección',
  8: 'Liberado',
  9: 'Disponible para retiro',
  10: 'Retirado',
  11: 'Entregado en destino',
  12: 'Devuelto vacío',
  13: 'En demurrage',
  14: 'Vencido',
  15: 'Retenido',
  16: 'Dañado'
};

const ESTADOS_POR_CODIGO: Record<string, string> = {
  PLANIFICADO: 'Planificado',
  EN_PATIO_ORIGEN: 'En patio de origen',
  EMBARCADO: 'Embarcado',
  EN_TRANSITO: 'En tránsito',
  ARRIBADO: 'Arribado',
  DESCARGADO: 'Descargado',
  EN_INSPECCION: 'En inspección',
  LIBERADO: 'Liberado',
  DISPONIBLE_RETIRO: 'Disponible para retiro',
  RETIRADO: 'Retirado',
  ENTREGADO_DESTINO: 'Entregado en destino',
  DEVUELTO_VACIO: 'Devuelto vacío',
  DEMURRAGE: 'En demurrage',
  VENCIDO: 'Vencido',
  RETENIDO: 'Retenido',
  DANADO: 'Dañado'
};

const RIESGOS_POR_ID: Record<number, string> = {
  1: 'OK',
  2: 'Advertencia',
  3: 'Crítico',
  4: 'Vencido'
};

const ETIQUETAS_CAMPO: Record<string, string> = {
  Estado: 'Estado',
  Naviera: 'Naviera',
  NumeroBl: 'N° BL',
  NombreForwarder: 'Forwarder',
  TerminalOrigen: 'Terminal de origen',
  TerminalLlegada: 'Terminal de llegada',
  FechaArriboReal: 'Arribo real',
  FechaRetiroContainer: 'Retiro del contenedor',
  FechaLlegadaEstimada: 'Llegada estimada',
  DeadlineDemurrage: 'Fecha límite de demurrage',
  DeadlineDetention: 'Fecha límite de detention',
  DiasLibresDemurrage: 'Días libres de demurrage',
  DiasLibresDetention: 'Días libres de detention',
  EstadoPuerto: 'Estado en el puerto',
  Asignado: 'Analista asignado',
  IdClima: 'Clima',
  Nombre: 'Nombre',
  Correo: 'Correo',
  Rol: 'Rol',
  Activo: 'Activo',
  Jefe: 'Jefe',
  Codigo: 'Código',
  Telefono: 'Teléfono',
  Vigente: 'Vigente',
  Pais: 'País',
  Evento: 'Evento',
  Canal: 'Canal',
  Destinatario: 'Destinatario',
  Motivo: 'Motivo',
  Error: 'Error',
  Asunto: 'Asunto',
  Leida: 'Leída',
  IdContainer: 'Contenedor',
  IdTipoAlerta: 'Tipo de alerta',
  IdRiesgo: 'Riesgo',
  UsuarioTerminal: 'Usuario del terminal',
  EstadoValidacion: 'Estado de validación',
  IdTerminal: 'Terminal'
};

const CAMPOS_FECHA = new Set([
  'FechaArriboReal',
  'FechaRetiroContainer',
  'FechaLlegadaEstimada',
  'DeadlineDemurrage',
  'DeadlineDetention'
]);

const CLIMAS: Record<number, string> = { 1: 'Sin alerta', 2: 'Marejada', 3: 'Cierre de puerto' };

const VERBOS_TERCERA: Record<string, string> = {
  Cambiaste: 'cambió',
  Registraste: 'registró',
  Corregiste: 'corrigió',
  Actualizaste: 'actualizó',
  Revisaste: 'revisó',
  Consultaste: 'consultó',
  Rechazaste: 'rechazó',
  Enviaste: 'envió',
  Gestionaste: 'gestionó',
  Creaste: 'creó',
  Marcaste: 'marcó',
  Iniciaste: 'inició'
};

function parsear(json: string | null): Record<string, unknown> | null {
  if (!json) return null;
  try {
    const valor = JSON.parse(json);
    return valor && typeof valor === 'object' && !Array.isArray(valor) ? (valor as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function formatearFecha(valor: unknown): string {
  const fecha = new Date(String(valor));
  if (isNaN(fecha.getTime())) return String(valor);
  return fecha.toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatearValor(campo: string, valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') return 'Sin dato';
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
  if (CAMPOS_FECHA.has(campo)) return formatearFecha(valor);
  if (campo === 'Estado') {
    return typeof valor === 'string' ? (ESTADOS_POR_CODIGO[valor] ?? valor) : (ESTADOS_POR_ID[Number(valor)] ?? String(valor));
  }
  if (campo === 'IdClima') return CLIMAS[Number(valor)] ?? String(valor);
  if (campo === 'IdRiesgo') return RIESGOS_POR_ID[Number(valor)] ?? String(valor);
  if (typeof valor === 'object') return JSON.stringify(valor);
  return String(valor);
}

function etiqueta(clave: string): string {
  return ETIQUETAS_CAMPO[clave] ?? clave;
}

function diferencias(anterior: Record<string, unknown> | null, nuevo: Record<string, unknown> | null, ignorar: string[] = []): CambioAuditoria[] {
  if (!nuevo) return [];
  const cambios: CambioAuditoria[] = [];

  for (const clave of Object.keys(nuevo)) {
    if (ignorar.includes(clave)) continue;
    const antes = anterior?.[clave] ?? null;
    const despues = nuevo[clave] ?? null;
    if (JSON.stringify(antes) === JSON.stringify(despues)) continue;
    cambios.push({ campo: etiqueta(clave), antes: formatearValor(clave, antes), despues: formatearValor(clave, despues) });
  }

  return cambios;
}

function filasTecnicas(anterior: Record<string, unknown> | null, nuevo: Record<string, unknown> | null): FilaTecnica[] {
  const claves = Array.from(new Set([...Object.keys(anterior ?? {}), ...Object.keys(nuevo ?? {})]));
  return claves.map(clave => {
    const antes = anterior?.[clave];
    const despues = nuevo?.[clave];
    const texto = (v: unknown) => (v === undefined ? '' : v === null ? 'null' : typeof v === 'object' ? JSON.stringify(v) : String(v));
    return { clave, antes: texto(antes), despues: texto(despues), cambio: JSON.stringify(antes) !== JSON.stringify(despues) };
  });
}

function aTerceraPersona(titulo: string, nombre: string | null): string {
  const [primera, ...resto] = titulo.split(' ');
  const verbo = VERBOS_TERCERA[primera];
  if (!verbo) return titulo;
  return `${nombre ?? 'Alguien'} ${verbo} ${resto.join(' ')}`;
}

function tituloContenedorUsuario(anterior: Record<string, unknown> | null, cambios: CambioAuditoria[]): string {
  const cambio = (clave: string) => cambios.find(c => c.campo === etiqueta(clave));
  const dem = cambio('DiasLibresDemurrage');
  const det = cambio('DiasLibresDetention');

  if (cambios.length === 0) return 'Revisaste los datos del contenedor';
  if (cambios.length === 1 && cambio('Asignado')) return 'Se reasignó el contenedor';
  if ((dem || det) && cambios.every(c => ['Días libres de demurrage', 'Días libres de detention', 'Fecha límite de demurrage', 'Fecha límite de detention'].includes(c.campo))) {
    if (dem && !det) return `Cambiaste los días libres de demurrage de ${dem.antes} a ${dem.despues}`;
    if (det && !dem) return `Cambiaste los días libres de detention de ${det.antes} a ${det.despues}`;
    return 'Cambiaste los días libres del contenedor';
  }
  if (cambios.length === 1 && cambio('FechaRetiroContainer')) {
    return anterior?.['FechaRetiroContainer'] ? 'Corregiste el retiro del contenedor' : 'Registraste el retiro del contenedor';
  }
  if (cambios.length === 1 && cambio('FechaArriboReal')) return 'Corregiste el arribo real del contenedor';
  if (cambios.length === 1 && cambio('FechaLlegadaEstimada')) return 'Corregiste la llegada estimada del contenedor';
  return cambios.length === 1 ? `Corregiste ${cambios[0].campo.toLowerCase()}` : `Actualizaste ${cambios.length} datos del contenedor`;
}

function describirNotificacion(nuevo: Record<string, unknown> | null): { titulo: string; cambios: CambioAuditoria[] } {
  const estado = String(nuevo?.['Estado'] ?? '');
  const canal = String(nuevo?.['Canal'] ?? '') === 'TELEGRAM' ? 'Telegram' : 'correo';
  const destinatario = nuevo?.['Destinatario'] ? ` a ${nuevo['Destinatario']}` : '';
  const cambios: CambioAuditoria[] = [];

  if (nuevo?.['Motivo']) cambios.push({ campo: 'Motivo', antes: 'Sin dato', despues: String(nuevo['Motivo']) });
  if (nuevo?.['Error']) cambios.push({ campo: 'Error', antes: 'Sin dato', despues: String(nuevo['Error']) });

  switch (estado) {
    case 'RECHAZADO':
      return { titulo: `Rechazaste el mensaje por ${canal}${destinatario}`, cambios };
    case 'ENVIADO':
    case 'APROBADO':
      return { titulo: `Enviaste el mensaje por ${canal}${destinatario}`, cambios };
    case 'FALLIDO':
      return { titulo: `El envío del mensaje por ${canal}${destinatario} falló`, cambios };
    default:
      return { titulo: `Gestionaste un mensaje por ${canal}${destinatario}`, cambios };
  }
}

function describirAdministracion(
  entidad: string,
  accion: string,
  anterior: Record<string, unknown> | null,
  nuevo: Record<string, unknown> | null,
  cambios: CambioAuditoria[]
): string {
  const nombre = String(nuevo?.['Nombre'] ?? nuevo?.['Codigo'] ?? anterior?.['Nombre'] ?? '');
  const sujeto = entidad === 'Usuario' ? 'el usuario' : entidad === 'Naviera' ? 'la naviera' : 'el terminal';
  const sufijo = nombre ? ` ${nombre}` : '';

  if (accion === 'CREAR') return `Se creó ${sujeto}${sufijo}`;

  const cambio = (clave: string) => cambios.find(c => c.campo === etiqueta(clave));
  const activo = cambio('Activo') ?? cambio('Vigente');

  if (activo && cambios.length === 1) {
    return activo.despues === 'Sí' ? `Se habilitó ${sujeto}${sufijo}` : `Se deshabilitó ${sujeto}${sufijo}`;
  }
  if (entidad === 'Usuario' && cambios.length === 1 && cambio('Rol')) {
    return `Se cambió el rol de${sufijo} de ${cambio('Rol')!.antes} a ${cambio('Rol')!.despues}`;
  }
  if (entidad === 'Usuario' && cambios.length === 1 && cambio('Jefe')) {
    return `Se cambió el jefe de${sufijo}`;
  }
  return `Se actualizaron los datos de ${sujeto}${sufijo}`;
}

export function describirEventoAuditoria(
  log: LogAuditoria,
  numeroPorContenedor: Map<number, string>,
  opciones: OpcionesFormato = {}
): EventoAuditoria {
  const anterior = parsear(log.valoresAnteriores);
  const nuevo = parsear(log.valoresNuevos);

  const base = {
    id: log.id,
    fecha: log.createAt,
    contenedorId: log.contenedorId ?? null,
    contenedorNumero: log.contenedorNumero ?? null,
    responsableId: log.responsableId,
    responsableNombre: log.responsableNombre,
    sensibilidad: log.sensibilidad ?? null,
    sensibilidadEtiqueta: log.sensibilidad ? (ETIQUETAS_SENSIBILIDAD[log.sensibilidad] ?? log.sensibilidad) : null,
    filasTecnicas: filasTecnicas(anterior, nuevo),
    jsonAnterior: anterior ? JSON.stringify(anterior, null, 2) : '',
    jsonNuevo: nuevo ? JSON.stringify(nuevo, null, 2) : '',
    tecnico: JSON.stringify({ anterior, nuevo }, null, 2)
  };

  const conPersona = (titulo: string) =>
    opciones.terceraPersona ? aTerceraPersona(titulo, log.responsableNombre) : titulo;

  if (log.nombreEntidad === 'Notificacion') {
    const { titulo, cambios } = describirNotificacion(nuevo);
    return { ...base, titulo: conPersona(titulo), cambios, origen: log.responsableId ? 'USUARIO' : 'SISTEMA', categoria: 'MENSAJE' };
  }

  if (log.nombreEntidad === 'Container') {
    const contenedorId = base.contenedorId ?? log.idEntidad;
    const contenedorNumero = base.contenedorNumero ?? numeroPorContenedor.get(contenedorId) ?? null;
    const comun = { ...base, contenedorId, contenedorNumero };

    if (log.accion === 'LEER') {
      return { ...comun, titulo: conPersona('Consultaste el contenedor'), cambios: [], origen: 'USUARIO', categoria: 'CONSULTA' };
    }

    const esSistema = !log.responsableId || (!!anterior && ('IdEstado' in anterior || 'IdRiesgo' in anterior));

    if (esSistema && nuevo) {
      const cambios: CambioAuditoria[] = [];
      if (anterior && ('IdEstado' in anterior || 'IdRiesgo' in anterior)) {
        if (anterior['IdEstado'] !== nuevo['IdEstado']) {
          cambios.push({
            campo: 'Estado',
            antes: ESTADOS_POR_ID[Number(anterior['IdEstado'])] ?? 'Sin dato',
            despues: ESTADOS_POR_ID[Number(nuevo['IdEstado'])] ?? 'Sin dato'
          });
        }
        if (anterior['IdRiesgo'] !== nuevo['IdRiesgo']) {
          cambios.push({
            campo: 'Riesgo',
            antes: RIESGOS_POR_ID[Number(anterior['IdRiesgo'])] ?? 'Sin dato',
            despues: RIESGOS_POR_ID[Number(nuevo['IdRiesgo'])] ?? 'Sin dato'
          });
        }
        if (nuevo['EstadoPuerto']) {
          cambios.push({ campo: 'Estado en el puerto', antes: 'Sin dato', despues: String(nuevo['EstadoPuerto']) });
        }
      } else {
        cambios.push(...diferencias(anterior, nuevo, ['IdEstado', 'IdRiesgo']));
      }
      return { ...comun, titulo: 'El sistema actualizó el contenedor', cambios, origen: 'SISTEMA', categoria: 'CONTENEDOR' };
    }

    if (log.accion === 'CREAR') {
      return { ...comun, titulo: 'Se registró el contenedor', cambios: [], origen: 'USUARIO', categoria: 'CONTENEDOR' };
    }

    const cambios = diferencias(anterior, nuevo, ['IdEstado', 'IdRiesgo']);
    return {
      ...comun,
      titulo: conPersona(nuevo ? tituloContenedorUsuario(anterior, cambios) : 'Actualizaste el contenedor'),
      cambios,
      origen: 'USUARIO',
      categoria: 'CONTENEDOR'
    };
  }

  if (['Usuario', 'Naviera', 'Terminal'].includes(log.nombreEntidad)) {
    const cambios = log.accion === 'CREAR' ? [] : diferencias(anterior, nuevo);
    return {
      ...base,
      titulo: describirAdministracion(log.nombreEntidad, log.accion, anterior, nuevo, cambios),
      cambios,
      origen: log.responsableId ? 'USUARIO' : 'SISTEMA',
      categoria: 'ADMINISTRACION'
    };
  }

  if (log.nombreEntidad === 'Sesion') {
    const fallido = nuevo?.['Evento'] === 'INICIO_SESION_FALLIDO';
    const titulo = fallido
      ? `Intento fallido de inicio de sesión${nuevo?.['Correo'] ? ` con ${nuevo['Correo']}` : ''}`
      : conPersona('Iniciaste sesión');
    return {
      ...base,
      titulo,
      cambios: [],
      origen: log.responsableId ? 'USUARIO' : 'SISTEMA',
      categoria: 'SESION'
    };
  }

  if (log.nombreEntidad === 'Alerta') {
    const leida = nuevo?.['Leida'] === true && anterior?.['Leida'] === false;
    const titulo = log.accion === 'CREAR' ? 'Se generó una alerta' : leida ? conPersona('Marcaste la alerta como leída') : 'Se actualizó una alerta';
    return { ...base, titulo, cambios: [], origen: log.responsableId ? 'USUARIO' : 'SISTEMA', categoria: 'OTRO' };
  }

  if (log.nombreEntidad === 'CredencialTerminal') {
    const cambios = log.accion === 'CREAR' ? [] : diferencias(anterior, nuevo);
    const titulo = log.accion === 'CREAR'
      ? 'Se registró una credencial de terminal'
      : nuevo?.['Vigente'] === false
        ? 'Se deshabilitó una credencial de terminal'
        : 'Se actualizó una credencial de terminal';
    return { ...base, titulo, cambios, origen: log.responsableId ? 'USUARIO' : 'SISTEMA', categoria: 'ADMINISTRACION' };
  }

  const verbo = log.accion === 'CREAR' ? 'Creaste' : log.accion === 'LEER' ? 'Consultaste' : 'Actualizaste';
  return {
    ...base,
    titulo: conPersona(`${verbo} un registro de ${log.nombreEntidad}`),
    cambios: [],
    origen: log.responsableId ? 'USUARIO' : 'SISTEMA',
    categoria: log.accion === 'LEER' ? 'CONSULTA' : 'OTRO'
  };
}
