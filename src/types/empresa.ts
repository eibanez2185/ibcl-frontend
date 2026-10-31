export interface Empresa {
    id:                   number;
    nombre:               string;
    direccion:            string | null;
    telefono:             string | null;
    idRepresentanteLegal: number | null;
    idCiudad:             number | null;
    nit:                  string | null;
    active:               boolean;
}
