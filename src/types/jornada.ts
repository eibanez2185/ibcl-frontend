export interface RegistroJornadaDetalle {
  id: number
  tipoRegistroId: number
  tipoRegistroNombre: string
  tipoRegistroDescripcion: string | null
  fechaHora: string
  solicitudPendiente: boolean
}

export interface ResumenJornada {
  horaEntrada: string | null
  horaSalidaReceso: string | null
  horaEntradaReceso: string | null
  horaSalida: string | null
  duracionReceso: string | null
  tiempoTrabajado: string | null
}

export interface MiJornadaHoy {
  estado: string
  siguienteAccion: string | null
  siguienteAccionId: number | null
  puedeRegistrar: boolean
  solicitudPendiente: boolean
  registros: RegistroJornadaDetalle[]
  resumen: ResumenJornada
}

export interface MisJornada {
  fecha: string;
  estado: string;
  siguienteAccion: string | null;
  siguienteAccionId: number | null;
  puedeRegistrar: boolean;
  solicitudPendiente: boolean;
  registros: RegistroJornadaDetalle[];
  resumen: ResumenJornada;
}