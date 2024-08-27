import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { ArchivoEvidenciaService } from 'src/app/services/modeloServicios/archivo-evidencia.service';
import { EvidenciaService } from 'src/app/services/modeloServicios/evidencia.service';
import { NotificacionesService } from 'src/app/services/modeloServicios/notificaciones.service';


@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit{
  userRegistra? : string;
  notificaciones: any[] = [];
  detalle: any;
  evidenciaDetails: { [id: number]: any } = {};
  constructor(private notificacionesService: NotificacionesService,
    private login: LoginService,
    private archivoService: ArchivoEvidenciaService,
    private evidenciaService: EvidenciaService,
  ) { }

  ngOnInit(): void {
    const usuarioRegistra = this.login.getTokenDecoded().usuarioRegistra;
    const perfil = this.login.getTokenDecoded().perfil;
  
    if (perfil === 'SUPERVISOR' || perfil === 'SUPADMIN') {
      this.notificacionesService.getNotificacionByUsuario('SUPERVISOR')
      .subscribe(data => {
        this.notificaciones = data;
        this.notificaciones.forEach(notificacion => {
          this.evidenciaService.getEvidenciaById(notificacion.IdEvidencia).subscribe(data => {
            // Asumir que data es un array y tomar el primer elemento
            if (Array.isArray(data) && data.length > 0) {
              this.evidenciaDetails[notificacion.IdEvidencia] = data[0];
            } else {
              this.evidenciaDetails[notificacion.IdEvidencia] = null;
            }
          });
        });
      });
    } else {
      this.notificacionesService.getNotificacionByUsuario(this.login.getTokenDecoded().usuarioRegistra)
      .subscribe(data => {
        this.notificaciones = data;
        // Obtener detalles de evidencia para cada notificación
        this.notificaciones.forEach(notificacion => {
          this.evidenciaService.getEvidenciaById(notificacion.IdEvidencia).subscribe(data => {
            // Asumir que data es un array y tomar el primer elemento
            if (Array.isArray(data) && data.length > 0) {
              this.evidenciaDetails[notificacion.IdEvidencia] = data[0];
            } else {
              this.evidenciaDetails[notificacion.IdEvidencia] = null;
            }
          });
        });
      });
    }
  }
}