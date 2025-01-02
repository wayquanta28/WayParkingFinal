// This file is for admin dashboard where he can accept or reject the data 
import { Component, OnInit, Input, ViewChild } from '@angular/core';
GISDataService

import { MessageService } from 'primeng/api'; // Import MessageService for toast notifications
import { ChangeDetectorRef } from '@angular/core';

import {
  faCheck as check,
  faTimes as times,
  faPen,
  faPlus,
  faFileAlt,
  faUsers,
  faClock,
  faBriefcase,
  faFile,
  IconDefinition,
  faMoneyBill,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';


import { GISDataService } from '../../../services/gisdata.service';
import { RejectionModalComponent } from '../rejection-modal/rejection-modal.component';
import { Router } from '@angular/router';

// Define interfaces for the expected data structures
interface GISDataCounts {
  Published: number;
  'Non Published': number;
  'Total Records': number;
  Pending: number;
}

interface ApprovedRecord {
  guid: string;
  place_name: string;
  city: string;
  state: string;
  capacity: number;
  zipcode: string;
  status: boolean | null; // Added status field
}

interface PendingRecord {
  guid: string;
  place_name: string;
  city: string;
  state: string;
  capacity: number;
  zipcode: string;
  status: boolean | null; // Added status field
}

interface RejectedRecord {
  guid: string;
  place_name: string;
  city: string;
  state: string;
  capacity: number;
  zipcode: string;
  status: boolean | null; // Added status field
}

// Define the component decorator with metadata
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [MessageService] // Provide MessageService for this component
})
export class DashboardComponent implements OnInit {

  @ViewChild('rejectionModal') rejectionModal!: RejectionModalComponent;
  currentRecordId: string = '';
  showPopup = false; // Flag to control the popup visibility
  showRejectPopup: boolean = false; // Flag for reject popup visibility
  popupPosition = { top: 0, left: 0 }; // Popup position

  @Input() title: string = ''; // Title input
  @Input() value: number = 0; // Value input
  @Input() iconName: string = ''; // Icon name input
  @Input() change?: string; // Optional change input

  // Icon mappings
  iconMappings: { [key: string]: IconDefinition } = {
    timesCircle: faTimesCircle,
    clock: faClock,
    checkCircle: faCheckCircle,
    file: faFile,
  };

  get icon(): IconDefinition {
    return this.iconMappings[this.iconName] || faCheckCircle; // Default icon
  }

  // Define icons to use in the template
  edit = faPen;
  create = faPlus;
  published = faCheckCircle;
  project = faUsers;
  time = faClock;
  work = faBriefcase;
  check = check;
  times = times;
  file = faFile;

  // Define component properties for data binding
  rejectedRecords: RejectedRecord[] = [];
  pendingRecords: PendingRecord[] = [];
  approvedRecords: ApprovedRecord[] = [];
  publishedCount = 0;
  nonPublishedCount = 0;
  pendingCount = 0;
  totalRecords = 0;

  selectedStatus: string = 'Total Available'; // Selected status for filtering records

