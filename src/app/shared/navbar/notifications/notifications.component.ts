import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { ArchivoEvidenciaService } from 'src/app/services/modeloServicios/archivo-evidencia.service';
import { NotificacionesService } from 'src/app/services/modeloServicios/notificaciones.service';


@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit{
  userRegistra? : string;
  notificaciones: any[] = [];

  constructor(private notificacionesService: NotificacionesService,
    private login: LoginService,
    private archivoService: ArchivoEvidenciaService
  ) { }

  ngOnInit(): void {
    const usuarioRegistra = this.login.getTokenDecoded().usuarioRegistra;
    const perfil = this.login.getTokenDecoded().perfil;
  
    if (perfil === 'SUPERVISOR' || perfil === 'SUPADMIN') {
      this.notificacionesService.getNotificacionByUsuario('SUPERVISOR')
      .subscribe(data => {
        this.notificaciones = data;
      });
    } else {
      this.notificacionesService.getNotificacionByUsuario(this.login.getTokenDecoded().usuarioRegistra)
      .subscribe(data => {
        this.notificaciones = data;
      // this.archivoService.FindOne(idArchivoEvidencia).subscribe(response => {
      //   console.log(response);
      //  });
      });
    }
  }
}