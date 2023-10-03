import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario, UsuarioRolPeticion, UsuarioRolRespuesta } from '../models/usuario.model';
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
  getRol(userRol: UsuarioRolPeticion): Observable<UsuarioRolRespuesta[]> {
    return this.http.get<UsuarioRolRespuesta[]>(`${this.API_URL}/rol?CodigoUsuario=${userRol.codigoUsuario}&CodigoSistema=${userRol.codigoSistema}&CodigoInstitucion=${userRol.codigoInstitucion}`)
  }
}
