import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  
  private apiUrl = 'http://localhost:5146/api/v1/shipments';

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