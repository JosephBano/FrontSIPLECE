import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { BehaviorSubject, Observable } from 'rxjs'; // Removed unused import 'Subject'
import { Notificacion } from 'src/app/models/modelos-generales/notificacion';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  private readonly API_URL = environment.URL_BACKEND_NOTIFICACIONES; 
  private dataUpdated = new BehaviorSubject<void>(undefined); 
  
  dataUpdated$ = this.dataUpdated.asObservable();

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor( private http: HttpClient ) { }

  addNotificacion(notificacion: Notificacion): Observable<any> {
    return this.http.post(`${this.API_URL}/AddNotificacion`, notificacion, this.httpOptions);
  }
  getNotificacionByUsuario(usuarioRegistra: string): Observable<any> {
    return this.http.get(`${this.API_URL}/GetNotificacionByUsuario/${usuarioRegistra}`);
  }
  deleteNotificacion(idEvidencia: any, usuarioRegistra: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/DeleteNotificacionByIdEvidenciaAndUsuarioRegistra/${idEvidencia}/${usuarioRegistra}`);
  }
  notifyDataChanged() {
    this.dataUpdated.next();
  }
}