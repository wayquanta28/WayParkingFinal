import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { GISDataService } from '../../../services/gisdata.service';
import { MessageService } from 'primeng/api';
import { PlaceNameService } from '../../../services/place-name.service';
import {
  faCheckCircle,
  faTimes as times,
  faPen,
  faPlus,
  faFileAlt,
  faUsers,
  faClock,
  faBriefcase,
  faFile,
  faFileImport
} from '@fortawesome/free-solid-svg-icons';

// Define interfaces for expected data structures
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
  status: boolean | null;
  feedback?:string;
}

interface PendingRecord {
  guid: string;
  place_name: string;
  city: string;
  state: string;
  capacity: number;
  zipcode: string;
  status: boolean | null;
  feedback?:string;
}

interface RejectedRecord {
  guid: string;
  place_name: string;
  city: string;
  state: string;
  capacity: number;
  zipcode: string;
  status: boolean | null;
  feedback:string;
}

interface AllRecords {
  guid: string;
  place_name: string;
  city: string;
  state: string;
  capacity: number;
  zipcode: string;
  status: boolean | null;
  feedback?:string;
}

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css'],
  providers: [MessageService]
})
export class UserDashboardComponent {
  // Define icons to use in the template
  edit = faPen;
  create = faPlus;
  published = faFileAlt;
  timesCircle = faUsers;
  time = faClock;
  work = faBriefcase;
  checkCircle = faCheckCircle;
  times = times;
  file = faFile;
  added = faFileImport;

  // Define component properties for data binding
  rejectedRecords: RejectedRecord[] = [];
  pendingRecords: PendingRecord[] = [];
  approvedRecords: ApprovedRecord[] = [];
  allRecords: AllRecords[] = [];
  publishedCount = 0;
  nonPublishedCount = 0;
  pendingCount = 0;
  totalRecords = 0;

  selectedStatus: string = 'Total Submitted';

  constructor(
    private gisDataService: GISDataService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private placeNameService: PlaceNameService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshData();
  }

  onCardClicked(title: string) {
    this.selectedStatus = title;
  }

  refreshData(): void {
    this.fetchGISDataCounts();
    this.getRejectRecords();
    this.getPendingRecords();
    this.getApprovedRecords();
    // to view all data
    // this.getAllRecords();
  }

  getRejectRecords(): void {
    this.gisDataService.getRejectedRecords().subscribe(
      (data: RejectedRecord[]) => {
        this.rejectedRecords = [...data];
      },
      error => {
        this.handleError('Failed to load rejected records.', error);
      }
    );
  }

  getPendingRecords(): void {
    this.gisDataService.getPendingRecords().subscribe(
      (data: PendingRecord[]) => {
        this.pendingRecords = data;   
      },
      error => {
        this.handleError('Failed to load pending records.', error);
      }
    );
  }

  getApprovedRecords(): void {
    this.gisDataService.getApprovedRecords().subscribe(
      (data: ApprovedRecord[]) => {
        this.approvedRecords = data;
      },
      error => {
        this.handleError('Failed to load approved records.', error);
      }
    );
  }

  getAllRecords(): void {
    this.gisDataService.getAllRecords().subscribe(
      (data: AllRecords[]) => {
        this.allRecords = data;
      },
      error => {
        this.handleError('Failed to load all records.', error);
      }
    );
  }

  get filteredRecords():(ApprovedRecord | RejectedRecord | PendingRecord | AllRecords)[] {

    switch (this.selectedStatus) {
      case 'Rejected':
        return this.rejectedRecords;
      case 'Total Submitted':
        return this.allRecords;
      case 'Approved':
        return this.approvedRecords;
        default:
      case 'Send to check':
        return this.nonPublishedCount > 0 ? this.pendingRecords : [];
    }
  }
// Type Guards (Optional)
isRejectedRecord(record: any): record is RejectedRecord {
  return record.status === false && 'feedback' in record;
}

isApprovedRecord(record: any): record is ApprovedRecord {
  return record.status === true;
}

isPendingRecord(record: any): record is PendingRecord {
  return record.status === null;
}
  fetchGISDataCounts(): void {
    this.gisDataService.getGISDataCount().subscribe(
      (data: GISDataCounts) => {
        this.publishedCount = data.Published;
        this.nonPublishedCount = data['Non Published'];
        this.pendingCount = data.Pending;
        this.totalRecords = data['Total Records'];
      },
      error => {
        this.handleError('Failed to load GIS data counts.', error);
      }
    );
  }

  private handleError(message: string, error: any): void {
    console.error('Handling error:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000
    });
  }

  navigateToEditor() {
    this.router.navigate(['/way/user/editor'], { state: { from: 'user' } });
    // this.router.navigate(['way/user/editor']);
  }

  navigateToWay() {
    this.router.navigate(['/way']);
  }

  navigateToEditorPlaceName(placeName: string,guid: string): void {
    console.log(placeName);
    this.router.navigate(['way/user/editor'], { queryParams: { placeName ,guid} });
  }

  
}
