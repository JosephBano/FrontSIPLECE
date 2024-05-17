import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';
import { Notificacion } from 'src/app/models/modelos-generales/notificacion';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  private readonly API_URL = environment.URL_BACKEND_NOTIFICACIONES; 
  
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
}
