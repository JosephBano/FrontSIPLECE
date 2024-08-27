import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { email } from '../models/email.model';

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private readonly API_URL = environment.URL_BACKEND_EMAIL;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  sendEmail(email: email): Observable<any> {
    return this.http.post(`${this.API_URL}/send`, email);
  }
}