  // Inject necessary services via the constructor
  constructor(
    private gisDataService: GISDataService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  // Angular lifecycle hook called after component initialization
  ngOnInit(): void {
    this.refreshData();  // Fetch initial data on load
  }

  openRejectionModal(recordId: string) {
    this.currentRecordId = recordId;

    const record = this.getRecordById(recordId);
    if (record) {
      this.rejectionModal.guid = record.guid;
      this.rejectionModal.status = record.status;
      this.rejectionModal.openModal();
    } else {
      this.handleError('Record not found.', null);
    }
  }

  // Implement a method to retrieve the record by ID
  getRecordById(recordId: string): any {
    return this.rejectedRecords.find(record => record.guid === recordId) ||
      this.pendingRecords.find(record => record.guid === recordId) ||
      this.approvedRecords.find(record => record.guid === recordId);
  }

  // Handle the rejection reason emitted from the modal
  handleRejectionReason(reason: string) {
    this.updateRecordStatus(this.currentRecordId, false, reason);
  }
  // Accept a record by updating its status
  acceptRecord(recordId: string): void {
    this.updateRecordStatus(recordId, true, 'accepted');
    this.fetchGISDataCounts();
    this.showPopup = true; // Show accept message
    this.showRejectPopup = false; // Hide reject message
    setTimeout(() => {
      this.showPopup = false; // Hide accept message after 3 seconds
    }, 3000);
  }

  // Reject a record by updating its status
  rejectRecord(recordId: string): void {
    this.updateRecordStatus(recordId, false, 'rejected');
  }
  onCardClicked(title: string) {
    this.selectedStatus = title; // Update selected status when card is clicked
  }

  refreshData(): void {
    this.fetchGISDataCounts(); // Fetch counts
    this.getRejectedRecords(); // Fetch rejected records
    this.getPendingRecords(); // Fetch pending records
    this.getApprovedRecords(); // Fetch approved records
  }

  // Fetch the rejected records from the service
  getRejectedRecords(): void {
    this.gisDataService.getRejectedRecords().subscribe(
      (data: RejectedRecord[]) => {
        this.rejectedRecords = data; // Assign data to rejectedRecords
        this.cdr.detectChanges(); // Ensure view updates
      },
      (error) => {
        this.handleError('Failed to load rejected records.', error); // Handle error
      }
    );
  }

  // Fetch the pending records from the service
  getPendingRecords(): void {
    this.gisDataService.getPendingRecords().subscribe(
      (data: PendingRecord[]) => {
        this.pendingRecords = data; // Assign data to pendingRecords
        this.cdr.detectChanges(); // Ensure view updates
      },
      (error) => {
        this.handleError('Failed to load pending records.', error); // Handle error
      }
    );
  }

  // Fetch the approved records from the service
  getApprovedRecords(): void {
    this.gisDataService.getApprovedRecords().subscribe(
      (data: ApprovedRecord[]) => {
        this.approvedRecords = data; // Assign data to approvedRecords
        this.cdr.detectChanges(); // Ensure view updates
      },
      (error) => {
        this.handleError('Failed to load approved records.', error); // Handle error
      }
    );
  }

  // Getter to retrieve records based on selected status
  get filteredRecords() {
    switch (this.selectedStatus) {
      case 'Rejected':
        return this.rejectedRecords; // Return rejected records
      case 'Non Published':
        return this.pendingRecords.filter(pendingRecords => pendingRecords.status === null);
      default:
      case 'Ready to Publish':
        return this.approvedRecords.filter(approvedRecords => approvedRecords.status === true);
    }
  }

  // Fetch GIS data counts from the service
  fetchGISDataCounts(): void {
    this.gisDataService.getGISDataCount().subscribe(
      (data: GISDataCounts) => {
        this.publishedCount = data.Published; // Assign published count
        this.nonPublishedCount = data['Non Published']; // Assign non-published count
        this.pendingCount = data.Pending; // Assign pending count
        this.totalRecords = data['Total Records']; // Assign total records count
        this.cdr.detectChanges(); // Ensure view updates
      },
      (error) => {
        this.handleError('Failed to load GIS data counts.', error); // Handle error
      }
    );
  }



  // // Accept a record by updating its status
  // acceptRecord(recordId: string): void {
  //   this.updateRecordStatus(recordId, true, 'accepted');
  //   this.fetchGISDataCounts();

  //   this.showPopup = true; // Show accept message
  //   this.showRejectPopup = false; // Hide reject message
  //   setTimeout(() => {
  //     this.showPopup = false; // Hide accept message after 3 seconds
  //   }, 3000);
  // }

  // Reject a record by updating its status
  // rejectRecord(recordId: string): void {
  //   this.updateRecordStatus(recordId, false, 'rejected');
  //   this.showRejectPopup = true; // Show reject message
  //   this.showPopup = false; // Hide accept message
  //   setTimeout(() => {
  //     this.showRejectPopup = false; // Hide reject message after 3 seconds
  //   }, 3000);
  // }

  // Update the record status via the service and handle response
  private updateRecordStatus(recordId: string, status: boolean, action: string): void {
    this.gisDataService.updateGISDataStatus(recordId, status).subscribe(
      response => {
        if (response && response.success) {
          // Display a success toast notification
          this.messageService.add({
            severity: status ? 'success' : 'warn',
            summary: status ? 'Accepted' : 'Rejected',
            detail: `Record ${action} successfully`,
            life: 3000 // Display duration in milliseconds
          });

          // Refresh data after successful action
          this.refreshData();
        } else {
          this.handleError(`Failed to ${action} record.`, response);
        }
      },
      error => {
        this.handleError(`Failed to ${action} record.`, error);
      }
    );
  }

  // Handle errors by displaying an error toast message
  private handleError(message: string, error: any): void {
    this.messageService.add({
      severity: 'error', // Error severity
      summary: 'Error', // Provide an appropriate summary
      detail: message, // Detail of the error
      life: 3000 // Display duration in milliseconds
    });
  }

  // Method to navigate to the editor page
  navigateToEditor(): void {
    // In admin dashboard (when navigating to editor)
    this.router.navigate(['/way/admin/editor'], { state: { from: 'admin' } });
  }

  navigateToWay(): void {
    this.router.navigate(['/way']); // Navigate to the way path
  }

}
