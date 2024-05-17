import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
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
    private login: LoginService
  ) { }

  ngOnInit(): void {
    const usuarioRegistra = this.login.getTokenDecoded().usuarioRegistra;
    this.notificacionesService.getNotificacionByUsuario(this.login.getTokenDecoded().usuarioRegistra)
    .subscribe(data => {
      console.log("data notificaciones",data);
      this.notificaciones = data;
    });
  }
}