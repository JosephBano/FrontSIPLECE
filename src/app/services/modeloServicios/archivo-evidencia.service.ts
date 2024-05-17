import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';
import { ArchivoEvidencia, archivoEvidencia } from 'src/app/models/modelos-generales/archivo-evidencia.model';
import { AgregarArchivoRequest, AgregarArchivoResponse, AgregarPathRequest, ObtenerTokenRequest, ObtenerTokenResponse } from 'src/app/models/modelos-generales/sharedPointToken';

@Injectable({
  providedIn: 'root'
})
export class ArchivoEvidenciaService {

  private readonly API_URL = environment.URL_BACKEND_ARCHIVOEVIDENCIA; 
  
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor( private http: HttpClient ) { }

  GetArchivosEvidencias(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  GetByEvidencia(id: string): Observable<ArchivoEvidencia[]> {
    return this.http.get<ArchivoEvidencia[]>(`${this.API_URL}/GetByEvidencia/${id}`);
  }

  GetByEvidenciaUser(id: string, user: string): Observable<ArchivoEvidencia[]> {
    return this.http.get<ArchivoEvidencia[]>(`${this.API_URL}/GetByEvidenciaUser?IdEvidencia=${id}&CodeUser=${user}`);
  }
  
  getArchivoInactivo(idEvidencia: number, codeUser: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/GetArchivoInactivo?IdEvidencia=${idEvidencia}&CodeUser=${codeUser}`);
  }
  GetTokenSharedPoint(obtenerToken: ObtenerTokenRequest): Observable<ObtenerTokenResponse>{
    return this.http.post<ObtenerTokenResponse>(`${this.API_URL}/Token`,obtenerToken);
  }

  AddFileSharedPoint(agregarArchivo: AgregarArchivoRequest): Observable<AgregarArchivoResponse>{
    return this.http.post<AgregarArchivoResponse>(`${this.API_URL}/AddFile`,agregarArchivo)
  }

  insertarArchivoEvidencia(archivo: archivoEvidencia): Observable<archivoEvidencia> {
    return this.http.post<archivoEvidencia>(`${this.API_URL}/InsertarArchivoEvidencia`, archivo, this.httpOptions);
  }

  UpdateArchivo(archivo: ArchivoEvidencia): Observable<ArchivoEvidencia> {
    return this.http.put<ArchivoEvidencia>(this.API_URL, archivo, this.httpOptions);
  }

  updateArchivoEvidencia(idEvidencia: any, codigoUsuario: any): Observable<any> {
    return this.http.put(`${this.API_URL}/UpdateArchivoEvidencia/${idEvidencia}/${codigoUsuario}`, {});
}

  DeleteArchivo(id: number): Observable<any> {
    return this.http.delete(this.API_URL + `/${id}`, this.httpOptions);
  }
  PostFile(formData: FormData): Observable<string> {
    return this.http.post<string>(`${this.API_URL}/SaveEvidence`, formData)
  }

  SaveFile(agregarpath: AgregarPathRequest): Observable<string> {
    return this.http.post<string>(`${this.API_URL}/SaveFile`, agregarpath)
  }
}
