import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { NotificationService } from 'src/app/services/modeloServicios/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit{
  notifications$?: Observable<any>;
  userRegistra? : string;

  constructor(private notificationService: NotificationService,
    private login: LoginService
  ) { }

  ngOnInit(): void {
    const usuarioRegistra = this.login.getTokenDecoded().usuarioRegistra;
  
    this.notifications$ = this.notificationService.getNotificationsForUser();
    this.notifications$.subscribe(notifications => {
      console.log(notifications); 
    });
  }
}