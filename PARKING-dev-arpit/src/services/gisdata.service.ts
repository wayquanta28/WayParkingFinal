
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { AllRecords, GISDataCount, PendingRecord, RejectedRecord } from '../app/models/gisdata';
import { environment } from '../app/environments/environment';

// Define interfaces for type safety

@Injectable({
  providedIn: 'root'
})
export class GISDataService {
  private baseApiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Method to get GIS data count
  getGISDataCount(): Observable<GISDataCount> {
    const apiUrl = `${this.baseApiUrl}/count`;
    return this.http.get<GISDataCount>(apiUrl).pipe(
      tap(data => console.log('Fetched GIS data count:')), // Log the fetched data for debugging
      catchError(this.handleError) // Handle errors
    );
  }

  // Method to get pending records
  getPendingRecords(): Observable<PendingRecord[]> {
    const pendingUrl = `${this.baseApiUrl}/pending`;
    return this.http.get<PendingRecord[]>(pendingUrl).pipe(
      tap(data => console.log('Fetched pending records:')), // Log the fetched data for debugging
      catchError(this.handleError) // Handle errors
    );
  }
  // Method to fetch rejected records
  // getRejectedRecords(): Observable<RejectedRecord[]> {
  //   const rejectedUrl = `${this.baseApiUrl}/status/rejected`; // API endpoint for rejected records
  //   return this.http.get<RejectedRecord[]>(rejectedUrl).pipe(
  //     tap(data => console.log('Fetched rejected records:', data)),
  //     catchError(this.handleError)
  //   );
  // }
  
  // Method to fetch rejected records with optional rejection reasons
  getRejectedRecords(includeReasons: boolean = true): Observable<RejectedRecord[]> {
    const rejectedUrl = `${this.baseApiUrl}/status/rejected`;

    return this.http.get<RejectedRecord[]>(rejectedUrl).pipe(
        tap(data => console.log('Fetched rejected records:', data)),
        catchError(error => {
            console.error('Error in getRejectedRecords:', error);
            return this.handleError(error);
        }),
        mergeMap((records: RejectedRecord[]) => {
            // Log the records fetched
            console.log('Records received:', records);

            if (includeReasons && records.length > 0) {
                console.log('Including rejection reasons.');

                // Create an array of observables to fetch rejection reasons
                const requests = records.map(record => 
                    this.getRejectionReason(record.guid).pipe(
                        tap(reason => console.log(`Reason for ${record.guid}: ${reason}`)), // Log each reason fetched
                        map(reason => ({
                            ...record,
                            feedback: reason // Update the record with the fetched reason
                        }))
                    )
                );

                // Use forkJoin to wait for all rejection reasons to be fetched
                return forkJoin(requests).pipe(
                    tap(updatedRecords => console.log('All rejection reasons fetched and updated records:', updatedRecords)),
                    catchError(err => {
                        console.error('Error in forkJoin:', err);
                        return of([]); // Fallback if forkJoin fails
                    })
                );
            } else {
                return of(records); // If no reasons to include, return original records
            }
        })
    );
}



// Method to fetch rejection reason for a specific record
private getRejectionReason(guid: string): Observable<string> {
  const reasonUrl = `${this.baseApiUrl}/rejection-reason/${guid}`;
  
  console.log(`Fetching rejection reason from URL: ${reasonUrl}`); // Debugging: log the URL

  return this.http.get<{ feedback?: string; error?: string }>(reasonUrl).pipe(
      tap(response => {
          // Log the response for debugging
          console.log(`Received response for ${guid}:`, response); // Log the entire response

          if (response.feedback) {
              console.log(`Fetched rejection reason for ${guid}: ${response.feedback}`);
          } else if (response.error) {
              console.error(`Error fetching rejection reason for ${guid}: ${response.error}`);
          } else {
              console.warn(`No feedback or error in response for ${guid}`);
          }
      }),
      map(response => {
          // Return feedback or a fallback message
          const feedback = response.feedback || '';
          console.log(`Returning feedback for ${guid}: ${feedback}`); // Debugging
          return feedback;
      }),
      catchError(error => {
          console.error(`Error fetching rejection reason for ${guid}:`, error);
          return of('No reason provided.'); // Return fallback value on error
      })
  );
}



  // Method to fetch the approved list
  getApprovedRecords(): Observable<RejectedRecord[]> {
    const approvedUrl = `${this.baseApiUrl}/status/approved`; // API endpoint for rejected records
    return this.http.get<RejectedRecord[]>(approvedUrl).pipe(
      tap(data => console.log('Fetched approved records:', data)),
      catchError(this.handleError)
    );
  }
  getAllRecords(): Observable<AllRecords[]>{
    const allStatusUrl = `${this.baseApiUrl}/status/all`;
    return this.http.get<AllRecords[]>(allStatusUrl).pipe(
      tap(data => console.log('Fetched total Records:', data)),
      catchError(this.handleError)
    )
  }
  // Method to update the status of a GIS data record
  updateGISDataStatus(guid: string, status: boolean): Observable<any> {
    const updateUrl = `${this.baseApiUrl}/status/${guid}`; // Updated endpoint structure
    return this.http.put(updateUrl, null, { params: { status: status.toString() } }).pipe(
      tap(response => console.log(`Updated status for record ${guid}:`, response)), // Log success response
      catchError(this.handleError) // Handle errors
    );
  }

  // Generic error handler for HTTP requests
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!'; // Default error message

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client-side Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server-side Error: Code ${error.status}\nMessage: ${error.message}`;
    }
    
    // Optionally log the error to the console
    console.error(errorMessage);

    // You might want to show an error notification to the user here

    return throwError(errorMessage); // Throw the error for further handling
  }
}
