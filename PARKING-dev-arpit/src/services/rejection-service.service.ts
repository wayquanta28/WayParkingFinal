import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../app/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RejectionService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    console.log('RejectionService initialized with baseUrl:', this.baseUrl);
  }

  /**
   * Retrieves the GUID associated with a given record ID.
   * @param recordId The ID of the record.
   * @returns An Observable emitting the GUID as a string.
   */
  getGuidById(recordId: string): Observable<string> {
    const url = `${this.baseUrl}/records/${recordId}/guid`;
    console.log(`getGuidById called with recordId: ${recordId}`);
    console.log(`Making GET request to URL: ${url}`);

    return this.http.get<string>(url).pipe(
      tap((guid: string) => console.log(`Received GUID for recordId ${recordId}: ${guid}`)),
      catchError((error: HttpErrorResponse) => {
        console.log(`Error in getGuidById for recordId ${recordId}:`, error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Updates the status and rejection reason of a record.
   * @param guid The GUID of the record to update.
   * @param status The new status of the record.
   * @param rejectionReason The reason for rejection.
   * @returns An Observable emitting the server response.
   */
  updateRecordStatus(guid: string, status: boolean, rejectionReason: string): Observable<any> {
    const url = `${this.baseUrl}/updateStatus`;
    const requestBody = {
      guid,
      status,
      rejectionReason: rejectionReason || null, // Set to null if not provided
    };

    console.log('updateRecordStatus called with the following parameters:', {
      guid,
      status,
      rejectionReason,
    });
    console.log('Request Body:', requestBody);
    console.log(`Making POST request to URL: ${url} with body:`, requestBody);

    return this.http.post<any>(url, requestBody).pipe(
      tap((response) => {
        console.log('Received response from updateRecordStatus:', response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.log('Error in updateRecordStatus:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Handles HTTP errors and returns a user-friendly error message.
   * @param error The HTTP error response.
   * @returns An Observable throwing an error message.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    console.log('handleError called.');

    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      errorMessage = `Client-side Error: ${error.error.message}`;
      console.log('Client-side Error:', error.error.message);
    } else {
      // Backend returned an unsuccessful response code
      errorMessage = `Server-side Error: Code ${error.status}\nMessage: ${error.message}`;
      console.log(`Server-side Error: Code ${error.status}\nMessage: ${error.message}`);
    }

    // Optionally, you can add more sophisticated error handling here

    return throwError(errorMessage);
  }


  
}
