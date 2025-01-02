import { Component, EventEmitter, Output, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RejectionService } from '../../../services/rejection-service.service';

@Component({
  selector: 'app-rejection-modal',
  templateUrl: './rejection-modal.component.html',
  styleUrls: ['./rejection-modal.component.css'],
})
export class RejectionModalComponent {
  isCustomReasonModalVisible = false; // Custom reason modal visibility
  @Input() guid: string = '';  // Expecting 'guid' to be passed as input
  @Input() status: boolean = false;  // Expecting 'status' to be passed as input, defaulting to false

  @Output() reasonSubmitted = new EventEmitter<string>();

  isVisible: boolean = false;
  selectedReason: string = '';  // Holds the selected rejection reason
  customReason: string = ''; // Holds the custom reason input
  errorMessage: string | null = null;
  isLoading: boolean = false;
  showRejectPopup: boolean = false; // Flag for reject popup visibility
  showPopup = false; // Flag to control the popup visibility

  rejectionReasons = [
    { id: 'incompleteInfo', value: 'Incomplete Information', label: 'Incomplete Information' },
    { id: 'incorrectFormat', value: 'Incorrect Format', label: 'Incorrect Format' },
    { id: 'duplicateEntry', value: 'Duplicate Entry', label: 'Duplicate Entry' },
    { id: 'invalidLocation', value: 'Invalid Location', label: 'Invalid Location' },
  ];

  constructor(private rejectionService: RejectionService) {}

  openModal() {
    this.isVisible = true;
    this.errorMessage = null; // Reset error message on modal open
    this.selectedReason = ''; // Reset selected reason
    this.customReason = ''; // Reset custom reason
  }

  closeModal() {
    this.isVisible = false;
    this.selectedReason = ''; // Reset the selected reason on close
    this.customReason = ''; // Reset custom reason
  }

  // Disable all validations by always returning true
  isValid(): boolean {
    return true;
  }

  submitReason() {
    // Reset error message at the start
    this.errorMessage = '';
    
    const finalStatus = false; // Explicitly setting the status to false (rejected)

    // Remove the validation logic for empty reasons
    const finalReason = this.selectedReason === 'Other' ? this.customReason.trim() : this.selectedReason || 'No reason provided';

    this.isLoading = true; // Start loading

    // Call the service to update the record status
    this.rejectionService.updateRecordStatus(this.guid, finalStatus, finalReason).subscribe(
      (response) => {
        // Success: Emit the selected or custom reason
        this.reasonSubmitted.emit(finalReason);

        // Close the modal after successful submission
        this.closeModal();

        // Show reject success popup
        this.showRejectPopup = true;

        // Hide the reject message after 3 seconds
        setTimeout(() => {
          this.showRejectPopup = false;
        }, 3000);

        this.isLoading = false; // Stop loading
      },
      (error: HttpErrorResponse) => {
        // Error handling
        this.errorMessage = 'Failed to update reason. Please try again later.';
        this.isLoading = false; // Stop loading
      }
    );
  }
}
