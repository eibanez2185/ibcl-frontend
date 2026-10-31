export interface ConsultaPlanillaJornada {
  fechaDesde: string;
  fechaHasta: string;
}

export interface ConsultaPlanillaJornadaEmpleado {
  idUsuario: number;
  fechaDesde: string;
  fechaHasta: string;
}

export interface DetallePlanillaJornada {
  fecha: string;
  dia: string;
  entrada: string;
  ingresoReceso: string;
  entradaReceso: string;
  salida: string;
  totalHorasJornada: string;
  clasificacion: string;
  tieneNovedad: boolean;
  esDomingoOFestivo: boolean;
}

export interface PlanillaJornada {
  fechaDesde: string;
  fechaHasta: string;
  totalHorasJornada: string;
  empresaNombre: string;
  empresaNit: string | null;
  usuarioNombre: string;
  cargo: string | null;
  periodo: string;
  mes: number;
  año: number;
  detalles: DetallePlanillaJornada[];
  observaciones: string[];
}