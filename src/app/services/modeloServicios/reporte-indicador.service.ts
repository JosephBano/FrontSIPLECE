import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
    providedIn: 'root'
  })
  export class ReporteIndicadorService {
    private readonly API_URL = environment.URL_BACKEND_INDICADOR; 
    private readonly  API_URL2 = environment.URL_BACKEND_INDICADOR_REPORT;
    private readonly API_URL3 = environment.URL_BACKEND_REPORT;
    httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    
    constructor(private http: HttpClient) { }
    
    getByTipoEvaluacion(idTipoEvaluacion: number): Observable<any> {
      return this.http.get(`${this.API_URL}/GetCuantitativos/${idTipoEvaluacion}`, this.httpOptions);
    }
    getCualitativos(): Observable<any> {
      return this.http.get(`${this.API_URL}/GetCualitativos`, this.httpOptions);
    };
    getVarIndicador(idIndicador: number): Observable<any> {
      return this.http.get(`${this.API_URL2}/GetVarIndicador/${idIndicador}`, this.httpOptions);
    }
    updateVarIndicador(Valor: number, IdVariable: number): Observable<any> {
      return this.http.put(`${this.API_URL2}/UpdateVarIndicador/${Valor}/${IdVariable}`, null, this.httpOptions);
    }
    getIndicadoresEvaluados(): Observable<any> {
      return this.http.get(`${this.API_URL2}/IndicadoresEvaluados`, this.httpOptions);
    }
    getValoracionCualitativos(): Observable<any> {
      return this.http.get(`${this.API_URL2}/ValoracionCualitativos`, this.httpOptions);
    }
    generarPDF(reportData: any): Observable<Blob> {
      return this.http.post(`${this.API_URL3}/GeneratePDF`, reportData, { responseType: 'blob' });
    }
    getCriteriosDetalles(): Observable<any> {
      return this.http.get(`${this.API_URL2}/CriteriosIndicadores`, this.httpOptions);
    }
  }
