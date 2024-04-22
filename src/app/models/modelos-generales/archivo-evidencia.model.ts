export interface ArchivoEvidencia {
    IdArchivoEvidencia?: string;
    IdPeriodo?: string;
    Estado?: string;
    FechaRegistro: string;
    FechaValidacion?: string;
    UsuarioRegistra: string;
    RolValida?: string;
    Detalle?: string;
    PathUrl?: string;
    Activo?: string;
    IdEvidencia?: string;
    showContainer?: boolean;
}
export interface insertarArchivoEvidencia{
    codigoUsuario: string,
    detalle: string,
    fechaRegistro: string,
    idEvidencia: number
}
