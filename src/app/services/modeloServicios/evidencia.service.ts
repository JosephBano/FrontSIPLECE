import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Evidencia } from 'src/app/models/modelos-generales/evidencia.model';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class EvidenciaService {

  private readonly API_URL = environment.URL_BACKEND_EVIDENCIA; 

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  
  constructor(private http: HttpClient) { }

  getEvidencia(): Observable<Evidencia[]> {
    return this.http.get<[]>(this.API_URL);
  }  

  getEvidenciaById(id: string): Observable<Evidencia[]> {
    return this.http.get<[]>(`${this.API_URL}/FindOne/${id}`)
  }
  
  postEvidencia(evidencia: Evidencia): Observable<Evidencia> {
    return this.http.post<Evidencia>(this.API_URL, evidencia, this.httpOptions);
  }
  
  updateEvidencia(evidencia: Evidencia): Observable<Evidencia> {
    return this.http.put<Evidencia>(this.API_URL, evidencia, this.httpOptions);
  }
  
  deleteEvidencia(id: string): Observable<any> {
    return this.http.delete(this.API_URL + `/${id}`, this.httpOptions);
  }
}
