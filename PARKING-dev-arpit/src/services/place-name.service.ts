import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'  // Makes the service available throughout the app
})

export class PlaceNameService {
  private selectedPlaceSource = new BehaviorSubject<string>(''); // Default value is an empty string
  selectedPlace$ = this.selectedPlaceSource.asObservable(); // Observable to expose selected place
  setSelectedPlace(placeName: string): void {
    this.selectedPlaceSource.next(placeName); // Update the selected place
  }
}
