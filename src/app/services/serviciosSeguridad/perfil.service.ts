import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Perfil } from "src/app/models/modelos-generales/perfil.model";
import { AddPermiso, PermisoPeticion, PermisoRespuesta, UpdatePermiso } from "src/app/models/modelosSeguridad/perfil.model";
import { DeletePermiso, PermisosPeticion } from "src/app/models/modelosSeguridad/permission.model";
import { environment } from "src/environments/environment.development";

@Injectable({
    providedIn: 'root'
})
export class PerfilService {
    private readonly API_URL = environment.URL_SEG_PERFIL;

    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    
    constructor(private http: HttpClient) { }

    
    getPermisosByCodigoPerfil(codigoModelo: string, codigoPerfil: string, codigoEstado: string): Observable<PermisoRespuesta[]> {
        return this.http.get<PermisoRespuesta[]>(`${this.API_URL}/ObtenerPermisos/${codigoModelo}/${codigoPerfil}/${codigoEstado}`);
      }

    getPermisos(datos: PermisoPeticion): Observable<PermisoRespuesta[]> {
        return this.http.post<PermisoRespuesta[]>(`${this.API_URL}/permisos`, datos, this.httpOptions);
    }

    addPermisos(datos: AddPermiso):Observable<number[]> {
        return this.http.post<number[]>(`${this.API_URL}/agregarPermisos`, datos, this.httpOptions);
    }

    updatePermisos(datos: UpdatePermiso):Observable<number[]> {
        return this.http.put<number[]>(`${this.API_URL}/actualizarPermisos`, datos, this.httpOptions);
    }

    deletePermisos(usuarioPerfil: string, idOpciones: string): Observable<any> {
        return this.http.delete(`${this.API_URL}/EliminarPermisos?usuarioPerfil=${usuarioPerfil}&idOpciones=${idOpciones}`);
      }
    
      deletePerfil(codigoAd: string, codigoSistema: string, codigoInstitucion: string): Observable<any> {
        return this.http.delete(`${this.API_URL}/EliminarPerfil?codigoAd=${codigoAd}&codigoSistema=${codigoSistema}&codigoInstitucion=${codigoInstitucion}`);
      }
}