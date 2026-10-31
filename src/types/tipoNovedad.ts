export interface TipoNovedad {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  idEmpresa: number | null;
}