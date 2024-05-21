import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { NotificacionesService } from 'src/app/services/modeloServicios/notificaciones.service';
import { Sidebar } from 'src/app/services/sidebar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{
  showNotifications = false;
  strname: string = ''; 
  notificaciones: any[] = [];
  numNotificaciones: number = 0;
  constructor(
    private toggleService: Sidebar,
    private login: LoginService,
    private notificacionesService: NotificacionesService
    )
    { this.notificacionesService.dataUpdated$.subscribe(() => {
      this.updateData();
    }); }

  toggle(): void {
    this.toggleService.toggle();
  }

  ngOnInit(): void {
    this.updateData();
  }
  
  updateData(): void {
    this.strname = this.login.getTokenDecoded().nombre;
    
    const usuarioRegistra = this.login.getTokenDecoded().usuarioRegistra;
    const perfil = this.login.getTokenDecoded().perfil;
  
    if (perfil === 'SUPERVISOR' || perfil === 'SUPADMIN') {
      this.notificacionesService.getNotificacionByUsuario('SUPERVISOR')
      .subscribe(data => {
        this.notificaciones = data;
        this.numNotificaciones = data.length; 
      });
    } else {
      this.notificacionesService.getNotificacionByUsuario(this.login.getTokenDecoded().usuarioRegistra)
      .subscribe(data => {
        this.notificaciones = data;
        this.numNotificaciones = data.length; 
      });
    }
  }
  
}