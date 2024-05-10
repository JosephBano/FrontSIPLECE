import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

export interface Notification {
  message: string;
  usuarioRegistra: string; 
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<any>([]);

  getNotificationsForUser() {
    return this.notifications.asObservable();
  }

  addNotification(notification: Notification) {
    this.notifications.next([...this.notifications.value, notification]);
    console.log("add",this.notifications.value); 
  }
}