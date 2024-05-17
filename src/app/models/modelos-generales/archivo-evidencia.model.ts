export interface ArchivoEvidencia {
    IdArchivoEvidencia?: number;
    IdPeriodo?: number;
    Estado?: string;
    FechaRegistro: string;
    FechaValidacion?: string;
    UsuarioRegistra: string;
    RolValida?: string;
    Detalle?: string;
    PathUrl?: string;
    Activo?: string;
    IdEvidencia?: number;
    showContainer?: boolean;
}
export interface archivoEvidencia{
        IdEvidencia?: any;
        Estado?: string;
        FechaRegistro: string;
        UsuarioRegistra: string;
        Detalle?: string;
        PathUrl?: string;
        Activo?: string;
}
