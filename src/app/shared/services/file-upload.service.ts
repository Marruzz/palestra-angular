import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Carica un file di certificato medico per un utente
   * @param userId ID dell'utente
   * @param file File del certificato medico
   * @param scadenza Data di scadenza del certificato (formato YYYY-MM-DD)
   */  uploadCertificatoMedico(userId: number, file: File, scadenza: string): Observable<any> {
    const formData = new FormData();
    formData.append('certificato', file);
    formData.append('scadenza', scadenza);

    return this.http.post(`${this.apiUrl}/dashboard/users/${userId}/certificato`, formData);
  }

  /**
   * Scarica un file di certificato medico per un utente
   * @param userId ID dell'utente
   * @param fileName Nome del file del certificato
   */  downloadCertificatoMedico(userId: number, fileName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/dashboard/users/${userId}/certificato/${fileName}`, {
      responseType: 'blob'
    });
  }
}
