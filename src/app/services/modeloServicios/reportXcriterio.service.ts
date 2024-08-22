import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportXcriterioService {
    private readonly API_URL = environment.URL_BACKEND_REPORTExCRITERIO; 
 
    httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    
  constructor(private http: HttpClient) {}

  generatePdf(pdfRequest: { Image: string}) {
    return this.http.post(`${this.API_URL}/GeneratePdf`, pdfRequest, { responseType: 'blob' });
  }
}
