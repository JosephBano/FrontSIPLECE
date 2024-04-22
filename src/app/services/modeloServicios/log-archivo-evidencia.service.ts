import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';
import { ArchivoEvidencia, insertarArchivoEvidencia } from 'src/app/models/modelos-generales/archivo-evidencia.model';
import { AgregarArchivoRequest, AgregarArchivoResponse, AgregarPathRequest, ObtenerTokenRequest, ObtenerTokenResponse } from 'src/app/models/modelos-generales/sharedPointToken';

@Injectable({
  providedIn: 'root'
})
export class LogArchivoEvidenciaService {

  private readonly API_URL = environment.URL_BACKEND_LOGARCHIVOEVIDENCIA; 
  
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor( private http: HttpClient ) { }

  getLogArchivoEvidenciaById(idArchivoEvidencia: any): Observable<any> {
    return this.http.get(`${this.API_URL}/${idArchivoEvidencia}`, this.httpOptions);
  }
}
