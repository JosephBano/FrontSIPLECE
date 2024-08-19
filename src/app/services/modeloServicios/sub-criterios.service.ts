import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ListChild, ListFather, SubCriterio } from '../../models/modelos-generales/subCriterio.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SubCriteriosService {

  private readonly API_URL = environment.URL_BACKEND_SUBCRITERIO; 

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  
  constructor(private http: HttpClient) { }

  getSubCriterio(): Observable<SubCriterio[]> {
    return this.http.get<SubCriterio[]>(this.API_URL);
  }  

  getByCriterio(id: string): Observable<SubCriterio[]> {
    return this.http.get<SubCriterio[]>(this.API_URL + `/GetByCriterio/${id}`);
  }
  
  getByModelo(id: string): Observable<SubCriterio[]> {
    return this.http.get<SubCriterio[]>(this.API_URL + `/GetByModelo/${id}`);
  }

  getSubCriterioById(id: string): Observable<SubCriterio> {
    return this.http.get<SubCriterio>(this.API_URL + `/FindOne/${id}`);
  }

  getChild(code: string): Observable<ListChild[]> {
    return this.http.get<ListChild[]>(`${this.API_URL}/AllChild?CodigoSubcriterio=${code}`);
  }

  getFather(code: string): Observable<ListFather[]> {
    return this.http.get<ListFather[]>(`${this.API_URL}/AllFather?CodigoSubcriterio=${code}`);
  }

  postSubCriterio(subcriterio: SubCriterio): Observable<SubCriterio> {
    return this.http.post<SubCriterio>(this.API_URL, subcriterio, this.httpOptions);
  }

  updateSubCriterio(subcriterio: SubCriterio): Observable<SubCriterio> {
    return this.http.put<SubCriterio>(this.API_URL, subcriterio, this.httpOptions);
  }

  deleteSubCriterio(id: string): Observable<any> {
    return this.http.delete(this.API_URL + `/${id}`, this.httpOptions);
  }
  getByCriterioDetalle(detalle: string): Observable<SubCriterio[]> {
    return this.http.get<any[]>(this.API_URL + `/GetByCriterioDetalle/${detalle}`);
  }
}
