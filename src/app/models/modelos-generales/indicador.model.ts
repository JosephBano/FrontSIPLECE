export interface Indicador {
    IdIndicador?: number;
    CodigoIndicador: string;
    IdSubCriterio: string;
    IdTipoEvaluacion: string;
    Detalle?: string;
    Orden: string;
    Activo?: string;
    Valoracion?: string;
    Estandar?: string;
    Validado?: number;
    PeriodoEvaluacion?: string;
}

export interface ListChild {
    listP: string
}
export interface ListFather {
    listP: string
}