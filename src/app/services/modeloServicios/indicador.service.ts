import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Indicador, ListChild, ListFather } from '../../models/modelos-generales/indicador.model';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class IndicadorService {

  private readonly API_URL = environment.URL_BACKEND_INDICADOR; 

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  
  constructor(private http: HttpClient) { }

  getIndicador(): Observable<Indicador[]> {
    return this.http.get<Indicador[]>(this.API_URL);
  }  

  getBySubCriterio(id: number): Observable<Indicador[]> {
    return this.http.get<Indicador[]>(`${this.API_URL}/GetBySubCriterio/${id}`);
  }
  getArchivosEvidencias(idIndicador: number): Observable<any> {
    return this.http.get(`${this.API_URL}/GetArchivosEvidencias/${idIndicador}`);
  }
  getByModelo(id: string): Observable<Indicador[]> {
    return this.http.get<Indicador[]>(this.API_URL + `/GetByModelo/${id}`)
  }

  getIndicadorById(id: any): Observable<Indicador[]> {
    return this.http.get<Indicador[]>(`${this.API_URL}/FindOne/${id}`)
  }

  getChild(code: string): Observable<ListChild[]> {
    return this.http.get<ListChild[]>(`${this.API_URL}/AllChild?CodigoIndicador=${code}`);
  }

  getFather(code: string): Observable<ListFather[]> {
    return this.http.get<ListFather[]>(`${this.API_URL}/AllFather?CodigoIndicador=${code}`);
  }
  
  postIndicador(indicador: Indicador): Observable<Indicador> {
    return this.http.post<Indicador>(this.API_URL, indicador, this.httpOptions);
  }
  
  updateIndicador(indicador: Indicador): Observable<Indicador> {
    return this.http.put<Indicador>(this.API_URL, indicador, this.httpOptions);
  }
  updateValoracion(IdIndicador: any, nuevaValoracion: any): Observable<any> {
    const url = `${this.API_URL}/UpdateValoracion/${IdIndicador}/${nuevaValoracion}`;
    return this.http.put(url, { nuevaValoracion }, this.httpOptions);
  }
  deleteIndicador(id: string): Observable<any> {
    return this.http.delete(this.API_URL + `/${id}`, this.httpOptions);
  }
  updateValidado(idIndicador: number, validado: boolean) {
    return this.http.put(`${this.API_URL}/UpdateValidado/${idIndicador}/${validado}`, {});
  }
  getByDetalle(detalle: string): Observable<Indicador[]> {
    return this.http.get<Indicador[]>(`${this.API_URL}/GetByDetalle/${detalle}`);
  }
}
