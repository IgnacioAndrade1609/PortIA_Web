import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private apiUrl = `${environment.apiUrl}/shipments`;

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    
    formData.append('file', file); 

    return this.http.post(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}