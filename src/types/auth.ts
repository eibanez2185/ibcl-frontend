export interface LoginRequest {
    idEmpresa: number;
    email:     string;
}

export interface Rol {
  id: number;
  idEmpresa: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface LoginResponse {
  token: string;
  idUsuario: number;
  idEmpresa: number;
  roles: Rol[];
}
