import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private notificationService: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Si è verificato un errore imprevisto';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Errore: ${error.error.message}`;
        } else {
          // Server-side error
          switch (error.status) {
            case 400:
              errorMessage = error.error?.message || 'Richiesta non valida';
              break;
            case 401:
              errorMessage = 'Non autorizzato. Effettua nuovamente il login.';
              break;
            case 403:
              errorMessage = 'Non hai i permessi per questa operazione';
              break;
            case 404:
              errorMessage = error.error?.message || 'Risorsa non trovata';
              break;
            case 409:
              errorMessage = error.error?.message || 'Conflitto nei dati';
              break;
            case 422:
              errorMessage = error.error?.message || 'Dati non validi';
              break;
            case 500:
              errorMessage = 'Errore interno del server. Riprova più tardi.';
              break;
            default:
              errorMessage = error.error?.message || `Errore ${error.status}: ${error.statusText}`;
          }
        }

        // Show notification to user
        this.notificationService.showError(errorMessage);

        // Re-throw the error for component handling if needed
        return throwError(() => error);
      })
    );
  }
}
