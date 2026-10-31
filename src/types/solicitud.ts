export interface Solicitud {
  id: number;
  usuarioId: number;
  registroId: number | null;
  idTipoRegistro: number;
  tipoRegistroNombre: string;
  horaActual: string | null;
  horaSolicitada: string | null;
  motivo: string;
  estado: string;
  fechaSolicitud: string;
  resueltoPor: number | null;
  fechaResolucion: string | null;
  idEmpresa: number;
}

export interface MisSolicitudesPagedResult {
  items: Solicitud[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SolicitudAdministrativa extends Solicitud {
  usuarioNombre: string;
}

export interface SolicitudesAdministrativasPagedResult {
  items: SolicitudAdministrativa[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}