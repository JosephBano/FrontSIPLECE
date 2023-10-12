import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from 'src/environments/environment.development';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly API_URL = environment.URL_SEG_USUARIOS;
  
  constructor( 
    private http: HttpClient,
    private loginService: LoginService,
    ) { }

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  getUsuarios(): Observable<Usuario[]> {
    const token = this.loginService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })
    return this.http.get<Usuario[]>(this.API_URL, {headers});
  }


  getUsuariosActivos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.API_URL);
  }
   
  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/${id}`);
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.API_URL, usuario); 
  }

  actualizarUsuario(usuario: Usuario): Observable<any> {
    return this.http.put<Usuario>(this.API_URL, usuario);
  }
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<Usuario>(`${this.API_URL}/${id}`);
  }

}

